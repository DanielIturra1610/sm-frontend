'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface SeverityDistributionChartProps {
  data?: Array<{
    name: string
    value: number
    color: string
  }>
}

const defaultData = [
  { name: 'Baja', value: 45, color: 'hsl(var(--chart-2))' },
  { name: 'Media', value: 32, color: 'hsl(var(--chart-3))' },
  { name: 'Alta', value: 18, color: 'hsl(var(--chart-4))' },
  { name: 'Crítica', value: 5, color: 'hsl(var(--chart-5))' },
]

export function SeverityDistributionChart({ data = defaultData }: SeverityDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

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