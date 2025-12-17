'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useIncident, useUpdateIncident } from '@/shared/hooks/incident-hooks'
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
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 20 caracteres'),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Por favor selecciona un nivel de severidad',
  }),
  type: z.enum(['safety', 'security', 'environmental', 'quality', 'operational'], {
    required_error: 'Por favor selecciona un tipo de incidente',
  }),
  location: z.string().min(5, 'La ubicación debe tener al menos 3 caracteres'),
})

type IncidentFormValues = z.infer<typeof incidentSchema>

export default function EditIncidentPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params?.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: incident, error, isLoading } = useIncident(incidentId)
  const { trigger: updateIncident } = useUpdateIncident(incidentId)

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
    },
  })

  // Pre-fill form when incident data is loaded
  useEffect(() => {
    if (incident) {
      form.reset({
        title: incident.title || '',
        description: incident.description || '',
        severity: incident.severity || 'low',
        type: incident.type || 'safety',
        location: incident.location || '',
      })
    }
  }, [incident, form])

  const onSubmit = async (data: IncidentFormValues) => {
    try {
      setIsSubmitting(true)

      const incidentData = {
        title: data.title,
        description: data.description,
        severity: data.severity,
      }

      await updateIncident(incidentData)
      toast.success('Incidente actualizado exitosamente')
      router.push(`/incidents/${incidentId}`)
    } catch (error) {
      console.error('Error updating incident:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el incidente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error al Cargar el Incidente</CardTitle>
            <CardDescription>
              {error?.message || 'No se pudo cargar los detalles del incidente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/incidents')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Incidentes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/incidents/${incidentId}`)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Incidente</h1>
            <p className="text-muted-foreground">Incidente #{incidentId.slice(0, 8)}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Incidente</CardTitle>
            <CardDescription>
              Modifica la información del incidente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Breve descripción del incidente"
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
                          placeholder="Descripción detallada de lo que sucedió..."
                          className="min-h-[150px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluye qué sucedió, cuándo, dónde y quién estuvo involucrado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Severity and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severidad *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la severidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="safety">Seguridad</SelectItem>
                            <SelectItem value="security">Seguridad Física</SelectItem>
                            <SelectItem value="environmental">Ambiental</SelectItem>
                            <SelectItem value="quality">Calidad</SelectItem>
                            <SelectItem value="operational">Operacional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="¿Dónde ocurrió este incidente?"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/incidents/${incidentId}`)}
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
