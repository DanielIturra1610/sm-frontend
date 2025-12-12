'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Clock,
  Search,
  FileWarning,
  ChevronRight,
} from 'lucide-react'
import type { Incident } from '@/shared/types/api'

interface TaskItem {
  id: string
  incidentId: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueInfo: string
  icon: React.ReactNode
  iconBg: string
}

const priorityConfig: Record<string, { bgColor: string; hoverBg: string }> = {
  high: { bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100' },
  medium: { bgColor: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100' },
  low: { bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100' },
}

function getTaskFromIncident(incident: Incident): TaskItem | null {
  // Only show tasks for incidents that need attention
  const needsAttention = ['reported', 'investigating', 'in_progress'].includes(incident.status)
  if (!needsAttention) return null

  const createdAt = new Date(incident.createdAt)
  const now = new Date()
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  let priority: 'high' | 'medium' | 'low' = 'low'
  let dueInfo = ''
  let icon: React.ReactNode
  let iconBg: string
  let description: string

  // Determine priority based on severity and time
  if (incident.severity === 'critical' || incident.severity === 'high') {
    priority = 'high'
  } else if (hoursSinceCreation > 48) {
    priority = 'high'
  } else if (incident.severity === 'medium' || hoursSinceCreation > 24) {
    priority = 'medium'
  }

  // Set task details based on incident status
  switch (incident.status) {
    case 'reported':
      icon = <AlertTriangle className="h-4 w-4 text-yellow-600" />
      iconBg = 'text-yellow-600'
      description = 'Requiere revisión inicial'
      dueInfo = hoursSinceCreation > 24 ? 'Urgente' : 'Pendiente de revisión'
      break
    case 'investigating':
      icon = <Search className="h-4 w-4 text-purple-600" />
      iconBg = 'text-purple-600'
      description = 'Investigación en curso'
      dueInfo = 'En investigación'
      break
    case 'in_progress':
      icon = <Clock className="h-4 w-4 text-blue-600" />
      iconBg = 'text-blue-600'
      description = 'Acciones correctivas pendientes'
      dueInfo = 'En progreso'
      break
    default:
      return null
  }

  return {
    id: `task-${incident.id}`,
    incidentId: incident.id,
    title: incident.title,
    description,
    priority,
    dueInfo,
    icon,
    iconBg,
  }
}

function TaskRow({ task, onClick }: { task: TaskItem; onClick: () => void }) {
  const config = priorityConfig[task.priority]

  return (
    <div
      className={`flex items-center p-3 ${config.bgColor} rounded-lg ${config.hoverBg} transition-colors cursor-pointer group`}
      onClick={onClick}
    >
      <div className="mr-3 flex-shrink-0">
        {task.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-gray-600">{task.dueInfo}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
    </div>
  )
}

function TaskSkeleton() {
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <Skeleton className="h-4 w-4 mr-3" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function PendingTasks() {
  const router = useRouter()
  // Get incidents that are not resolved or closed
  const { data, isLoading } = useIncidents({
    limit: 20,
    sort: 'created_at',
    order: 'desc',
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Tareas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const incidents = data?.data || []
  const tasks = incidents
    .map(getTaskFromIncident)
    .filter((task): task is TaskItem => task !== null)
    .sort((a, b) => {
      // Sort by priority (high first)
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Tareas Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileWarning className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay tareas pendientes</p>
            <p className="text-xs mt-1">¡Excelente trabajo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() => router.push(`/incidents/${task.incidentId}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
