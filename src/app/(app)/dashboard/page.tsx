/**
 * Página de Dashboard Avanzado - Stegmaier Safety Management
 * Dashboard completo con KPIs, gráficos y filtros
 */

'use client'

import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, InteractiveCard } from '@/shared/components/ui/card'
import {
  DashboardMetrics,
  IncidentTrendsChart,
  SeverityDistributionChart,
  DashboardFilters,
  type DashboardFiltersType
} from '@/shared/components/dashboard'
import {
  Shield,
  FileText,
  BarChart3,
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
  Filter,
  Calendar,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const handleFiltersChange = (filters: DashboardFiltersType) => {
    console.log('Filtros de dashboard cambiados:', filters)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido de nuevo, {user?.full_name}</p>
      </div>

      {/* Filtros del Dashboard */}
      <DashboardFilters onFiltersChange={handleFiltersChange} />

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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Reportar Incidente</h3>
                  <p className="text-sm text-gray-600">Enviar nuevo incidente de seguridad</p>
                </InteractiveCard>

                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Generar Reporte</h3>
                  <p className="text-sm text-gray-600">Crear documentación de seguridad</p>
                </InteractiveCard>

                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Auditoría de Seguridad</h3>
                  <p className="text-sm text-gray-600">Programar nueva auditoría</p>
                </InteractiveCard>

                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Ver Analíticas</h3>
                  <p className="text-sm text-gray-600">Información de desempeño</p>
                </InteractiveCard>

                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Capacitación de Equipo</h3>
                  <p className="text-sm text-gray-600">Programar sesiones de capacitación</p>
                </InteractiveCard>

                <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Más Acciones</h3>
                  <p className="text-sm text-gray-600">Ver todas las acciones disponibles</p>
                </InteractiveCard>
              </div>
            </CardContent>
          </Card>

          {/* Incidentes Recientes */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Incidentes Recientes</CardTitle>
                <a href="/incidents">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  <div className="h-3 w-3 bg-red-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Fallo de Equipo - Línea 3</p>
                    <p className="text-sm text-gray-600">Paro de producción por falla de cinta transportadora</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Alto
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Hace 2h</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Casi Accidente - Almacén</p>
                    <p className="text-sm text-gray-600">Operador de montacargas reportó colisión inminente</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Medio
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Hace 4h</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Actualización de Protocolo de Seguridad</p>
                    <p className="text-sm text-gray-600">Procedimientos de evacuación de emergencia revisados</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Resuelto
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Hace 1d</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Actividad y Notificaciones */}
        <div className="space-y-6">
          {/* Feed de Actividad */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Auditoría de seguridad completada</p>
                    <p className="text-xs text-gray-600">Edificio A - Todas las verificaciones pasaron</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Reporte generado</p>
                    <p className="text-xs text-gray-600">Resumen mensual de seguridad</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 4 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Incidente reportado</p>
                    <p className="text-xs text-gray-600">Resbalón menor en cafetería</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 6 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Sesión de capacitación</p>
                    <p className="text-xs text-gray-600">Práctica de seguridad contra incendios completada</p>
                    <p className="text-xs text-gray-500 mt-1">Hace 1 día</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tareas Próximas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Tareas Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Inspección de equipo</p>
                    <p className="text-xs text-gray-600">Vence mañana</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
                  <Calendar className="h-4 w-4 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Renovación de capacitación de seguridad</p>
                    <p className="text-xs text-gray-600">Vence en 3 días</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <Calendar className="h-4 w-4 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reunión mensual de seguridad</p>
                    <p className="text-xs text-gray-600">Próximo viernes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}