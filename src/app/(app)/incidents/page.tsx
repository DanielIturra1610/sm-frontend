/**
 * Incidents Management Page
 * View and manage all incidents/sucesos
 * Clean UI with cards and list view
 */

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIncidents, useDeleteIncident, useIncidentStats } from '@/shared/hooks/incident-hooks'
import {
  IncidentStatusBadge,
  IncidentSeverityBadge,
  IncidentTypeBadge
} from '@/shared/components/ui/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Plus,
  Search,
  Eye,
  AlertCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Incident, IncidentListParams } from '@/shared/types/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { toast } from 'sonner'
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

// Get severity icon and color
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
    case 'high':
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' }
    case 'medium':
      return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' }
    default:
      return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' }
  }
}

export default function IncidentsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<IncidentListParams>({
    page: 1,
    limit: 10,
    sort: 'reportedAt',
    order: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null)

  // API Hooks
  const { data: apiResponse, error, isLoading, mutate } = useIncidents(filters)
  const { data: stats, isLoading: statsLoading } = useIncidentStats()
  const { trigger: deleteIncident, isMutating: isDeleting } = useDeleteIncident()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        page: 1
      }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, severityFilter])

  // Data
  const incidents = useMemo(() => apiResponse?.data || [], [apiResponse])
  const pagination = useMemo(() => apiResponse?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }, [apiResponse])

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar sucesos: ' + (error.message || 'Error desconocido'))
    }
  }, [error])

  // Handlers
  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!incidentToDelete) return
    try {
      await deleteIncident(incidentToDelete.id)
      toast.success('Suceso eliminado exitosamente')
    } catch {
      toast.error('Error al eliminar el suceso')
    } finally {
      setIncidentToDelete(null)
    }
  }, [incidentToDelete, deleteIncident])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }, [])

  // Loading state
  if (isLoading && !apiResponse) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar los sucesos
            </h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => mutate()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sucesos</h1>
          <p className="text-gray-600 mt-1">Monitorea y gestiona todos los sucesos de seguridad</p>
        </div>
        <Button onClick={() => router.push('/incidents/create')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Suceso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sucesos</p>
                <div className="text-3xl font-bold text-blue-900">
                  {statsLoading ? <Skeleton className="h-9 w-12" /> : stats?.totalIncidents ?? 0}
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Abiertos</p>
                <div className="text-3xl font-bold text-orange-900">
                  {statsLoading ? <Skeleton className="h-9 w-12" /> : stats?.openIncidents ?? 0}
                </div>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Críticos</p>
                <div className="text-3xl font-bold text-red-900">
                  {statsLoading ? <Skeleton className="h-9 w-12" /> : stats?.severityDistribution?.critical ?? 0}
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resueltos</p>
                <div className="text-3xl font-bold text-green-900">
                  {statsLoading ? <Skeleton className="h-9 w-12" /> : stats?.statusDistribution?.resolved ?? 0}
                </div>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, ubicación o correlativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="reported">Reportado</SelectItem>
                  <SelectItem value="investigating">En Investigación</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Sucesos ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay sucesos disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'No se encontraron sucesos con los filtros aplicados'
                  : 'Comienza registrando tu primer suceso'}
              </p>
              <Button onClick={() => router.push('/incidents/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Suceso
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {incidents.map((incident) => {
                const severityInfo = getSeverityIcon(incident.severity)
                const SeverityIcon = severityInfo.icon

                return (
                  <div
                    key={incident.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/incidents/${incident.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Icon and Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Correlativo Badge - Prominente */}
                          <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${severityInfo.bg}`}>
                              <SeverityIcon className={`h-6 w-6 ${severityInfo.color}`} />
                            </div>
                            {incident.incidentNumber && (
                              <Badge variant="secondary" className="font-mono text-xs font-bold bg-slate-800 text-white hover:bg-slate-700">
                                #{incident.incidentNumber}
                              </Badge>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {incident.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <IncidentTypeBadge type={incident.type} />
                              <IncidentSeverityBadge severity={incident.severity} />
                              <IncidentStatusBadge status={incident.status} />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {incident.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {incident.reportedBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Date and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(incident.reportedAt), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true, locale: es })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/incidents/${incident.id}`)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/incidents/${incident.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/incidents/${incident.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setIncidentToDelete(incident)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} sucesos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!incidentToDelete} onOpenChange={() => setIncidentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar suceso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el suceso{' '}
              <span className="font-semibold">&quot;{incidentToDelete?.title}&quot;</span>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
