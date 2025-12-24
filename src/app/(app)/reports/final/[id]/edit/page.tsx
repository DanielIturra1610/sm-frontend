/**
 * Edit Final Report Page
 * Comprehensive final incident investigation report
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFinalReport, useUpdateFinalReport, usePrefillData, useActionPlanReportByIncident } from '@/shared/hooks/report-hooks'
import { useExtractedAnalysisData } from '@/shared/hooks/useExtractedAnalysisData'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { finalReportSchema, type FinalReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { ReportTimeline } from '@/shared/components/reports/ReportTimeline'
import { LinkedReportsData } from '@/shared/components/reports/LinkedReportsData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  FileCheck,
  Users,
  Truck,
  Building2,
  DollarSign,
  Search,
  FileText,
  AlertCircle,
  Calendar,
  MapPin,
  Link2,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data: report, isLoading: isLoadingReport } = useFinalReport(id)
  const { trigger: updateReport, isMutating } = useUpdateFinalReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get incident details
  const { data: incident } = useIncident(report?.incident_id || '')

  // Get prefill data for timeline
  const { data: prefillData, isLoading: isLoadingPrefill } = usePrefillData(
    report?.incident_id || null,
    'final-report'
  )

  // Fetch action plan data to get correct progress percentage
  const { data: actionPlanData } = useActionPlanReportByIncident(report?.incident_id || null)

  // Extract analysis data from linked reports (Five Whys, Fishbone, Causal Tree, Action Plan)
  const {
    causasRaiz: extractedCausas,
    conclusiones: extractedConclusiones,
    isLoading: isLoadingAnalysis
  } = useExtractedAnalysisData(prefillData?.source_reports, report?.incident_id)

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
  const { fields: terceros, append: appendTercero, remove: removeTercero } = useFieldArray({ control, name: 'terceros_identificados' })
  const { fields: causas, append: appendCausa, remove: removeCausa, replace: replaceCausas } = useFieldArray({ control, name: 'analisis_causas_raiz' })
  const { fields: costos, append: appendCosto, remove: removeCosto } = useFieldArray({ control, name: 'costos_tabla' })
  const { fields: evidencias, append: appendEvidencia, remove: removeEvidencia } = useFieldArray({ control, name: 'imagenes_evidencia' })
  const { fields: responsables, append: appendResponsable, remove: removeResponsable } = useFieldArray({ control, name: 'responsables_investigacion' })

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
        descripcion_detallada: report.descripcion_detallada || '',
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
        acciones_inmediatas_resumen: report.acciones_inmediatas_resumen || '',
        plan_accion_resumen: report.plan_accion_resumen || '',
        lecciones_aprendidas: report.lecciones_aprendidas || '',

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

  // Update plan_accion_resumen when action plan data loads (with correct progress)
  useEffect(() => {
    if (actionPlanData && actionPlanData.items && actionPlanData.items.length > 0) {
      const numTareas = actionPlanData.items.length
      // Calculate average progress: use avance_real, or 100 if completed, or 0
      const totalAvance = actionPlanData.items.reduce((sum, item) => {
        if (item.estado === 'completed') return sum + 100
        return sum + (item.avance_real || 0)
      }, 0)
      const avance = actionPlanData.porcentaje_avance_plan || Math.round(totalAvance / numTareas)
      setValue('plan_accion_resumen', `Plan de acción con ${numTareas} tareas. Avance: ${avance}%.`)
    }
  }, [actionPlanData, setValue])

  // Handler to auto-fill analysis data from linked reports
  const handleAutoFillAnalysis = () => {
    if (extractedCausas.length > 0) {
      const causasData = extractedCausas.map((c) => ({
        problema: c.problema,
        causa_raiz: c.causa_raiz,
        accion_plan: c.accion_plan || '',
        metodologia: c.metodologia || '',
      }))
      replaceCausas(causasData)
      toast.success(`Se agregaron ${causasData.length} causas raíz de los análisis`)
    } else {
      toast.info('No se encontraron causas raíz en los análisis vinculados')
    }
  }

  const onSubmit = async (data: FinalReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
      toast.success('Informe Final actualizado exitosamente')
      router.push(`/reports/final/${id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el informe'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingReport) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Informe no encontrado</h3>
            <p className="text-gray-600 mb-4">El informe final que buscas no existe o fue eliminado.</p>
            <Button onClick={() => router.push('/reports/final')}>
              Volver a Informes Finales
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ReportFormHeader
        title="Editar Informe Final"
        description="Informe completo de investigación del suceso"
        backUrl={`/reports/final/${id}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Info and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Incident Summary */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                Información del Suceso
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {incident ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {incident.descripcion_breve || incident.title || 'Suceso'}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {incident.correlativo && (
                        <Badge variant="secondary">{incident.correlativo}</Badge>
                      )}
                      {incident.tipo && (
                        <Badge variant="outline">{incident.tipo}</Badge>
                      )}
                      {incident.severity && (
                        <Badge
                          className={
                            incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {incident.severity === 'critical' ? 'Crítico' :
                           incident.severity === 'high' ? 'Alto' :
                           incident.severity === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {incident.fecha_ocurrencia && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500">Fecha del suceso</p>
                          <p className="font-medium">
                            {format(new Date(incident.fecha_ocurrencia), "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                    )}
                    {incident.lugar && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500">Ubicación</p>
                          <p className="font-medium">{incident.lugar}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {incident.descripcion && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Descripción</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{incident.descripcion}</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando información del suceso...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Reports Timeline */}
          <ReportTimeline
            prefillData={prefillData}
            isLoading={isLoadingPrefill}
            incidentId={report.incident_id}
          />
        </div>

        {/* Form Tabs */}
        <Tabs defaultValue="linked-reports" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="linked-reports" className="flex items-center gap-2 py-2.5">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2 py-2.5">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="involved" className="flex items-center gap-2 py-2.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Involucrados</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 py-2.5">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2 py-2.5">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Costos</span>
            </TabsTrigger>
            <TabsTrigger value="conclusions" className="flex items-center gap-2 py-2.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Conclusiones</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 0: Linked Reports Data */}
          <TabsContent value="linked-reports">
            <LinkedReportsData
              sourceReports={prefillData?.source_reports}
              isLoading={isLoadingPrefill}
            />
          </TabsContent>

          {/* Tab 1: Company & General */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Datos de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Empresa</Label>
                    <Input {...register('company_data.nombre')} placeholder="Nombre de la empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label>RUT</Label>
                    <Input {...register('company_data.rut')} placeholder="RUT de la empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input {...register('company_data.direccion')} placeholder="Dirección" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input {...register('company_data.telefono')} placeholder="Teléfono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...register('company_data.email')} type="email" placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contacto</Label>
                    <Input {...register('company_data.contacto')} placeholder="Persona de contacto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clasificación del Suceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="con_baja_il"
                      checked={watch('tipo_accidente_tabla.con_baja_il')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.con_baja_il', checked as boolean)}
                    />
                    <Label htmlFor="con_baja_il" className="text-sm">Con Baja IL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sin_baja_il"
                      checked={watch('tipo_accidente_tabla.sin_baja_il')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.sin_baja_il', checked as boolean)}
                    />
                    <Label htmlFor="sin_baja_il" className="text-sm">Sin Baja IL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incidente_industrial"
                      checked={watch('tipo_accidente_tabla.incidente_industrial')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.incidente_industrial', checked as boolean)}
                    />
                    <Label htmlFor="incidente_industrial" className="text-sm">Inc. Industrial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incidente_laboral"
                      checked={watch('tipo_accidente_tabla.incidente_laboral')}
                      onCheckedChange={(checked) => setValue('tipo_accidente_tabla.incidente_laboral', checked as boolean)}
                    />
                    <Label htmlFor="incidente_laboral" className="text-sm">Inc. Laboral</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del Suceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Detalles del Accidente</Label>
                  <Textarea {...register('detalles_accidente')} rows={4} placeholder="Describa los detalles del accidente..." />
                </div>
                <div className="space-y-2">
                  <Label>Descripción Detallada</Label>
                  <Textarea {...register('descripcion_detallada')} rows={4} placeholder="Descripción completa de los hechos..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lugar Detallado</Label>
                    <Input {...register('lugar_detallado')} placeholder="Ubicación específica" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Elaboración</Label>
                    <Input type="date" {...register('fecha_elaboracion')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Involved People & Equipment */}
          <TabsContent value="involved" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personas Involucradas
                    </CardTitle>
                    <CardDescription>Personal afectado o involucrado en el suceso</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendPersona({ nombre: '', cargo: '', empresa: '', tipo_lesion: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay personas registradas</p>
                  ) : (
                    personas.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Equipos Dañados
                    </CardTitle>
                    <CardDescription>Maquinaria, vehículos o equipos afectados</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEquipo({ nombre: '', tipo: '', marca: '', tipo_dano: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay equipos registrados</p>
                  ) : (
                    equipos.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Terceros Identificados
                    </CardTitle>
                    <CardDescription>Empresas o personas externas relacionadas</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendTercero({ nombre: '', empresa: '', rol: '', contacto: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {terceros.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay terceros registrados</p>
                  ) : (
                    terceros.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Análisis de Causas Raíz
                    </CardTitle>
                    <CardDescription>Resumen de causas identificadas en los análisis</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillAnalysis}
                      disabled={isLoadingAnalysis || !prefillData?.source_reports}
                      title="Extraer causas de análisis vinculados"
                    >
                      {isLoadingAnalysis ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Auto-rellenar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCausa({ problema: '', causa_raiz: '', accion_plan: '', metodologia: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {causas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay causas registradas</p>
                  ) : (
                    causas.map((field, index) => {
                      const metodologia = watch(`analisis_causas_raiz.${index}.metodologia`)
                      return (
                        <Card key={field.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-3">
                                {metodologia && (
                                  <Badge variant="outline" className="text-xs">
                                    {metodologia}
                                  </Badge>
                                )}
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

            <Card>
              <CardHeader>
                <CardTitle>Medidas y Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Resumen de Acciones Inmediatas</Label>
                  <Textarea {...register('acciones_inmediatas_resumen')} rows={3} placeholder="Resumen de las acciones inmediatas tomadas..." />
                </div>
                <div className="space-y-2">
                  <Label>Resumen del Plan de Acción</Label>
                  <Textarea {...register('plan_accion_resumen')} rows={3} placeholder="Resumen del plan de acción..." />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Medidas Correctivas</Label>
                  <Textarea {...register('medidas_correctivas')} rows={3} placeholder="Medidas correctivas implementadas..." />
                </div>
                <div className="space-y-2">
                  <Label>Medidas Preventivas</Label>
                  <Textarea {...register('medidas_preventivas')} rows={3} placeholder="Medidas preventivas propuestas..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Costs & Evidence */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Costos Asociados
                    </CardTitle>
                    <CardDescription>Estimación de costos del suceso</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendCosto({ concepto: '', monto: 0, moneda: 'CLP' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay costos registrados</p>
                  ) : (
                    costos.map((field, index) => (
                      <Card key={field.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <Input {...register(`costos_tabla.${index}.concepto`)} placeholder="Concepto" />
                              <Input {...register(`costos_tabla.${index}.monto`, { valueAsNumber: true })} type="number" placeholder="Monto" />
                              <Input {...register(`costos_tabla.${index}.moneda`)} placeholder="Moneda" defaultValue="CLP" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCosto(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Costo Total Estimado</Label>
                  <Input type="number" {...register('costo_total_estimado', { valueAsNumber: true })} placeholder="0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Responsables de Investigación</CardTitle>
                    <CardDescription>Personal encargado de la investigación</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendResponsable({ nombre: '', cargo: '', firma: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {responsables.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay responsables registrados</p>
                  ) : (
                    responsables.map((field, index) => (
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Conclusions */}
          <TabsContent value="conclusions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Conclusiones y Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Conclusiones</Label>
                  <Textarea {...register('conclusiones')} rows={5} placeholder="Conclusiones del informe..." />
                </div>
                <div className="space-y-2">
                  <Label>Lecciones Aprendidas</Label>
                  <Textarea {...register('lecciones_aprendidas')} rows={4} placeholder="Lecciones aprendidas del suceso..." />
                </div>
                <div className="space-y-2">
                  <Label>Recomendaciones</Label>
                  <Textarea {...register('recomendaciones')} rows={4} placeholder="Recomendaciones para prevenir futuros sucesos..." />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones Adicionales</Label>
                  <Textarea {...register('observaciones')} rows={3} placeholder="Observaciones adicionales..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/final/${id}`)}
            disabled={isSubmitting || isMutating}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isMutating} size="lg">
            {(isSubmitting || isMutating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
