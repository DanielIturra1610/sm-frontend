/**
 * Edit Action Plan Report Page
 * Allows editing action plan with up to 25 tasks
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionPlanReport, useUpdateActionPlanReport } from '@/shared/hooks/report-hooks'
import { actionPlanReportSchema, type ActionPlanReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { SuggestionInput } from '@/shared/components/ui/suggestion-input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, Copy, Calendar, CheckCircle2, TrendingUp } from 'lucide-react'
import { Separator } from '@/shared/components/ui/separator'
import { addDays, format, differenceInDays } from 'date-fns'

const TASK_ESTADOS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'delayed', label: 'Retrasada' },
]

// Helper to convert date string to ISO format for backend
const toISODate = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined
  // If already in ISO format, return as-is
  if (dateStr.includes('T')) return dateStr
  // Convert YYYY-MM-DD to ISO format
  return `${dateStr}T00:00:00Z`
}

export default function EditActionPlanReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { data: report, isLoading: isLoadingReport } = useActionPlanReport(id)
  const { trigger: updateReport, isMutating } = useUpdateActionPlanReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ActionPlanReportFormData>({
    resolver: zodResolver(actionPlanReportSchema),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const fecha_inicio = watch('fecha_inicio')
  const duracion_dias = watch('duracion_dias')
  const fecha_fin_estimada = watch('fecha_fin_estimada')

  // Ref to track which field triggered the change (to avoid infinite loops)
  const dateChangeSource = useRef<'inicio' | 'duracion' | 'fin' | null>(null)

  // Load existing report data
  useEffect(() => {
    if (report) {
      reset({
        incident_id: report.incident_id,
        fecha_inicio: report.fecha_inicio || '',
        fecha_fin_estimada: report.fecha_fin_estimada || '',
        duracion_dias: report.duracion_dias || 30,
        items: report.items?.map((item, index) => ({
          numero: item.numero || index + 1,
          tarea: item.tarea || '',
          subtarea: item.subtarea || '',
          inicio: item.inicio || '',
          fin: item.fin || '',
          responsable: item.responsable || '',
          cliente: item.cliente || '',
          avance_real: item.avance_real || 0,
          avance_programado: item.avance_programado || 100,
          comentario: item.comentario || '',
          tipo_acc_inc: item.tipo_acc_inc || 'ACC',
          estado: item.estado || 'pending',
        })) || [],
      })
    }
  }, [report, reset])

  // Auto-calculate dates bidirectionally
  // When fecha_inicio changes → recalculate fecha_fin (keeping duracion)
  useEffect(() => {
    if (dateChangeSource.current === 'inicio') {
      if (fecha_inicio && duracion_dias) {
        const endDate = addDays(new Date(fecha_inicio), duracion_dias)
        setValue('fecha_fin_estimada', format(endDate, 'yyyy-MM-dd'))
      }
    }
    dateChangeSource.current = null
  }, [fecha_inicio, setValue])

  // When duracion_dias changes → recalculate fecha_fin
  useEffect(() => {
    if (dateChangeSource.current === 'duracion') {
      if (fecha_inicio && duracion_dias) {
        const endDate = addDays(new Date(fecha_inicio), duracion_dias)
        setValue('fecha_fin_estimada', format(endDate, 'yyyy-MM-dd'))
      }
    }
    dateChangeSource.current = null
  }, [duracion_dias, setValue])

  // When fecha_fin_estimada changes → recalculate duracion_dias
  useEffect(() => {
    if (dateChangeSource.current === 'fin') {
      if (fecha_inicio && fecha_fin_estimada) {
        const startDate = new Date(fecha_inicio)
        const endDate = new Date(fecha_fin_estimada)
        const days = differenceInDays(endDate, startDate)
        if (days >= 0) {
          setValue('duracion_dias', days)
        }
      }
    }
    dateChangeSource.current = null
  }, [fecha_fin_estimada, setValue])

  const onSubmit = async (data: ActionPlanReportFormData) => {
    try {
      setIsSubmitting(true)

      // Convert all dates to ISO format for backend
      const formattedData = {
        ...data,
        fecha_inicio: toISODate(data.fecha_inicio),
        fecha_fin_estimada: toISODate(data.fecha_fin_estimada),
        items: data.items?.map(item => ({
          ...item,
          inicio: toISODate(item.inicio),
          fin: toISODate(item.fin),
        })),
      }

      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(formattedData)
      toast.success('Plan de Acción actualizado exitosamente')
      router.push(`/reports/action-plan/${id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el plan'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateOverallProgress = () => {
    if (!items || items.length === 0) return 0
    const total = items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
    return Math.round(total / items.length)
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
    toast.success(`Responsable "${responsable}" copiado a todas las tareas`)
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
    toast.success(`Cliente "${cliente}" copiado a todas las tareas`)
  }

  // Fill all items with 100% progress
  const fillAllWith100Percent = () => {
    if (!items || items.length === 0) return
    items.forEach((_, idx) => {
      setValue(`items.${idx}.avance_real`, 100)
      setValue(`items.${idx}.avance_programado`, 100)
      setValue(`items.${idx}.estado`, 'completed')
    })
    toast.success('Todos los avances establecidos en 100% y estado completado')
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
            <p className="text-center text-gray-500">Plan de Acción no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ReportFormHeader
        title="Editar Plan de Acción"
        description="Modifica las tareas y el seguimiento del plan"
        backUrl={`/reports/action-plan/${id}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Datos principales del plan de acción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  {...register('fecha_inicio', {
                    onChange: () => { dateChangeSource.current = 'inicio' }
                  })}
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
                  {...register('duracion_dias', {
                    valueAsNumber: true,
                    onChange: () => { dateChangeSource.current = 'duracion' }
                  })}
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
                  {...register('fecha_fin_estimada', {
                    onChange: () => { dateChangeSource.current = 'fin' }
                  })}
                />
                <p className="text-xs text-gray-500">Se actualiza automáticamente al cambiar otros campos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Cards */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tareas del Plan</CardTitle>
                <CardDescription>
                  Hasta 25 tareas con seguimiento detallado
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
                  💡 Tip: Use los íconos en cada tarjeta para copiar responsable/cliente a todas las tareas
                </div>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
              {fields.map((field, index) => {
                const taskStatus = watch(`items.${index}.estado`) || 'pending'
                const statusConfig = {
                  pending: { color: 'border-l-yellow-500 bg-yellow-50/30', badge: 'bg-yellow-100 text-yellow-800' },
                  in_progress: { color: 'border-l-blue-500 bg-blue-50/30', badge: 'bg-blue-100 text-blue-800' },
                  completed: { color: 'border-l-green-500 bg-green-50/30', badge: 'bg-green-100 text-green-800' },
                  cancelled: { color: 'border-l-gray-500 bg-gray-50/30', badge: 'bg-gray-100 text-gray-800' },
                  delayed: { color: 'border-l-red-500 bg-red-50/30', badge: 'bg-red-100 text-red-800' },
                }
                const currentStatus = statusConfig[taskStatus as keyof typeof statusConfig] || statusConfig.pending

                return (
                  <div
                    key={field.id}
                    className={`border rounded-lg border-l-4 ${currentStatus.color} p-4 transition-all hover:shadow-md`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={taskStatus}
                            onValueChange={(value) => setValue(`items.${index}.estado`, value as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delayed')}
                          >
                            <SelectTrigger className={`w-36 h-8 text-xs ${currentStatus.badge}`}>
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
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Tarea */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">Tarea *</Label>
                          <Input
                            {...register(`items.${index}.tarea`)}
                            placeholder="Descripción de la tarea"
                            className="w-full"
                          />
                          {errors.items?.[index]?.tarea && (
                            <p className="text-xs text-red-600">
                              {errors.items[index]?.tarea?.message}
                            </p>
                          )}
                        </div>

                        {/* Subtarea */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">Subtarea</Label>
                          <Input
                            {...register(`items.${index}.subtarea`)}
                            placeholder="Detalle o subtarea (opcional)"
                            className="w-full"
                          />
                        </div>

                        {/* Fechas */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Fecha Inicio</Label>
                            <Input
                              type="date"
                              {...register(`items.${index}.inicio`)}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Fecha Fin</Label>
                            <Input
                              type="date"
                              {...register(`items.${index}.fin`)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Responsable y Cliente */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                              Responsable
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyResponsableToAll(index)}
                                disabled={!items?.[index]?.responsable}
                                title="Copiar a todas las tareas"
                                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </Label>
                            <SuggestionInput
                              suggestionType="responsables"
                              {...register(`items.${index}.responsable`)}
                              placeholder="Nombre del responsable"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                              Cliente
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyClienteToAll(index)}
                                disabled={!items?.[index]?.cliente}
                                title="Copiar a todas las tareas"
                                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </Label>
                            <SuggestionInput
                              suggestionType="clientes"
                              {...register(`items.${index}.cliente`)}
                              placeholder="Nombre del cliente"
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Avances */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Avance Real (%)</Label>
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...register(`items.${index}.avance_real`, {
                                  valueAsNumber: true,
                                })}
                                className="w-full"
                              />
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${items?.[index]?.avance_real || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Avance Programado (%)</Label>
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...register(`items.${index}.avance_programado`, {
                                  valueAsNumber: true,
                                })}
                                className="w-full"
                              />
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${items?.[index]?.avance_programado || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comentario */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">Comentario</Label>
                          <Textarea
                            {...register(`items.${index}.comentario`)}
                            placeholder="Notas o comentarios adicionales..."
                            rows={2}
                            className="w-full resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {fields.length} / 25 tareas
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({
                  numero: (items?.length || 0) + 1,
                  tarea: '',
                  subtarea: '',
                  inicio: '',
                  fin: '',
                  responsable: '',
                  cliente: '',
                  avance_real: 0,
                  avance_programado: 100,
                  comentario: '',
                  tipo_acc_inc: 'ACC',
                  estado: 'pending',
                })}
                disabled={(items?.length || 0) >= 25}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tarea
              </Button>
            </div>

            {errors.items && (
              <p className="text-sm text-red-600 mt-2">
                {typeof errors.items === 'object' && 'message' in errors.items
                  ? errors.items.message
                  : 'Por favor verifica los datos de las tareas'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/action-plan/${id}`)}
            disabled={isSubmitting || isMutating}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isMutating}
          >
            {(isSubmitting || isMutating) && (
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
