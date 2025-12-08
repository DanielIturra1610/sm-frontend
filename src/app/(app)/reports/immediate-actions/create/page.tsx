/**
 * Create Immediate Actions Report Page
 * Form with dynamic table of action items and progress tracking
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateImmediateActionsReport } from '@/shared/hooks/report-hooks'
import { immediateActionsReportSchema, type ImmediateActionsReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

// Predefined actions
const PREDEFINED_ACTIONS = [
  {
    numero: 1,
    tarea: 'Comunicar lo acontecido a Jefatura Directa',
    tipo_acc_inc: 'comunicacion',
  },
  {
    numero: 2,
    tarea: 'Informar Incidente y su clasificación a la Dirección',
    tipo_acc_inc: 'reporte',
  },
  {
    numero: 3,
    tarea: 'Enviar recopilación de antecedentes',
    tipo_acc_inc: 'documentacion',
  },
  {
    numero: 4,
    tarea: 'Informar Incidente Ocurrido a Jefatura CGE',
    tipo_acc_inc: 'comunicacion',
  },
  {
    numero: 5,
    tarea: 'Generar Reporte Flash vía WhatsApp a Jefe de Área CGE y HSEQ',
    tipo_acc_inc: 'reporte',
  },
  {
    numero: 6,
    tarea: 'Iniciar Proceso de Investigación Preliminar de Incidentes',
    tipo_acc_inc: 'investigacion',
  },
]

export default function CreateImmediateActionsReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateImmediateActionsReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ImmediateActionsReportFormData>({
    resolver: zodResolver(immediateActionsReportSchema),
    defaultValues: {
      items: PREDEFINED_ACTIONS.map(action => ({
        ...action,
        inicio: '',
        fin: '',
        responsable: '',
        cliente: '',
        avance_real: 0,
        avance_programado: 0,
        comentario: '',
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const incident_id = watch('incident_id')
  const items = watch('items')

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!items || items.length === 0) return 0
    const totalProgress = items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
    return Math.round(totalProgress / items.length)
  }

  const onSubmit = async (data: ImmediateActionsReportFormData) => {
    try {
      setIsSubmitting(true)
      // Calculate overall progress before submitting
      const overallProgress = calculateOverallProgress()
      await createReport({
        ...data,
        porcentaje_avance_plan: overallProgress,
      })
      toast.success('Reporte de Acciones Inmediatas creado exitosamente')
      router.push('/reports/immediate-actions')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Crear Reporte de Acciones Inmediatas"
        description="Reporte de acciones tomadas en las primeras 24-48 horas"
        backUrl="/reports/immediate-actions"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Incidente</CardTitle>
            <CardDescription>
              Seleccione el incidente al cual pertenece este reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentSelector
              value={incident_id || ''}
              onChange={(value) => setValue('incident_id', value)}
              error={errors.incident_id?.message}
              required
            />
          </CardContent>
        </Card>

        {/* Period Information */}
        <Card>
          <CardHeader>
            <CardTitle>Período del Reporte</CardTitle>
            <CardDescription>
              Fechas de inicio y término del seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  {...register('fecha_inicio')}
                />
                {errors.fecha_inicio && (
                  <p className="text-sm text-red-600">{errors.fecha_inicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_termino">Fecha de Término</Label>
                <Input
                  id="fecha_termino"
                  type="date"
                  {...register('fecha_termino')}
                />
                {errors.fecha_termino && (
                  <p className="text-sm text-red-600">{errors.fecha_termino.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Acciones Inmediatas</CardTitle>
                <CardDescription>
                  Seguimiento de las acciones tomadas (6 acciones predefinidas)
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Avance General</div>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateOverallProgress()}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[200px]">Tarea</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="w-32">Avance Real</TableHead>
                    <TableHead className="w-32">Avance Prog.</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.tarea`)}
                          placeholder="Descripción de la tarea"
                          className="min-w-[200px]"
                        />
                        {errors.items?.[index]?.tarea && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.items[index]?.tarea?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...register(`items.${index}.inicio`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...register(`items.${index}.fin`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.responsable`)}
                          placeholder="Responsable"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.cliente`)}
                          placeholder="Cliente"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...register(`items.${index}.avance_real`, {
                              valueAsNumber: true,
                            })}
                            className="w-20"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${items?.[index]?.avance_real || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...register(`items.${index}.avance_programado`, {
                              valueAsNumber: true,
                            })}
                            className="w-20"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${items?.[index]?.avance_programado || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          {...register(`items.${index}.comentario`)}
                          placeholder="Comentarios"
                          rows={2}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        {index >= 6 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  numero: fields.length + 1,
                  tarea: '',
                  inicio: '',
                  fin: '',
                  responsable: '',
                  cliente: '',
                  avance_real: 0,
                  avance_programado: 0,
                  comentario: '',
                  tipo_acc_inc: 'adicional',
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Acción Adicional
            </Button>

            {errors.items && (
              <p className="text-sm text-red-600 mt-2">
                {typeof errors.items.message === 'string' && errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/reports/immediate-actions')}
            disabled={isMutating || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isMutating || isSubmitting}
          >
            {(isMutating || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Crear Reporte
          </Button>
        </div>
      </form>
    </div>
  )
}
