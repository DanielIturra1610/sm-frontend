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
  name: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  steps: z.array(
    z.object({
      name: z.string().min(3, 'El nombre del paso debe tener al menos 3 caracteres'),
      description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
      type: z.enum(['approval', 'task', 'notification', 'automation']),
      assignee: z.string().min(1, 'Se requiere un responsable'),
      requiredApprovals: z.number().min(1).max(10),
    })
  ).min(1, 'Se requiere al menos un paso'),
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
          name: 'Revisión Inicial',
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
      toast.success('Flujo de trabajo creado exitosamente')
      router.push('/workflows')
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el flujo de trabajo')
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
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Flujo de Trabajo</h1>
            <p className="text-muted-foreground">Definir un nuevo proceso de flujo de trabajo de incidentes</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Acerca de los Flujos de Trabajo</CardTitle>
            <CardDescription className="text-blue-700">
              Los flujos de trabajo automatizan los procesos de gestión de incidentes definiendo una serie de pasos
              que deben completarse. Cada paso puede requerir aprobaciones, asignar tareas, enviar
              notificaciones o activar automatizaciones.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Flujo de Trabajo</CardTitle>
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
                      <FormLabel>Nombre del Flujo de Trabajo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="por ejemplo, Investigación Estándar de Incidentes"
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
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el propósito y alcance de este flujo de trabajo..."
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
                      <h3 className="text-lg font-semibold">Pasos del Flujo de Trabajo</h3>
                      <p className="text-sm text-muted-foreground">
                        Define los pasos en este proceso de flujo de trabajo
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
                      Añadir Paso
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Paso {index + 1}</CardTitle>
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
                              <FormLabel>Nombre del Paso</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="por ejemplo, Revisión del Gerente"
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
                              <FormLabel>Descripción</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="Describe qué sucede en este paso..."
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
                                <FormLabel>Tipo</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="approval">Aprobación</SelectItem>
                                    <SelectItem value="task">Tarea</SelectItem>
                                    <SelectItem value="notification">Notificación</SelectItem>
                                    <SelectItem value="automation">Automatización</SelectItem>
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
                                <FormLabel>Responsable</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="reporter">Reportero</SelectItem>
                                    <SelectItem value="manager">Gerente</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
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
                                <FormLabel>Aprobaciones Requeridas</FormLabel>
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Flujo de Trabajo
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/workflows')}
                    disabled={isSubmitting}
                  >
                    Cancelar
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