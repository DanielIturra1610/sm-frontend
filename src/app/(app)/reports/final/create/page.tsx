/**
 * Create Final Report Page
 * Comprehensive final incident investigation report
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFinalReport, usePrefillData } from '@/shared/hooks/report-hooks'
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
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, FileCheck, CheckCircle2, FileText } from 'lucide-react'

export default function CreateFinalReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateFinalReport()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAutoFilled, setHasAutoFilled] = useState(false)

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
  const { fields: causas, append: appendCausa, remove: removeCausa, replace: replaceCausas } = useFieldArray({ control, name: 'analisis_causas_raiz' })
  const { fields: costos, append: appendCosto, remove: removeCosto } = useFieldArray({ control, name: 'costos_tabla' })
  const { fields: evidencias, append: appendEvidencia, remove: removeEvidencia } = useFieldArray({ control, name: 'imagenes_evidencia' })
  const { fields: responsables, append: appendResponsable, remove: removeResponsable } = useFieldArray({ control, name: 'responsables_investigacion' })

  const incident_id = watch('incident_id')

  // Fetch prefill data when incident is selected
  const { data: prefillData, isLoading: isLoadingPrefill } = usePrefillData(incident_id || null, 'final-report')

  // Auto-fill form when prefill data is available
  useEffect(() => {
    if (prefillData && incident_id && !hasAutoFilled) {
      // Company data
      if (prefillData.final_report_data?.company_data) {
        const cd = prefillData.final_report_data.company_data
        if (cd.nombre) setValue('company_data.nombre', cd.nombre)
        if (cd.rut) setValue('company_data.rut', cd.rut)
        if (cd.direccion) setValue('company_data.direccion', cd.direccion)
      } else if (prefillData.empresa) {
        setValue('company_data.nombre', prefillData.empresa)
      }

      // Accident classification
      if (prefillData.final_report_data?.tipo_accidente_tabla) {
        const tat = prefillData.final_report_data.tipo_accidente_tabla
        setValue('tipo_accidente_tabla.con_baja_il', tat.con_baja_il || false)
        setValue('tipo_accidente_tabla.sin_baja_il', tat.sin_baja_il || false)
        setValue('tipo_accidente_tabla.incidente_industrial', tat.incidente_industrial || false)
        setValue('tipo_accidente_tabla.incidente_laboral', tat.incidente_laboral || false)
      } else {
        setValue('tipo_accidente_tabla.con_baja_il', prefillData.con_baja_il || false)
        setValue('tipo_accidente_tabla.sin_baja_il', prefillData.sin_baja_il || false)
        setValue('tipo_accidente_tabla.incidente_industrial', prefillData.incidente_industrial || false)
        setValue('tipo_accidente_tabla.incidente_laboral', prefillData.incidente_laboral || false)
      }

      // Text fields from final report data
      if (prefillData.final_report_data) {
        const frd = prefillData.final_report_data
        if (frd.detalles_accidente) setValue('detalles_accidente', frd.detalles_accidente)
        if (frd.descripcion_detallada) setValue('descripcion_detallada', frd.descripcion_detallada)
        if (frd.conclusiones) setValue('conclusiones', frd.conclusiones)
        if (frd.lecciones_aprendidas) setValue('lecciones_aprendidas', frd.lecciones_aprendidas)
        if (frd.acciones_inmediatas_resumen) setValue('acciones_inmediatas_resumen', frd.acciones_inmediatas_resumen)
        if (frd.plan_accion_resumen) setValue('plan_accion_resumen', frd.plan_accion_resumen)

        // Root cause analysis - replace the array
        if (frd.analisis_causas_raiz && frd.analisis_causas_raiz.length > 0) {
          const causasData = frd.analisis_causas_raiz.map((c) => ({
            problema: c.problema || '',
            causa_raiz: c.causa_raiz || '',
            accion_plan: c.accion_plan || '',
            metodologia: c.metodologia || '',
          }))
          replaceCausas(causasData)
        }
      }

      // Basic description from prefill
      if (!prefillData.final_report_data?.detalles_accidente && prefillData.descripcion) {
        setValue('detalles_accidente', prefillData.descripcion)
        setValue('descripcion_detallada', prefillData.descripcion)
      }

      setHasAutoFilled(true)
      toast.success('Datos pre-llenados desde reportes anteriores')
    }
  }, [prefillData, incident_id, hasAutoFilled, setValue, replaceCausas])

  // Reset autofill flag when incident changes
  useEffect(() => {
    if (!incident_id) {
      setHasAutoFilled(false)
    }
  }, [incident_id])

  // Count source reports for display
  const getSourceReportsCount = () => {
    if (!prefillData?.source_reports) return 0
    const sr = prefillData.source_reports
    let count = 0
    if (sr.flash_report_id) count++
    if (sr.immediate_actions_id) count++
    if (sr.root_cause_id) count++
    if (sr.action_plan_id) count++
    if (sr.zero_tolerance_id) count++
    if (sr.five_whys_ids?.length) count += sr.five_whys_ids.length
    if (sr.fishbone_ids?.length) count += sr.fishbone_ids.length
    if (sr.causal_tree_ids?.length) count += sr.causal_tree_ids.length
    return count
  }

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
            <CardDescription>
              Seleccione el incidente para el cual se generará el reporte final.
              Los datos se pre-llenarán automáticamente desde reportes anteriores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IncidentSelector
              value={incident_id || ''}
              onChange={(value) => {
                setValue('incident_id', value)
                setHasAutoFilled(false)
              }}
              error={errors.incident_id?.message}
              required
            />

            {/* Prefill Status Indicator */}
            {incident_id && (
              <div className="space-y-3">
                {isLoadingPrefill && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando datos de reportes anteriores...
                  </div>
                )}

                {hasAutoFilled && prefillData && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Datos pre-llenados</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>Se han cargado datos de {getSourceReportsCount()} reporte(s) anterior(es).</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {prefillData.source_reports?.flash_report_id && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Flash Report
                          </Badge>
                        )}
                        {prefillData.source_reports?.immediate_actions_id && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Acciones Inmediatas
                          </Badge>
                        )}
                        {prefillData.source_reports?.root_cause_id && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Causa Raíz
                          </Badge>
                        )}
                        {prefillData.source_reports?.action_plan_id && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Plan de Acción
                          </Badge>
                        )}
                        {prefillData.source_reports?.zero_tolerance_id && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Tolerancia Cero
                          </Badge>
                        )}
                        {prefillData.source_reports?.five_whys_ids?.map((id, i) => (
                          <Badge key={id} variant="outline" className="bg-blue-50">
                            5 Porqués #{i + 1}
                          </Badge>
                        ))}
                        {prefillData.source_reports?.fishbone_ids?.map((id, i) => (
                          <Badge key={id} variant="outline" className="bg-green-50">
                            Ishikawa #{i + 1}
                          </Badge>
                        ))}
                        {prefillData.source_reports?.causal_tree_ids?.map((id, i) => (
                          <Badge key={id} variant="outline" className="bg-purple-50">
                            Árbol Causal #{i + 1}
                          </Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
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
            <div className="space-y-6">
              {/* Root Cause Analysis Summary */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Análisis de Causas Raíz</CardTitle>
                      <CardDescription>
                        Resumen de causas identificadas en los análisis realizados
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCausa({ problema: '', causa_raiz: '', accion_plan: '', metodologia: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {causas.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay causas raíz registradas. Seleccione un incidente con análisis previos o agregue manualmente.
                      </p>
                    ) : (
                      causas.map((field, index) => {
                        const metodologia = watch(`analisis_causas_raiz.${index}.metodologia`)
                        const getBadgeColor = (met: string) => {
                          if (met?.includes('5 Por') || met?.includes('5 Why')) return 'bg-blue-100 text-blue-800'
                          if (met?.includes('Ishikawa') || met?.includes('Fishbone')) return 'bg-green-100 text-green-800'
                          if (met?.includes('Árbol') || met?.includes('Causal Tree')) return 'bg-purple-100 text-purple-800'
                          return 'bg-gray-100 text-gray-800'
                        }
                        return (
                          <Card key={field.id} className="bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getBadgeColor(metodologia || '')}>
                                      {metodologia || 'Manual'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Problema</Label>
                                      <Input {...register(`analisis_causas_raiz.${index}.problema`)} placeholder="Problema identificado" />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Causa Raíz</Label>
                                      <Input {...register(`analisis_causas_raiz.${index}.causa_raiz`)} placeholder="Causa raíz" />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Acción Propuesta</Label>
                                    <Input {...register(`analisis_causas_raiz.${index}.accion_plan`)} placeholder="Acción para mitigar" />
                                  </div>
                                  <Input type="hidden" {...register(`analisis_causas_raiz.${index}.metodologia`)} />
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeCausa(index)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Text Fields */}
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
            </div>
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
