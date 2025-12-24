'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  GitBranch,
  Fish,
  HelpCircle,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  FileText,
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
import { useQueryClient } from '@tanstack/react-query'
import { useCausalTreeAnalyses, useDeleteCausalTreeAnalysis } from '@/shared/hooks/causal-tree-hooks'
import { useFishboneAnalyses, useFiveWhysAnalyses, useDeleteFishboneAnalysis, useDeleteFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
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

  // Fetch all analyses
  const { data: causalTreeData, isLoading: loadingCausalTree, refetch: refetchCausalTree } = useCausalTreeAnalyses()
  const { data: fishboneData, isLoading: loadingFishbone, mutate: mutateFishbone } = useFishboneAnalyses()
  const { data: fiveWhysData, isLoading: loadingFiveWhys, mutate: mutateFiveWhys } = useFiveWhysAnalyses()

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

  const handleDelete = async (analysis: UnifiedAnalysis) => {
    const confirmed = window.confirm(`¿Estás seguro de eliminar el análisis "${analysis.title}"?`)
    if (!confirmed) return

    try {
      if (analysis.methodology === 'causal-tree') {
        await deleteCausalTree.mutateAsync(analysis.id)
      } else if (analysis.methodology === 'fishbone') {
        await deleteFishbone.trigger(analysis.id)
      } else if (analysis.methodology === 'five-whys') {
        await deleteFiveWhys.trigger(analysis.id)
      }
      // Refresh all data after deletion
      await refreshAllData()
      toast.success('Análisis eliminado correctamente')
    } catch (error) {
      console.error('Error deleting analysis:', error)
      toast.error('Error al eliminar el análisis')
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
    if (analysis.title && analysis.title.trim()) {
      return `${prefix} - ${analysis.title.trim()}`
    }
    if (analysis.finalEvent && analysis.finalEvent.trim()) {
      return `${prefix} - ${analysis.finalEvent.trim()}`
    }
    return prefix
  }

  // Unify all analyses into a single list
  const allAnalyses: UnifiedAnalysis[] = [
    ...(causalTreeData?.analyses || []).map((a: any) => ({
      id: a.id,
      title: getCausalTreeDisplayTitle(a),
      methodology: 'causal-tree' as const,
      status: a.status || 'draft',
      incidentId: a.incidentId || '',
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      finalEvent: a.finalEvent,
    })),
    ...(fishboneData?.analyses || []).map((a: any) => ({
      id: a.id,
      title: a.problem || 'Diagrama Ishikawa',
      methodology: 'fishbone' as const,
      status: a.status || 'draft',
      incidentId: a.incidentId,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      problem: a.problem,
    })),
    ...(fiveWhysData?.analyses || []).map((a: any) => ({
      id: a.id,
      title: a.title || 'Análisis 5 Porqués',
      methodology: 'five-whys' as const,
      status: a.status || 'draft',
      incidentId: a.incidentId,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      problem: a.problemStatement,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Apply filters
  const filteredAnalyses = allAnalyses.filter((analysis) => {
    const title = analysis.title || ''
    const incidentId = analysis.incidentId || ''
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incidentId.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análisis de Causa Raíz</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos los análisis de investigación de incidentes
          </p>
        </div>
        <Button onClick={() => router.push('/root-cause-analysis/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.causalTree}</div>
            <p className="text-xs text-muted-foreground">Árbol Causal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.fishbone}</div>
            <p className="text-xs text-muted-foreground">Ishikawa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.fiveWhys}</div>
            <p className="text-xs text-muted-foreground">5 Porqués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o incidente..."
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
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron análisis</h3>
            <p className="text-muted-foreground mb-4">
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
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${methodConfig.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                                handleDelete(analysis)
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
    </div>
  )
}
