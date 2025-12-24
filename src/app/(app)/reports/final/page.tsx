/**
 * Final Reports List Page
 * View and manage all final incident reports
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useFinalReports, useDeleteFinalReport } from '@/shared/hooks/report-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import { api } from '@/lib/api'
import type { FinalReport, Incident, ReportStatus } from '@/shared/types/api'
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
  CheckCircle2,
  Clock,
  MoreHorizontal,
  FileCheck,
  Users,
  Truck,
  Building2,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
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

export default function FinalReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useFinalReports()
  const { data: incidentsData, isLoading: isLoadingIncidents } = useIncidents({ limit: 1000 })
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteFinalReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  // Create incidents map for quick lookup
  const incidentsMap = useMemo(() => {
    const map = new Map<string, Incident>()
    incidentsData?.data?.forEach((incident) => {
      map.set(incident.id, incident)
    })
    return map
  }, [incidentsData])

  const getIncident = (incidentId: string) => {
    return incidentsMap.get(incidentId)
  }

  /**
   * Get incident title for display
   */
  const getIncidentTitle = (report: FinalReport): string => {
    const incident = getIncident(report.incident_id)
    if (incident?.descripcion_breve) {
      return incident.descripcion_breve.substring(0, 60) + (incident.descripcion_breve.length > 60 ? '...' : '')
    }
    if (incident?.title) {
      return incident.title
    }
    if (report.detalles_accidente) {
      return report.detalles_accidente.substring(0, 60) + (report.detalles_accidente.length > 60 ? '...' : '')
    }
    return 'Informe Final de Incidente'
  }

  /**
   * Get incident type abbreviation for filename
   */
  const getIncidentTypeAbbrev = (report: FinalReport): string => {
    const parts: string[] = []
    const tipo = report.tipo_accidente_tabla

    if (tipo?.con_baja_il) parts.push('CB')
    if (tipo?.sin_baja_il) parts.push('SB')
    if (tipo?.incidente_industrial) parts.push('IND')
    if (tipo?.incidente_laboral) parts.push('LAB')
    if (tipo?.es_plgf && tipo?.nivel_plgf) parts.push(tipo.nivel_plgf)

    return parts.length > 0 ? parts.join(' ') : 'INC'
  }

  /**
   * Generate filename for export
   * Format: 5. Informe Final DD-MM-YYYY [TIPO] [EMPRESA] [CORRELATIVO].[ext]
   * Example: "5. Informe Final 05-11-2025 INC IND PYT TX OH.docx"
   */
  const generateExportFilename = (report: FinalReport, exportFormat: 'pdf' | 'docx'): string => {
    const incident = getIncident(report.incident_id)
    const fecha = report.created_at
      ? format(new Date(report.created_at), 'dd-MM-yyyy')
      : format(new Date(), 'dd-MM-yyyy')
    const tipoIncidente = getIncidentTypeAbbrev(report)
    const empresa = report.company_data?.nombre?.substring(0, 15) || incident?.empresa?.substring(0, 15) || ''
    const correlativo = incident?.numero_prodity || report.id.substring(0, 5).toUpperCase()

    const nameParts = ['5. Informe Final', fecha, tipoIncidente]
    if (empresa) nameParts.push(empresa)
    if (correlativo) nameParts.push(correlativo)

    return `${nameParts.join(' ')}.${exportFormat}`
  }

  const handleExport = async (report: FinalReport, exportFormat: 'pdf' | 'docx') => {
    try {
      toast.info(`Descargando informe en formato ${exportFormat.toUpperCase()}...`)
      const filename = generateExportFilename(report, exportFormat)
      await api.finalReport.export(report.id, exportFormat, filename)
      toast.success(`Informe descargado: ${filename}`)
    } catch (error) {
      console.error('Error al descargar el informe:', error)
      toast.error('Error al descargar el informe')
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
    const suceso = incident?.descripcion_breve?.toLowerCase() || ''
    const empresa = report.company_data?.nombre?.toLowerCase() || incident?.empresa?.toLowerCase() || ''
    const correlativo = incident?.numero_prodity?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      suceso.includes(searchLower) ||
      empresa.includes(searchLower) ||
      correlativo.includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === 'all' || report.report_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: reports?.length || 0,
    draft: reports?.filter(r => r.report_status === 'draft').length || 0,
    submitted: reports?.filter(r => r.report_status === 'submitted' || r.report_status === 'under_review').length || 0,
    approved: reports?.filter(r => r.report_status === 'approved' || r.report_status === 'published' || r.report_status === 'closed').length || 0,
    totalPersonas: reports?.reduce((sum, r) => sum + (r.personas_involucradas?.length || 0), 0) || 0,
    totalEquipos: reports?.reduce((sum, r) => sum + (r.equipos_danados?.length || 0), 0) || 0,
  }

  if (isLoading || isLoadingIncidents) {
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
              Error al cargar los informes
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
          <h1 className="text-3xl font-bold text-gray-900">Informes Finales</h1>
          <p className="text-gray-600 mt-1">Informes completos de investigación de incidentes</p>
        </div>
        <Button onClick={() => router.push('/reports/final/create')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Informe Final
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Total Informes</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.total}</p>
              </div>
              <FileCheck className="h-10 w-10 text-indigo-500 opacity-80" />
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
                  placeholder="Buscar por suceso, empresa o correlativo..."
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
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
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
            <FileCheck className="h-5 w-5" />
            Informes Finales ({filteredReports?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay informes disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron informes con los filtros aplicados'
                  : 'Comienza creando tu primer Informe Final'}
              </p>
              <Button onClick={() => router.push('/reports/final/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Informe Final
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReports.map((report: FinalReport) => {
                const incident = getIncident(report.incident_id)
                return (
                  <div
                    key={report.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/reports/final/${report.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Title and info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <FileCheck className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {getIncidentTitle(report)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {report.company_data?.nombre && (
                                <Badge variant="outline" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {report.company_data.nombre}
                                </Badge>
                              )}
                              {incident?.numero_prodity && (
                                <Badge variant="secondary" className="text-xs">
                                  Prodity: {incident.numero_prodity}
                                </Badge>
                              )}
                              <ReportStatusBadge status={report.report_status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                              {(report.personas_involucradas?.length || 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {report.personas_involucradas?.length} persona(s)
                                </span>
                              )}
                              {(report.equipos_danados?.length || 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <Truck className="h-4 w-4" />
                                  {report.equipos_danados?.length} equipo(s)
                                </span>
                              )}
                              {(report.analisis_causas_raiz?.length || 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {report.analisis_causas_raiz?.length} causa(s) raíz
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dates and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {report.generated_at ? (
                              <span>
                                Generado: {format(new Date(report.generated_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            ) : (
                              <span>
                                {format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })}
                              </span>
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
                            onClick={() => router.push(`/reports/final/${report.id}`)}
                            title="Ver informe"
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
                              <DropdownMenuItem onClick={() => router.push(`/reports/final/${report.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              {report.report_status === 'draft' && (
                                <DropdownMenuItem onClick={() => router.push(`/reports/final/${report.id}/edit`)}>
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
            <AlertDialogTitle>Eliminar informe</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El informe será eliminado permanentemente.
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
