'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Search,
  XCircle,
} from 'lucide-react'
import type { Incident } from '@/shared/types/api'

interface ActivityItem {
  id: string
  type: 'created' | 'investigating' | 'in_progress' | 'resolved' | 'closed'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  iconBg: string
}

const activityConfig: Record<string, { icon: React.ReactNode; iconBg: string; verb: string }> = {
  reported: {
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    verb: 'Suceso reportado',
  },
  investigating: {
    icon: <Search className="h-4 w-4 text-purple-600" />,
    iconBg: 'bg-purple-100',
    verb: 'Investigación iniciada',
  },
  in_progress: {
    icon: <Clock className="h-4 w-4 text-blue-600" />,
    iconBg: 'bg-blue-100',
    verb: 'En progreso',
  },
  resolved: {
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    iconBg: 'bg-green-100',
    verb: 'Suceso resuelto',
  },
  closed: {
    icon: <XCircle className="h-4 w-4 text-gray-600" />,
    iconBg: 'bg-gray-100',
    verb: 'Suceso cerrado',
  },
}

function transformIncidentsToActivity(incidents: Incident[]): ActivityItem[] {
  return incidents.map((incident) => {
    const config = activityConfig[incident.status] || activityConfig.reported

    return {
      id: incident.id,
      type: incident.status as ActivityItem['type'],
      title: config.verb,
      description: incident.title,
      timestamp: incident.updatedAt || incident.createdAt,
      icon: config.icon,
      iconBg: config.iconBg,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function ActivityItemRow({ activity }: { activity: ActivityItem }) {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className="flex items-start space-x-3">
      <div className={`h-8 w-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-48 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function RecentActivity() {
  const { data, isLoading } = useIncidents({ limit: 10, sort: 'updated_at', order: 'desc' })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const incidents = data?.data || []
  const activities = transformIncidentsToActivity(incidents).slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItemRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
