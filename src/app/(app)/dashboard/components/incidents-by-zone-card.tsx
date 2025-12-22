'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useIncidentsByZone } from '@/shared/hooks/metrics-hooks'
import { MapPin, Loader2 } from 'lucide-react'

export function IncidentsByZoneCard() {
  const { data, error, isLoading } = useIncidentsByZone()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sucesos por Zona
          </CardTitle>
          <CardDescription>Distribución geográfica de sucesos</CardDescription>
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
            <MapPin className="h-5 w-5" />
            Sucesos por Zona
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  const safeData = Array.isArray(data) ? data : []
  const total = safeData.reduce((sum, item) => sum + (item.count ?? 0), 0)
  const sortedData = [...safeData].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Sucesos por Zona
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
            {sortedData.map((zone, idx) => {
              const percentage = total > 0 ? (zone.count / total) * 100 : 0
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{zone.name}</span>
                    <Badge variant="secondary">{zone.count}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-stegmaier-blue h-full transition-all duration-500"
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
