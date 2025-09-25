'use client'

import { useState } from 'react'
import { Calendar, Filter, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

export type DateRange = {
  from: Date
  to: Date
}

export type DashboardFilters = {
  dateRange: DateRange
  period: string
  department?: string
  severity?: string
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardFilters) => void
  initialFilters?: Partial<DashboardFilters>
}

const predefinedPeriods = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

const departments = [
  { value: 'all', label: 'Todos los departamentos' },
  { value: 'produccion', label: 'Producción' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'seguridad', label: 'Seguridad Industrial' },
  { value: 'calidad', label: 'Control de Calidad' },
  { value: 'logistica', label: 'Logística' },
]

const severityLevels = [
  { value: 'all', label: 'Todas las severidades' },
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

function getDateRangeFromPeriod(period: string): DateRange {
  const now = new Date()
  const today = endOfDay(now)

  switch (period) {
    case '7d':
      return { from: startOfDay(subDays(now, 7)), to: today }
    case '30d':
      return { from: startOfDay(subDays(now, 30)), to: today }
    case '3m':
      return { from: startOfDay(subMonths(now, 3)), to: today }
    case '6m':
      return { from: startOfDay(subMonths(now, 6)), to: today }
    case '1y':
      return { from: startOfDay(subYears(now, 1)), to: today }
    default:
      return { from: startOfDay(subDays(now, 30)), to: today }
  }
}

export function DashboardFilters({ onFiltersChange, initialFilters }: DashboardFiltersProps) {
  const [period, setPeriod] = useState(initialFilters?.period || '30d')
  const [department, setDepartment] = useState(initialFilters?.department || 'all')
  const [severity, setSeverity] = useState(initialFilters?.severity || 'all')
  const [dateRange, setDateRange] = useState<DateRange>(
    initialFilters?.dateRange || getDateRangeFromPeriod('30d')
  )

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      const newDateRange = getDateRangeFromPeriod(newPeriod)
      setDateRange(newDateRange)
      onFiltersChange({
        dateRange: newDateRange,
        period: newPeriod,
        department: department !== 'all' ? department : undefined,
        severity: severity !== 'all' ? severity : undefined,
      })
    }
  }

  const handleDepartmentChange = (newDepartment: string) => {
    setDepartment(newDepartment)
    onFiltersChange({
      dateRange,
      period,
      department: newDepartment !== 'all' ? newDepartment : undefined,
      severity: severity !== 'all' ? severity : undefined,
    })
  }

  const handleSeverityChange = (newSeverity: string) => {
    setSeverity(newSeverity)
    onFiltersChange({
      dateRange,
      period,
      department: department !== 'all' ? department : undefined,
      severity: newSeverity !== 'all' ? newSeverity : undefined,
    })
  }

  const handleReset = () => {
    const defaultPeriod = '30d'
    const defaultDateRange = getDateRangeFromPeriod(defaultPeriod)

    setPeriod(defaultPeriod)
    setDepartment('all')
    setSeverity('all')
    setDateRange(defaultDateRange)

    onFiltersChange({
      dateRange: defaultDateRange,
      period: defaultPeriod,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5" />
          Filtros del Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Período de Tiempo
            </label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <Calendar className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {predefinedPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Departamento
            </label>
            <Select value={department} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Severidad
            </label>
            <Select value={severity} onValueChange={handleSeverityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Período seleccionado: {format(dateRange.from, 'dd MMM yyyy', { locale: es })} - {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}