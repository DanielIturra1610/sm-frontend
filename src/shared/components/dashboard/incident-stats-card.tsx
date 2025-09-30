'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { IncidentStats } from '@/shared/types/api'
import { cn } from '@/lib/utils'

interface IncidentStatsCardProps {
  stats: IncidentStats
  className?: string
}

export function IncidentStatsCard({ stats, className }: IncidentStatsCardProps) {
  const statItems = [
    {
      title: "Total",
      value: stats.total,
      icon: TrendingUp,
      color: "text-stegmaier-blue",
      bgColor: "bg-stegmaier-blue/10",
    },
    {
      title: "Abiertos",
      value: stats.open,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Resueltos",
      value: stats.closed,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tiempo Promedio",
      value: `${Math.round(stats.avgResolutionTime)}h`,
      icon: Clock,
      color: "text-stegmaier-gray-dark",
      bgColor: "bg-stegmaier-gray-light",
    },
  ]

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Estadísticas de Incidentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`${item.bgColor} p-3 rounded-full mb-2`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-stegmaier-gray-dark">{item.title}</div>
            </div>
          ))}
        </div>
        
        {/* Severity Breakdown */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-stegmaier-gray-dark mb-2">Por Severidad</h3>
          <div className="space-y-2">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <span className="text-sm capitalize">{severity}</span>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}