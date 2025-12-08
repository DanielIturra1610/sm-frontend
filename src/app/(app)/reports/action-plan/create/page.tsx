/**
 * Create Action Plan Report Page
 * Detailed action planning with up to 25 tasks
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateActionPlanReport } from '@/shared/hooks/report-hooks'
import { actionPlanReportSchema, type ActionPlanReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { addDays, format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const TASK_ESTADOS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'delayed', label: 'Retrasada' },
]

export default function CreateActionPlanReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateActionPlanReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ActionPlanReportFormData>({
    resolver: zodResolver(actionPlanReportSchema),
    defaultValues: {
      items: [
        {
          numero: 1,
          tarea: 'Medidas Correctivas',
          subtarea: '',
          inicio: '',
          fin: '',
          responsable: '',
          cliente: '',
          avance_real: 0,
          avance_programado: 0,
          comentario: '',
          tipo_acc_inc: 'correctiva',
          estado: 'pending',
        },
        {
          numero: 2,
          tarea: 'Reportar Avances',
          subtarea: '',
          inicio: '',
          fin: '',
          responsable: '',
          cliente: '',
          avance_real: 0,
          avance_programado: 0,
          comentario: '',
          tipo_acc_inc: 'seguimiento',
          estado: 'pending',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const incident_id = watch('incident_id')
  const fecha_inicio = watch('fecha_inicio')
  const duracion_dias = watch('duracion_dias')
  const items = watch('items')

  // Auto-calculate end date
  useEffect(() => {
    if (fecha_inicio && duracion_dias) {
      const endDate = addDays(new Date(fecha_inicio), duracion_dias)
      setValue('fecha_fin_estimada', format(endDate, 'yyyy-MM-dd'))
    }
  }, [fecha_inicio, duracion_dias, setValue])

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!items || items.length === 0) return 0
    const totalProgress = items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
    return Math.round(totalProgress / items.length)
  }

  const onSubmit = async (data: ActionPlanReportFormData) => {
    try {
      setIsSubmitting(true)

      // Validate first and last tasks
      if (data.items.length < 2) {
        toast.error('Debe haber al menos 2 tareas (Medidas Correctivas y Reportar Avances)')
        return
      }

      if (data.items[0].tarea !== 'Medidas Correctivas') {
        toast.error('La primera tarea debe ser "Medidas Correctivas"')
        return
      }

      if (data.items[data.items.length - 1].tarea !== 'Reportar Avances') {
        toast.error('La última tarea debe ser "Reportar Avances"')
        return
      }

      // Calculate overall progress
      const overallProgress = calculateOverallProgress()

      await createReport({
        ...data,
        porcentaje_avance_plan: overallProgress,
      })
      toast.success('Plan de Acción creado exitosamente')
      router.push('/reports/action-plan')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertTaskBeforeLast = () => {
    if (fields.length >= 25) {
      toast.error('Máximo 25 tareas permitidas')
      return
    }

    const newTaskNumber = fields.length
    const newTask = {
      numero: newTaskNumber,
      tarea: '',
      subtarea: '',
      inicio: '',
      fin: '',
      responsable: '',
      cliente: '',
      avance_real: 0,
      avance_programado: 0,
      comentario: '',
      tipo_acc_inc: 'adicional',
      estado: 'pending' as const,
    }

    // Get current items, insert before last
    const currentItems = [...items]
    currentItems.splice(currentItems.length - 1, 0, newTask)

    // Renumber all tasks
    const renumberedItems = currentItems.map((item, index) => ({
      ...item,
      numero: index + 1,
    }))

    setValue('items', renumberedItems)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Crear Plan de Acción"
        description="Planificación detallada de acciones correctivas y preventivas"
        backUrl="/reports/action-plan"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Incidente</CardTitle>
            <CardDescription>
              Seleccione el incidente al cual pertenece este plan
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

        {/* Planning Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Planificación
            </CardTitle>
            <CardDescription>
              Defina las fechas y duración del plan de acción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="duracion_dias">Duración (días)</Label>
                <Input
                  id="duracion_dias"
                  type="number"
                  min="1"
                  {...register('duracion_dias', { valueAsNumber: true })}
                  placeholder="Ej: 30"
                />
                {errors.duracion_dias && (
                  <p className="text-sm text-red-600">{errors.duracion_dias.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin_estimada">Fecha Fin Estimada</Label>
                <Input
                  id="fecha_fin_estimada"
                  type="date"
                  {...register('fecha_fin_estimada')}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Calculada automáticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tareas del Plan de Acción</CardTitle>
                <CardDescription>
                  Primera tarea: "Medidas Correctivas" | Última tarea: "Reportar Avances"
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Avance General</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateOverallProgress()}%
                  </span>
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
                    <TableHead className="min-w-[150px]">Tarea</TableHead>
                    <TableHead className="min-w-[150px]">Subtarea</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="w-24">Real</TableHead>
                    <TableHead className="w-24">Prog.</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="min-w-[150px]">Comentario</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const isFirst = index === 0
                    const isLast = index === fields.length - 1
                    const isFixed = isFirst || isLast

                    return (
                      <TableRow key={field.id} className={isFixed ? 'bg-blue-50' : ''}>
                        <TableCell className="font-medium">
                          <Badge variant={isFixed ? 'default' : 'outline'}>
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.tarea`)}
                            placeholder="Descripción"
                            disabled={isFixed}
                            className={isFixed ? 'bg-white font-semibold' : ''}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.subtarea`)}
                            placeholder="Subtarea"
                          />
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
                              className="w-16"
                            />
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
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
                              className="w-16"
                            />
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-600 h-1 rounded-full"
                                style={{ width: `${items?.[index]?.avance_programado || 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={items?.[index]?.estado || 'pending'}
                            onValueChange={(value) => setValue(`items.${index}.estado`, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_ESTADOS.map((estado) => (
                                <SelectItem key={estado.value} value={estado.value}>
                                  {estado.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          {!isFixed && (
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
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {fields.length} / 25 tareas (Primera: Medidas Correctivas, Última: Reportar Avances)
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={insertTaskBeforeLast}
                disabled={fields.length >= 25}
              >
                <Plus className="h-4 w-4 mr-2" />
                Insertar Tarea
              </Button>
            </div>

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
            onClick={() => router.push('/reports/action-plan')}
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
            Crear Plan
          </Button>
        </div>
      </form>
    </div>
  )
}
