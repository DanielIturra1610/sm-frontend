/**
 * Action Plan Reports List Page
 * View and manage all action plan reports
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useActionPlanReports, useDeleteActionPlanReport, useFlashReports } from '@/shared/hooks/report-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import type { ActionPlanReport, Incident, FlashReport } from '@/shared/types/api'
import { exportActionPlanToWord, exportActionPlanToPDF } from '@/shared/utils/action-plan-export'
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
  ClipboardList,
  Calendar,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Hash,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportStatus } from '@/shared/types/api'
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

export default function ActionPlanReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useActionPlanReports()
  const { data: incidentsData, isLoading: isLoadingIncidents } = useIncidents({ limit: 1000 })
  const { data: flashReports, isLoading: isLoadingFlash } = useFlashReports()
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteActionPlanReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  // Create a map of incidents by ID for quick lookup
  const incidentsMap = useMemo(() => {
    const map = new Map<string, Incident>()
    incidentsData?.data?.forEach((incident) => {
      map.set(incident.id, incident)
    })
    return map
  }, [incidentsData])

  // Create a map of flash reports by incident_id for empresa lookup
  const flashReportsMap = useMemo(() => {
    const map = new Map<string, FlashReport>()
    flashReports?.forEach((report) => {
      map.set(report.incident_id, report)
    })
    return map
  }, [flashReports])

  // Helper to get incident details
  const getIncident = (incidentId: string) => {
    return incidentsMap.get(incidentId)
  }

  // Helper to get empresa from flash report
  const getEmpresa = (incidentId: string): string | undefined => {
    return flashReportsMap.get(incidentId)?.empresa
  }

  // Get correlativo number for display and search
  const getCorrelativo = (incident: Incident | undefined): string => {
    return incident?.incidentNumber || incident?.correlativo || ''
  }

  const handleExport = async (report: ActionPlanReport, exportFormat: 'pdf' | 'docx') => {
    try {
      toast.info(`Generando reporte en formato ${exportFormat.toUpperCase()}...`)
      const incident = getIncident(report.incident_id)
      const correlativo = getCorrelativo(incident)
      const metadata = {
        empresa: getEmpresa(report.incident_id),
        fecha: report.fecha_inicio,
        correlativo: correlativo,
      }

      if (exportFormat === 'docx') {
        await exportActionPlanToWord(report, metadata)
      } else {
        await exportActionPlanToPDF(report, metadata)
      }
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Error al generar el reporte')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!reportToDelete) return
    try {
      await deleteReport(reportToDelete)
      toast.success('Reporte eliminado exitosamente')
    } catch {
      toast.error('Error al eliminar el reporte')
    } finally {
      setReportToDelete(null)
    }
  }

  const filteredReports = reports?.filter((report) => {
    const incident = getIncident(report.incident_id)
    const incidentTitle = incident?.descripcion_breve?.toLowerCase() || ''
    const correlativo = getCorrelativo(incident).toLowerCase()
    const incidentTipo = incident?.tipo?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      incidentTitle.includes(searchLower) ||
      correlativo.includes(searchLower) ||
      incidentTipo.includes(searchLower) ||
      report.incident_id.toLowerCase().includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === 'all' || report.report_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: reports?.length || 0,
    draft: reports?.filter(r => r.report_status === 'draft').length || 0,
    inProgress: reports?.filter(r => r.report_status === 'in_progress' || r.report_status === 'under_review').length || 0,
    completed: reports?.filter(r => r.report_status === 'approved' || r.report_status === 'completed').length || 0,
  }

  // Helper to calculate progress for a single report
  const getReportProgress = (report: ActionPlanReport) => {
    if (report.porcentaje_avance_plan && report.porcentaje_avance_plan > 0) {
      return report.porcentaje_avance_plan
    }
    if (report.items && report.items.length > 0) {
      const totalProgress = report.items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
      return Math.round(totalProgress / report.items.length)
    }
    return 0
  }

  // Calculate average progress
  const avgProgress = reports && reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + getReportProgress(r), 0) / reports.length)
    : 0

  if (isLoading || isLoadingIncidents || isLoadingFlash) {
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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar los reportes
            </h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
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
          <h1 className="text-3xl font-bold text-gray-900">Planes de Acción</h1>
          <p className="text-gray-600 mt-1">Planificación detallada de acciones correctivas (7-14 días)</p>
        </div>
        <Button onClick={() => router.push('/reports/action-plan/create')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Plan de Acción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Planes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <Edit className="h-10 w-10 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500 opacity-80" />
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por correlativo (ej: 00042), título o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="under_review">En Revisión</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Planes de Acción ({filteredReports?.length || 0})
            {avgProgress > 0 && (
              <Badge variant="secondary" className="ml-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                Avance promedio: {avgProgress}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay planes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron planes con los filtros aplicados'
                  : 'Comienza creando tu primer plan de acción'}
              </p>
              <Button onClick={() => router.push('/reports/action-plan/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Plan
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report: ActionPlanReport) => {
                const incident = getIncident(report.incident_id)
                const tasksCount = report.items?.length || 0

                // Count completed tasks: either estado is 'completed' OR avance_real >= 100
                const completedTasks = report.items?.filter(
                  item => item.estado === 'completed' || (item.avance_real && item.avance_real >= 100)
                ).length || 0

                const progress = getReportProgress(report)

                return (
                  <div
                    key={report.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/reports/action-plan/${report.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Correlativo + Title and info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Icon and Correlativo Badge */}
                          <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <ClipboardList className="h-5 w-5 text-blue-600" />
                            </div>
                            {getCorrelativo(incident) && (
                              <Badge variant="secondary" className="font-mono text-xs font-bold bg-slate-800 text-white hover:bg-slate-700">
                                #{getCorrelativo(incident)}
                              </Badge>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {incident?.descripcion_breve || incident?.title || 'Plan de Acción'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {incident?.tipo && (
                                <Badge variant="outline" className="text-xs">
                                  {incident.tipo}
                                </Badge>
                              )}
                              <ReportStatusBadge status={report.report_status} />
                            </div>
                            {/* Progress and Tasks info */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <ClipboardList className="h-4 w-4" />
                                  <span>{completedTasks}/{tasksCount} tareas</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-blue-600">
                                  {progress}%
                                </span>
                              </div>
                              {report.duracion_dias && (
                                <Badge variant="outline" className="text-xs">
                                  {report.duracion_dias} días
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dates and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          {report.fecha_inicio && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(report.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                              </span>
                              {report.fecha_fin_estimada && (
                                <span className="text-gray-400">
                                  → {format(new Date(report.fecha_fin_estimada), 'dd MMM', { locale: es })}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Creado: {format(new Date(report.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/action-plan/${report.id}`)}
                            title="Ver reporte"
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
                              <DropdownMenuItem onClick={() => router.push(`/reports/action-plan/${report.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              {report.report_status === 'draft' && (
                                <DropdownMenuItem onClick={() => router.push(`/reports/action-plan/${report.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExport(report, 'pdf')}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(report, 'docx')}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar Word
                              </DropdownMenuItem>
                              {report.report_status === 'draft' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setReportToDelete(report.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar reporte</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
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
