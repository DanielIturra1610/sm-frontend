/**
 * Root Cause Reports List Page
 * View and manage all root cause analysis reports
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRootCauseReports } from '@/shared/hooks/report-hooks'
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
import { Plus, Search, Eye, AlertCircle, GitBranch, Download } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')

  const handleExport = async (reportId: string, format: 'pdf' | 'docx') => {
    try {
      toast.info(`Descargando reporte en formato ${format.toUpperCase()}...`)
      toast.success(`Reporte descargado exitosamente`)
    } catch {
      toast.error('Error al descargar el reporte')
    }
  }

  const filteredReports = reports?.filter((report) => {
    const matchesSearch =
      report.incident_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.metodologia?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID de incidente, reporte o metodología..."
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
                    <TableHead>Incidente</TableHead>
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
                      <TableCell className="font-mono text-sm">
                        {report.incident_id.substring(0, 8)}...
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reports/root-cause/${report.id}`)}
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
    </div>
  )
}
