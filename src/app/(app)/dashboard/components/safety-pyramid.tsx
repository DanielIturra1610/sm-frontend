'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useSafetyPyramid } from '@/shared/hooks/metrics-hooks'
import { Shield, Loader2 } from 'lucide-react'

export function SafetyPyramidCard() {
  const { data, error, isLoading } = useSafetyPyramid()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pirámide de Seguridad
          </CardTitle>
          <CardDescription>Distribución de incidentes por severidad</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pirámide de Seguridad
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  const levels = [
    { label: 'Fatalidades', count: data.fatalities, color: 'bg-red-900', width: 'w-1/5' },
    { label: 'Lesiones con tiempo perdido', count: data.lost_time_injuries, color: 'bg-red-600', width: 'w-2/5' },
    { label: 'Tratamiento médico', count: data.medical_treatment, color: 'bg-orange-500', width: 'w-3/5' },
    { label: 'Primeros auxilios', count: data.first_aid, color: 'bg-yellow-500', width: 'w-4/5' },
    { label: 'Casi accidentes', count: data.near_miss, color: 'bg-green-500', width: 'w-full' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Pirámide de Seguridad
        </CardTitle>
        <CardDescription>
          Total: {data.total} incidentes registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {levels.map((level, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{level.label}</span>
                  <span className="text-sm font-bold">{level.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`${level.color} h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500`}
                    style={{ width: data.total > 0 ? `${(level.count / data.total) * 100}%` : '0%' }}
                  >
                    {level.count > 0 && `${((level.count / data.total) * 100).toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p>
            La pirámide de seguridad muestra que por cada incidente grave, existen múltiples
            incidentes menores y casi accidentes que sirven como indicadores tempranos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
