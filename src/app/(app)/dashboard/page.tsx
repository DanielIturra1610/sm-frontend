/**
 * Página de Dashboard Avanzado - Stegmaier Safety Management
 * Dashboard completo con KPIs, gráficos y filtros
 */

'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle, InteractiveCard } from '@/shared/components/ui/card'
import {
  DashboardMetrics,
  IncidentTrendsChart,
  SeverityDistributionChart,
  RecentIncidents,
  RecentActivity,
  PendingTasks,
} from '@/shared/components/dashboard'
import {
  Shield,
  FileText,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600">Bienvenido de nuevo, {user?.full_name}</p>
      </div>

      {/* Indicadores Clave de Desempeño */}
      <DashboardMetrics />

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncidentTrendsChart />
        <SeverityDistributionChart />
      </div>

      {/* Cuadrícula de Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Acciones Rápidas e Incidentes Recientes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Acciones Rápidas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <InteractiveCard
                  className="p-4 text-center hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/incidents/create')}
                >
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-medium text-sm">Reportar Suceso</h3>
                  <p className="text-xs text-gray-500 mt-1">Registro inicial</p>
                </InteractiveCard>

                <InteractiveCard
                  className="p-4 text-center hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/reports/flash/create')}
                >
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-sm">Flash Report</h3>
                  <p className="text-xs text-gray-500 mt-1">Reporte 24h</p>
                </InteractiveCard>

                <InteractiveCard
                  className="p-4 text-center hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/incidents')}
                >
                  <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="font-medium text-sm">Ver Sucesos</h3>
                  <p className="text-xs text-gray-500 mt-1">Todos los registros</p>
                </InteractiveCard>

                <InteractiveCard
                  className="p-4 text-center hover:shadow-lg cursor-pointer"
                  onClick={() => router.push('/analysis/fishbone')}
                >
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-sm">Diagrama Ishikawa</h3>
                </InteractiveCard>
              </div>
            </CardContent>
          </Card>

          {/* Incidentes Recientes - Componente conectado al API */}
          <RecentIncidents />
        </div>

        {/* Columna Derecha - Actividad y Tareas */}
        <div className="space-y-6">
          {/* Actividad Reciente - Componente conectado al API */}
          <RecentActivity />

          {/* Tareas Pendientes - Componente conectado al API */}
          <PendingTasks />
        </div>
      </div>
    </div>
  )
}