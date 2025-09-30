'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserTasks } from '@/shared/hooks/workflow-hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ArrowLeft, ListTodo, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function UserTasksPage() {
  const router = useRouter()
  const { data: tasks, error, isLoading } = useUserTasks()
  const [filter, setFilter] = useState<string>('all')

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: Clock,
      completed: CheckCircle2,
      overdue: AlertCircle,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
  }

  const filteredTasks = tasks?.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  }) || []

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mis Tareas</h1>
            <p className="text-muted-foreground">Tareas asignadas a usted</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Todas ({tasks?.length || 0})
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pendientes ({tasks?.filter((t) => t.status === 'pending').length || 0})
            </Button>
            <Button
              variant={filter === 'in_progress' ? 'primary' : 'outline'}
              onClick={() => setFilter('in_progress')}
            >
              En Progreso ({tasks?.filter((t) => t.status === 'in_progress').length || 0})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'primary' : 'outline'}
              onClick={() => setFilter('overdue')}
            >
              Atrasadas ({tasks?.filter((t) => t.status === 'overdue').length || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tareas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {tasks?.filter((t) => t.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks?.filter((t) => t.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks?.filter((t) => t.status === 'overdue').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron tareas</p>
              <p className="text-muted-foreground">
                {filter !== 'all'
                  ? 'No hay tareas que coincidan con su filtro'
                  : 'No tiene tareas asignadas en este momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/workflows/${task.workflowInstanceId}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{task.name}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(task.priority)}
                      >
                        Prioridad {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Instancia de Flujo de Trabajo</p>
                        <p>#{task.workflowInstanceId.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Asignado a</p>
                        <p>{task.assignedTo}</p>
                      </div>
                      {task.dueDate && (
                        <div>
                          <p className="font-medium text-muted-foreground">Fecha de Vencimiento</p>
                          <p className={
                            new Date(task.dueDate) < new Date()
                              ? 'text-red-600 font-medium'
                              : ''
                          }>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle complete task
                          console.log('Complete task:', task.id)
                        }}
                        disabled={task.status === 'completed'}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Completar Tarea
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/workflows/${task.workflowInstanceId}`)
                        }}
                      >
                        Ver Flujo de Trabajo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}