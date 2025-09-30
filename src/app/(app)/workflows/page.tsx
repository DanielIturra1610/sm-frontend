'use client'

import { useRouter } from 'next/navigation'
import { useWorkflowInstances } from '@/shared/hooks/workflow-hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Plus, Workflow, Clock, CheckCircle2, XCircle, Loader2, ListTodo } from 'lucide-react'
import Link from 'next/link'

export default function WorkflowsListPage() {
  const router = useRouter()
  const { data: instances, error, isLoading } = useWorkflowInstances()

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: Clock,
      completed: CheckCircle2,
      cancelled: XCircle,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flujos de Trabajo</h1>
          <p className="text-muted-foreground">Gestiona procesos de flujo de trabajo de incidentes y tareas</p>
        </div>
        <div className="flex gap-2">
          <Link href="/workflows/tasks">
            <Button variant="outline">
              <ListTodo className="mr-2 h-4 w-4" />
              Mis Tareas
            </Button>
          </Link>
          <Link href="/workflows/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Flujo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Instancias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {instances?.filter((i) => i.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {instances?.filter((i) => i.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {instances?.filter((i) => i.status === 'cancelled').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Instances List */}
      <div className="space-y-4">
        {!instances || instances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Workflow className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron instancias de flujo</p>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primer flujo de trabajo
              </p>
              <Link href="/workflows/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Flujo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          instances.map((instance) => (
            <Card
              key={instance.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/workflows/${instance.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Workflow className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">
                        Workflow Instance #{instance.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(instance.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(instance.status)}
                          {instance.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Tipo de Entidad</p>
                        <p className="capitalize">{instance.entityType}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">ID de Entidad</p>
                        <p>#{instance.entityId.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Paso Actual</p>
                        <p>{instance.currentStep}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Progreso</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${
                                  (instance.steps.filter((s) => s.status === 'completed').length /
                                    instance.steps.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {instance.steps.filter((s) => s.status === 'completed').length}/
                            {instance.steps.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Creado: {new Date(instance.createdAt).toLocaleString()}</p>
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