/**
 * Create Final Report Page
 * Comprehensive final incident investigation report
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFinalReport } from '@/shared/hooks/report-hooks'
import { finalReportSchema, type FinalReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, FileCheck } from 'lucide-react'

export default function CreateFinalReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateFinalReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FinalReportFormData>({
    resolver: zodResolver(finalReportSchema),
    defaultValues: {
      company_data: {},
      tipo_accidente_tabla: {},
      personas_involucradas: [],
      equipos_danados: [],
      terceros_identificados: [],
      analisis_causas_raiz: [],
      costos_tabla: [],
      imagenes_evidencia: [],
      responsables_investigacion: [],
    },
  })

  const { fields: personas, append: appendPersona, remove: removePersona } = useFieldArray({ control, name: 'personas_involucradas' })
  const { fields: equipos, append: appendEquipo, remove: removeEquipo } = useFieldArray({ control, name: 'equipos_danados' })
  const { fields: terceros, append: appendTercero, remove: removeTercero } = useFieldArray({ control, name: 'terceros_identificados' })
  const { fields: causas, append: appendCausa, remove: removeCausa } = useFieldArray({ control, name: 'analisis_causas_raiz' })
  const { fields: costos, append: appendCosto, remove: removeCosto } = useFieldArray({ control, name: 'costos_tabla' })
  const { fields: evidencias, append: appendEvidencia, remove: removeEvidencia } = useFieldArray({ control, name: 'imagenes_evidencia' })
  const { fields: responsables, append: appendResponsable, remove: removeResponsable } = useFieldArray({ control, name: 'responsables_investigacion' })

  const incident_id = watch('incident_id')

  const onSubmit = async (data: FinalReportFormData) => {
    try {
      setIsSubmitting(true)
      await createReport(data)
      toast.success('Reporte Final creado exitosamente')
      router.push('/reports/final')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Crear Reporte Final"
        description="Informe completo de investigación de incidente"
        backUrl="/reports/final"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Incidente</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentSelector
              value={incident_id || ''}
              onChange={(value) => setValue('incident_id', value)}
              error={errors.incident_id?.message}
              required
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="accident">Accidente</TabsTrigger>
            <TabsTrigger value="involved">Involucrados</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
            <TabsTrigger value="costs">Costos</TabsTrigger>
          </TabsList>

          {/* Tab 1: Company Data */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_data.nombre">Nombre</Label>
                    <Input {...register('company_data.nombre')} placeholder="Nombre de la empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_data.rut">RUT</Label>
                    <Input {...register('company_data.rut')} placeholder="RUT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_data.direccion">Dirección</Label>
                    <Input {...register('company_data.direccion')} placeholder="Dirección" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_data.telefono">Teléfono</Label>
                    <Input {...register('company_data.telefono')} placeholder="Teléfono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_data.email">Email</Label>
                    <Input {...register('company_data.email')} type="email" placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_data.contacto">Contacto</Label>
                    <Input {...register('company_data.contacto')} placeholder="Persona de contacto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Accident Type */}
          <TabsContent value="accident">
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Accidente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="con_baja_il"
                      checked={watch('tipo_accidente_tabla.con_baja_il')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.con_baja_il', checked as boolean)}
                    />
                    <Label htmlFor="con_baja_il">Con Baja - Incapacidad Laboral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sin_baja_il"
                      checked={watch('tipo_accidente_tabla.sin_baja_il')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.sin_baja_il', checked as boolean)}
                    />
                    <Label htmlFor="sin_baja_il">Sin Baja - Incapacidad Laboral</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Involved People & Equipment */}
          <TabsContent value="involved">
            <div className="space-y-6">
              {/* People */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Personas Involucradas</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPersona({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personas.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <Input {...register(`personas_involucradas.${index}.nombre`)} placeholder="Nombre" />
                              <Input {...register(`personas_involucradas.${index}.cargo`)} placeholder="Cargo" />
                              <Input {...register(`personas_involucradas.${index}.empresa`)} placeholder="Empresa" />
                              <Input {...register(`personas_involucradas.${index}.tipo_lesion`)} placeholder="Tipo de lesión" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePersona(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Equipos Dañados</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEquipo({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {equipos.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <Input {...register(`equipos_danados.${index}.nombre`)} placeholder="Nombre" />
                              <Input {...register(`equipos_danados.${index}.tipo`)} placeholder="Tipo" />
                              <Input {...register(`equipos_danados.${index}.marca`)} placeholder="Marca" />
                              <Input {...register(`equipos_danados.${index}.tipo_dano`)} placeholder="Tipo de daño" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeEquipo(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Third Parties */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Terceros Identificados</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendTercero({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {terceros.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <Input {...register(`terceros_identificados.${index}.nombre`)} placeholder="Nombre" />
                              <Input {...register(`terceros_identificados.${index}.empresa`)} placeholder="Empresa" />
                              <Input {...register(`terceros_identificados.${index}.rol`)} placeholder="Rol" />
                              <Input {...register(`terceros_identificados.${index}.contacto`)} placeholder="Contacto" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeTercero(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Analysis */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Análisis y Conclusiones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="detalles_accidente">Detalles del Accidente</Label>
                  <Textarea {...register('detalles_accidente')} rows={4} placeholder="Detalles..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion_detallada">Descripción Detallada</Label>
                  <Textarea {...register('descripcion_detallada')} rows={4} placeholder="Descripción..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conclusiones">Conclusiones</Label>
                  <Textarea {...register('conclusiones')} rows={3} placeholder="Conclusiones..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecciones_aprendidas">Lecciones Aprendidas</Label>
                  <Textarea {...register('lecciones_aprendidas')} rows={3} placeholder="Lecciones..." />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="acciones_inmediatas_resumen">Resumen Acciones Inmediatas</Label>
                  <Textarea {...register('acciones_inmediatas_resumen')} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_accion_resumen">Resumen Plan de Acción</Label>
                  <Textarea {...register('plan_accion_resumen')} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Costs & Evidence */}
          <TabsContent value="costs">
            <div className="space-y-6">
              {/* Costs */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Costos</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCosto({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {costos.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <Input {...register(`costos_tabla.${index}.concepto`)} placeholder="Concepto" />
                              <Input {...register(`costos_tabla.${index}.monto`, { valueAsNumber: true })} type="number" placeholder="Monto" />
                              <Input {...register(`costos_tabla.${index}.moneda`)} placeholder="Moneda" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCosto(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Investigators */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Responsables de Investigación</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendResponsable({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {responsables.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <Input {...register(`responsables_investigacion.${index}.nombre`)} placeholder="Nombre" />
                              <Input {...register(`responsables_investigacion.${index}.cargo`)} placeholder="Cargo" />
                              <Input {...register(`responsables_investigacion.${index}.firma`)} placeholder="Firma" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeResponsable(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/reports/final')} disabled={isMutating || isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isMutating || isSubmitting}>
            {(isMutating || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Crear Reporte Final
          </Button>
        </div>
      </form>
    </div>
  )
}
