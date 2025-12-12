"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  Eye,
  Trash2,
  MapPin,
  User,
  Clock,
  MoreHorizontal,
  Plus,
  Filter as FilterIcon,
  Download,
  RefreshCw,
  Tags
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

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
import {
  Incident,
  IncidentListParams,
} from "@/shared/types/api"
import { useIncidents } from "@/shared/hooks/incident-hooks"
import { toast } from "sonner"

export default function IncidentsPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState<IncidentListParams>({
    page: 1,
    limit: 10,
    sort: "reportedAt",
    order: "desc"
  })

  // Use the real API hook
  const { data: apiResponse, error, isLoading, mutate } = useIncidents(filters)

  // Get incidents from API response - already transformed by incident-service
  const incidents = React.useMemo(() => {
    if (!apiResponse) return []
    // The incident-service already transforms the data, so we just need to extract it
    // apiResponse has structure: { data: Incident[], pagination: {...} }
    return apiResponse.data || []
  }, [apiResponse])

  // Get pagination from API response - already structured by incident-service
  const pagination = React.useMemo(() => {
    if (!apiResponse?.pagination) {
      return { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
    return apiResponse.pagination
  }, [apiResponse])

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast.error('Error al cargar incidentes: ' + (error.message || 'Error desconocido'))
    }
  }, [error])

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
    mutate()
  }, [mutate])

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
    router.push(`/incidents/${incident.id}`)
    
  }, [])


  const handleDelete = React.useCallback(async (incident: Incident) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el incidente "${incident.title}"?`)) {
      console.log("Delete incident:", incident.id)
      
      mutate()
    }
  }, [mutate])

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
              <Button onClick={() => router.push("/incidents/create")}>
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