/**
 * Edit Root Cause Report Page
 * Allows editing root cause analysis with Five Whys and Fishbone
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRootCauseReport, useUpdateRootCauseReport } from '@/shared/hooks/report-hooks'
import { rootCauseReportSchema, type RootCauseReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Save, HelpCircle, Fish } from 'lucide-react'

export default function EditRootCauseReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { data: report, isLoading: isLoadingReport } = useRootCauseReport(id)
  const { trigger: updateReport, isMutating } = useUpdateRootCauseReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RootCauseReportFormData>({
    resolver: zodResolver(rootCauseReportSchema),
  })

  // Load existing report data
  useEffect(() => {
    if (report) {
      reset({
        incident_id: report.incident_id,
        fecha_analisis: report.fecha_analisis || '',
        participantes: report.participantes || '',
        descripcion_problema: report.descripcion_problema || '',
        
        // Five Whys
        why_1: report.why_1 || '',
        why_2: report.why_2 || '',
        why_3: report.why_3 || '',
        why_4: report.why_4 || '',
        why_5: report.why_5 || '',
        causa_raiz_identificada: report.causa_raiz_identificada || '',
        
        // Fishbone categories
        personas: report.personas || '',
        procesos: report.procesos || '',
        equipos: report.equipos || '',
        materiales: report.materiales || '',
        ambiente: report.ambiente || '',
        gestion: report.gestion || '',
        
        conclusiones: report.conclusiones || '',
        recomendaciones: report.recomendaciones || '',
        observaciones: report.observaciones || '',
      })
    }
  }, [report, reset])

  const onSubmit = async (data: RootCauseReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
      toast.success('Análisis de Causa Raíz actualizado exitosamente')
      router.push(`/reports/root-cause/${id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el análisis'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingReport) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Análisis de Causa Raíz no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ReportFormHeader
        title="Editar Análisis de Causa Raíz"
        description="Modifica el análisis Five Whys y diagrama Fishbone"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Datos principales del análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_analisis">Fecha de Análisis</Label>
                <Input
                  id="fecha_analisis"
                  type="date"
                  {...register('fecha_analisis')}
                />
                {errors.fecha_analisis && (
                  <p className="text-sm text-red-600">{errors.fecha_analisis.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="participantes">Participantes</Label>
                <Input
                  id="participantes"
                  placeholder="Nombres de participantes"
                  {...register('participantes')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion_problema">Descripción del Problema</Label>
              <Textarea
                id="descripcion_problema"
                placeholder="Describe el problema a analizar..."
                rows={3}
                {...register('descripcion_problema')}
              />
              {errors.descripcion_problema && (
                <p className="text-sm text-red-600">{errors.descripcion_problema.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Five Whys Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <CardTitle>Metodología Five Whys (5 Porqués)</CardTitle>
            </div>
            <CardDescription>
              Pregunta "¿Por qué?" sucesivamente para llegar a la causa raíz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="why_1" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">1</span>
                ¿Por qué ocurrió el problema?
              </Label>
              <Textarea
                id="why_1"
                placeholder="Primera causa..."
                rows={2}
                {...register('why_1')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_2" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">2</span>
                ¿Por qué ocurrió eso?
              </Label>
              <Textarea
                id="why_2"
                placeholder="Segunda causa..."
                rows={2}
                {...register('why_2')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_3" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">3</span>
                ¿Por qué ocurrió eso?
              </Label>
              <Textarea
                id="why_3"
                placeholder="Tercera causa..."
                rows={2}
                {...register('why_3')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_4" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">4</span>
                ¿Por qué ocurrió eso?
              </Label>
              <Textarea
                id="why_4"
                placeholder="Cuarta causa..."
                rows={2}
                {...register('why_4')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why_5" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">5</span>
                ¿Por qué ocurrió eso?
              </Label>
              <Textarea
                id="why_5"
                placeholder="Quinta causa..."
                rows={2}
                {...register('why_5')}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="causa_raiz_identificada" className="font-semibold text-blue-700">
                Causa Raíz Identificada
              </Label>
              <Textarea
                id="causa_raiz_identificada"
                placeholder="Resume la causa raíz principal identificada..."
                rows={3}
                className="border-blue-200 focus:border-blue-500"
                {...register('causa_raiz_identificada')}
              />
              {errors.causa_raiz_identificada && (
                <p className="text-sm text-red-600">{errors.causa_raiz_identificada.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fishbone Diagram */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-purple-600" />
              <CardTitle>Diagrama Ishikawa (Fishbone)</CardTitle>
            </div>
            <CardDescription>
              Analiza causas por categorías: 6M
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personas" className="font-semibold">
                  👥 Personas (Mano de Obra)
                </Label>
                <Textarea
                  id="personas"
                  placeholder="Factores relacionados con el personal..."
                  rows={3}
                  {...register('personas')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procesos" className="font-semibold">
                  ⚙️ Procesos (Métodos)
                </Label>
                <Textarea
                  id="procesos"
                  placeholder="Factores relacionados con procedimientos..."
                  rows={3}
                  {...register('procesos')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipos" className="font-semibold">
                  🔧 Equipos (Máquinas)
                </Label>
                <Textarea
                  id="equipos"
                  placeholder="Factores relacionados con maquinaria..."
                  rows={3}
                  {...register('equipos')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materiales" className="font-semibold">
                  📦 Materiales
                </Label>
                <Textarea
                  id="materiales"
                  placeholder="Factores relacionados con materiales..."
                  rows={3}
                  {...register('materiales')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ambiente" className="font-semibold">
                  🌍 Ambiente (Medio Ambiente)
                </Label>
                <Textarea
                  id="ambiente"
                  placeholder="Factores ambientales..."
                  rows={3}
                  {...register('ambiente')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gestion" className="font-semibold">
                  📊 Gestión (Medición)
                </Label>
                <Textarea
                  id="gestion"
                  placeholder="Factores de gestión y medición..."
                  rows={3}
                  {...register('gestion')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conclusions and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Conclusiones y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conclusiones">Conclusiones</Label>
              <Textarea
                id="conclusiones"
                placeholder="Conclusiones del análisis de causa raíz..."
                rows={4}
                {...register('conclusiones')}
              />
              {errors.conclusiones && (
                <p className="text-sm text-red-600">{errors.conclusiones.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recomendaciones">Recomendaciones</Label>
              <Textarea
                id="recomendaciones"
                placeholder="Recomendaciones para prevenir recurrencia..."
                rows={4}
                {...register('recomendaciones')}
              />
              {errors.recomendaciones && (
                <p className="text-sm text-red-600">{errors.recomendaciones.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Adicionales</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones adicionales..."
                rows={3}
                {...register('observaciones')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/root-cause/${id}`)}
            disabled={isSubmitting || isMutating}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isMutating}
          >
            {(isSubmitting || isMutating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
