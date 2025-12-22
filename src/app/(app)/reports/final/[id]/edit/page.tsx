/**
 * Edit Final Report Page
 * Comprehensive final incident investigation report
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFinalReport, useUpdateFinalReport } from '@/shared/hooks/report-hooks'
import { finalReportSchema, type FinalReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { data: report, isLoading: isLoadingReport } = useFinalReport(id)
  const { trigger: updateReport, isMutating } = useUpdateFinalReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FinalReportFormData>({
    resolver: zodResolver(finalReportSchema),
  })

  const { fields: personas, append: appendPersona, remove: removePersona } = useFieldArray({ control, name: 'personas_involucradas' })
  const { fields: equipos, append: appendEquipo, remove: removeEquipo } = useFieldArray({ control, name: 'equipos_danados' })
  const { fields: causas, append: appendCausa, remove: removeCausa } = useFieldArray({ control, name: 'analisis_causas_raiz' })
  const { fields: costos, append: appendCosto, remove: removeCosto } = useFieldArray({ control, name: 'costos_tabla' })

  // Load existing report data
  useEffect(() => {
    if (report) {
      reset({
        incident_id: report.incident_id,
        fecha_elaboracion: report.fecha_elaboracion || '',
        
        // Company data
        company_data: report.company_data || {},
        
        // Classification
        tipo_accidente_tabla: report.tipo_accidente_tabla || {},
        
        // Main content
        detalles_accidente: report.detalles_accidente || '',
        lugar_detallado: report.lugar_detallado || '',
        descripcion_hechos: report.descripcion_hechos || '',
        
        // People and equipment
        personas_involucradas: report.personas_involucradas || [],
        equipos_danados: report.equipos_danados || [],
        terceros_identificados: report.terceros_identificados || [],
        
        // Analysis
        analisis_causas_raiz: report.analisis_causas_raiz || [],
        medidas_correctivas: report.medidas_correctivas || '',
        medidas_preventivas: report.medidas_preventivas || '',
        
        // Costs
        costos_tabla: report.costos_tabla || [],
        costo_total_estimado: report.costo_total_estimado || 0,
        
        // Evidence
        imagenes_evidencia: report.imagenes_evidencia || [],
        
        // Signatories
        responsables_investigacion: report.responsables_investigacion || [],
        
        // Additional
        conclusiones: report.conclusiones || '',
        recomendaciones: report.recomendaciones || '',
        observaciones: report.observaciones || '',
      })
    }
  }, [report, reset])

  const onSubmit = async (data: FinalReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
      toast.success('Reporte Final actualizado exitosamente')
      router.push(`/reports/final/${id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el reporte'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingReport) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Reporte Final no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <ReportFormHeader
        title="Editar Reporte Final"
        description="Reporte comprensivo de la investigación del suceso"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="involucrados">Involucrados</TabsTrigger>
            <TabsTrigger value="analisis">Análisis</TabsTrigger>
            <TabsTrigger value="costos">Costos</TabsTrigger>
            <TabsTrigger value="conclusiones">Conclusiones</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_elaboracion">Fecha de Elaboración</Label>
                  <Input
                    id="fecha_elaboracion"
                    type="date"
                    {...register('fecha_elaboracion')}
                  />
                  {errors.fecha_elaboracion && (
                    <p className="text-sm text-red-600">{errors.fecha_elaboracion.message}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Datos de la Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_nombre">Nombre Empresa</Label>
                      <Input
                        id="company_nombre"
                        {...register('company_data.nombre')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_rut">RUT</Label>
                      <Input
                        id="company_rut"
                        {...register('company_data.rut')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_direccion">Dirección</Label>
                    <Input
                      id="company_direccion"
                      {...register('company_data.direccion')}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Clasificación del Suceso</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="con_baja_il"
                        checked={watch('tipo_accidente_tabla.con_baja_il')}
                        onCheckedChange={(checked) => setValue('tipo_accidente_tabla.con_baja_il', checked as boolean)}
                      />
                      <Label htmlFor="con_baja_il">Con Baja IL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sin_baja_il"
                        checked={watch('tipo_accidente_tabla.sin_baja_il')}
                        onCheckedChange={(checked) => setValue('tipo_accidente_tabla.sin_baja_il', checked as boolean)}
                      />
                      <Label htmlFor="sin_baja_il">Sin Baja IL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="incidente_industrial"
                        checked={watch('tipo_accidente_tabla.incidente_industrial')}
                        onCheckedChange={(checked) => setValue('tipo_accidente_tabla.incidente_industrial', checked as boolean)}
                      />
                      <Label htmlFor="incidente_industrial">Incidente Industrial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="incidente_laboral"
                        checked={watch('tipo_accidente_tabla.incidente_laboral')}
                        onCheckedChange={(checked) => setValue('tipo_accidente_tabla.incidente_laboral', checked as boolean)}
                      />
                      <Label htmlFor="incidente_laboral">Incidente Laboral</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="detalles_accidente">Detalles del Suceso</Label>
                  <Textarea
                    id="detalles_accidente"
                    rows={4}
                    {...register('detalles_accidente')}
                  />
                  {errors.detalles_accidente && (
                    <p className="text-sm text-red-600">{errors.detalles_accidente.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lugar_detallado">Lugar Detallado</Label>
                  <Input
                    id="lugar_detallado"
                    {...register('lugar_detallado')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_hechos">Descripción de los Hechos</Label>
                  <Textarea
                    id="descripcion_hechos"
                    rows={6}
                    {...register('descripcion_hechos')}
                  />
                  {errors.descripcion_hechos && (
                    <p className="text-sm text-red-600">{errors.descripcion_hechos.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Involucrados Tab */}
          <TabsContent value="involucrados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personas Involucradas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {personas.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="Nombre completo"
                      {...register(`personas_involucradas.${index}.nombre`)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Cargo"
                      {...register(`personas_involucradas.${index}.cargo`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePersona(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPersona({ nombre: '', cargo: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Persona
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipos Dañados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipos.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="Nombre del equipo"
                      {...register(`equipos_danados.${index}.nombre`)}
                      className="flex-1"
                    />
                    <Textarea
                      placeholder="Descripción del daño"
                      {...register(`equipos_danados.${index}.descripcion_dano`)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquipo(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendEquipo({ nombre: '', descripcion_dano: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Equipo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análisis Tab */}
          <TabsContent value="analisis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Causas Raíz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {causas.map((field, index) => (
                  <div key={field.id} className="space-y-2 p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <Label>Causa {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCausa(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Descripción de la causa raíz"
                      {...register(`analisis_causas_raiz.${index}.descripcion`)}
                      rows={3}
                    />
                    <Input
                      placeholder="Categoría (Ej: Proceso, Equipo, Personal)"
                      {...register(`analisis_causas_raiz.${index}.categoria`)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCausa({ descripcion: '', categoria: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Causa
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medidas_correctivas">Medidas Correctivas</Label>
                  <Textarea
                    id="medidas_correctivas"
                    rows={4}
                    {...register('medidas_correctivas')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medidas_preventivas">Medidas Preventivas</Label>
                  <Textarea
                    id="medidas_preventivas"
                    rows={4}
                    {...register('medidas_preventivas')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costos Tab */}
          <TabsContent value="costos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Costos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {costos.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Concepto"
                      {...register(`costos_tabla.${index}.concepto`)}
                    />
                    <Input
                      type="number"
                      placeholder="Monto"
                      {...register(`costos_tabla.${index}.monto`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCosto(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCosto({ concepto: '', monto: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Costo
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="costo_total_estimado">Costo Total Estimado</Label>
                  <Input
                    id="costo_total_estimado"
                    type="number"
                    {...register('costo_total_estimado', { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conclusiones Tab */}
          <TabsContent value="conclusiones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conclusiones y Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conclusiones">Conclusiones</Label>
                  <Textarea
                    id="conclusiones"
                    rows={5}
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
                    rows={5}
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
                    rows={4}
                    {...register('observaciones')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/final/${id}`)}
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
