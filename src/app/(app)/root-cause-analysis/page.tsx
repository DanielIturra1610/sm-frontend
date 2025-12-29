'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  GitBranch,
  Fish,
  HelpCircle,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Pencil,
  FileText,
  Hash,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
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
import { useQueryClient } from '@tanstack/react-query'
import { useCausalTreeAnalyses, useDeleteCausalTreeAnalysis } from '@/shared/hooks/causal-tree-hooks'
import { useFishboneAnalyses, useFiveWhysAnalyses, useDeleteFishboneAnalysis, useDeleteFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import type { Incident } from '@/shared/types/api'
import { toast } from 'sonner'

type MethodologyType = 'all' | 'causal-tree' | 'fishbone' | 'five-whys'
type StatusFilter = 'all' | 'in_progress' | 'completed'

const METHODOLOGY_CONFIG = {
  'causal-tree': {
    label: 'Árbol Causal',
    icon: GitBranch,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Metodología sistemática para identificar causas básicas',
  },
  'fishbone': {
    label: 'Diagrama Ishikawa',
    icon: Fish,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Análisis de causas usando las 6M',
  },
  'five-whys': {
    label: '5 Porqués',
    icon: HelpCircle,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Técnica iterativa de preguntas',
  },
}

const STATUS_CONFIG = {
  draft: { label: 'En Progreso', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'En Progreso', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completado', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  reviewed: { label: 'Completado', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  archived: { label: 'Archivado', icon: Clock, color: 'bg-gray-100 text-gray-600' },
}

interface UnifiedAnalysis {
  id: string
  title: string
  methodology: 'causal-tree' | 'fishbone' | 'five-whys'
  status: string
  incidentId: string
  createdAt: string
  updatedAt: string
  problem?: string
  finalEvent?: string
}

export default function RootCauseAnalysisPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [methodologyFilter, setMethodologyFilter] = useState<MethodologyType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [analysisToDelete, setAnalysisToDelete] = useState<UnifiedAnalysis | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch all analyses
  const { data: causalTreeData, isLoading: loadingCausalTree, refetch: refetchCausalTree } = useCausalTreeAnalyses()
  const { data: fishboneData, isLoading: loadingFishbone, mutate: mutateFishbone } = useFishboneAnalyses()
  const { data: fiveWhysData, isLoading: loadingFiveWhys, mutate: mutateFiveWhys } = useFiveWhysAnalyses()
  const { data: incidentsData } = useIncidents()

  // Create incident lookup map for correlativo
  const incidentMap = useMemo(() => {
    const map = new Map<string, Incident>()
    const incidents = incidentsData?.data || []
    incidents.forEach((inc: Incident) => map.set(inc.id, inc))
    return map
  }, [incidentsData])

  // Get correlativo for an incident
  const getCorrelativo = (incidentId: string): string => {
    if (!incidentId) return ''
    const incident = incidentMap.get(incidentId) as any
    return incident?.incidentNumber || incident?.incident_number || incident?.correlativo || ''
  }

  // Delete mutations
  const deleteCausalTree = useDeleteCausalTreeAnalysis()
  const deleteFishbone = useDeleteFishboneAnalysis()
  const deleteFiveWhys = useDeleteFiveWhysAnalysis()

  // Refresh all data sources
  const refreshAllData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] }),
      mutateFishbone(),
      mutateFiveWhys(),
    ])
  }

  const handleDelete = async () => {
    if (!analysisToDelete) return

    setIsDeleting(true)
    try {
      if (analysisToDelete.methodology === 'causal-tree') {
        await deleteCausalTree.mutateAsync(analysisToDelete.id)
      } else if (analysisToDelete.methodology === 'fishbone') {
        await deleteFishbone.trigger(analysisToDelete.id)
      } else if (analysisToDelete.methodology === 'five-whys') {
        await deleteFiveWhys.trigger(analysisToDelete.id)
      }
      // Refresh all data after deletion
      await refreshAllData()
      toast.success('Análisis eliminado correctamente')
    } catch (error) {
      console.error('Error deleting analysis:', error)
      toast.error('Error al eliminar el análisis')
    } finally {
      setIsDeleting(false)
      setAnalysisToDelete(null)
    }
  }

  const getEditUrl = (analysis: UnifiedAnalysis) => {
    switch (analysis.methodology) {
      case 'causal-tree':
        return `/root-cause-analysis/causal-tree/${analysis.id}/edit`
      case 'fishbone':
        return `/root-cause-analysis/fishbone/${analysis.id}/edit`
      case 'five-whys':
        return `/root-cause-analysis/five-whys/${analysis.id}/edit`
    }
  }

  const isDraft = (status: string) => {
    return status === 'draft' || status === 'in_progress'
  }

  const isLoading = loadingCausalTree || loadingFishbone || loadingFiveWhys

  // Helper to get display title for causal tree: "Árbol Causal - [título/evento]"
  const getCausalTreeDisplayTitle = (analysis: any): string => {
    const prefix = 'Árbol Causal'
    const title = analysis.title
    const finalEvent = analysis.finalEvent || analysis.final_event
    if (title && title.trim()) {
      return `${prefix} - ${title.trim()}`
    }
    if (finalEvent && finalEvent.trim()) {
      return `${prefix} - ${finalEvent.trim()}`
    }
    return prefix
  }

  // Helper to safely get array from data
  const getAnalysisArray = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.analyses && Array.isArray(data.analyses)) return data.analyses
    if (data.data && Array.isArray(data.data)) return data.data
    return []
  }

  // Unify all analyses into a single list
  const allAnalyses: UnifiedAnalysis[] = [
    ...getAnalysisArray(causalTreeData).map((a: any) => ({
      id: a.id,
      title: getCausalTreeDisplayTitle(a),
      methodology: 'causal-tree' as const,
      status: a.status || a.report_status || 'draft',
      incidentId: a.incidentId || a.incident_id || '',
      createdAt: a.createdAt || a.created_at,
      updatedAt: a.updatedAt || a.updated_at,
      finalEvent: a.finalEvent || a.final_event,
    })),
    ...getAnalysisArray(fishboneData).map((a: any) => ({
      id: a.id,
      title: a.title || a.problem || 'Diagrama Ishikawa',
      methodology: 'fishbone' as const,
      status: a.status || a.report_status || 'draft',
      incidentId: a.incidentId || a.incident_id || '',
      createdAt: a.createdAt || a.created_at,
      updatedAt: a.updatedAt || a.updated_at,
      problem: a.problem,
    })),
    ...getAnalysisArray(fiveWhysData).map((a: any) => ({
      id: a.id,
      title: a.title || 'Análisis 5 Porqués',
      methodology: 'five-whys' as const,
      status: a.status || a.report_status || 'draft',
      incidentId: a.incidentId || a.incident_id || '',
      createdAt: a.createdAt || a.created_at,
      updatedAt: a.updatedAt || a.updated_at,
      problem: a.problemStatement || a.problem_statement,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply filters
  const filteredAnalyses = allAnalyses.filter((analysis) => {
    const title = analysis.title || ''
    const incidentId = analysis.incidentId || ''
    const correlativo = getCorrelativo(incidentId).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      title.toLowerCase().includes(searchLower) ||
      incidentId.toLowerCase().includes(searchLower) ||
      correlativo.includes(searchLower)
    const matchesMethodology =
      methodologyFilter === 'all' || analysis.methodology === methodologyFilter

    // Normalize status filter: in_progress includes draft, completed includes reviewed
    let matchesStatus = statusFilter === 'all'
    if (statusFilter === 'in_progress') {
      matchesStatus = analysis.status === 'in_progress' || analysis.status === 'draft'
    } else if (statusFilter === 'completed') {
      matchesStatus = analysis.status === 'completed' || analysis.status === 'reviewed'
    }

    return matchesSearch && matchesMethodology && matchesStatus
  })

  // Stats
  const stats = {
    total: allAnalyses.length,
    causalTree: allAnalyses.filter((a) => a.methodology === 'causal-tree').length,
    fishbone: allAnalyses.filter((a) => a.methodology === 'fishbone').length,
    fiveWhys: allAnalyses.filter((a) => a.methodology === 'five-whys').length,
    completed: allAnalyses.filter((a) => a.status === 'completed' || a.status === 'reviewed').length,
    inProgress: allAnalyses.filter((a) => a.status === 'in_progress' || a.status === 'draft').length,
  }

  const getAnalysisUrl = (analysis: UnifiedAnalysis) => {
    switch (analysis.methodology) {
      case 'causal-tree':
        return `/root-cause-analysis/causal-tree/${analysis.id}`
      case 'fishbone':
        return `/root-cause-analysis/fishbone/${analysis.id}`
      case 'five-whys':
        return `/root-cause-analysis/five-whys/${analysis.id}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Causa Raíz</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los análisis de investigación de incidentes (Árbol Causal, Ishikawa, 5 Porqués)
          </p>
        </div>
        <Button onClick={() => router.push('/root-cause-analysis/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Análisis</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <GitBranch className="h-10 w-10 text-slate-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Clock className="h-10 w-10 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completados</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Metodologías</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-600 font-medium">{stats.causalTree} AC</span>
                  <span className="text-xs text-blue-600 font-medium">{stats.fishbone} IK</span>
                  <span className="text-xs text-purple-600 font-medium">{stats.fiveWhys} 5P</span>
                </div>
              </div>
              <HelpCircle className="h-10 w-10 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por correlativo (ej: 00042), título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={methodologyFilter}
              onValueChange={(v) => setMethodologyFilter(v as MethodologyType)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Metodología" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las metodologías</SelectItem>
                <SelectItem value="causal-tree">Árbol Causal</SelectItem>
                <SelectItem value="fishbone">Diagrama Ishikawa</SelectItem>
                <SelectItem value="five-whys">5 Porqués</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Cargando análisis...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron análisis</h3>
            <p className="text-gray-600 mb-4">
              {allAnalyses.length === 0
                ? 'Aún no hay análisis creados. Crea el primero.'
                : 'No hay análisis que coincidan con los filtros seleccionados.'}
            </p>
            {allAnalyses.length === 0 && (
              <Button onClick={() => router.push('/root-cause-analysis/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Análisis
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map((analysis) => {
            const methodConfig = METHODOLOGY_CONFIG[analysis.methodology]
            const statusConfig = STATUS_CONFIG[analysis.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
            const Icon = methodConfig.icon
            const StatusIcon = statusConfig.icon

            return (
              <Card
                key={`${analysis.methodology}-${analysis.id}`}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(getAnalysisUrl(analysis))}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Correlativo Badge - Prominente */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`p-3 rounded-lg ${methodConfig.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {getCorrelativo(analysis.incidentId) && (
                        <Badge variant="secondary" className="font-mono text-xs font-bold bg-slate-800 text-white hover:bg-slate-700">
                          #{getCorrelativo(analysis.incidentId)}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold truncate">{analysis.title}</h3>
                        <Badge variant="outline" className={methodConfig.color}>
                          {methodConfig.label}
                        </Badge>
                        <Badge variant="secondary" className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(analysis.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(getAnalysisUrl(analysis))
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Análisis
                        </DropdownMenuItem>
                        {isDraft(analysis.status) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(getEditUrl(analysis))
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Descarga de PDF no disponible aún')
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Descarga de Word no disponible aún')
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Descargar Word
                        </DropdownMenuItem>
                        {isDraft(analysis.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAnalysisToDelete(analysis)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!analysisToDelete} onOpenChange={() => setAnalysisToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar análisis</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el análisis &quot;{analysisToDelete?.title}&quot;?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
