'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Incident } from '@/shared/types/api'

const severityConfig: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  low: {
    label: 'Baja',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500'
  },
  medium: {
    label: 'Media',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    dotColor: 'bg-yellow-500'
  },
  high: {
    label: 'Alta',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    dotColor: 'bg-orange-500'
  },
  critical: {
    label: 'Crítica',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500'
  },
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  reported: { label: 'Reportado', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  investigating: { label: 'Investigando', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  in_progress: { label: 'En Progreso', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  resolved: { label: 'Resuelto', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  closed: { label: 'Cerrado', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
}

function IncidentRow({ incident }: { incident: Incident }) {
  const router = useRouter()
  const severity = severityConfig[incident.severity] || severityConfig.medium
  const status = statusConfig[incident.status] || statusConfig.reported

  const timeAgo = formatDistanceToNow(new Date(incident.reportedAt || incident.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div
      className={`flex items-center p-4 ${severity.bgColor} rounded-lg border border-${severity.dotColor.replace('bg-', '')}/20 hover:opacity-90 transition-all cursor-pointer`}
      onClick={() => router.push(`/incidents/${incident.id}`)}
    >
      <div className={`h-3 w-3 ${severity.dotColor} rounded-full mr-4 flex-shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{incident.title}</p>
        <p className="text-sm text-gray-600 truncate">{incident.description || incident.location || 'Sin descripción'}</p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
          {status.label}
        </span>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
    </div>
  )
}

function IncidentRowSkeleton() {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <Skeleton className="h-3 w-3 rounded-full mr-4" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="text-right">
        <Skeleton className="h-5 w-16 mb-1" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

export function RecentIncidents() {
  const { data, isLoading, error } = useIncidents({ limit: 5, sort: 'created_at', order: 'desc' })
  const router = useRouter()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Incidentes Recientes</CardTitle>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <IncidentRowSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const incidents = data?.data || []

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Incidentes Recientes</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/incidents')}>
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay incidentes registrados</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push('/incidents/create')}
            >
              Crear primer incidente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
