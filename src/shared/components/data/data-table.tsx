"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type Table as TableType,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  RefreshCw
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

export interface DataTablePaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: DataTablePaginationInfo
  onPaginationChange?: (page: number, limit: number) => void
  onSortingChange?: (sorting: SortingState) => void
  onGlobalFilterChange?: (filter: string) => void
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  onRefresh?: () => void
  isLoading?: boolean
  title?: string
  description?: string
  searchPlaceholder?: string
  showSearch?: boolean
  showColumnToggle?: boolean
  showPagination?: boolean
  showExport?: boolean
  showRefresh?: boolean
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  className?: string
  tableClassName?: string
  headerClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onColumnFiltersChange,
  onRefresh,
  isLoading = false,
  title,
  description,
  searchPlaceholder = "Search...",
  showSearch = true,
  showColumnToggle = true,
  showPagination = true,
  showExport = false,
  showRefresh = false,
  emptyStateTitle = "No data",
  emptyStateDescription = "No data available to display.",
  emptyStateAction,
  className,
  tableClassName,
  headerClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Handle controlled pagination
  const paginationState = React.useMemo(() => {
    if (pagination) {
      return {
        pageIndex: pagination.page - 1, // React Table uses 0-based indexing
        pageSize: pagination.limit,
      }
    }
    return {
      pageIndex: 0,
      pageSize: 10,
    }
  }, [pagination])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      onColumnFiltersChange?.(newFilters)
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value)
      onGlobalFilterChange?.(value)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: paginationState,
    },
    // For server-side pagination
    manualPagination: Boolean(pagination),
    pageCount: pagination ? pagination.totalPages : undefined,
  })

  const handlePaginationChange = React.useCallback(
    (newPage: number) => {
      if (pagination && onPaginationChange) {
        onPaginationChange(newPage + 1, pagination.limit) // Convert back to 1-based
      }
    },
    [pagination, onPaginationChange]
  )

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      if (pagination && onPaginationChange) {
        onPaginationChange(1, newPageSize) // Reset to first page with new size
      }
    },
    [pagination, onPaginationChange]
  )

  // Loading skeleton rows
  const loadingRows = Array.from({ length: paginationState.pageSize }, (_, i) => (
    <TableRow key={`loading-${i}`}>
      {columns.map((_, colIndex) => (
        <TableCell key={colIndex}>
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  ))

  // Empty state
  const emptyState = (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{emptyStateTitle}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{emptyStateDescription}</p>
          </div>
          {emptyStateAction && (
            <div className="mt-4">
              {emptyStateAction}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <Card className={cn("w-full", className)}>
      {(title || description || showSearch || showColumnToggle || showExport || showRefresh) && (
        <CardHeader className={cn("border-b bg-gray-50/50", headerClassName)}>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              )}

              {showRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              )}

              {showExport && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}

              {showColumnToggle && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="relative">
          <Table className={cn("w-full", tableClassName)}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          canSort && "cursor-pointer select-none hover:bg-gray-50",
                          "font-semibold text-gray-900"
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center space-x-2">
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {canSort && (
                            <div className="flex-shrink-0">
                              {sorted === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-gray-600" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading
                ? loadingRows
                : table.getRowModel().rows?.length
                  ? table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : emptyState
              }
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between border-t bg-gray-50/50 px-6 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                {pagination ? (
                  <>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </>
                ) : (
                  <>
                    Showing {table.getRowModel().rows.length} of{' '}
                    {table.getPrePaginationRowModel().rows.length} results
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={paginationState.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  {[10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(table.getState().pagination.pageIndex - 1)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1 mx-2">
                  <span className="text-sm text-gray-600">
                    Page {pagination ? pagination.page : table.getState().pagination.pageIndex + 1} of{' '}
                    {pagination ? pagination.totalPages : table.getPageCount()}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(table.getState().pagination.pageIndex + 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper hook for table actions
export function useTableActions<TData>() {
  const [selectedRows, setSelectedRows] = React.useState<TData[]>([])
  const [isActionLoading, setIsActionLoading] = React.useState(false)

  const executeAction = React.useCallback(
    async (action: (rows: TData[]) => Promise<void>, rows: TData[] = selectedRows) => {
      try {
        setIsActionLoading(true)
        await action(rows)
      } finally {
        setIsActionLoading(false)
      }
    },
    [selectedRows]
  )

  return {
    selectedRows,
    setSelectedRows,
    isActionLoading,
    executeAction,
  }
}