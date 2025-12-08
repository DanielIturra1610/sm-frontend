'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Search, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useCausalTreeAnalyses } from '@/shared/hooks/causal-tree-hooks'
import type { CausalTreeAnalysisFilter } from '@/shared/types/causal-tree'

export default function CausalTreePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filter: CausalTreeAnalysisFilter = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
    limit: 20,
    offset: 0,
  }

  const { data, isLoading, error } = useCausalTreeAnalyses(filter)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      draft: { variant: 'outline', icon: FileText, label: 'Borrador' },
      in_progress: { variant: 'default', icon: Clock, label: 'En Progreso' },
      completed: { variant: 'default', icon: CheckCircle2, label: 'Completado' },
      reviewed: { variant: 'default', icon: CheckCircle2, label: 'Revisado' },
      archived: { variant: 'secondary', icon: AlertCircle, label: 'Archivado' },
    }

    const config = variants[status] || variants.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'border-l-gray-400',
      in_progress: 'border-l-blue-500',
      completed: 'border-l-green-500',
      reviewed: 'border-l-purple-500',
      archived: 'border-l-gray-500',
    }
    return colors[status] || 'border-l-gray-400'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Árbol Causal</h1>
          <p className="text-muted-foreground">
            Análisis de causas mediante árbol de eventos
          </p>
        </div>
        <Button onClick={() => router.push('/causal-tree/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar análisis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="reviewed">Revisado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando análisis...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar los análisis. Por favor, intenta nuevamente.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis List */}
      {data && (
        <div className="space-y-4">
          {data.analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay análisis</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No se encontraron análisis con los filtros aplicados.'
                      : 'Comienza creando tu primer análisis de árbol causal.'}
                  </p>
                  <Button onClick={() => router.push('/causal-tree/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Análisis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {data.analyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getStatusColor(
                      analysis.status
                    )}`}
                    onClick={() => router.push(`/causal-tree/${analysis.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{analysis.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {analysis.finalEvent}
                          </CardDescription>
                        </div>
                        {getStatusBadge(analysis.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{analysis.nodes.length} nodos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{analysis.rootCauses.length} causas raíz</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{analysis.preventiveMeasures.length} medidas</span>
                        </div>
                      </div>
                      {analysis.description && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {analysis.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Info */}
              <div className="text-center text-sm text-muted-foreground">
                Mostrando {data.analyses.length} de {data.total} análisis
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
