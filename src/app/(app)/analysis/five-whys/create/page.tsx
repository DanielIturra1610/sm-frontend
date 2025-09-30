'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fiveWhysSchema = z.object({
  incidentId: z.string().min(1, 'ID del incidente es requerido'),
  problem: z.string().min(10, 'La descripción del problema debe tener al menos 10 caracteres'),
  whys: z.array(
    z.object({
      question: z.string().min(5, 'La pregunta debe tener al menos 5 caracteres'),
      answer: z.string().min(5, 'La respuesta debe tener al menos 5 caracteres'),
    })
  ).min(1, 'Debe haber al menos un por qué').max(10, 'Máximo 10 porqués permitidos'),
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
      problem: '',
      whys: [
        { question: '¿Por qué sucedió esto?', answer: '' },
        { question: '¿Por qué?', answer: '' },
        { question: '¿Por qué?', answer: '' },
        { question: '¿Por qué?', answer: '' },
        { question: '¿Por qué?', answer: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'whys',
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

                {/* Problem Statement */}
                <FormField
                  control={form.control}
                  name="problem"
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

                {/* Five Whys */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Los Porqués</h3>
                      <p className="text-sm text-muted-foreground">
                        Pregunta por qué iterativamente para profundizar en la causa raíz
                      </p>
                    </div>
                    {fields.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ question: '¿Por qué?', answer: '' })}
                        disabled={isSubmitting}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Porqué
                      </Button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Por qué #{index + 1}</CardTitle>
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
                          name={`whys.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pregunta</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="¿Por qué ocurrió esto?"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`whys.${index}.answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Respuesta</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="Proporciona una respuesta detallada..."
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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