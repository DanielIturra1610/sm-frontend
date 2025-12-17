'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useOverdueIncidents } from '@/shared/hooks/metrics-hooks'
import { AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OverdueIncidentsCard() {
  const { data, error, isLoading } = useOverdueIncidents(5)
  const router = useRouter()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Sucesos Vencidos
          </CardTitle>
          <CardDescription>Sucesos que excedieron su plazo SLA</CardDescription>
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
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Sucesos Vencidos
          </CardTitle>
          <CardDescription>Error al cargar datos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Sucesos Vencidos
          </div>
          <Badge variant="destructive">{data.total}</Badge>
        </CardTitle>
        <CardDescription>Requieren atención inmediata</CardDescription>
      </CardHeader>
      <CardContent>
        {data.incidents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              ✓ No hay sucesos vencidos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => router.push(`/incidents/${incident.id}`)}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {incident.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {incident.severity}
                      </Badge>
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {incident.days_overdue} días vencido
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
