"use client"

import * as React from "react"
import { CalendarDays, Filter, X, Search, Users, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import {
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  IncidentListParams
} from "@/shared/types/api"

interface FilterPanelProps {
  filters: IncidentListParams
  onFiltersChange: (filters: IncidentListParams) => void
  onReset: () => void
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  className,
  isCollapsed = false,
  onToggle,
}: FilterPanelProps) {
  const [localSearch, setLocalSearch] = React.useState(filters.search || "")

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch || undefined })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, filters, onFiltersChange])

  const updateFilter = React.useCallback(
    (key: keyof IncidentListParams, value: string | undefined) => {
      onFiltersChange({
        ...filters,
        [key]: value || undefined,
      })
    },
    [filters, onFiltersChange]
  )

  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.status ||
      filters.severity ||
      filters.type ||
      filters.assignedTo ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.search ||
      filters.correlativo
    )
  }, [filters])

  const getActiveFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.status) count++
    if (filters.severity) count++
    if (filters.type) count++
    if (filters.assignedTo) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.search) count++
    if (filters.correlativo) count++
    return count
  }, [filters])

  if (isCollapsed) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-stegmaier-blue" />
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-stegmaier-blue text-white rounded-full">
                  {getActiveFilterCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-stegmaier-blue" />
            <CardTitle className="text-base font-semibold">Advanced Filters</CardTitle>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-stegmaier-blue text-white rounded-full">
                {getActiveFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            {onToggle && (
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search by Correlativo */}
        <div className="space-y-2">
          <Label htmlFor="correlativo" className="text-sm font-medium text-gray-700">
            Buscar por Correlativo
          </Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="correlativo"
              placeholder="Ej: 00001, 00042..."
              value={filters.correlativo || ""}
              onChange={(e) => updateFilter("correlativo", e.target.value)}
              className="pl-10"
              maxLength={5}
            />
          </div>
          <p className="text-xs text-gray-500">Busca sucesos por su número correlativo único</p>
        </div>

        <Separator />

        {/* General Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">
            Búsqueda General
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              placeholder="Buscar en título, descripción..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        {/* Status & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => updateFilter("status", value as IncidentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="text-sm font-medium text-gray-700">
              Severity
            </Label>
            <Select
              value={filters.severity || ""}
              onValueChange={(value) => updateFilter("severity", value as IncidentSeverity)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Type & Assigned To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Type
            </Label>
            <Select
              value={filters.type || ""}
              onValueChange={(value) => updateFilter("type", value as IncidentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700">
              Assigned To
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="assignedTo"
                placeholder="Filter by assignee..."
                value={filters.assignedTo || ""}
                onChange={(e) => updateFilter("assignedTo", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-xs text-gray-500">
                From
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-xs text-gray-500">
                To
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("status", "reported")}
              className={cn(
                "text-xs",
                filters.status === "reported" && "bg-blue-50 border-blue-200 text-blue-700"
              )}
            >
              New Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("severity", "critical")}
              className={cn(
                "text-xs",
                filters.severity === "critical" && "bg-red-50 border-red-200 text-red-700"
              )}
            >
              Critical
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("status", "in_progress")}
              className={cn(
                "text-xs",
                filters.status === "in_progress" && "bg-orange-50 border-orange-200 text-orange-700"
              )}
            >
              In Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("type", "safety")}
              className={cn(
                "text-xs",
                filters.type === "safety" && "bg-red-50 border-red-200 text-red-700"
              )}
            >
              Safety Issues
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                    Status: {filters.status}
                    <button
                      onClick={() => updateFilter("status", undefined)}
                      className="hover:bg-blue-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.severity && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 border border-orange-200 rounded-md text-orange-700">
                    Severity: {filters.severity}
                    <button
                      onClick={() => updateFilter("severity", undefined)}
                      className="hover:bg-orange-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 border border-green-200 rounded-md text-green-700">
                    Type: {filters.type}
                    <button
                      onClick={() => updateFilter("type", undefined)}
                      className="hover:bg-green-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.correlativo && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 border border-purple-200 rounded-md text-purple-700">
                    Correlativo: {filters.correlativo}
                    <button
                      onClick={() => updateFilter("correlativo", undefined)}
                      className="hover:bg-purple-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    Search: &quot;{filters.search}&quot;
                    <button
                      onClick={() => {
                        updateFilter("search", undefined)
                        setLocalSearch("")
                      }}
                      className="hover:bg-gray-100 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}