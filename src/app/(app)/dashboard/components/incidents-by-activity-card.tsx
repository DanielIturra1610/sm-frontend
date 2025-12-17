'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useIncidentsByActivity } from '@/shared/hooks/metrics-hooks'
import { Briefcase, Loader2 } from 'lucide-react'

export function IncidentsByActivityCard() {
  const { data, error, isLoading } = useIncidentsByActivity()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Sucesos por Actividad
          </CardTitle>
          <CardDescription>Distribución por tipo de actividad</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
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
            <Briefcase className="h-5 w-5" />
            Sucesos por Actividad
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Sucesos por Actividad
        </CardTitle>
        <CardDescription>Total: {total} sucesos</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedData.map((activity, idx) => {
              const percentage = total > 0 ? (activity.count / total) * 100 : 0
              const color = colors[idx % colors.length]
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{activity.name}</span>
                    <Badge variant="secondary">{activity.count}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${color} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
