import { AlertTriangle, Shield, Clock, TrendingUp } from 'lucide-react'
import { KPICard } from './kpi-card'

interface DashboardMetricsProps {
  data?: {
    totalIncidents: number
    openIncidents: number
    avgResolutionTime: number
    riskScore: number
    trends: {
      incidents: { value: number; isPositive: boolean }
      resolution: { value: number; isPositive: boolean }
      risk: { value: number; isPositive: boolean }
    }
  }
}

const defaultData = {
  totalIncidents: 142,
  openIncidents: 23,
  avgResolutionTime: 3.2,
  riskScore: 7.8,
  trends: {
    incidents: { value: 12, isPositive: false },
    resolution: { value: 15, isPositive: true },
    risk: { value: 8, isPositive: true },
  },
}

export function DashboardMetrics({ data = defaultData }: DashboardMetricsProps) {
  const metrics = data

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Incidentes"
        value={metrics.totalIncidents}
        description="Incidentes registrados este mes"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{
          value: metrics.trends.incidents.value,
          label: "vs mes anterior",
          isPositive: metrics.trends.incidents.isPositive,
        }}
        variant="info"
      />

      <KPICard
        title="Incidentes Abiertos"
        value={metrics.openIncidents}
        description="Requieren atención inmediata"
        icon={<Clock className="h-4 w-4" />}
        variant={metrics.openIncidents > 20 ? "warning" : "success"}
      />

      <KPICard
        title="Tiempo Promedio Resolución"
        value={`${metrics.avgResolutionTime}h`}
        description="Tiempo promedio para resolver incidentes"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{
          value: metrics.trends.resolution.value,
          label: "mejora vs anterior",
          isPositive: metrics.trends.resolution.isPositive,
        }}
        variant="success"
      />

      <KPICard
        title="Índice de Riesgo"
        value={`${metrics.riskScore}/10`}
        description="Evaluación general de seguridad"
        icon={<Shield className="h-4 w-4" />}
        trend={{
          value: metrics.trends.risk.value,
          label: "mejora en seguridad",
          isPositive: metrics.trends.risk.isPositive,
        }}
        variant={metrics.riskScore > 8 ? "error" : metrics.riskScore > 6 ? "warning" : "success"}
      />
    </div>
  )
}