/**
 * Create Action Plan Report Page
 * Detailed action planning with up to 25 tasks
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateActionPlanReport, usePrefillData, useRootCauseReportByIncident } from '@/shared/hooks/report-hooks'
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
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, Calendar, TrendingUp, CheckCircle2, FileText, AlertCircle, GitBranch, HelpCircle, Fish, ClipboardList, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { addDays, format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import type { ActionPlanSuggestedItem } from '@/shared/types/api'

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
  const [hasAutoFilled, setHasAutoFilled] = useState(false)

  // Task selection state
  const [showTaskSelector, setShowTaskSelector] = useState(true)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(true)

  // Generate default empty tasks
  const generateEmptyTasks = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      numero: i + 1,
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
      estado: 'pending' as const,
    }))
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ActionPlanReportFormData>({
    resolver: zodResolver(actionPlanReportSchema),
    defaultValues: {
      items: generateEmptyTasks(5),
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

  // Fetch prefill data when incident is selected
  const { data: prefillData, isLoading: isLoadingPrefill } = usePrefillData(incident_id || null, 'action-plan')
  const { data: rootCauseReport, isLoading: isLoadingRootCause } = useRootCauseReportByIncident(incident_id || null)

  // Helper to get task ID for selection tracking
  const getTaskId = (item: ActionPlanSuggestedItem, index: number) =>
    `${item.source || 'default'}-${index}-${item.tarea.slice(0, 20)}`

  // Group suggested items by source for better UI
  const groupedSuggestedItems = React.useMemo(() => {
    const items = prefillData?.action_plan_data?.suggested_items || []
    const groups: Record<string, ActionPlanSuggestedItem[]> = {
      default: [],
      root_cause: [],
      five_whys: [],
      fishbone: [],
      causal_tree: [],
    }
    items.forEach(item => {
      const source = item.source || 'default'
      if (!groups[source]) groups[source] = []
      groups[source].push(item)
    })
    return groups
  }, [prefillData])

  const sourceConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    default: { label: 'Tareas Base', icon: <ClipboardList className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' },
    root_cause: { label: 'Análisis Causa Raíz', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    five_whys: { label: '5 Porqués', icon: <HelpCircle className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    fishbone: { label: 'Diagrama Ishikawa', icon: <Fish className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    causal_tree: { label: 'Árbol Causal', icon: <GitBranch className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  }

  // When prefill data arrives, pre-select all suggested items and set dates
  useEffect(() => {
    if (prefillData && incident_id && !hasAutoFilled) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const suggestedDuration = prefillData.action_plan_data?.suggested_duration_days || 14
      const endDate = format(addDays(new Date(), suggestedDuration), 'yyyy-MM-dd')

      // Pre-select all suggested items
      const allItemIds = new Set<string>()
      const suggestedItems = prefillData.action_plan_data?.suggested_items || []
      suggestedItems.forEach((item, index) => {
        allItemIds.add(getTaskId(item, index))
      })
      setSelectedTaskIds(allItemIds)

      // Set basic form data (dates, incident)
      setValue('incident_id', incident_id)
      setValue('fecha_inicio', today)
      setValue('duracion_dias', suggestedDuration)
      setValue('fecha_fin_estimada', endDate)

      // Auto-fill existing tasks with dates, responsible, cliente, and progress
      const currentItems = items || []
      if (currentItems.length > 0) {
        const updatedItems = currentItems.map((item, index) => ({
          ...item,
          inicio: today,
          fin: endDate,
          responsable: prefillData.supervisor || item.responsable || '',
          cliente: prefillData.empresa || item.cliente || '',
          avance_real: 0,
          avance_programado: 100,
        }))
        setValue('items', updatedItems)
      }

      // Show task selector if there are suggested items from RCA
      if (suggestedItems.length > 0) {
        setShowTaskSelector(true)
        setIsTaskSelectorOpen(true)
        toast.info(`${suggestedItems.length} tareas sugeridas de análisis RCA. Puede agregarlas al plan.`)
      } else {
        setShowTaskSelector(false)
      }

      setHasAutoFilled(true)
    }
  }, [prefillData, incident_id, hasAutoFilled, setValue, items])

  // Apply selected tasks to the form (adds to existing tasks)
  const applySelectedTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const suggestedDuration = prefillData?.action_plan_data?.suggested_duration_days || 14
    const endDate = format(addDays(new Date(), suggestedDuration), 'yyyy-MM-dd')

    // Get current items
    const currentItems = [...(items || [])]
    let itemNumber = currentItems.length + 1

    // Add selected suggested items to existing tasks
    const suggestedItems = prefillData?.action_plan_data?.suggested_items || []
    let addedCount = 0
    suggestedItems.forEach((item, index) => {
      const taskId = getTaskId(item, index)

      if (selectedTaskIds.has(taskId)) {
        const sourceLabel = sourceConfig[item.source || 'default']?.label || ''
        currentItems.push({
          numero: itemNumber++,
          tarea: item.tarea,
          subtarea: item.subtarea || '',
          inicio: today,
          fin: endDate,
          responsable: prefillData?.supervisor || '',
          cliente: prefillData?.empresa || '',
          avance_real: 0,
          avance_programado: 100,
          comentario: item.source && item.source !== 'default' ? `Origen: ${sourceLabel}` : '',
          tipo_acc_inc: item.tipo_acc_inc || 'ACC',
          estado: 'pending' as const,
        })
        addedCount++
      }
    })

    setValue('items', currentItems)
    setShowTaskSelector(false)
    if (addedCount > 0) {
      toast.success(`${addedCount} tareas agregadas al plan`)
    }
  }

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Select/deselect all tasks from a source
  const toggleSourceSelection = (source: string, select: boolean) => {
    const sourceItems = groupedSuggestedItems[source] || []
    const allItems = prefillData?.action_plan_data?.suggested_items || []

    setSelectedTaskIds(prev => {
      const newSet = new Set(prev)
      sourceItems.forEach(item => {
        const globalIndex = allItems.findIndex(i => i === item)
        const taskId = getTaskId(item, globalIndex)
        if (select) {
          newSet.add(taskId)
        } else {
          newSet.delete(taskId)
        }
      })
      return newSet
    })
  }

  // Reset auto-fill flag when incident changes
  useEffect(() => {
    if (!incident_id) {
      setHasAutoFilled(false)
    }
  }, [incident_id])

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

      const dataItems = data.items || []

      // Validate at least one task
      if (dataItems.length < 1) {
        toast.error('Debe haber al menos 1 tarea en el plan')
        return
      }

      // Calculate overall progress
      const overallProgress = calculateOverallProgress()

      await createReport({
        ...data,
        items: dataItems,
        porcentaje_avance_plan: overallProgress,
      } as any)
      toast.success('Plan de Acción creado exitosamente')
      router.push('/reports/action-plan')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTask = () => {
    if (fields.length >= 25) {
      toast.error('Máximo 25 tareas permitidas')
      return
    }

    const newTaskNumber = fields.length + 1
    // Use form dates or default to today + 14 days
    const startDate = fecha_inicio || format(new Date(), 'yyyy-MM-dd')
    const endDate = watch('fecha_fin_estimada') || format(addDays(new Date(), duracion_dias || 14), 'yyyy-MM-dd')

    append({
      numero: newTaskNumber,
      tarea: '',
      subtarea: '',
      inicio: startDate,
      fin: endDate,
      responsable: prefillData?.supervisor || '',
      cliente: prefillData?.empresa || '',
      avance_real: 0,
      avance_programado: 100,
      comentario: '',
      tipo_acc_inc: 'ACC',
      estado: 'pending' as const,
    })
  }

  const removeTask = (index: number) => {
    if (fields.length <= 1) {
      toast.error('Debe haber al menos 1 tarea')
      return
    }
    remove(index)
    // Renumber remaining tasks
    const currentItems = [...(items || [])]
    currentItems.splice(index, 1)
    const renumberedItems = currentItems.map((item, idx) => ({
      ...item,
      numero: idx + 1,
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

            {/* Prefill Status Indicator */}
            {incident_id && (
              <div className="mt-4">
                {(isLoadingPrefill || isLoadingRootCause) ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando datos de reportes anteriores...
                  </div>
                ) : prefillData ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Datos Pre-llenados</AlertTitle>
                    <AlertDescription className="text-green-700">
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Se han cargado datos desde los reportes anteriores del incidente.</span>
                        </div>

                        {/* Source reports info */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {prefillData.source_reports?.flash_report_id && (
                            <Badge variant="secondary">Flash Report</Badge>
                          )}
                          {prefillData.source_reports?.immediate_actions_id && (
                            <Badge variant="secondary">Acciones Inmediatas</Badge>
                          )}
                          {prefillData.source_reports?.root_cause_id && (
                            <Badge variant="secondary">Causa Raíz</Badge>
                          )}
                        </div>

                        {/* Analysis sources info */}
                        {prefillData.action_plan_data?.suggested_items && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {prefillData.action_plan_data.suggested_items.some(i => i.source === 'five_whys') && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">5 Porqués</Badge>
                            )}
                            {prefillData.action_plan_data.suggested_items.some(i => i.source === 'fishbone') && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ishikawa</Badge>
                            )}
                            {prefillData.action_plan_data.suggested_items.some(i => i.source === 'causal_tree') && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Árbol Causal</Badge>
                            )}
                          </div>
                        )}

                        {/* Causas identificadas */}
                        {prefillData.causas_identificadas && (
                          <div className="text-sm mt-2 p-2 bg-green-100 rounded">
                            <strong>Causas identificadas:</strong>
                            <div className="mt-1 text-xs">{prefillData.causas_identificadas}</div>
                          </div>
                        )}

                        {/* Suggested items count by source */}
                        {prefillData.action_plan_data?.suggested_items && prefillData.action_plan_data.suggested_items.length > 0 && (
                          <div className="text-sm mt-1">
                            <strong>{prefillData.action_plan_data.suggested_items.length}</strong> tareas sugeridas:
                            <ul className="list-disc list-inside mt-1 text-xs">
                              {prefillData.action_plan_data.suggested_items.filter(i => i.source === 'root_cause').length > 0 && (
                                <li>{prefillData.action_plan_data.suggested_items.filter(i => i.source === 'root_cause').length} del análisis de causa raíz</li>
                              )}
                              {prefillData.action_plan_data.suggested_items.filter(i => i.source === 'five_whys').length > 0 && (
                                <li>{prefillData.action_plan_data.suggested_items.filter(i => i.source === 'five_whys').length} de 5 Porqués</li>
                              )}
                              {prefillData.action_plan_data.suggested_items.filter(i => i.source === 'fishbone').length > 0 && (
                                <li>{prefillData.action_plan_data.suggested_items.filter(i => i.source === 'fishbone').length} de Ishikawa</li>
                              )}
                              {prefillData.action_plan_data.suggested_items.filter(i => i.source === 'causal_tree').length > 0 && (
                                <li>{prefillData.action_plan_data.suggested_items.filter(i => i.source === 'causal_tree').length} de Árbol Causal</li>
                              )}
                            </ul>
                          </div>
                        )}

                        {prefillData.supervisor && (
                          <div className="text-sm">
                            <strong>Supervisor:</strong> {prefillData.supervisor}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Sin Datos Previos</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      No se encontraron reportes anteriores para este incidente. Complete el Flash Report y análisis de causa raíz para obtener sugerencias automáticas.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Selector from RCA Analyses */}
        {showTaskSelector && incident_id && prefillData?.action_plan_data?.suggested_items && prefillData.action_plan_data.suggested_items.length > 0 && (
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <Collapsible open={isTaskSelectorOpen} onOpenChange={setIsTaskSelectorOpen}>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                      Selección de Tareas
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Seleccione las tareas que desea incluir en el plan de acción
                    </CardDescription>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isTaskSelectorOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-4 space-y-4">
                    {/* Group by source */}
                    {Object.entries(groupedSuggestedItems).map(([source, sourceItems]) => {
                      if (sourceItems.length === 0) return null

                      const config = sourceConfig[source] || sourceConfig.default
                      const allItems = prefillData?.action_plan_data?.suggested_items || []

                      // Check if all items in this source are selected
                      const allSelected = sourceItems.every(item => {
                        const globalIndex = allItems.findIndex(i => i === item)
                        return selectedTaskIds.has(getTaskId(item, globalIndex))
                      })

                      // Check if some items are selected
                      const someSelected = sourceItems.some(item => {
                        const globalIndex = allItems.findIndex(i => i === item)
                        return selectedTaskIds.has(getTaskId(item, globalIndex))
                      })

                      return (
                        <div key={source} className="border rounded-lg bg-white p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded ${config.color}`}>
                                {config.icon}
                              </span>
                              <span className="font-medium">{config.label}</span>
                              <Badge variant="secondary" className="ml-2">
                                {sourceItems.length} tareas
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSourceSelection(source, !allSelected)}
                            >
                              {allSelected ? (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Deseleccionar todo
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Seleccionar todo
                                </>
                              )}
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {sourceItems.map((item, localIndex) => {
                              const globalIndex = allItems.findIndex(i => i === item)
                              const taskId = getTaskId(item, globalIndex)
                              const isSelected = selectedTaskIds.has(taskId)

                              return (
                                <div
                                  key={taskId}
                                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                    isSelected
                                      ? 'bg-purple-50 border-purple-200'
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  <Checkbox
                                    id={taskId}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleTaskSelection(taskId)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <label
                                      htmlFor={taskId}
                                      className="text-sm font-medium cursor-pointer block"
                                    >
                                      {item.tarea}
                                    </label>
                                    {item.subtarea && (
                                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {item.subtarea}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.tipo_acc_inc && (
                                        <Badge variant="outline" className="text-xs">
                                          {item.tipo_acc_inc === 'corrective' || item.tipo_acc_inc === 'ACC'
                                            ? 'Correctiva'
                                            : item.tipo_acc_inc === 'preventive' || item.tipo_acc_inc === 'preventiva'
                                            ? 'Preventiva'
                                            : item.tipo_acc_inc}
                                        </Badge>
                                      )}
                                      {item.priority && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            item.priority === 'high'
                                              ? 'border-red-300 text-red-700'
                                              : item.priority === 'medium'
                                              ? 'border-yellow-300 text-yellow-700'
                                              : 'border-gray-300 text-gray-700'
                                          }`}
                                        >
                                          {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {/* Selection Summary and Apply Button */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{selectedTaskIds.size}</span> tareas seleccionadas
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowTaskSelector(false)}
                        >
                          Omitir
                        </Button>
                        <Button
                          type="button"
                          onClick={applySelectedTasks}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={selectedTaskIds.size === 0}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aplicar Selección ({selectedTaskIds.size} tareas)
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        )}

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
                  Agregue las tareas necesarias para el plan de acción
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
                  {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.tarea`)}
                            placeholder="Descripción"
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(index)}
                            disabled={fields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {fields.length} / 25 tareas
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addTask}
                disabled={fields.length >= 25}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tarea
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
