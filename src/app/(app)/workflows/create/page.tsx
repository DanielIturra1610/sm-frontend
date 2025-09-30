'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/forms/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const workflowSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  steps: z.array(
    z.object({
      name: z.string().min(3, 'Step name must be at least 3 characters'),
      description: z.string().min(5, 'Description must be at least 5 characters'),
      type: z.enum(['approval', 'task', 'notification', 'automation']),
      assignee: z.string().min(1, 'Assignee is required'),
      requiredApprovals: z.number().min(1).max(10),
    })
  ).min(1, 'At least one step is required'),
})

type WorkflowFormValues = z.infer<typeof workflowSchema>

export default function CreateWorkflowPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      steps: [
        {
          name: 'Initial Review',
          description: '',
          type: 'approval',
          assignee: 'manager',
          requiredApprovals: 1,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  })

  const onSubmit = async (data: WorkflowFormValues) => {
    try {
      setIsSubmitting(true)
      // Replace with actual API call: await createWorkflow(data)
      console.log('Creating workflow:', data)
      toast.success('Workflow created successfully')
      router.push('/workflows')
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/workflows')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Workflow</h1>
            <p className="text-muted-foreground">Define a new incident workflow process</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Workflows</CardTitle>
            <CardDescription className="text-blue-700">
              Workflows automate incident management processes by defining a series of steps
              that must be completed. Each step can require approvals, assign tasks, send
              notifications, or trigger automations.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Standard Incident Investigation"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose and scope of this workflow..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Workflow Steps</h3>
                      <p className="text-sm text-muted-foreground">
                        Define the steps in this workflow process
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          name: '',
                          description: '',
                          type: 'task',
                          assignee: '',
                          requiredApprovals: 1,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Step
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Step {index + 1}</CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`steps.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Step Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="e.g., Manager Review"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`steps.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="Describe what happens in this step..."
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`steps.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="approval">Approval</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                    <SelectItem value="notification">Notification</SelectItem>
                                    <SelectItem value="automation">Automation</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`steps.${index}.assignee`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assignee</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="reporter">Reporter</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`steps.${index}.requiredApprovals`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Required Approvals</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-initial"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Workflow
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/workflows')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}