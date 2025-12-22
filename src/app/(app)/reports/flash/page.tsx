/**
 * Flash Reports List Page
 * Manage flash reports (must be created within 24 hours of incident)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlashReports, useDeleteFlashReport } from '@/shared/hooks/report-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import { api } from '@/lib/api'
import type { FlashReport } from '@/shared/types/api'
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
  Zap,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  FileText
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

export default function FlashReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useFlashReports()
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteFlashReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  /**
   * Generate filename for export
   * Format: [Empresa] Reporte [Tipo] [Tipo Incidente] [Fecha] [Correlativo].[Extension]
   * Example: "Origix Reporte Flash Incidente Laboral 17-11-2025 00042.pdf"
   */
  const generateExportFilename = (report: FlashReport, exportFormat: 'pdf' | 'docx'): string => {
    const empresa = report.empresa || 'Origix'
    const tipoReporte = 'Flash'
    const tipoIncidente = report.tipo || 'Incidente'
    const fecha = report.fecha
      ? format(new Date(report.fecha), 'dd-MM-yyyy')
      : format(new Date(), 'dd-MM-yyyy')
    const correlativo = report.numero_prodity || report.id.substring(0, 5).toUpperCase()

    return `${empresa} Reporte ${tipoReporte} ${tipoIncidente} ${fecha} ${correlativo}.${exportFormat}`
  }

  const handleExport = async (report: FlashReport, exportFormat: 'pdf' | 'docx') => {
    try {
      toast.info(`Descargando reporte en formato ${exportFormat.toUpperCase()}...`)
      const filename = generateExportFilename(report, exportFormat)
      await api.flashReport.export(report.id, exportFormat, filename)
      toast.success(`Reporte descargado: ${filename}`)
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
      toast.error('Error al descargar el reporte')
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
    const suceso = report.suceso?.toLowerCase() || ''
    const lugar = report.lugar?.toLowerCase() || ''
    const numeroProdity = report.numero_prodity?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      suceso.includes(searchLower) ||
      lugar.includes(searchLower) ||
      numeroProdity.includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === 'all' || report.report_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: reports?.length || 0,
    draft: reports?.filter(r => r.report_status === 'draft').length || 0,
    submitted: reports?.filter(r => r.report_status === 'submitted' || r.report_status === 'under_review').length || 0,
    approved: reports?.filter(r => r.report_status === 'approved' || r.report_status === 'completed').length || 0,
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
          <h1 className="text-3xl font-bold text-gray-900">Flash Reports</h1>
          <p className="text-gray-600 mt-1">Reportes iniciales de incidentes (deben crearse dentro de 24 horas)</p>
        </div>
        <Button onClick={() => router.push('/reports/flash/create')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Flash Report
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
              <Zap className="h-10 w-10 text-blue-500 opacity-80" />
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
                <p className="text-sm font-medium text-yellow-600">En Revisión</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.submitted}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Aprobados</p>
                <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
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
                  placeholder="Buscar por suceso, lugar o número Prodity..."
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
            <Zap className="h-5 w-5" />
            Flash Reports ({filteredReports?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron reportes con los filtros aplicados'
                  : 'Comienza creando tu primer Flash Report'}
              </p>
              <Button onClick={() => router.push('/reports/flash/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Flash Report
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report: FlashReport) => (
                <div
                  key={report.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/reports/flash/${report.id}`)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Title and info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {report.suceso || 'Sin título'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {report.tipo && (
                              <Badge variant="outline" className="text-xs">
                                {report.tipo}
                              </Badge>
                            )}
                            {report.numero_prodity && (
                              <Badge variant="secondary" className="text-xs">
                                Prodity: {report.numero_prodity}
                              </Badge>
                            )}
                            <ReportStatusBadge status={report.report_status} />
                          </div>
                          {report.lugar && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {report.lugar}
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
                          {report.fecha ? (
                            <span>
                              {format(new Date(report.fecha), 'dd MMM yyyy', { locale: es })}
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
                          onClick={() => router.push(`/reports/flash/${report.id}`)}
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
                            <DropdownMenuItem onClick={() => router.push(`/reports/flash/${report.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            {report.report_status === 'draft' && (
                              <DropdownMenuItem onClick={() => router.push(`/reports/flash/${report.id}/edit`)}>
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
              ))}
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
