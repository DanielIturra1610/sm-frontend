/**
 * Create Immediate Actions Report Page
 * Form with dynamic table of action items and progress tracking
 * Auto-fills data from Flash Report if exists
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateImmediateActionsReport, useFlashReportByIncident } from '@/shared/hooks/report-hooks'
import { immediateActionsReportSchema, type ImmediateActionsReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, CheckCircle2, FileText, AlertCircle, Copy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

// Predefined actions
// tipo_acc_inc values: 'ACC' (Accidente), 'INC' (Incidente), 'FLASH' (Importado de Flash Report)
const PREDEFINED_ACTIONS = [
  {
    numero: 1,
    tarea: 'Comunicar lo acontecido a Jefatura Directa',
    tipo_acc_inc: 'INC',
  },
  {
    numero: 2,
    tarea: 'Informar Incidente y su clasificación a la Dirección',
    tipo_acc_inc: 'INC',
  },
  {
    numero: 3,
    tarea: 'Enviar recopilación de antecedentes',
    tipo_acc_inc: 'INC',
  },
  {
    numero: 4,
    tarea: 'Informar Incidente Ocurrido a Jefatura CGE',
    tipo_acc_inc: 'INC',
  },
  {
    numero: 5,
    tarea: 'Generar Reporte Flash vía WhatsApp a Jefe de Área CGE y HSEQ',
    tipo_acc_inc: 'INC',
  },
  {
    numero: 6,
    tarea: 'Iniciar Proceso de Investigación Preliminar de Incidentes',
    tipo_acc_inc: 'INC',
  },
]

export default function CreateImmediateActionsReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateImmediateActionsReport()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAutoFilled, setHasAutoFilled] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
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

  // Fetch Flash Report when incident is selected
  const { data: flashReport, isLoading: isLoadingFlashReport } = useFlashReportByIncident(incident_id || null)

  // Parse immediate actions from Flash Report text
  const parseActionsFromFlashReport = (actionsText: string): string[] => {
    if (!actionsText) return []

    // Split by common patterns: numbered lists, line breaks, or numbered with dots/parentheses
    const lines = actionsText
      .split(/(?:\r?\n)|(?:\d+[.)]\s*)/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    return lines
  }

  // Auto-fill form when Flash Report is found
  useEffect(() => {
    if (flashReport && incident_id && !hasAutoFilled) {
      // Format date for input (YYYY-MM-DD)
      const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return ''
        try {
          const date = new Date(dateStr)
          return date.toISOString().split('T')[0]
        } catch {
          return ''
        }
      }

      const fechaInicio = formatDate(flashReport.fecha)

      // Parse actions from Flash Report's acciones_inmediatas field
      const flashReportActions = parseActionsFromFlashReport(flashReport.acciones_inmediatas || '')

      let updatedItems: typeof PREDEFINED_ACTIONS extends readonly (infer T)[] ? (T & {
        inicio: string
        fin: string
        responsable: string
        cliente: string
        avance_real: number
        avance_programado: number
        comentario: string
      })[] : never

      if (flashReportActions.length > 0) {
        // Use actions from Flash Report instead of predefined ones
        updatedItems = flashReportActions.map((tarea, index) => ({
          numero: index + 1,
          tarea,
          tipo_acc_inc: 'FLASH', // Imported from Flash Report
          inicio: fechaInicio,
          fin: fechaInicio, // Same as inicio since these are immediate actions
          responsable: flashReport.supervisor || '',
          cliente: '',
          avance_real: 100, // Actions from flash report are already completed
          avance_programado: 100,
          comentario: 'Acción tomada según Flash Report',
        }))
      } else {
        // Fall back to predefined actions if no actions in Flash Report
        updatedItems = PREDEFINED_ACTIONS.map((action) => {
          const baseItem = {
            ...action,
            inicio: fechaInicio,
            fin: '',
            responsable: '',
            cliente: '',
            avance_real: 0,
            avance_programado: 0,
            comentario: '',
          }

          // Pre-fill supervisor for communication actions
          if (flashReport.supervisor) {
            if ([
              'Comunicar lo acontecido a Jefatura Directa',
              'Informar Incidente y su clasificación a la Dirección',
              'Informar Incidente Ocurrido a Jefatura CGE'
            ].includes(action.tarea)) {
              baseItem.responsable = flashReport.supervisor
            }
          }

          return baseItem
        })
      }

      // Reset form with pre-filled data
      reset({
        incident_id,
        fecha_inicio: fechaInicio,
        fecha_termino: '',
        items: updatedItems,
      })

      setHasAutoFilled(true)
      toast.success(
        flashReportActions.length > 0
          ? `${flashReportActions.length} acciones importadas desde el Flash Report`
          : 'Datos pre-llenados desde el Flash Report'
      )
    }
  }, [flashReport, incident_id, hasAutoFilled, reset])

  // Reset auto-fill flag when incident changes
  useEffect(() => {
    if (!incident_id) {
      setHasAutoFilled(false)
    }
  }, [incident_id])

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!items || items.length === 0) return 0
    const totalProgress = items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
    return Math.round(totalProgress / items.length)
  }

  // Duplicate action item
  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index]
    if (itemToDuplicate) {
      append({
        numero: items.length + 1,
        tarea: itemToDuplicate.tarea,
        inicio: itemToDuplicate.inicio,
        fin: itemToDuplicate.fin,
        responsable: itemToDuplicate.responsable,
        cliente: itemToDuplicate.cliente,
        avance_real: 0,
        avance_programado: 0,
        comentario: '',
        tipo_acc_inc: itemToDuplicate.tipo_acc_inc,
      })
      toast.success('Acción duplicada exitosamente')
    }
  }

  const onSubmit = async (data: ImmediateActionsReportFormData) => {
    try {
      setIsSubmitting(true)

      // Validate incident_id is present
      if (!data.incident_id) {
        toast.error('Debe seleccionar un incidente')
        return
      }

      // Transform and clean data for API
      const cleanedItems = (data.items || []).map((item, index) => ({
        numero: index + 1, // Ensure numero starts from 1
        tarea: item.tarea || '',
        inicio: item.inicio || undefined,
        fin: item.fin || undefined,
        responsable: item.responsable || undefined,
        cliente: item.cliente || undefined,
        avance_real: item.avance_real ?? 0,
        avance_programado: item.avance_programado ?? 0,
        comentario: item.comentario || undefined,
        tipo_acc_inc: item.tipo_acc_inc || 'INC',
      }))

      // Prepare payload matching the backend DTO exactly
      const payload = {
        incident_id: data.incident_id,
        fecha_inicio: data.fecha_inicio || undefined,
        fecha_termino: data.fecha_termino || undefined,
        items: cleanedItems.length > 0 ? cleanedItems : undefined,
      }

      console.log('Creating immediate actions report with payload:', payload)

      await createReport(payload)
      toast.success('Reporte de Acciones Inmediatas creado exitosamente')
      router.push('/reports/immediate-actions')
    } catch (error: any) {
      console.error('Error creating immediate actions report:', error)
      const errorMessage = error?.message || error?.response?.data?.message || 'Error al crear el reporte'
      toast.error(errorMessage)
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
          <CardContent className="space-y-4">
            <IncidentSelector
              value={incident_id || ''}
              onChange={(value) => {
                setValue('incident_id', value)
                setHasAutoFilled(false) // Reset to allow auto-fill for new incident
              }}
              error={errors.incident_id?.message}
              required
            />

            {/* Flash Report Status Indicator */}
            {incident_id && (
              <div className="mt-4">
                {isLoadingFlashReport ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando Flash Report...
                  </div>
                ) : flashReport ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Flash Report Encontrado</AlertTitle>
                    <AlertDescription className="text-green-700">
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-4 w-4" />
                        <span>Los datos se han pre-llenado automáticamente desde el Flash Report.</span>
                        <Badge variant={
                          flashReport.report_status === 'approved' ? 'default' :
                          flashReport.report_status === 'submitted' ? 'secondary' : 'outline'
                        }>
                          {flashReport.report_status === 'approved' ? 'Aprobado' :
                           flashReport.report_status === 'submitted' ? 'Enviado' :
                           flashReport.report_status === 'draft' ? 'Borrador' : flashReport.report_status}
                        </Badge>
                      </div>
                      {flashReport.acciones_inmediatas && (
                        <div className="text-sm mt-2 p-2 bg-green-100 rounded">
                          <strong>Acciones importadas del Flash Report:</strong>
                          <div className="mt-1 text-xs whitespace-pre-line">{flashReport.acciones_inmediatas}</div>
                        </div>
                      )}
                      {flashReport.supervisor && (
                        <div className="text-sm mt-1">
                          <strong>Supervisor:</strong> {flashReport.supervisor}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Sin Flash Report</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      No se encontró un Flash Report para este incidente. Los campos comenzarán vacíos.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
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
                    <TableHead className="w-24">Acciones</TableHead>
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
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateItem(index)}
                            title="Duplicar acción"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {index >= 6 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600"
                              title="Eliminar acción"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
                  tipo_acc_inc: 'INC', // Manual/additional action
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
