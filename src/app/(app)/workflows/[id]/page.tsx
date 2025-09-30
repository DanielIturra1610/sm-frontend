'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, Workflow, CheckCircle2, Clock, Circle } from 'lucide-react'

// Mock data - replace with actual hook when available
const mockWorkflowInstance = {
  id: '1',
  workflowId: 'wf-001',
  entityId: 'inc-001',
  entityType: 'incident',
  currentStep: 'Review and Approval',
  status: 'active',
  steps: [
    {
      id: 'step-1',
      stepId: 'initial-report',
      status: 'completed',
      assignedTo: ['John Doe'],
      completedAt: '2024-01-15T10:30:00Z',
      completedBy: 'John Doe',
    },
    {
      id: 'step-2',
      stepId: 'investigation',
      status: 'completed',
      assignedTo: ['Jane Smith'],
      completedAt: '2024-01-16T14:20:00Z',
      completedBy: 'Jane Smith',
    },
    {
      id: 'step-3',
      stepId: 'review-approval',
      status: 'in_progress',
      assignedTo: ['Bob Wilson'],
    },
    {
      id: 'step-4',
      stepId: 'closure',
      status: 'pending',
      assignedTo: ['Admin'],
    },
  ],
  context: {
    priority: 'high',
    department: 'Production',
  },
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params?.id as string | null

  // Replace with actual hook: const { data: workflow, error, isLoading } = useWorkflowInstance(workflowId)
  const workflow = mockWorkflowInstance
  const isLoading = false
  const error = null

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              Error Loading Workflow
            </CardTitle>
            <CardDescription>Failed to load workflow details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/workflows')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const getStepStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-400',
      in_progress: 'text-blue-600',
      completed: 'text-green-600',
      skipped: 'text-gray-400',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStepIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-6 w-6" />
    if (status === 'in_progress') return <Clock className="h-6 w-6" />
    return <Circle className="h-6 w-6" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workflow Instance</h1>
            <p className="text-muted-foreground">#{workflow.id}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2">
        <Badge className={getStatusColor(workflow.status)}>
          {workflow.status.toUpperCase()}
        </Badge>
        <Badge variant="outline">Entity: {workflow.entityType}</Badge>
        <Badge variant="outline">Entity ID: {workflow.entityId}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workflow Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Progress</CardTitle>
              <CardDescription>
                Current step: {workflow.currentStep}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 ${getStepStatusColor(step.status)}`}>
                        {getStepIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">
                              Step {index + 1}: {step.stepId}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Assigned to: {step.assignedTo.join(', ')}
                            </p>
                          </div>
                          <Badge
                            variant={step.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {step.status}
                          </Badge>
                        </div>

                        {step.completedAt && (
                          <div className="text-sm text-muted-foreground">
                            <p>
                              Completed by {step.completedBy} on{' '}
                              {new Date(step.completedAt).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {step.status === 'in_progress' && (
                          <div className="mt-3">
                            <Button size="sm">Complete This Step</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < workflow.steps.length - 1 && (
                      <div
                        className={`absolute left-3 top-8 w-0.5 h-8 ${
                          step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Context Information */}
          {workflow.context && Object.keys(workflow.context).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Context Information</CardTitle>
                <CardDescription>Additional workflow metadata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(workflow.context).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace('_', ' ')}
                      </p>
                      <p className="text-sm font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Steps</span>
                <Badge variant="outline">{workflow.steps.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge variant="outline">
                  {workflow.steps.filter((s) => s.status === 'completed').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline">
                  {workflow.steps.filter((s) => s.status === 'in_progress').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge variant="outline">
                  {workflow.steps.filter((s) => s.status === 'pending').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(workflow.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Entity */}
          <Card>
            <CardHeader>
              <CardTitle>Related {workflow.entityType}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/${workflow.entityType}s/${workflow.entityId}`)}
              >
                View {workflow.entityType} #{workflow.entityId.slice(0, 8)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}