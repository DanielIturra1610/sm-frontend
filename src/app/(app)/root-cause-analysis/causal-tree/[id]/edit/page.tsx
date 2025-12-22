'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, GitBranch } from 'lucide-react'
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
import { useCausalTreeAnalysis, useUpdateCausalTreeAnalysis } from '@/shared/hooks/causal-tree-hooks'

const causalTreeSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  finalEvent: z.string().min(10, 'El evento final debe tener al menos 10 caracteres'),
  description: z.string().optional(),
})

type CausalTreeFormData = z.infer<typeof causalTreeSchema>

export default function EditCausalTreePage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string

  const { data: analysis, isLoading, error } = useCausalTreeAnalysis(analysisId)
  const updateMutation = useUpdateCausalTreeAnalysis()

  const form = useForm<CausalTreeFormData>({
    resolver: zodResolver(causalTreeSchema),
    defaultValues: {
      title: '',
      finalEvent: '',
      description: '',
    },
  })

  useEffect(() => {
    if (analysis) {
      form.reset({
        title: analysis.title || '',
        finalEvent: analysis.finalEvent || '',
        description: analysis.description || '',
      })
    }
  }, [analysis, form])

  const onSubmit = async (data: CausalTreeFormData) => {
    try {
      await updateMutation.mutateAsync({
        analysisId,
        data: {
          title: data.title,
          finalEvent: data.finalEvent,
          description: data.description,
        },
      })
      toast.success('Análisis actualizado exitosamente')
      router.push(`/root-cause-analysis/causal-tree/${analysisId}`)
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

  const canEdit = analysis.status !== 'completed' && analysis.status !== 'reviewed'

  if (!canEdit) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-600">No se puede editar</CardTitle>
            <CardDescription>
              Este análisis ha sido {analysis.status === 'completed' ? 'completado' : 'revisado'} y no puede ser modificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/root-cause-analysis/causal-tree/${analysisId}`)}>
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
          onClick={() => router.push(`/root-cause-analysis/causal-tree/${analysisId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Análisis
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Editar Análisis</h1>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <GitBranch className="h-3 w-3 mr-1" />
            Árbol Causal
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Modifica la información básica del análisis de árbol causal
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Análisis</CardTitle>
          <CardDescription>
            Actualiza el título, evento final y descripción del análisis
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
                        placeholder="Ej: Análisis Causal - Caída en área de producción"
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
                name="finalEvent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento Final (Lesión/Daño) *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el evento final o lesión que será el punto de partida del análisis..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Este es el nodo raíz del árbol causal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción adicional del análisis..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/root-cause-analysis/causal-tree/${analysisId}`)}
                  disabled={updateMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
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
