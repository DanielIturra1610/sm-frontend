/**
 * Reports Page - All Reports with Correlativo Search
 * Central hub for all incident reports with unified search by correlativo
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  FileText,
  AlertCircle,
  Search,
  ClipboardList,
  FileCheck,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Target,
  Eye,
  Calendar,
  Hash,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useFlashReports,
  useImmediateActionsReports,
  useActionPlanReports,
  useFinalReports,
  useRootCauseReports,
  useZeroToleranceReports,
} from '@/shared/hooks/report-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import type {
  FlashReport,
  ImmediateActionsReport,
  ActionPlanReport,
  FinalReport,
  RootCauseReport,
  ZeroToleranceReport,
  Incident,
} from '@/shared/types/api'

// Report type configuration
const REPORT_TYPES = {
  flash: {
    label: 'Flash Report',
    shortLabel: 'Flash',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    href: '/reports/flash',
  },
  immediate_actions: {
    label: 'Acciones Inmediatas',
    shortLabel: 'Acc. Inm.',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    href: '/reports/immediate-actions',
  },
  root_cause: {
    label: 'Causa Raíz',
    shortLabel: 'Causa Raíz',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    href: '/reports/root-cause',
  },
  action_plan: {
    label: 'Plan de Acción',
    shortLabel: 'Plan Acc.',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    href: '/reports/action-plan',
  },
  final: {
    label: 'Reporte Final',
    shortLabel: 'Final',
    icon: FileCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    href: '/reports/final',
  },
  zero_tolerance: {
    label: 'Tolerancia Cero',
    shortLabel: 'T. Cero',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    href: '/reports/zero-tolerance',
  },
} as const

type ReportType = keyof typeof REPORT_TYPES

interface UnifiedReport {
  id: string
  type: ReportType
  incident_id: string
  status: string
  created_at: string
  updated_at: string
  incident?: Incident
  // Additional fields for display
  suceso?: string
  descripcion?: string
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  submitted: { label: 'Enviado', variant: 'default' },
  under_review: { label: 'En Revisión', variant: 'default' },
  approved: { label: 'Aprobado', variant: 'default' },
  rejected: { label: 'Rechazado', variant: 'destructive' },
  in_progress: { label: 'En Progreso', variant: 'default' },
  completed: { label: 'Completado', variant: 'default' },
  published: { label: 'Publicado', variant: 'default' },
  closed: { label: 'Cerrado', variant: 'outline' },
}

export default function ReportsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Fetch all data
  const { data: incidentsData, isLoading: incidentsLoading } = useIncidents()
  const { data: flashReports, isLoading: flashLoading } = useFlashReports()
  const { data: immediateActions, isLoading: immediateLoading } = useImmediateActionsReports()
  const { data: actionPlans, isLoading: actionPlanLoading } = useActionPlanReports()
  const { data: finalReports, isLoading: finalLoading } = useFinalReports()
  const { data: rootCauseReports, isLoading: rootCauseLoading } = useRootCauseReports()
  const { data: zeroToleranceReports, isLoading: zeroToleranceLoading } = useZeroToleranceReports()

  const isLoading = incidentsLoading || flashLoading || immediateLoading ||
    actionPlanLoading || finalLoading || rootCauseLoading || zeroToleranceLoading

  // Create incident lookup map
  const incidentMap = useMemo(() => {
    const map = new Map<string, Incident>()
    const incidents = incidentsData?.data || []
    incidents.forEach((inc: Incident) => map.set(inc.id, inc))
    return map
  }, [incidentsData])

  // Combine all reports into unified list
  const allReports = useMemo(() => {
    const reports: UnifiedReport[] = []

    flashReports?.forEach((r: FlashReport) => reports.push({
      id: r.id,
      type: 'flash',
      incident_id: r.incident_id,
      status: r.report_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      incident: incidentMap.get(r.incident_id),
      suceso: r.suceso,
      descripcion: r.descripcion,
    }))

    immediateActions?.forEach((r: ImmediateActionsReport) => reports.push({
      id: r.id,
      type: 'immediate_actions',
      incident_id: r.incident_id,
      status: r.report_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      incident: incidentMap.get(r.incident_id),
    }))

    rootCauseReports?.forEach((r: RootCauseReport) => reports.push({
      id: r.id,
      type: 'root_cause',
      incident_id: r.incident_id,
      status: r.report_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      incident: incidentMap.get(r.incident_id),
    }))

    actionPlans?.forEach((r: ActionPlanReport) => reports.push({
      id: r.id,
      type: 'action_plan',
      incident_id: r.incident_id,
      status: r.report_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      incident: incidentMap.get(r.incident_id),
    }))

    finalReports?.forEach((r: FinalReport) => reports.push({
      id: r.id,
      type: 'final',
      incident_id: r.incident_id,
      status: r.report_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      incident: incidentMap.get(r.incident_id),
    }))

    zeroToleranceReports?.forEach((r: ZeroToleranceReport) => {
      if (r.incident_id) {
        reports.push({
          id: r.id,
          type: 'zero_tolerance',
          incident_id: r.incident_id,
          status: r.report_status,
          created_at: r.created_at,
          updated_at: r.updated_at,
          incident: incidentMap.get(r.incident_id),
          suceso: r.suceso,
          descripcion: r.descripcion,
        })
      }
    })

    // Sort by creation date descending
    return reports.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [flashReports, immediateActions, rootCauseReports, actionPlans, finalReports, zeroToleranceReports, incidentMap])

  // Filter reports
  const filteredReports = useMemo(() => {
    return allReports.filter(report => {
      // Type filter
      if (typeFilter !== 'all' && report.type !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && report.status !== statusFilter) {
        return false
      }

      // Search filter (by correlativo or title)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const incident = report.incident
        const correlativo = incident?.correlativo || incident?.incidentNumber || ''
        const title = incident?.title || report.suceso || ''
        const description = incident?.description || report.descripcion || ''

        const matchesCorrelativo = correlativo.toLowerCase().includes(query)
        const matchesTitle = title.toLowerCase().includes(query)
        const matchesDescription = description.toLowerCase().includes(query)

        if (!matchesCorrelativo && !matchesTitle && !matchesDescription) {
          return false
        }
      }

      return true
    })
  }, [allReports, searchQuery, typeFilter, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = allReports.length
    const draft = allReports.filter(r => r.status === 'draft').length
    const inReview = allReports.filter(r => ['submitted', 'under_review'].includes(r.status)).length
    const approved = allReports.filter(r => ['approved', 'completed', 'published', 'closed'].includes(r.status)).length

    return { total, draft, inReview, approved }
  }, [allReports])

  // Get incident correlativo
  const getCorrelativo = (report: UnifiedReport) => {
    const incident = report.incident
    return incident?.correlativo || incident?.incidentNumber || '----'
  }

  // Get incident title
  const getIncidentTitle = (report: UnifiedReport) => {
    const incident = report.incident
    return incident?.title || report.suceso || 'Sin título'
  }

  // Navigate to report detail
  const handleViewReport = (report: UnifiedReport) => {
    const config = REPORT_TYPES[report.type]
    router.push(`${config.href}/${report.id}`)
  }

  // Loading skeleton
  if (isLoading && allReports.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-14" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Todos los Reportes</h1>
        <p className="text-gray-600 mt-1">
          Busca y gestiona todos los reportes por número correlativo del suceso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reportes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-80" />
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
              <ClipboardList className="h-10 w-10 text-gray-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">En Revisión</p>
                <p className="text-3xl font-bold text-orange-900">{stats.inReview}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-80" />
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por correlativo (ej: 00042) o título del suceso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base"
                />
              </div>
            </div>

            {/* Type filter */}
            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="flash">Flash Report</SelectItem>
                  <SelectItem value="immediate_actions">Acciones Inmediatas</SelectItem>
                  <SelectItem value="root_cause">Causa Raíz</SelectItem>
                  <SelectItem value="action_plan">Plan de Acción</SelectItem>
                  <SelectItem value="final">Reporte Final</SelectItem>
                  <SelectItem value="zero_tolerance">Tolerancia Cero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="w-full md:w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="under_review">En Revisión</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View mode toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Reportes ({filteredReports.length})
            {searchQuery && (
              <span className="text-sm font-normal text-gray-500">
                - Resultados para &quot;{searchQuery}&quot;
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron reportes
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? `No hay reportes que coincidan con "${searchQuery}"`
                  : 'No hay reportes disponibles con los filtros aplicados'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            // List View
            <div className="divide-y">
              {filteredReports.map((report) => {
                const config = REPORT_TYPES[report.type]
                const Icon = config.icon
                const statusConfig = STATUS_CONFIG[report.status] || { label: report.status, variant: 'outline' as const }

                return (
                  <div
                    key={`${report.type}-${report.id}`}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewReport(report)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                        <Icon className={`h-6 w-6 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-sm font-semibold">
                            #{getCorrelativo(report)}
                          </Badge>
                          <Badge className={`${config.bgColor} ${config.color} border-0`}>
                            {config.shortLabel}
                          </Badge>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {getIncidentTitle(report)}
                        </h3>
                      </div>

                      {/* Date and Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewReport(report)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredReports.map((report) => {
                const config = REPORT_TYPES[report.type]
                const Icon = config.icon
                const statusConfig = STATUS_CONFIG[report.status] || { label: report.status, variant: 'outline' as const }

                return (
                  <Card
                    key={`${report.type}-${report.id}`}
                    className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${config.borderColor}`}
                    onClick={() => handleViewReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <Badge variant={statusConfig.variant} className="text-xs">
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono font-semibold">
                            #{getCorrelativo(report)}
                          </Badge>
                          <span className="text-xs text-gray-500">{config.label}</span>
                        </div>

                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                          {getIncidentTitle(report)}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
