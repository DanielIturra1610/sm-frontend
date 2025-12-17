'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useIncidentsByCategory } from '@/shared/hooks/metrics-hooks'
import { PieChart, Loader2 } from 'lucide-react'

export function IncidentsByCategoryCard() {
  const { data, error, isLoading } = useIncidentsByCategory()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sucesos por Categoría
          </CardTitle>
          <CardDescription>Distribución por tipo de suceso</CardDescription>
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
            <PieChart className="h-5 w-5" />
            Sucesos por Categoría
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  const categories = [
    { name: 'Accidentes', count: data.accidente, color: 'bg-red-500', percentage: (data.accidente / data.total) * 100 },
    { name: 'Incidentes', count: data.incidente, color: 'bg-orange-500', percentage: (data.incidente / data.total) * 100 },
    { name: 'Tolerancia 0', count: data.tolerancia_0, color: 'bg-yellow-500', percentage: (data.tolerancia_0 / data.total) * 100 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Sucesos por Categoría
        </CardTitle>
        <CardDescription>Total: {data.total} sucesos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual bar representation */}
          <div className="flex h-8 rounded-lg overflow-hidden">
            {categories.map((cat, idx) => (
              cat.count > 0 && (
                <div
                  key={idx}
                  className={`${cat.color} flex items-center justify-center text-white text-xs font-semibold transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                  title={`${cat.name}: ${cat.count}`}
                >
                  {cat.percentage > 10 && cat.count}
                </div>
              )
            ))}
          </div>

          {/* Legend and details */}
          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${cat.color}`} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {cat.percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-bold min-w-[2rem] text-right">
                    {cat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
