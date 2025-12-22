'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/forms/form'
import { toast } from 'sonner'
import { useFiveWhysAnalysis, useUpdateFiveWhys } from '@/shared/hooks/analysis-hooks'

const fiveWhysSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  problemStatement: z.string().min(10, 'La descripción del problema debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
})

type FiveWhysFormData = z.infer<typeof fiveWhysSchema>

export default function EditFiveWhysPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string

  const { data: analysis, isLoading, error } = useFiveWhysAnalysis(analysisId)
  const { trigger: updateAnalysis, isMutating: isUpdating } = useUpdateFiveWhys(analysisId)

  const form = useForm<FiveWhysFormData>({
    resolver: zodResolver(fiveWhysSchema),
    defaultValues: {
      title: '',
      problemStatement: '',
    },
  })

  useEffect(() => {
    if (analysis) {
      form.reset({
        title: analysis.title || '',
        problemStatement: analysis.problemStatement || '',
      })
    }
  }, [analysis, form])

  const onSubmit = async (data: FiveWhysFormData) => {
    try {
      await updateAnalysis(data)
      toast.success('Análisis actualizado exitosamente')
      router.push(`/root-cause-analysis/five-whys/${analysisId}`)
    } catch (err) {
      console.error('Error updating analysis:', err)
      toast.error('Error al actualizar el análisis')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error al Cargar el Análisis</CardTitle>
            <CardDescription>
              {error?.message || 'No se pudo cargar el análisis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/root-cause-analysis')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = analysis.status !== 'approved' && analysis.status !== 'rejected'

  if (!canEdit) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-600">No se puede editar</CardTitle>
            <CardDescription>
              Este análisis ha sido {analysis.status === 'approved' ? 'aprobado' : 'rechazado'} y no puede ser modificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/root-cause-analysis/five-whys/${analysisId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/root-cause-analysis/five-whys/${analysisId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Análisis
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Editar Análisis</h1>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <HelpCircle className="h-3 w-3 mr-1" />
            5 Porqués
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Modifica la información básica del análisis de 5 porqués
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Análisis</CardTitle>
          <CardDescription>
            Actualiza el título y la declaración del problema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      />
                    </FormControl>
                    <FormDescription>
                      Un título descriptivo para identificar este análisis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problemStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Declaración del Problema *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe claramente el problema que estás analizando..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sé específico y objetivo sobre lo que salió mal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/root-cause-analysis/five-whys/${analysisId}`)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
