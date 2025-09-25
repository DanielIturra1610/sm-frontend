'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface IncidentTrendsChartProps {
  data?: Array<{
    month: string
    incidents: number
    resolved: number
    open: number
  }>
}

const defaultData = [
  { month: 'Ene', incidents: 45, resolved: 38, open: 7 },
  { month: 'Feb', incidents: 52, resolved: 47, open: 5 },
  { month: 'Mar', incidents: 41, resolved: 39, open: 2 },
  { month: 'Abr', incidents: 38, resolved: 35, open: 3 },
  { month: 'May', incidents: 47, resolved: 44, open: 3 },
  { month: 'Jun', incidents: 55, resolved: 48, open: 7 },
  { month: 'Jul', incidents: 49, resolved: 46, open: 3 },
  { month: 'Ago', incidents: 43, resolved: 40, open: 3 },
  { month: 'Sep', incidents: 51, resolved: 45, open: 6 },
  { month: 'Oct', incidents: 48, resolved: 43, open: 5 },
  { month: 'Nov', incidents: 42, resolved: 39, open: 3 },
  { month: 'Dic', incidents: 39, resolved: 35, open: 4 },
]

export function IncidentTrendsChart({ data = defaultData }: IncidentTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Tendencias de Incidentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="open" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {label}
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-1">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-xs">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="incidents"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="url(#incidents)"
                name="Total Incidentes"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="url(#resolved)"
                name="Resueltos"
              />
              <Area
                type="monotone"
                dataKey="open"
                stackId="3"
                stroke="hsl(var(--chart-3))"
                fill="url(#open)"
                name="Abiertos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}