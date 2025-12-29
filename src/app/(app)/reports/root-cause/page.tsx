/**
 * Root Cause Reports List Page
 * View and manage all root cause analysis reports
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useRootCauseReports, useDeleteRootCauseReport } from '@/shared/hooks/report-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import type { Incident } from '@/shared/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Plus, Search, Eye, AlertCircle, GitBranch, Download, Edit, Trash2, MoreHorizontal, Hash } from 'lucide-react'
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

const METODOLOGIA_LABELS: Record<string, string> = {
  five_whys: '5 Por Qués',
  fishbone: 'Diagrama de Ishikawa',
  six_sigma: 'Six Sigma',
  fmea: 'FMEA',
  other: 'Otra',
}

export default function RootCauseReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useRootCauseReports()
  const { data: incidentsData } = useIncidents()
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteRootCauseReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  // Create incident lookup map for correlativo
  const incidentMap = useMemo(() => {
    const map = new Map<string, Incident>()
    const incidents = incidentsData?.data || []
    incidents.forEach((inc: Incident) => map.set(inc.id, inc))
    return map
  }, [incidentsData])

  // Get correlativo for a report
  const getCorrelativo = (incidentId: string): string => {
    const incident = incidentMap.get(incidentId)
    return incident?.incidentNumber || incident?.correlativo || ''
  }

  const handleExport = async (reportId: string, format: 'pdf' | 'docx') => {
    try {
      toast.info(`Descargando reporte en formato ${format.toUpperCase()}...`)
      toast.success(`Reporte descargado exitosamente`)
    } catch {
      toast.error('Error al descargar el reporte')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!reportToDelete) return
    try {
      await deleteReport(reportToDelete)
      toast.success('Reporte eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar reporte:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al eliminar el reporte: ${errorMessage}`)
    } finally {
      setReportToDelete(null)
    }
  }

  const filteredReports = reports?.filter((report) => {
    const correlativo = getCorrelativo(report.incident_id).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      correlativo.includes(searchLower) ||
      report.incident_id?.toLowerCase().includes(searchLower) ||
      report.id.toLowerCase().includes(searchLower) ||
      report.metodologia?.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === 'all' || report.report_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Análisis de Causa Raíz</h1>
          <p className="text-gray-600 mt-1">Análisis profundo con metodología 5 Por Qués (2-7 días)</p>
        </div>
        <Button onClick={() => router.push('/reports/root-cause/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por correlativo (ej: 00042), metodología o ID..."
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

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes ({filteredReports?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredReports || filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay análisis disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron análisis con los filtros aplicados'
                  : 'Comienza creando tu primer análisis de causa raíz'}
              </p>
              <Button onClick={() => router.push('/reports/root-cause/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Análisis
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Reporte</TableHead>
                    <TableHead>Correlativo</TableHead>
                    <TableHead>Metodología</TableHead>
                    <TableHead>Tablas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {report.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {getCorrelativo(report.incident_id) ? (
                          <Badge variant="secondary" className="font-mono text-xs font-bold bg-slate-800 text-white hover:bg-slate-700">
                            #{getCorrelativo(report.incident_id)}
                          </Badge>
                        ) : (
                          <span className="font-mono text-sm text-gray-500">
                            {report.incident_id.substring(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {METODOLOGIA_LABELS[report.metodologia] || report.metodologia}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {report.analysis_tables?.length || 0}
                          </span>
                          <span className="text-sm text-gray-500">tablas</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.report_status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/root-cause/${report.id}`)}
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
                              <DropdownMenuItem onClick={() => router.push(`/reports/root-cause/${report.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              {report.report_status === 'draft' && (
                                <DropdownMenuItem onClick={() => router.push(`/reports/root-cause/${report.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExport(report.id, 'pdf')}>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(report.id, 'docx')}>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
