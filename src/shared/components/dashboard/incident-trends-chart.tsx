'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { useIncidentTrends } from '@/shared/hooks/incident-hooks'
import { CalendarDays } from 'lucide-react'

export function IncidentTrendsChart() {
  const currentYear = new Date().getFullYear()
  const [selectedYears, setSelectedYears] = useState<number[]>([currentYear])
  const [showComparison, setShowComparison] = useState(false)
  
  const { data: trendsData, isLoading } = useIncidentTrends()

  // Use API data or empty array
  const data = trendsData?.trends ?? []
  
  // Toggle year comparison
  const toggleYearComparison = () => {
    if (showComparison) {
      setSelectedYears([currentYear])
      setShowComparison(false)
    } else {
      setSelectedYears([currentYear - 1, currentYear])
      setShowComparison(true)
    }
  }
  
  // TODO: Backend endpoint needed for year comparison
  // GET /api/v1/tenants/{tenant_id}/analytics/trends?years=2024,2025

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Tendencias de Sucesos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Tendencias de Sucesos {showComparison && `(${selectedYears.join(' vs ')})`}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleYearComparison}
            className="ml-auto"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            {showComparison ? 'Vista Simple' : 'Comparar Años'}
          </Button>
        </div>
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
                name="Total Sucesos"
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