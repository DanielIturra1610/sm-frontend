'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFishboneAnalysis, useAddFishboneCause } from '@/shared/hooks/analysis-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
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
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string; borderColor: string; hoverBg: string }> = {
  people: { label: 'Personas', icon: Users, color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-500', hoverBg: 'hover:bg-blue-200' },
  method: { label: 'Métodos', icon: Settings, color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-500', hoverBg: 'hover:bg-emerald-200' },
  machine: { label: 'Máquinas', icon: Cpu, color: 'text-violet-700', bgColor: 'bg-violet-100', borderColor: 'border-violet-500', hoverBg: 'hover:bg-violet-200' },
  material: { label: 'Materiales', icon: Package, color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-500', hoverBg: 'hover:bg-amber-200' },
  measurement: { label: 'Mediciones', icon: Ruler, color: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-500', hoverBg: 'hover:bg-rose-200' },
  environment: { label: 'Entorno', icon: TreePine, color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-500', hoverBg: 'hover:bg-teal-200' },
}

interface AddCauseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  onSubmit: (data: { description: string; subCauses?: string[] }) => Promise<void>
  isSubmitting: boolean
}

function AddCauseDialog({ open, onOpenChange, category, onSubmit, isSubmitting }: AddCauseDialogProps) {
  const [description, setDescription] = useState('')
  const [subCauses, setSubCauses] = useState('')

  const config = CATEGORY_CONFIG[category] || { label: category, icon: AlertCircle, color: 'text-gray-600' }
  const Icon = config.icon

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('La descripción es requerida')
      return
    }
    const subCausesArray = subCauses.split('\n').filter(s => s.trim())
    await onSubmit({ description, subCauses: subCausesArray.length > 0 ? subCausesArray : undefined })
    setDescription('')
    setSubCauses('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="h-5 w-5" />
            Agregar Causa - {config.label}
          </DialogTitle>
          <DialogDescription>
            Agrega una causa relacionada con esta categoría. Puedes incluir sub-causas opcionales.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción de la Causa *</label>
            <Input
              placeholder="Ej: Falta de capacitación en procedimientos de seguridad"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sub-causas (opcional)</label>
            <Textarea
              placeholder="Una sub-causa por línea:&#10;- No hay programa de inducción&#10;- Capacitaciones no actualizadas"
              value={subCauses}
              onChange={(e) => setSubCauses(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Ingresa cada sub-causa en una línea separada</p>
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
                <Plus className="h-4 w-4 mr-2" />
                Agregar Causa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CategoryCardProps {
  category: string
  causes: any[]
  onAddCause: (category: string) => void
}

function CategoryCard({ category, causes, onAddCause }: CategoryCardProps) {
  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon

  return (
    <div
      onClick={() => onAddCause(category)}
      className={`
        group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
        ${config.bgColor} ${config.borderColor} ${config.hoverBg}
        hover:shadow-lg hover:scale-[1.02]
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 ${config.color}`}>
          <Icon className="h-5 w-5" />
          <span className="font-bold">{config.label}</span>
        </div>
        <Plus className={`h-4 w-4 ${config.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>

      {causes.length > 0 ? (
        <ul className="space-y-2">
          {causes.map((cause: any, idx: number) => (
            <li key={idx} className="text-sm text-gray-700 bg-white/60 rounded-md px-2 py-1">
              {cause.description || cause}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Clic para agregar causa
        </p>
      )}
    </div>
  )
}

export default function FishboneDetailPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string | null

  const { data: analysis, error, isLoading, mutate } = useFishboneAnalysis(analysisId)
  const { trigger: addCause, isMutating: isAddingCause } = useAddFishboneCause(analysisId || '')

  // Get incident data for title
  const incidentId = analysis?.incidentId || analysis?.incident_id || ''
  const { data: incident } = useIncident(incidentId)

  const [addCauseDialog, setAddCauseDialog] = useState<{ open: boolean; category: string }>({
    open: false,
    category: '',
  })

  const handleAddCause = async (data: { description: string; subCauses?: string[] }) => {
    try {
      await addCause({
        category: addCauseDialog.category,
        description: data.description,
        subCauses: data.subCauses,
      })
      toast.success('Causa agregada exitosamente')
      mutate()
    } catch (error) {
      console.error('Error adding cause:', error)
      toast.error('Error al agregar la causa')
    }
  }

  const openAddCauseDialog = (category: string) => {
    setAddCauseDialog({ open: true, category })
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  // Group causes by category
  const categoriesMap: Record<string, any[]> = {}
  const allCategories = ['people', 'method', 'machine', 'material', 'measurement', 'environment']

  // Initialize all categories as empty
  allCategories.forEach(cat => {
    categoriesMap[cat] = []
  })

  // Group causes from analysis.causes array by their category field
  const causes = analysis.causes || []
  causes.forEach((cause: any) => {
    const category = cause.category?.toLowerCase() || ''
    // Map backend categories to our 6M categories
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

  const topCategories = ['people', 'method', 'machine']
  const bottomCategories = ['material', 'measurement', 'environment']
  const totalCauses = Object.values(categoriesMap).reduce((sum, causes) => sum + causes.length, 0)

  // Get incident title for the effect box
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
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(analysis.status || analysis.report_status || 'draft')}>
          {(analysis.status || analysis.report_status || 'draft').replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline">
          {totalCauses} causas identificadas
        </Badge>
      </div>

      {/* Incident Info + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident Information */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              Suceso Relacionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Correlativo */}
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Correlativo</p>
                <Badge variant="secondary" className="font-mono text-sm font-bold bg-slate-800 text-white">
                  #{incident?.incidentNumber || incident?.correlativo || 'N/A'}
                </Badge>
              </div>
              {/* Título */}
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">Título del Suceso</p>
                <p className="font-medium text-sm text-gray-800 line-clamp-2">
                  {incident?.title || 'Sin título'}
                </p>
              </div>
              {/* Fecha */}
              {incident?.eventDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                  <p className="text-sm text-gray-700">
                    {new Date(incident.eventDate).toLocaleDateString('es-CL')}
                  </p>
                </div>
              )}
              {/* Ubicación */}
              {incident?.location && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                  <p className="text-sm text-gray-700">{incident.location}</p>
                </div>
              )}
              {/* Categoría */}
              {incident?.category && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                  <p className="text-sm text-gray-700">{incident.category}</p>
                </div>
              )}
              {/* Severidad */}
              {incident?.severity && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Severidad</p>
                  <Badge variant="outline" className="text-xs">
                    {incident.severity}
                  </Badge>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t">
              <Link href={`/incidents/${incidentId}`}>
                <Button variant="outline" size="sm">
                  Ver Suceso Completo
                  <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 h-full flex flex-col justify-center">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">Cómo usar el Diagrama</p>
                <p className="text-sm text-blue-700 mt-1">
                  Haz clic en cualquier categoría (6M) para agregar causas relacionadas con esa área.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fishbone Diagram - Improved Layout */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Categories Grid - Left Side */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              {/* Top Row */}
              {topCategories.map((cat) => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  causes={categoriesMap[cat]}
                  onAddCause={openAddCauseDialog}
                />
              ))}
              {/* Bottom Row */}
              {bottomCategories.map((cat) => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  causes={categoriesMap[cat]}
                  onAddCause={openAddCauseDialog}
                />
              ))}
            </div>

            {/* Arrow/Spine connecting to Effect */}
            <div className="flex items-center">
              <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-red-500 rounded-full" />
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-red-500 border-b-[8px] border-b-transparent" />
            </div>

            {/* Effect Box - Right Side */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-56 flex-shrink-0">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-400/50">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-bold text-sm uppercase tracking-wide">Efecto</span>
                      </div>
                      <p className="font-semibold text-base leading-snug line-clamp-4">
                        {effectTitle}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm">
                  <p className="font-medium">Problema completo:</p>
                  <p className="text-sm">{analysis.problem || effectTitle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Problem Description - Separate Card */}
      {analysis.problem && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Descripción del Problema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.problem}</p>
          </CardContent>
        </Card>
      )}

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

      {/* Detailed Causes List */}
      {totalCauses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Causas por Categoría</CardTitle>
            <CardDescription>
              Vista expandida de todas las causas identificadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCategories.map((cat) => {
                const config = CATEGORY_CONFIG[cat]
                const Icon = config.icon
                const causes = categoriesMap[cat]

                if (causes.length === 0) return null

                return (
                  <Card key={cat} className={`border-l-4 ${config.borderColor} ${config.bgColor}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-base flex items-center gap-2 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {causes.map((cause: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <p className="font-medium text-gray-800">{cause.description || cause}</p>
                            {cause.subCauses && cause.subCauses.length > 0 && (
                              <ul className="ml-4 mt-1 space-y-0.5">
                                {cause.subCauses.map((sub: string, subIdx: number) => (
                                  <li key={subIdx} className="text-xs text-muted-foreground">
                                    • {sub}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Cause Dialog */}
      <AddCauseDialog
        open={addCauseDialog.open}
        onOpenChange={(open) => setAddCauseDialog({ ...addCauseDialog, open })}
        category={addCauseDialog.category}
        onSubmit={handleAddCause}
        isSubmitting={isAddingCause}
      />
    </div>
  )
}
