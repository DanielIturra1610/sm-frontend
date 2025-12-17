'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fiveWhysSchema = z.object({
  incidentId: z.string().min(1, 'ID del incidente es requerido'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  problemStatement: z.string().min(10, 'La descripción del problema debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
})

type FiveWhysFormValues = z.infer<typeof fiveWhysSchema>

function CreateFiveWhysForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId') || ''
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createAnalysis } = useCreateFiveWhysAnalysis()

  const form = useForm<FiveWhysFormValues>({
    resolver: zodResolver(fiveWhysSchema),
    defaultValues: {
      incidentId,
      title: '',
      problemStatement: '',
    },
  })

  const onSubmit = async (data: FiveWhysFormValues) => {
    try {
      setIsSubmitting(true)
      const newAnalysis = await createAnalysis(data)
      toast.success('Análisis de 5 porqués creado exitosamente')
      router.push(`/analysis/five-whys/${newAnalysis.id}`)
    } catch (error) {
      console.error('Error creating analysis:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el análisis')
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
            onClick={() => router.push('/analysis/five-whys')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Análisis de 5 Porqués</h1>
            <p className="text-muted-foreground">Identificar causas raíz a través de preguntas iterativas</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Acerca del Análisis de 5 Porqués</CardTitle>
            <CardDescription className="text-blue-700">
              La técnica de los 5 Porqués ayuda a identificar la causa raíz de un problema haciendo la pregunta ¿Por qué? repetidamente.
              Cada respuesta forma la base de la siguiente pregunta, profundizando hasta llegar al problema fundamental.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Análisis</CardTitle>
            <CardDescription>
              Define el problema y pregunta por qué para descubrir la causa raíz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Incident ID */}
                <FormField
                  control={form.control}
                  name="incidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Incidente *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="id-del-incidente"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        El incidente al que está relacionado este análisis
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Análisis *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Análisis de derrame de aceite en zona de producción"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Un título descriptivo para identificar este análisis
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Problem Statement */}
                <FormField
                  control={form.control}
                  name="problemStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Declaración del Problema *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe claramente el problema que estás analizando..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Sé específico y objetivo sobre lo que salió mal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Info about next steps */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <p className="text-sm text-amber-800">
                      <strong>Siguiente paso:</strong> Después de crear el análisis, podrás agregar las preguntas
                      &quot;¿Por qué?&quot; y sus respuestas en la página de detalle del análisis.
                    </p>
                  </CardContent>
                </Card>

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
                        Crear Análisis
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/analysis/five-whys')}
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

export default function CreateFiveWhysPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <CreateFiveWhysForm />
    </Suspense>
  )
}