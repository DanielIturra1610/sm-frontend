'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIncidentStats } from '@/shared/hooks/incident-hooks'

// Severity labels and colors mapping
const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'hsl(var(--chart-2))' },
  medium: { label: 'Media', color: 'hsl(var(--chart-3))' },
  high: { label: 'Alta', color: 'hsl(var(--chart-4))' },
  critical: { label: 'Crítica', color: 'hsl(var(--chart-5))' },
}

export function SeverityDistributionChart() {
  const { data: stats, isLoading } = useIncidentStats()

  // Transform API data to chart format
  const data = stats?.severityDistribution
    ? Object.entries(stats.severityDistribution).map(([severity, value]) => ({
        name: severityConfig[severity]?.label || severity,
        value: value,
        color: severityConfig[severity]?.color || 'hsl(var(--chart-1))',
      }))
    : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Distribución por Severidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Distribución por Severidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Distribución por Severidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const percentage = ((data.value / total) * 100).toFixed(1)
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-medium">{data.name}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground">
                            {data.value} incidentes ({percentage}%)
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.value}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {data[index]?.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}