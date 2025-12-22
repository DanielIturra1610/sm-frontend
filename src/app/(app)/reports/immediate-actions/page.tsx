/**
 * Immediate Actions Reports List Page
 * View and manage all immediate actions reports
 * Improved UI with cards and better progress tracking
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useImmediateActionsReports, useDeleteImmediateActionsReport } from '@/shared/hooks/report-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
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
  Download,
  Edit,
  Trash2,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportStatus, ImmediateActionsReport } from '@/shared/types/api'
import { api } from '@/lib/api'
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

// Calculate progress from items
const calculateProgress = (report: ImmediateActionsReport): number => {
  // First try to use items if available
  if (report.items && report.items.length > 0) {
    const totalProgress = report.items.reduce((sum, item) => sum + (item.avance_real || 0), 0)
    return Math.round(totalProgress / report.items.length)
  }
  // Fallback to porcentaje_avance_plan from backend
  return report.porcentaje_avance_plan || 0
}

// Get progress color based on percentage
const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500'
  if (progress >= 75) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  if (progress >= 25) return 'bg-orange-500'
  return 'bg-red-500'
}

// Get report title/name
const getReportTitle = (report: ImmediateActionsReport): string => {
  if (report.incident?.correlativo) {
    return `Acciones Inmediatas - ${report.incident.correlativo}`
  }
  if (report.incident?.title) {
    return `Acciones Inmediatas - ${report.incident.title.substring(0, 30)}${report.incident.title.length > 30 ? '...' : ''}`
  }
  // Fallback: generate from dates
  if (report.fecha_inicio) {
    return `Acciones Inmediatas - ${format(new Date(report.fecha_inicio), 'dd/MM/yyyy', { locale: es })}`
  }
  return `Reporte de Acciones Inmediatas`
}

// Generate filename for export
// Format: [Empresa] Reporte [Tipo] [Tipo Incidente] [Fecha] [Correlativo].[Extension]
// Example: "Origix Reporte Acciones Inmediatas Incidente Laboral 17-11-2025 00042.pdf"
const generateExportFilename = (report: ImmediateActionsReport, extension: 'pdf' | 'docx'): string => {
  const empresa = 'Origix' // TODO: Get from tenant/company settings
  const tipoReporte = 'Acciones Inmediatas'
  const tipoIncidente = report.incident?.tipo || 'Incidente'
  const fecha = report.fecha_inicio
    ? format(new Date(report.fecha_inicio), 'dd-MM-yyyy')
    : format(new Date(report.created_at), 'dd-MM-yyyy')
  const correlativo = report.incident?.correlativo || report.id.substring(0, 8)

  return `${empresa} Reporte ${tipoReporte} ${tipoIncidente} ${fecha} ${correlativo}.${extension}`
}

export default function ImmediateActionsReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useImmediateActionsReports()
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteImmediateActionsReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  const handleExport = async (report: ImmediateActionsReport, exportFormat: 'pdf' | 'docx') => {
    try {
      toast.info(`Descargando reporte en formato ${exportFormat.toUpperCase()}...`)

      const filename = generateExportFilename(report, exportFormat)
      await api.immediateActions.export(report.id, exportFormat, filename)

      toast.success(`Reporte descargado: ${filename}`)
    } catch (error) {
      console.error('Error exporting report:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al descargar el reporte'
      toast.error(errorMessage)
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
    const title = getReportTitle(report).toLowerCase()
    const correlativo = report.incident?.correlativo?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      title.includes(searchLower) ||
      correlativo.includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === 'all' || report.report_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: reports?.length || 0,
    completed: reports?.filter(r => calculateProgress(r) === 100).length || 0,
    inProgress: reports?.filter(r => {
      const progress = calculateProgress(r)
      return progress > 0 && progress < 100
    }).length || 0,
    pending: reports?.filter(r => calculateProgress(r) === 0).length || 0,
  }

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Acciones Inmediatas</h1>
          <p className="text-gray-600 mt-1">Gestiona los reportes de acciones inmediatas (24-48 horas)</p>
        </div>
        <Button onClick={() => router.push('/reports/immediate-actions/create')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reportes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <ClipboardList className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completados (100%)</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-80" />
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

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sin Iniciar</p>
                <p className="text-3xl font-bold text-red-900">{stats.pending}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-80" />
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
                  placeholder="Buscar por correlativo, título o ID..."
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
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
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
            Reportes ({filteredReports?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron reportes con los filtros aplicados'
                  : 'Comienza creando tu primer reporte de acciones inmediatas'}
              </p>
              <Button onClick={() => router.push('/reports/immediate-actions/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Reporte
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report) => {
                const progress = calculateProgress(report)
                const progressColor = getProgressColor(progress)
                const title = getReportTitle(report)
                const itemsCount = report.items?.length || 0
                const completedItems = report.items?.filter(item => (item.avance_real || 0) >= 100).length || 0

                return (
                  <div
                    key={report.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/reports/immediate-actions/${report.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Title and info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                            progress >= 100 ? 'bg-green-100' : progress > 0 ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {progress >= 100 ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <ClipboardList className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {report.incident?.correlativo && (
                                <Badge variant="outline" className="text-xs">
                                  {report.incident.correlativo}
                                </Badge>
                              )}
                              {report.incident?.tipo && (
                                <Badge variant="secondary" className="text-xs">
                                  {report.incident.tipo}
                                </Badge>
                              )}
                              <ReportStatusBadge status={report.report_status} />
                            </div>
                            {report.incident?.descripcion_breve && (
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                {report.incident.descripcion_breve}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center: Progress */}
                      <div className="lg:w-48">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Avance</span>
                              <span className={`text-sm font-bold ${
                                progress >= 100 ? 'text-green-600' :
                                progress >= 50 ? 'text-blue-600' : 'text-gray-600'
                              }`}>
                                {progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${progressColor}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            {itemsCount > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {completedItems}/{itemsCount} acciones completadas
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Dates and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {report.fecha_inicio ? (
                              <span>
                                {format(new Date(report.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                              </span>
                            ) : (
                              <span className="text-gray-400">Sin fecha</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Creado: {format(new Date(report.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/immediate-actions/${report.id}`)}
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
                              <DropdownMenuItem onClick={() => router.push(`/reports/immediate-actions/${report.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              {report.report_status === 'draft' && (
                                <DropdownMenuItem onClick={() => router.push(`/reports/immediate-actions/${report.id}/edit`)}>
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
              Esta accion no se puede deshacer. El reporte sera eliminado permanentemente.
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
