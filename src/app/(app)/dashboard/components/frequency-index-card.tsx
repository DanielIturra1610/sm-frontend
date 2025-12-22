'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useFrequencyIndex } from '@/shared/hooks/metrics-hooks'
import { TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react'

export function FrequencyIndexCard() {
  const { data, error, isLoading } = useFrequencyIndex()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Índice de Frecuencia
          </CardTitle>
          <CardDescription>Indicador de seguridad laboral</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
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
            <Activity className="h-5 w-5" />
            Índice de Frecuencia
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  const index = data.frequency_index ?? 0
  const isGood = index < 10 // Lower is better
  const totalAccidents = data.total_accidents ?? 0
  const totalHoursWorked = data.total_hours_worked ?? 0

  // Handle period as string or object
  const getPeriodLabel = () => {
    if (!data.period) return 'No disponible'
    if (typeof data.period === 'string') return data.period
    if (typeof data.period === 'object' && data.period.label) return data.period.label
    return 'No disponible'
  }
  const period = getPeriodLabel()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Índice de Frecuencia
        </CardTitle>
        <CardDescription>
          (Accidentes × 1,000,000) / Horas trabajadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{index.toFixed(2)}</span>
            {isGood ? (
              <TrendingDown className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Accidentes</p>
              <p className="text-lg font-semibold">{totalAccidents}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Horas Trabajadas</p>
              <p className="text-lg font-semibold">
                {totalHoursWorked.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Período: {period}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
