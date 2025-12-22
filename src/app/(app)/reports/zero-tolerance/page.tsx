/**
 * Zero Tolerance Reports List Page
 * View and manage all zero tolerance reports
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZeroToleranceReports, useDeleteZeroToleranceReport } from '@/shared/hooks/report-hooks'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
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
import { Plus, Search, Eye, AlertCircle, ShieldAlert, Download, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportStatus } from '@/shared/types/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const SEVERIDAD_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: 'Baja', className: 'bg-yellow-100 text-yellow-800' },
  medium: { label: 'Media', className: 'bg-orange-100 text-orange-800' },
  high: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  critical: { label: 'Crítica', className: 'bg-purple-100 text-purple-800' },
}

export default function ZeroToleranceReportsPage() {
  const router = useRouter()
  const { data: reports, error, isLoading } = useZeroToleranceReports()
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteZeroToleranceReport()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

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
    } catch {
      toast.error('Error al eliminar el reporte')
    } finally {
      setReportToDelete(null)
    }
  }

  const filteredReports = reports?.filter((report) => {
    const matchesSearch =
      report.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.suceso?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los reportes</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Tolerancia Cero</h1>
          <p className="text-gray-600 mt-1">Registro de incumplimientos críticos de seguridad</p>
        </div>
        <Button onClick={() => router.push('/reports/zero-tolerance/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número de documento, suceso..."
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
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
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
              <ShieldAlert className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reportes disponibles</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron reportes con los filtros aplicados'
                  : 'Comienza creando tu primer reporte de tolerancia cero'}
              </p>
              <Button onClick={() => router.push('/reports/zero-tolerance/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Reporte
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Documento</TableHead>
                    <TableHead>Suceso</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-semibold">
                        {report.numero_documento || 'Sin N°'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.suceso || '-'}
                      </TableCell>
                      <TableCell>
                        {report.fecha_hora ? (
                          format(new Date(report.fecha_hora), 'dd/MM/yy HH:mm', { locale: es })
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{report.lugar || '-'}</TableCell>
                      <TableCell>{report.empresa || '-'}</TableCell>
                      <TableCell>
                        {report.severidad && SEVERIDAD_LABELS[report.severidad] ? (
                          <Badge className={SEVERIDAD_LABELS[report.severidad].className}>
                            {SEVERIDAD_LABELS[report.severidad].label}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.report_status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/zero-tolerance/${report.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleExport(report.id, 'pdf')}>
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(report.id, 'docx')}>
                                Descargar Word
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {report.report_status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/reports/zero-tolerance/${report.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setReportToDelete(report.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
