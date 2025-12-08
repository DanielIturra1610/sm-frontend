/**
 * Flash Reports List Page
 * Manage flash reports (must be created within 24 hours of incident)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlashReports } from '@/shared/hooks/report-hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import type { FlashReport, ReportStatus } from '@/shared/types/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function FlashReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useFlashReports()
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all')

  const getStatusBadge = (status: ReportStatus) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'secondary' as const, icon: Edit },
      submitted: { label: 'Enviado', variant: 'default' as const, icon: Clock },
      under_review: { label: 'En Revisión', variant: 'default' as const, icon: Clock },
      approved: { label: 'Aprobado', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rechazado', variant: 'destructive' as const, icon: XCircle },
      in_progress: { label: 'En Progreso', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle },
      published: { label: 'Publicado', variant: 'default' as const, icon: CheckCircle },
      closed: { label: 'Cerrado', variant: 'secondary' as const, icon: CheckCircle },
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredReports = reports?.filter(
    (report) => filter === 'all' || report.report_status === filter
  )

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Error al cargar los reportes: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flash Reports</h1>
          <p className="text-gray-600">
            Reportes iniciales de incidentes (deben crearse dentro de 24 horas)
          </p>
        </div>
        <Button onClick={() => router.push('/reports/flash/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Flash Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          Borradores
        </Button>
        <Button
          variant={filter === 'submitted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('submitted')}
        >
          Enviados
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Aprobados
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((report: FlashReport) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {report.suceso || 'Sin título'}
                      </h3>
                      {getStatusBadge(report.report_status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {report.tipo && <p>Tipo: {report.tipo}</p>}
                      {report.lugar && <p>Lugar: {report.lugar}</p>}
                      {report.fecha && (
                        <p>
                          Fecha:{' '}
                          {format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      )}
                      {report.numero_prodity && (
                        <p>No. Prodity: {report.numero_prodity}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Creado: {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/reports/flash/${report.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {report.report_status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/reports/flash/${report.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando un nuevo Flash Report
              </p>
              <Button onClick={() => router.push('/reports/flash/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Flash Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
