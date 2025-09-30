"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MapPin,
  User,
  Clock,
  MoreHorizontal,
  Plus,
  Filter as FilterIcon,
  Download,
  RefreshCw,
  Search,
  Tags
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { DataTable } from "@/shared/components/data/data-table"
import {
  IncidentStatusBadge,
  IncidentSeverityBadge,
  IncidentTypeBadge
} from "@/shared/components/ui/status-badge"
import { FilterPanel } from "./_components/filter-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import {
  Incident,
  IncidentListParams,
  PaginatedResponse
} from "@/shared/types/api"

// Mock data for demonstration
const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    title: "Fallo de Equipo - Línea 3",
    description: "Paro de producción debido a falla de cinta transportadora que afecta la línea de ensamblaje principal. Se requiere atención inmediata para prevenir retrasos en la producción.",
    severity: "critical",
    status: "investigating",
    type: "operational",
    location: "Edificio A - Planta de Producción 3",
    reportedBy: "John Smith",
    reportedAt: "2024-01-15T10:30:00Z",
    assignedTo: "Mike Johnson",
    assignedAt: "2024-01-15T11:00:00Z",
    tags: ["equipo", "producción", "urgente"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "investigation",
      availableActions: ["assign", "escalate"],
      completedSteps: ["reported", "acknowledged"],
      pendingApprovals: []
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T11:00:00Z"
  },
  {
    id: "inc-002",
    title: "Casi Accidente - Almacén",
    description: "Operador de montacargas reportó colisión inminente con peatón en zona B del almacén. Se necesita revisar los protocolos de seguridad.",
    severity: "high",
    status: "in_progress",
    type: "safety",
    location: "Zona B del Almacén",
    reportedBy: "Sarah Davis",
    reportedAt: "2024-01-14T14:22:00Z",
    assignedTo: "Anna Wilson",
    assignedAt: "2024-01-14T15:00:00Z",
    tags: ["casi-accidente", "montacargas", "seguridad"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "action_plan",
      availableActions: ["resolve", "escalate"],
      completedSteps: ["reported", "acknowledged", "investigation"],
      pendingApprovals: []
    },
    createdAt: "2024-01-14T14:22:00Z",
    updatedAt: "2024-01-14T15:00:00Z"
  },
  {
    id: "inc-003",
    title: "Derrame Químico - Lab 2",
    description: "Derrame menor de producto químico en laboratorio 2. El área ha sido contenida y asegurada. Se ha notificado al equipo de limpieza.",
    severity: "medium",
    status: "resolved",
    type: "environmental",
    location: "Laboratorio 2 - Ala de Investigación",
    reportedBy: "Dr. Robert Chen",
    reportedAt: "2024-01-12T09:15:00Z",
    assignedTo: "Equipo Ambiental",
    assignedAt: "2024-01-12T09:30:00Z",
    resolvedAt: "2024-01-12T16:45:00Z",
    tags: ["químico", "laboratorio", "ambiental"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "resolved",
      availableActions: ["close", "reopen"],
      completedSteps: ["reported", "acknowledged", "investigation", "action_plan", "resolved"],
      pendingApprovals: []
    },
    createdAt: "2024-01-12T09:15:00Z",
    updatedAt: "2024-01-12T16:45:00Z"
  },
  {
    id: "inc-004",
    title: "Brecha de Seguridad - Control de Acceso",
    description: "Detectado intento de acceso no autorizado en la puerta de la sala de servidores. Se está revisando el video de seguridad.",
    severity: "high",
    status: "reported",
    type: "security",
    location: "Sala de Servidores - Ala de TI",
    reportedBy: "Sistema de Seguridad",
    reportedAt: "2024-01-16T02:33:00Z",
    tags: ["seguridad", "control-acceso", "brecha"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "reported",
      availableActions: ["acknowledge", "assign"],
      completedSteps: ["reported"],
      pendingApprovals: []
    },
    createdAt: "2024-01-16T02:33:00Z",
    updatedAt: "2024-01-16T02:33:00Z"
  },
  {
    id: "inc-005",
    title: "Falla en Control de Calidad",
    description: "El lote QC-2024-001 no pasó la inspección de calidad. Los productos deben ser aislados e investigados.",
    severity: "medium",
    status: "in_progress",
    type: "quality",
    location: "Departamento de Control de Calidad",
    reportedBy: "Inspector de Calidad",
    reportedAt: "2024-01-13T11:20:00Z",
    assignedTo: "Jefe de Calidad",
    assignedAt: "2024-01-13T12:00:00Z",
    tags: ["calidad", "lote", "cc"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "investigation",
      availableActions: ["resolve", "escalate"],
      completedSteps: ["reported", "acknowledged"],
      pendingApprovals: []
    },
    createdAt: "2024-01-13T11:20:00Z",
    updatedAt: "2024-01-13T12:00:00Z"
  },
  {
    id: "inc-006",
    title: "Problema con Simulacro de Emergencia",
    description: "Ruta de salida bloqueada durante simulacro de emergencia. Los procedimientos de evacuación de emergencia necesitan revisión inmediata.",
    severity: "low",
    status: "closed",
    type: "safety",
    location: "Edificio B - Salida de Emergencia 3",
    reportedBy: "Oficial de Seguridad",
    reportedAt: "2024-01-10T16:45:00Z",
    assignedTo: "Jefe de Instalaciones",
    assignedAt: "2024-01-10T17:00:00Z",
    resolvedAt: "2024-01-11T09:30:00Z",
    tags: ["emergencia", "simulacro", "evacuación"],
    attachments: [],
    companyId: "comp-001",
    workflowState: {
      currentStep: "closed",
      availableActions: ["reopen"],
      completedSteps: ["reported", "acknowledged", "investigation", "action_plan", "resolved", "closed"],
      pendingApprovals: []
    },
    createdAt: "2024-01-10T16:45:00Z",
    updatedAt: "2024-01-11T10:00:00Z"
  }
]

const mockPagination = {
  page: 1,
  limit: 10,
  total: 6,
  totalPages: 1
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>(mockIncidents)
  const [pagination, setPagination] = React.useState(mockPagination)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState<IncidentListParams>({
    page: 1,
    limit: 10,
    sort: "reportedAt",
    order: "desc"
  })

  // Mock API calls
  const fetchIncidents = React.useCallback(async (params: IncidentListParams) => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Apply filters to mock data
    let filteredIncidents = [...mockIncidents]

    if (params.status) {
      filteredIncidents = filteredIncidents.filter(incident => incident.status === params.status)
    }
    if (params.severity) {
      filteredIncidents = filteredIncidents.filter(incident => incident.severity === params.severity)
    }
    if (params.type) {
      filteredIncidents = filteredIncidents.filter(incident => incident.type === params.type)
    }
    if (params.assignedTo) {
      filteredIncidents = filteredIncidents.filter(incident =>
        incident.assignedTo?.toLowerCase().includes(params.assignedTo!.toLowerCase())
      )
    }
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      filteredIncidents = filteredIncidents.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm) ||
        incident.description.toLowerCase().includes(searchTerm) ||
        incident.location.toLowerCase().includes(searchTerm) ||
        incident.reportedBy.toLowerCase().includes(searchTerm)
      )
    }

    // Apply sorting
    if (params.sort) {
      filteredIncidents.sort((a, b) => {
        const aValue = a[params.sort as keyof Incident] as string
        const bValue = b[params.sort as keyof Incident] as string
        const comparison = aValue.localeCompare(bValue)
        return params.order === "desc" ? -comparison : comparison
      })
    }

    setIncidents(filteredIncidents)
    setPagination({
      page: params.page || 1,
      limit: params.limit || 10,
      total: filteredIncidents.length,
      totalPages: Math.ceil(filteredIncidents.length / (params.limit || 10))
    })
    setIsLoading(false)
  }, [])

  // Load initial data
  React.useEffect(() => {
    fetchIncidents(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleFiltersChange = React.useCallback((newFilters: IncidentListParams) => {
    setFilters(prev => {
      const updated = { ...newFilters, page: 1 }
      // Only update if values actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) return prev
      return updated
    })
  }, [])

  const handlePaginationChange = React.useCallback((page: number, limit: number) => {
    setFilters(prev => {
      // Only update if values actually changed
      if (prev.page === page && prev.limit === limit) return prev
      return { ...prev, page, limit }
    })
  }, [])

  const handleRefresh = React.useCallback(() => {
    setFilters(prev => ({ ...prev })) // Trigger refetch by creating new reference
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters(prev => {
      const defaultFilters: IncidentListParams = {
        page: 1,
        limit: 10,
        sort: "reportedAt",
        order: "desc"
      }
      // Only reset if current filters are different
      if (JSON.stringify(prev) === JSON.stringify(defaultFilters)) return prev
      return defaultFilters
    })
  }, [])

  // Action handlers
  const handleView = React.useCallback((incident: Incident) => {
    console.log("View incident:", incident.id)
    // TODO: Navigate to incident detail page
  }, [])

  const handleEdit = React.useCallback((incident: Incident) => {
    console.log("Edit incident:", incident.id)
    // TODO: Navigate to incident edit page
  }, [])

  const handleDelete = React.useCallback(async (incident: Incident) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el incidente "${incident.title}"?`)) {
      console.log("Delete incident:", incident.id)
      // TODO: Implement delete API call
      await fetchIncidents(filters)
    }
  }, [fetchIncidents, filters])

  // Table columns definition
  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: "title",
      header: "Incidente",
      cell: ({ row }) => {
        const incident = row.original
        return (
          <div className="space-y-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {incident.title}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{incident.location}</span>
            </div>
            {incident.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tags className="h-3 w-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {incident.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {incident.tags.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{incident.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <IncidentTypeBadge type={row.getValue("type")} />
      ),
    },
    {
      accessorKey: "severity",
      header: "Severidad",
      cell: ({ row }) => (
        <IncidentSeverityBadge severity={row.getValue("severity")} />
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <IncidentStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "reportedBy",
      header: "Reportado por",
      cell: ({ row }) => {
        const incident = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {incident.reportedBy}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>hace {formatDistanceToNow(new Date(incident.reportedAt))}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Asignado a",
      cell: ({ row }) => {
        const assignedTo = row.getValue("assignedTo") as string | undefined
        return assignedTo ? (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-sm text-gray-900">{assignedTo}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Sin asignar</span>
        )
      },
    },
    {
      accessorKey: "reportedAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("reportedAt"))
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">
              {format(date, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-gray-500">
              {format(date, "HH:mm")}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const incident = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(incident)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(incident)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(incident)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-stegmaier-blue/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-stegmaier-blue" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Incidentes</h1>
                <p className="text-sm text-gray-600">Rastrea y gestiona incidentes de seguridad</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Incidente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={resetFilters}
              isCollapsed={!showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>

          {/* Data Table */}
          <div className="lg:col-span-3">
            <DataTable
              columns={columns}
              data={incidents}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              title="Incidentes"
              description={`${pagination.total} incidentes totales`}
              searchPlaceholder="Buscar incidentes..."
              showSearch={false} // Using filter panel instead
              showColumnToggle={true}
              showPagination={true}
              showExport={false}
              showRefresh={false} // Using header refresh instead
              emptyStateTitle="No se encontraron incidentes"
              emptyStateDescription="No hay incidentes que coincidan con tus filtros actuales. Intenta ajustar tus criterios de búsqueda."
              emptyStateAction={
                <Button variant="outline" onClick={resetFilters}>
                  Limpiar Filtros
                </Button>
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full shadow-lg"
            size="lg"
          >
            <FilterIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}