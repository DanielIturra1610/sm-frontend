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
import { SuggestionInput } from '@/shared/components/ui/suggestion-input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, CheckCircle2, FileText, AlertCircle, Copy, Calendar } from 'lucide-react'

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
    // @ts-expect-error - Schema type mismatch with optional avance fields
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
        // Pre-fill supervisor as responsable for ALL actions
        updatedItems = PREDEFINED_ACTIONS.map((action) => ({
          ...action,
          inicio: fechaInicio,
          fin: '',
          responsable: flashReport.supervisor || '',
          cliente: '',
          avance_real: 0,
          avance_programado: 0,
          comentario: '',
        }))
      }

      // Reset form with pre-filled data
      // fecha_termino = fecha_inicio since immediate actions are completed the same day
      reset({
        incident_id,
        fecha_inicio: fechaInicio,
        fecha_termino: fechaInicio,
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
    if (!items || items.length === 0) return
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

  // Copy responsable to all items
  const copyResponsableToAll = (sourceIndex: number) => {
    if (!items || items.length === 0) return
    const responsable = items[sourceIndex]?.responsable
    if (!responsable) {
      toast.error('El responsable está vacío')
      return
    }
    items.forEach((_, idx) => {
      setValue(`items.${idx}.responsable`, responsable)
    })
    toast.success(`Responsable "${responsable}" copiado a todas las acciones`)
  }

  // Copy cliente to all items
  const copyClienteToAll = (sourceIndex: number) => {
    if (!items || items.length === 0) return
    const cliente = items[sourceIndex]?.cliente
    if (!cliente) {
      toast.error('El cliente está vacío')
      return
    }
    items.forEach((_, idx) => {
      setValue(`items.${idx}.cliente`, cliente)
    })
    toast.success(`Cliente "${cliente}" copiado a todas las acciones`)
  }

  // Fill all items with 100% progress
  const fillAllWith100Percent = () => {
    if (!items || items.length === 0) return
    items.forEach((_, idx) => {
      setValue(`items.${idx}.avance_real`, 100)
      setValue(`items.${idx}.avance_programado`, 100)
    })
    toast.success('Todos los avances establecidos en 100%')
  }

  // Fill all dates with today
  const fillAllDatesWithToday = () => {
    if (!items || items.length === 0) return
    const today = new Date().toISOString().split('T')[0]
    items.forEach((_, idx) => {
      setValue(`items.${idx}.inicio`, today)
      setValue(`items.${idx}.fin`, today)
    })
    toast.success('Todas las fechas establecidas con la fecha de hoy')
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

      // @ts-expect-error - useSWRMutation type signature issue
      await createReport(payload)
      toast.success('Reporte de Acciones Inmediatas creado exitosamente')
      router.push('/reports/immediate-actions')
    } catch (error) {
      console.error('Error creating immediate actions report:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el reporte'
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

      {/* @ts-expect-error - handleSubmit type inference issue */}
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
            {/* Productivity Toolbar */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillAllDatesWithToday}
                  disabled={!items || items.length === 0}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Llenar Fechas Hoy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillAllWith100Percent}
                  disabled={!items || items.length === 0}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Llenar 100% en Todos
                </Button>
                <div className="text-xs text-gray-500 flex items-center ml-2">
                  💡 Tip: Use los íconos en cada fila para copiar responsable/cliente a todas las acciones
                </div>
              </div>
            </div>

            {/* Card-based layout for action items */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header row with number, task, and actions */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Input
                        {...register(`items.${index}.tarea`)}
                        placeholder="Descripción de la tarea"
                        className="font-medium"
                      />
                      {errors.items?.[index]?.tarea && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[index]?.tarea?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar acción"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Fields grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Dates */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Fecha Inicio</Label>
                      <Input
                        type="date"
                        {...register(`items.${index}.inicio`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Fecha Fin</Label>
                      <Input
                        type="date"
                        {...register(`items.${index}.fin`)}
                      />
                    </div>

                    {/* Responsable */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500">Responsable</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyResponsableToAll(index)}
                          disabled={!items?.[index]?.responsable}
                          title="Copiar a todas las acciones"
                          className="h-5 px-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar a todos
                        </Button>
                      </div>
                      <SuggestionInput
                        suggestionType="responsables"
                        {...register(`items.${index}.responsable`)}
                        value={items?.[index]?.responsable || ''}
                        placeholder="Nombre del responsable"
                      />
                    </div>

                    {/* Cliente */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500">Cliente</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyClienteToAll(index)}
                          disabled={!items?.[index]?.cliente}
                          title="Copiar a todas las acciones"
                          className="h-5 px-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar a todos
                        </Button>
                      </div>
                      <SuggestionInput
                        suggestionType="clientes"
                        {...register(`items.${index}.cliente`)}
                        value={items?.[index]?.cliente || ''}
                        placeholder="Nombre del cliente"
                      />
                    </div>
                  </div>

                  {/* Progress and Comments row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {/* Avance Real */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Avance Real (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...register(`items.${index}.avance_real`, {
                            valueAsNumber: true,
                          })}
                          className="w-20"
                        />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${items?.[index]?.avance_real || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-blue-600 w-12 text-right">
                          {items?.[index]?.avance_real || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Avance Programado */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Avance Programado (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...register(`items.${index}.avance_programado`, {
                            valueAsNumber: true,
                          })}
                          className="w-20"
                        />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${items?.[index]?.avance_programado || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-green-600 w-12 text-right">
                          {items?.[index]?.avance_programado || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Comentario */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Comentario</Label>
                      <Textarea
                        {...register(`items.${index}.comentario`)}
                        placeholder="Comentarios adicionales..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
