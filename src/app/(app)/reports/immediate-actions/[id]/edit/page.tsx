/**
 * Edit Immediate Actions Report Page
 * Allows editing existing immediate actions with dynamic cards
 * Matches the create page interface
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useImmediateActionsReport, useUpdateImmediateActionsReport } from '@/shared/hooks/report-hooks'
import { immediateActionsReportSchema, type ImmediateActionsReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { SuggestionInput } from '@/shared/components/ui/suggestion-input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, Copy, Calendar, CheckCircle2 } from 'lucide-react'

export default function EditImmediateActionsReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data: report, isLoading: isLoadingReport } = useImmediateActionsReport(id)
  const { trigger: updateReport, isMutating } = useUpdateImmediateActionsReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ImmediateActionsReportFormData>({
    // @ts-expect-error - Schema type mismatch with optional avance fields
    resolver: zodResolver(immediateActionsReportSchema),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')

  // Load existing report data
  useEffect(() => {
    if (report) {
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

      reset({
        incident_id: report.incident_id,
        fecha_inicio: formatDate(report.fecha_inicio),
        fecha_termino: formatDate(report.fecha_termino),
        items: report.items?.map((item, index) => ({
          numero: item.numero || index + 1,
          tarea: item.tarea || '',
          inicio: formatDate(item.inicio),
          fin: formatDate(item.fin),
          responsable: item.responsable || '',
          cliente: item.cliente || '',
          avance_real: item.avance_real || 0,
          avance_programado: item.avance_programado || 0,
          comentario: item.comentario || '',
          tipo_acc_inc: item.tipo_acc_inc || 'INC',
        })) || [],
      })
    }
  }, [report, reset])

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
        tipo_acc_inc: itemToDuplicate.tipo_acc_inc || 'INC',
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
      setValue(`items.${idx}.responsable`, responsable, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true
      })
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
      setValue(`items.${idx}.cliente`, cliente, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true
      })
    })
    toast.success(`Cliente "${cliente}" copiado a todas las acciones`)
  }

  // Fill all items with 100% progress
  const fillAllWith100Percent = () => {
    if (!items || items.length === 0) return
    items.forEach((_, idx) => {
      setValue(`items.${idx}.avance_real`, 100, { shouldDirty: true })
      setValue(`items.${idx}.avance_programado`, 100, { shouldDirty: true })
    })
    toast.success('Todos los avances establecidos en 100%')
  }

  // Fill all dates with today
  const fillAllDatesWithToday = () => {
    if (!items || items.length === 0) return
    const today = new Date().toISOString().split('T')[0]
    items.forEach((_, idx) => {
      setValue(`items.${idx}.inicio`, today, { shouldDirty: true })
      setValue(`items.${idx}.fin`, today, { shouldDirty: true })
    })
    toast.success('Todas las fechas establecidas con la fecha de hoy')
  }

  // Helper to convert date string to ISO format for backend
  const toISODate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) return undefined
    // If already in ISO format, return as-is
    if (dateStr.includes('T')) return dateStr
    // Convert YYYY-MM-DD to ISO format
    return `${dateStr}T00:00:00Z`
  }

  const onSubmit = async (data: ImmediateActionsReportFormData) => {
    try {
      setIsSubmitting(true)

      // Transform and clean data for API with proper ISO date format
      const cleanedItems = (data.items || []).map((item, index) => ({
        numero: index + 1,
        tarea: item.tarea || '',
        inicio: toISODate(item.inicio),
        fin: toISODate(item.fin),
        responsable: item.responsable || undefined,
        cliente: item.cliente || undefined,
        avance_real: item.avance_real ?? 0,
        avance_programado: item.avance_programado ?? 0,
        comentario: item.comentario || undefined,
        tipo_acc_inc: item.tipo_acc_inc || 'INC',
      }))

      const payload = {
        incident_id: data.incident_id,
        fecha_inicio: toISODate(data.fecha_inicio),
        fecha_termino: toISODate(data.fecha_termino),
        items: cleanedItems, // Always send the array, even if empty
      }

      console.log('Enviando payload:', JSON.stringify(payload, null, 2))

      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(payload)
      toast.success('Reporte de Acciones Inmediatas actualizado exitosamente')
      router.push(`/reports/immediate-actions/${id}`)
    } catch (error) {
      console.error('Error updating immediate actions report:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el reporte'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingReport) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Reporte no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Editar Reporte de Acciones Inmediatas"
        description="Modifica los datos del reporte y el seguimiento de acciones"
        backUrl={`/reports/immediate-actions/${id}`}
      />

      {/* @ts-expect-error - handleSubmit type inference issue */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Incidente</CardTitle>
            <CardDescription>
              Incidente asociado a este reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {report.incident?.correlativo || `ID: ${report.incident_id}`}
              </Badge>
              {report.incident?.tipo && (
                <Badge variant="secondary">{report.incident.tipo}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {report.incident?.descripcion_breve || 'Sin descripción'}
              </span>
            </div>
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

        {/* Action Items Cards */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Acciones Inmediatas</CardTitle>
                <CardDescription>
                  Seguimiento de las acciones tomadas
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
                  Tip: Use los íconos en cada fila para copiar responsable/cliente a todas las acciones
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar acción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                  tipo_acc_inc: 'INC',
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
            onClick={() => router.push(`/reports/immediate-actions/${id}`)}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
