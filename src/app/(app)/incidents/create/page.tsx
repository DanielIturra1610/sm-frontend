'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateIncident } from '@/shared/hooks/incident-hooks'
import { useAttachmentMutations } from '@/shared/hooks/attachment-hooks'
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
import { PhotoUploader } from '@/shared/components/attachments/PhotoUploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ArrowLeft, Save, Loader2, Camera, X } from 'lucide-react'
import { toast } from 'sonner'

const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Por favor selecciona un nivel de severidad',
  }),
  type: z.enum(['safety', 'security', 'environmental', 'quality', 'operational'], {
    required_error: 'Por favor selecciona un tipo de incidente',
  }),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  tags: z.string().optional(),
})

type IncidentFormValues = z.infer<typeof incidentSchema>

export default function CreateIncidentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createIncident } = useCreateIncident()
  const { uploadMultiple } = useAttachmentMutations()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      tags: '',
    },
  })

  const onSubmit = async (data: IncidentFormValues) => {
    try {
      setIsSubmitting(true)

      // Parse tags from comma-separated string
      const tags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []

      const incidentData = {
        title: data.title,
        description: data.description,
        severity: data.severity,
        type: data.type,
        location: data.location,
        tags,
      }

      const newIncident = await createIncident(incidentData, {})

      // Upload photos if any
      if (pendingFiles.length > 0) {
        try {
          await uploadMultiple(newIncident.id, pendingFiles)
          toast.success('Incidente creado con ' + pendingFiles.length + ' foto(s)')
        } catch (uploadError) {
          toast.success('Incidente creado, pero hubo error al subir fotos')
        }
      } else {
        toast.success('Incidente creado exitosamente')
      }
      router.push(`/incidents/${newIncident.id}`)
    } catch (error) {
      console.error('Error creating incident:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el incidente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/incidents')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Incidente</h1>
            <p className="text-muted-foreground">Reportar un nuevo incidente de seguridad</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Incidente</CardTitle>
            <CardDescription>
              Proporciona información detallada sobre el incidente
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
                          defaultValue={field.value}
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
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="safety">Seguridad</SelectItem>
                            <SelectItem value="security">Protección</SelectItem>
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

{/* Photos */}                <div className="space-y-2">                  <FormLabel>Fotos (opcional)</FormLabel>                  <div className="border rounded-lg p-4">                    {pendingFiles.length === 0 ? (                      <PhotoUploader                        onUpload={async (files) => setPendingFiles(prev => [...prev, ...files])}                        disabled={isSubmitting}                        maxFiles={10}                        maxSizeMB={10}                      />                    ) : (                      <div className="space-y-3">                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">                          {pendingFiles.map((file, idx) => (                            <div key={idx} className="relative aspect-square rounded overflow-hidden border">                              <img                                src={URL.createObjectURL(file)}                                alt={file.name}                                className="w-full h-full object-cover"                              />                              <button                                type="button"                                onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"                              >                                <X className="h-3 w-3" />                              </button>                            </div>                          ))}                        </div>                        <div className="flex items-center justify-between">                          <span className="text-sm text-muted-foreground">                            {pendingFiles.length} foto(s) seleccionadas                          </span>                          <Button                            type="button"                            variant="outline"                            size="sm"                            onClick={() => setPendingFiles([])}                          >                            Limpiar                          </Button>                        </div>                      </div>                    )}                  </div>                  <FormDescription>                    Agrega fotos del incidente (se subiran al crear)                  </FormDescription>                </div>
                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiquetas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="etiqueta1, etiqueta2, etiqueta3"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Etiquetas separadas por comas para categorizar este incidente
                      </FormDescription>
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Incidente
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/incidents')}
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