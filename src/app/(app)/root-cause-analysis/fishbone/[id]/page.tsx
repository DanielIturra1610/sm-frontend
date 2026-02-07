'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFishboneAnalysis, useAddFishboneCause, useUpdateFishboneCause, useDeleteFishboneCause } from '@/shared/hooks/analysis-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { useFlashReportByIncident } from '@/shared/hooks/report-hooks'
import { exportToExcel, exportToWord, exportToPDF, type FishboneExportMetadata } from '@/shared/utils/fishbone-export'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Fish,
  Plus,
  Users,
  Settings,
  Cpu,
  Package,
  Ruler,
  TreePine,
  Loader2,
  Info,
  Pencil,
  Trash2,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Download,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string; borderColor: string; hoverBg: string; lightBg: string }> = {
  people: { label: 'Personas', icon: Users, color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-500', hoverBg: 'hover:bg-blue-200', lightBg: 'bg-blue-50' },
  method: { label: 'Métodos', icon: Settings, color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-500', hoverBg: 'hover:bg-emerald-200', lightBg: 'bg-emerald-50' },
  machine: { label: 'Máquinas', icon: Cpu, color: 'text-violet-700', bgColor: 'bg-violet-100', borderColor: 'border-violet-500', hoverBg: 'hover:bg-violet-200', lightBg: 'bg-violet-50' },
  material: { label: 'Materiales', icon: Package, color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-500', hoverBg: 'hover:bg-amber-200', lightBg: 'bg-amber-50' },
  measurement: { label: 'Mediciones', icon: Ruler, color: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-500', hoverBg: 'hover:bg-rose-200', lightBg: 'bg-rose-50' },
  environment: { label: 'Entorno', icon: TreePine, color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-500', hoverBg: 'hover:bg-teal-200', lightBg: 'bg-teal-50' },
}

const IMPACT_CONFIG = {
  high: { label: 'Alto', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: 'Bajo', color: 'bg-green-100 text-green-700 border-green-200' },
}

const LIKELIHOOD_CONFIG = {
  high: { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: 'Baja', color: 'bg-green-100 text-green-700 border-green-200' },
}

interface CauseFormData {
  description: string
  impact: string
  likelihood: string
  priority: number
  notes: string
}

interface CauseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  mode: 'add' | 'edit'
  initialData?: CauseFormData & { id?: string }
  onSubmit: (data: CauseFormData) => Promise<void>
  isSubmitting: boolean
}

function CauseDialog({ open, onOpenChange, category, mode, initialData, onSubmit, isSubmitting }: CauseDialogProps) {
  const [formData, setFormData] = useState<CauseFormData>({
    description: initialData?.description || '',
    impact: initialData?.impact || 'medium',
    likelihood: initialData?.likelihood || 'medium',
    priority: initialData?.priority || 5,
    notes: initialData?.notes || '',
  })

  const config = CATEGORY_CONFIG[category] || { label: category, icon: AlertCircle, color: 'text-gray-600' }
  const Icon = config.icon

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('La descripción es requerida')
      return
    }
    if (formData.description.trim().length < 10) {
      toast.error('La descripción debe tener al menos 10 caracteres')
      return
    }
    await onSubmit(formData)
    if (mode === 'add') {
      setFormData({ description: '', impact: 'medium', likelihood: 'medium', priority: 5, notes: '' })
    }
    onOpenChange(false)
  }

  // Reset form when dialog opens with new data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && initialData) {
      setFormData({
        description: initialData.description || '',
        impact: initialData.impact || 'medium',
        likelihood: initialData.likelihood || 'medium',
        priority: initialData.priority || 5,
        notes: initialData.notes || '',
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="h-5 w-5" />
            {mode === 'add' ? 'Agregar Causa' : 'Editar Causa'} - {config.label}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Agrega una nueva causa identificada para esta categoría.'
              : 'Modifica los datos de la causa seleccionada.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de la Causa *</Label>
            <Textarea
              id="description"
              placeholder="Describe la causa identificada de forma clara y específica..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Mínimo 10 caracteres</p>
          </div>

          {/* Impact and Likelihood */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="impact">Impacto</Label>
              <Select value={formData.impact} onValueChange={(v) => setFormData({ ...formData, impact: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar impacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Alto
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medio
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Bajo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="likelihood">Probabilidad</Label>
              <Select value={formData.likelihood} onValueChange={(v) => setFormData({ ...formData, likelihood: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar probabilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Baja
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad (1-10)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="priority"
                type="number"
                min={1}
                max={10}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
                className="w-24"
              />
              <div className="flex-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: n })}
                    className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                      n <= formData.priority
                        ? n >= 8 ? 'bg-red-500 text-white' : n >= 5 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional, evidencias, observaciones..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                {mode === 'add' ? <Plus className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {mode === 'add' ? 'Agregar Causa' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CauseItemProps {
  cause: any
  index: number
  categoryConfig: typeof CATEGORY_CONFIG[string]
  onEdit: () => void
  onDelete: () => void
}

function CauseItem({ cause, index, categoryConfig, onEdit, onDelete }: CauseItemProps) {
  const impact = cause.impact?.toLowerCase() || 'medium'
  const likelihood = cause.likelihood?.toLowerCase() || 'medium'
  const impactConfig = IMPACT_CONFIG[impact as keyof typeof IMPACT_CONFIG] || IMPACT_CONFIG.medium
  const likelihoodConfig = LIKELIHOOD_CONFIG[likelihood as keyof typeof LIKELIHOOD_CONFIG] || LIKELIHOOD_CONFIG.medium

  const isHighRisk = impact === 'high' && likelihood === 'high'
  const isLevel2 = cause.level === 2

  return (
    <div className={`group relative rounded-lg border transition-all ${
      isHighRisk ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
    } ${isLevel2 ? 'ml-6 border-l-2 border-l-gray-300' : ''}`}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Number indicator */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            isHighRisk ? 'bg-red-500 text-white' : `${categoryConfig.bgColor} ${categoryConfig.color}`
          }`}>
            {isLevel2 ? <ChevronRight className="h-4 w-4" /> : index}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${isLevel2 ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
              {cause.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-xs ${impactConfig.color}`}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {impactConfig.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Nivel de impacto</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-xs ${likelihoodConfig.color}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {likelihoodConfig.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Probabilidad de ocurrencia</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {cause.priority && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs">
                        P{cause.priority}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Prioridad {cause.priority}/10</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {isHighRisk && (
                <Badge className="text-xs bg-red-500 text-white">
                  Riesgo Crítico
                </Badge>
              )}
            </div>

            {/* Notes */}
            {cause.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {cause.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar causa</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar causa</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CategorySectionProps {
  category: string
  causes: any[]
  onAddCause: () => void
  onEditCause: (cause: any) => void
  onDeleteCause: (cause: any) => void
}

function CategorySection({ category, causes, onAddCause, onEditCause, onDeleteCause }: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon

  // Separate level 1 and level 2 causes
  const mainCauses = causes.filter(c => !c.level || c.level === 1)
  const subCausesMap: Record<string, any[]> = {}
  causes.filter(c => c.level === 2).forEach(c => {
    const parentId = c.parentId || 'orphan'
    if (!subCausesMap[parentId]) subCausesMap[parentId] = []
    subCausesMap[parentId].push(c)
  })

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <CardHeader className={`pb-3 ${config.lightBg}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${config.color}`}>
            <Icon className="h-5 w-5" />
            {config.label}
            <Badge variant="secondary" className="ml-2">
              {causes.length}
            </Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onAddCause} className={`${config.color} border-current`}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {causes.length === 0 ? (
          <div className={`text-center py-8 rounded-lg border-2 border-dashed ${config.borderColor} ${config.lightBg}`}>
            <Icon className={`h-8 w-8 mx-auto mb-2 ${config.color} opacity-50`} />
            <p className="text-sm text-muted-foreground">
              No hay causas identificadas
            </p>
            <Button size="sm" variant="ghost" className={`mt-2 ${config.color}`} onClick={onAddCause}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar primera causa
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {mainCauses.map((cause, idx) => (
              <div key={cause.id || idx}>
                <CauseItem
                  cause={cause}
                  index={idx + 1}
                  categoryConfig={config}
                  onEdit={() => onEditCause(cause)}
                  onDelete={() => onDeleteCause(cause)}
                />
                {/* Sub-causes */}
                {subCausesMap[cause.id]?.map((subCause, subIdx) => (
                  <CauseItem
                    key={subCause.id || `sub-${subIdx}`}
                    cause={subCause}
                    index={subIdx + 1}
                    categoryConfig={config}
                    onEdit={() => onEditCause(subCause)}
                    onDelete={() => onDeleteCause(subCause)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FishboneDetailPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string | null

  const { data: analysis, error, isLoading, mutate } = useFishboneAnalysis(analysisId)
  const { trigger: addCause, isMutating: isAddingCause } = useAddFishboneCause(analysisId || '')
  const { trigger: updateCause, isMutating: isUpdatingCause } = useUpdateFishboneCause(analysisId || '')
  const { trigger: deleteCause, isMutating: isDeletingCause } = useDeleteFishboneCause(analysisId || '')

  // Get incident data for title
  const incidentId = analysis?.incidentId || analysis?.incident_id || ''
  const { data: incident } = useIncident(incidentId)

  // Get flash report to extract empresa for export filename
  const { data: flashReport } = useFlashReportByIncident(incidentId || null)

  const [causeDialog, setCauseDialog] = useState<{
    open: boolean
    mode: 'add' | 'edit'
    category: string
    cause?: any
  }>({
    open: false,
    mode: 'add',
    category: '',
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    cause?: any
  }>({
    open: false,
  })

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'pdf' | 'docx' | 'xlsx') => {
    if (!analysis) return

    setIsExporting(true)
    try {
      // Build metadata for filename: [Empresa] Reporte Diagrama Ishikawa [Fecha] [Correlativo]
      const metadata: FishboneExportMetadata = {
        empresa: flashReport?.empresa || incident?.empresa || undefined,
        fecha: analysis.createdAt ? new Date(analysis.createdAt).toISOString().split('T')[0] : undefined,
        correlativo: incident?.correlativo || undefined,
      }

      switch (format) {
        case 'xlsx':
          await exportToExcel(analysis, metadata)
          toast.success('Análisis exportado a Excel exitosamente')
          break
        case 'docx':
          await exportToWord(analysis, metadata)
          toast.success('Análisis exportado a Word exitosamente')
          break
        case 'pdf':
          await exportToPDF(analysis, metadata)
          toast.success('Análisis exportado a PDF exitosamente')
          break
      }
    } catch (error) {
      console.error('Error exporting analysis:', error)
      toast.error(`Error al exportar el análisis`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleAddCause = async (data: CauseFormData) => {
    try {
      await addCause({
        category: causeDialog.category,
        description: data.description,
        impact: data.impact,
        likelihood: data.likelihood,
        priority: data.priority,
      })
      toast.success('Causa agregada exitosamente')
      mutate()
    } catch (error) {
      console.error('Error adding cause:', error)
      toast.error('Error al agregar la causa')
    }
  }

  const handleEditCause = async (data: CauseFormData) => {
    if (!causeDialog.cause?.id) return
    try {
      await updateCause({
        causeId: causeDialog.cause.id,
        description: data.description,
        impact: data.impact,
        likelihood: data.likelihood,
        priority: data.priority,
        notes: data.notes,
      })
      toast.success('Causa actualizada exitosamente')
      mutate()
    } catch (error) {
      console.error('Error updating cause:', error)
      toast.error('Error al actualizar la causa')
    }
  }

  const handleDeleteCause = async () => {
    if (!deleteDialog.cause?.id) return
    try {
      await deleteCause(deleteDialog.cause.id)
      toast.success('Causa eliminada exitosamente')
      setDeleteDialog({ open: false })
      mutate()
    } catch (error) {
      console.error('Error deleting cause:', error)
      toast.error('Error al eliminar la causa')
    }
  }

  const openAddDialog = (category: string) => {
    setCauseDialog({ open: true, mode: 'add', category })
  }

  const openEditDialog = (category: string, cause: any) => {
    setCauseDialog({ open: true, mode: 'edit', category, cause })
  }

  const openDeleteDialog = (cause: any) => {
    setDeleteDialog({ open: true, cause })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Análisis
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del análisis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/root-cause-analysis')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group causes by category
  const categoriesMap: Record<string, any[]> = {}
  const allCategories = ['people', 'method', 'machine', 'material', 'measurement', 'environment']

  allCategories.forEach(cat => {
    categoriesMap[cat] = []
  })

  const causes = analysis.causes || []
  causes.forEach((cause: any) => {
    const category = cause.category?.toLowerCase() || ''
    const categoryMapping: Record<string, string> = {
      'people': 'people',
      'method': 'method',
      'process': 'method',
      'machine': 'machine',
      'equipment': 'machine',
      'material': 'material',
      'measurement': 'measurement',
      'environment': 'environment',
    }
    const mappedCategory = categoryMapping[category] || category
    if (categoriesMap[mappedCategory]) {
      categoriesMap[mappedCategory].push(cause)
    }
  })

  const totalCauses = causes.length
  const highRiskCauses = causes.filter((c: any) => c.impact === 'high' && c.likelihood === 'high').length
  const effectTitle = incident?.title || analysis.title || 'Problema a Analizar'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/root-cause-analysis')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{analysis.title || 'Diagrama de Ishikawa'}</h1>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <Fish className="h-3 w-3 mr-1" />
                Ishikawa
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Análisis #{analysis.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileDown className="mr-2 h-4 w-4 text-red-600" />
                Descargar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                Descargar Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                Descargar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="text-sm">
          {totalCauses} causas identificadas
        </Badge>
        {highRiskCauses > 0 && (
          <Badge className="bg-red-500 text-white text-sm">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {highRiskCauses} riesgo crítico
          </Badge>
        )}
        {allCategories.map(cat => {
          const count = categoriesMap[cat].length
          if (count === 0) return null
          const config = CATEGORY_CONFIG[cat]
          return (
            <Badge key={cat} variant="outline" className={`text-xs ${config.color} border-current`}>
              {config.label}: {count}
            </Badge>
          )
        })}
      </div>

      {/* Problem/Effect Card */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Efecto / Problema a Analizar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-red-900">{effectTitle}</p>
          {analysis.problem && analysis.problem !== effectTitle && (
            <p className="text-sm text-red-700 mt-2">{analysis.problem}</p>
          )}
        </CardContent>
      </Card>

      {/* Incident Info */}
      {incident && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              Suceso Relacionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="font-mono text-sm font-bold bg-slate-800 text-white">
                #{incident.incidentNumber || incident.correlativo || 'N/A'}
              </Badge>
              <span className="text-sm text-gray-600">{incident.title}</span>
              {incident.eventDate && (
                <span className="text-sm text-muted-foreground">
                  {new Date(incident.eventDate).toLocaleDateString('es-CL')}
                </span>
              )}
              <Link href={`/incidents/${incidentId}`}>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Ver suceso completo →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Metodología 6M de Ishikawa</p>
              <p className="text-sm text-blue-700 mt-1">
                Identifica las causas raíz organizándolas en 6 categorías: Personas, Métodos, Máquinas, Materiales, Mediciones y Entorno.
                Haz clic en "Agregar" en cada categoría para registrar las causas identificadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allCategories.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            causes={categoriesMap[cat]}
            onAddCause={() => openAddDialog(cat)}
            onEditCause={(cause) => openEditDialog(cat, cause)}
            onDeleteCause={(cause) => openDeleteDialog(cause)}
          />
        ))}
      </div>

      {/* Root Cause Section */}
      {(analysis.rootCause || analysis.root_cause) && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Causa Raíz Identificada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-900 font-medium">{analysis.rootCause || analysis.root_cause}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Cause Dialog */}
      <CauseDialog
        open={causeDialog.open}
        onOpenChange={(open) => setCauseDialog({ ...causeDialog, open })}
        category={causeDialog.category}
        mode={causeDialog.mode}
        initialData={causeDialog.cause ? {
          description: causeDialog.cause.description || '',
          impact: causeDialog.cause.impact || 'medium',
          likelihood: causeDialog.cause.likelihood || 'medium',
          priority: causeDialog.cause.priority || 5,
          notes: causeDialog.cause.notes || '',
        } : undefined}
        onSubmit={causeDialog.mode === 'add' ? handleAddCause : handleEditCause}
        isSubmitting={isAddingCause || isUpdatingCause}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta causa?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. La causa será eliminada permanentemente del análisis.
                </p>
                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium text-gray-800">{deleteDialog.cause?.description}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCause}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCause}
              disabled={isDeletingCause}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingCause ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
