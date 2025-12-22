/**
 * Edit Action Plan Report Page
 * Allows editing action plan with up to 25 tasks
 */

'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Save, Plus, Trash2, Copy, Calendar, CheckCircle2 } from 'lucide-react'
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

  const onSubmit = async (data: ActionPlanReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
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
                />
                {errors.fecha_fin_estimada && (
                  <p className="text-sm text-red-600">{errors.fecha_fin_estimada.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
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
                  💡 Tip: Use los íconos en cada fila para copiar responsable/cliente a todas las tareas
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                Agregar Tarea {(items?.length || 0) >= 25 && '(Máximo alcanzado)'}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[200px]">Tarea</TableHead>
                    <TableHead className="min-w-[150px]">Subtarea</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="w-24">Estado</TableHead>
                    <TableHead className="w-28">Avance Real</TableHead>
                    <TableHead className="w-28">Avance Prog.</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Textarea
                          {...register(`items.${index}.tarea`)}
                          placeholder="Descripción de la tarea"
                          rows={2}
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
                          {...register(`items.${index}.subtarea`)}
                          placeholder="Subtarea (opcional)"
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...register(`items.${index}.inicio`)}
                          className="w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...register(`items.${index}.fin`)}
                          className="w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <SuggestionInput
                            suggestionType="responsables"
                            {...register(`items.${index}.responsable`)}
                            placeholder="Responsable"
                            className="flex-1 min-w-[120px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyResponsableToAll(index)}
                            disabled={!items?.[index]?.responsable}
                            title="Copiar a todas las filas"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <SuggestionInput
                            suggestionType="clientes"
                            {...register(`items.${index}.cliente`)}
                            placeholder="Cliente"
                            className="flex-1 min-w-[120px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyClienteToAll(index)}
                            disabled={!items?.[index]?.cliente}
                            title="Copiar a todas las filas"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={watch(`items.${index}.estado`)}
                          onValueChange={(value) => setValue(`items.${index}.estado`, value as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delayed')}
                        >
                          <SelectTrigger className="w-24">
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
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </TableCell>
                      <TableCell>
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
                          <span className="text-sm text-gray-500">%</span>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          title="Eliminar tarea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
