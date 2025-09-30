'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Plus, Search, FileText, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with actual API call
const mockAnalyses = [
  {
    id: '1',
    problem: 'Problemas de calidad en la línea de producción',
    incidentId: 'inc-001',
    status: 'approved',
    createdBy: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z',
    reviewedBy: 'Jane Smith',
    reviewedAt: '2024-01-16T14:20:00Z',
    categoriesCount: 6,
    totalCauses: 15,
  },
  {
    id: '2',
    problem: 'Accidente laboral en área de ensamblaje',
    incidentId: 'inc-002',
    status: 'in_review',
    createdBy: 'Alice Johnson',
    createdAt: '2024-01-18T09:15:00Z',
    categoriesCount: 4,
    totalCauses: 10,
  },
  {
    id: '3',
    problem: 'Análisis de falla de equipo',
    incidentId: 'inc-003',
    status: 'draft',
    createdBy: 'Bob Wilson',
    createdAt: '2024-01-20T16:45:00Z',
    categoriesCount: 5,
    totalCauses: 8,
  },
]

export default function FishboneListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: Clock,
      in_review: Clock,
      approved: CheckCircle2,
      rejected: XCircle,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
  }

  const filteredAnalyses = mockAnalyses.filter((analysis) => {
    const matchesSearch = analysis.problem.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Espina de Pescado (Ishikawa)</h1>
          <p className="text-muted-foreground">Diagramas de causa y efecto para análisis de causa raíz</p>
        </div>
        <Link href="/analysis/fishbone/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Análisis
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
              placeholder="Buscar análisis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('draft')}
              >
                Borrador
              </Button>
              <Button
                variant={statusFilter === 'in_review' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('in_review')}
              >
                En Revisión
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                Aprobado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Análisis Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockAnalyses.filter((a) => a.status === 'in_review').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockAnalyses.filter((a) => a.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Borrador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {mockAnalyses.filter((a) => a.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyses List */}
      <div className="space-y-4">
        {filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron análisis</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Intente ajustar sus filtros'
                  : 'Comience creando su primer análisis de espina de pescado'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/analysis/fishbone/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Análisis
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAnalyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/analysis/fishbone/${analysis.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{analysis.problem}</h3>
                      <Badge className={getStatusColor(analysis.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(analysis.status)}
                          {analysis.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                      <div>
                        <p className="font-medium text-foreground">Incidente</p>
                        <p>#{analysis.incidentId}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Creado Por</p>
                        <p>{analysis.createdBy}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Creado</p>
                        <p>{new Date(analysis.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {analysis.reviewedBy && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-2">
                        <div>
                          <p className="font-medium text-foreground">Revisado Por</p>
                          <p>{analysis.reviewedBy}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Revisado</p>
                          <p>{new Date(analysis.reviewedAt!).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline">{analysis.categoriesCount} Categories</Badge>
                    <Badge variant="secondary">{analysis.totalCauses} Causes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}