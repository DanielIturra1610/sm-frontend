'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateFishboneAnalysis } from '@/shared/hooks/analysis-hooks'
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
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fishboneSchema = z.object({
  incidentId: z.string().min(1, 'ID del incidente es requerido'),
  problem: z.string().min(10, 'La declaración del problema debe tener al menos 10 caracteres'),
  categories: z.array(
    z.object({
      name: z.string().min(2, 'El nombre de la categoría debe tener al menos 2 caracteres'),
      causes: z.array(
        z.object({
          description: z.string().min(5, 'La descripción de la causa debe tener al menos 5 caracteres'),
        })
      ).min(1, 'Se requiere al menos una causa'),
    })
  ).min(1, 'Se requiere al menos una categoría'),
})

type FishboneFormValues = z.infer<typeof fishboneSchema>

const defaultCategories = [
  { name: 'Personas', causes: [{ description: '' }] },
  { name: 'Métodos', causes: [{ description: '' }] },
  { name: 'Máquinas', causes: [{ description: '' }] },
  { name: 'Materiales', causes: [{ description: '' }] },
  { name: 'Mediciones', causes: [{ description: '' }] },
  { name: 'Entorno', causes: [{ description: '' }] },
]

function CreateFishboneFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId') || ''
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createAnalysis } = useCreateFishboneAnalysis()

  const form = useForm<FishboneFormValues>({
    resolver: zodResolver(fishboneSchema),
    defaultValues: {
      incidentId,
      problem: '',
      categories: defaultCategories,
    },
  })

  const onSubmit = async (data: FishboneFormValues) => {
    try {
      setIsSubmitting(true)
      const newAnalysis = await createAnalysis(data)
      toast.success('Análisis de espina de pescado creado exitosamente')
      router.push(`/analysis/fishbone/${newAnalysis.id}`)
    } catch (error) {
      console.error('Error creating analysis:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el análisis')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/analysis/fishbone')} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Análisis de Espina de Pescado</h1>
            <p className="text-muted-foreground">Identificar causas raíz usando el diagrama de Ishikawa</p>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Acerca del Diagrama de Espina de Pescado</CardTitle>
            <CardDescription className="text-blue-700">
              El diagrama de Espina de Pescado (Ishikawa) ayuda a identificar múltiples causas potenciales de un problema
              organizándolas en categorías. Las categorías comunes incluyen: Personas, Métodos, Máquinas,
              Materiales, Mediciones y Entorno (marco 6M).
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="incidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Incidente *</FormLabel>
                      <FormControl>
                        <Input placeholder="id-del-incidente" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Declaración del Problema (Efecto) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe claramente el efecto o problema..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Esta es la &quot;cabeza&quot; de la espina de pescado - el efecto que estás analizando
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Nota:</strong> Para esta versión simplificada, edita las categorías directamente en el formulario después de la creación.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-initial">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Análisis
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/analysis/fishbone')}
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

export default function CreateFishbonePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <CreateFishboneFormContent />
    </Suspense>
  )
}