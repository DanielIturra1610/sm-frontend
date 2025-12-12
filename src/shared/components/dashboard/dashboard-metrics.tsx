'use client'

import { AlertTriangle, Shield, Clock, TrendingUp } from 'lucide-react'
import { KPICard } from './kpi-card'
import { useIncidentStats } from '@/shared/hooks/incident-hooks'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function DashboardMetrics() {
  const { data: stats, isLoading, error } = useIncidentStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  // Use API data or fallback values
  const metrics = {
    totalIncidents: stats?.totalIncidents ?? 0,
    openIncidents: stats?.openIncidents ?? 0,
    avgResolutionTime: stats?.avgResolutionTime ?? 0,
    incidentTrend: stats?.incidentTrend ?? 0,
    incidentTrendIsPositive: stats?.incidentTrendIsPositive ?? true,
  }

  // Calculate a simple risk score based on open incidents ratio
  const riskScore = metrics.totalIncidents > 0
    ? Math.min(10, Math.round((metrics.openIncidents / Math.max(metrics.totalIncidents, 1)) * 10 * 2))
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Incidentes"
        value={metrics.totalIncidents}
        description="Incidentes registrados este mes"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={metrics.incidentTrend !== 0 ? {
          value: Math.abs(Math.round(metrics.incidentTrend)),
          label: "vs mes anterior",
          isPositive: metrics.incidentTrendIsPositive,
        } : undefined}
        variant="info"
      />

      <KPICard
        title="Incidentes Abiertos"
        value={metrics.openIncidents}
        description="Requieren atención inmediata"
        icon={<Clock className="h-4 w-4" />}
        variant={metrics.openIncidents > 20 ? "warning" : metrics.openIncidents > 10 ? "info" : "success"}
      />

      <KPICard
        title="Tiempo Promedio Resolución"
        value={`${metrics.avgResolutionTime.toFixed(1)}h`}
        description="Tiempo promedio para resolver incidentes"
        icon={<TrendingUp className="h-4 w-4" />}
        variant={metrics.avgResolutionTime > 48 ? "warning" : "success"}
      />

      <KPICard
        title="Índice de Riesgo"
        value={`${riskScore}/10`}
        description="Basado en incidentes abiertos"
        icon={<Shield className="h-4 w-4" />}
        variant={riskScore > 7 ? "error" : riskScore > 4 ? "warning" : "success"}
      />
    </div>
  )
}