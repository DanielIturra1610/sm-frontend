/**
 * Create Final Report Page
 * Comprehensive final incident investigation report
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFinalReport, usePrefillData, useActionPlanReportByIncident } from '@/shared/hooks/report-hooks'
import { useExtractedAnalysisData } from '@/shared/hooks/useExtractedAnalysisData'
import { useExpressMode } from '@/shared/hooks/useExpressMode'
import { ExpressModeSelector } from '@/shared/components/reports/ExpressModeSelector'
import { DataPreviewCard } from '@/shared/components/reports/DataPreviewCard'
import { finalReportSchema, type FinalReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { InputWithSuggestions } from '@/shared/components/ui/input-with-suggestions'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, FileCheck, CheckCircle2, FileText, Image, Users, Truck, Building2, DollarSign, ClipboardCheck, Info, Link2, Sparkles } from 'lucide-react'
import { ReportTimeline } from '@/shared/components/reports/ReportTimeline'
import { LinkedReportsData } from '@/shared/components/reports/LinkedReportsData'
import { getSucesoTypeLabel } from '@/shared/constants/suceso-options'

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

  const { fields: personas, append: appendPersona, remove: removePersona, replace: replacePersonas } = useFieldArray({ control, name: 'personas_involucradas' })
  const { fields: equipos, append: appendEquipo, remove: removeEquipo, replace: replaceEquipos } = useFieldArray({ control, name: 'equipos_danados' })
  const { fields: terceros, append: appendTercero, remove: removeTercero, replace: replaceTerceros } = useFieldArray({ control, name: 'terceros_identificados' })
  const { fields: causas, append: appendCausa, remove: removeCausa, replace: replaceCausas } = useFieldArray({ control, name: 'analisis_causas_raiz' })
  const { fields: costos, append: appendCosto, remove: removeCosto, replace: replaceCostos } = useFieldArray({ control, name: 'costos_tabla' })
  const { fields: evidencias, append: appendEvidencia, remove: removeEvidencia, replace: replaceEvidencias } = useFieldArray({ control, name: 'imagenes_evidencia' })
  const { fields: responsables, append: appendResponsable, remove: removeResponsable, replace: replaceResponsables } = useFieldArray({ control, name: 'responsables_investigacion' })

  const incident_id = watch('incident_id')
  const watchPersonas = watch('personas_involucradas')
  const watchEmpresa = watch('company_data.nombre')

  // Obtener sugerencias de empresas únicas de personas involucradas
  const empresaSuggestions = [...new Set(
    watchPersonas
      ?.map(p => p.empresa)
      .filter((e): e is string => Boolean(e && e.trim()))
  )]
  if (watchEmpresa && !empresaSuggestions.includes(watchEmpresa)) {
    empresaSuggestions.unshift(watchEmpresa)
  }

  // Obtener sugerencias de cargos únicos
  const cargoSuggestions = [...new Set(
    watchPersonas
      ?.map(p => p.cargo)
      .filter((c): c is string => Boolean(c && c.trim()))
  )]

  // Función para agregar persona con empresa pre-llenada
  const handleAddPersona = () => {
    appendPersona({
      nombre: '',
      cargo: '',
      empresa: watchEmpresa || '',
      tipo_lesion: '',
    })
  }

  // Express Mode hook
  const {
    mode,
    setMode,
    expressData,
    isLoading: isLoadingExpressData,
    canUseExpressMode,
    dataCompleteness,
  } = useExpressMode(incident_id || null)

  // Fetch prefill data when incident is selected
  const { data: prefillData, isLoading: isLoadingPrefill } = usePrefillData(incident_id || null, 'final-report')

  // Fetch action plan data to get correct progress percentage
  const { data: actionPlanData } = useActionPlanReportByIncident(incident_id || null)

  // Extract analysis data from linked reports (Five Whys, Fishbone, Causal Tree, Action Plan)
  const {
    causasRaiz: extractedCausas,
    conclusiones: extractedConclusiones,
    isLoading: isLoadingAnalysis
  } = useExtractedAnalysisData(prefillData?.source_reports, incident_id)

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
      } else if (prefillData.tipo) {
        // Map tipo from Flash Report to checkboxes
        const tipo = prefillData.tipo.toLowerCase()
        const conBaja = tipo.includes('con_baja') || tipo.includes('con baja')
        const sinBaja = tipo.includes('sin_baja') || tipo.includes('sin baja')
        const incIndustrial = tipo.includes('industrial') || tipo.includes('inc_industrial')
        const incLaboral = tipo.includes('laboral') || tipo.includes('inc_laboral')

        setValue('tipo_accidente_tabla.con_baja_il', conBaja)
        setValue('tipo_accidente_tabla.sin_baja_il', sinBaja)
        setValue('tipo_accidente_tabla.incidente_industrial', incIndustrial)
        setValue('tipo_accidente_tabla.incidente_laboral', incLaboral)
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
        // Generate plan_accion_resumen with correct progress from actual action plan data
        if (actionPlanData && actionPlanData.items) {
          const numTareas = actionPlanData.items.length
          const avance = actionPlanData.porcentaje_avance_plan ??
            Math.round((actionPlanData.items.filter(i => i.estado === 'completed').length / numTareas) * 100)
          setValue('plan_accion_resumen', `Plan de acción con ${numTareas} tareas. Avance: ${avance}%.`)
        } else if (frd.plan_accion_resumen) {
          setValue('plan_accion_resumen', frd.plan_accion_resumen)
        }

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

        // Personas involucradas - replace the array
        if (frd.personas_involucradas && frd.personas_involucradas.length > 0) {
          const personasData = frd.personas_involucradas.map((p) => ({
            nombre: p.nombre || '',
            cargo: p.cargo || '',
            empresa: p.empresa || '',
            tipo_lesion: p.tipo_lesion || '',
          }))
          replacePersonas(personasData)
        }

        // Equipos dañados - replace the array
        if (frd.equipos_danados && frd.equipos_danados.length > 0) {
          const equiposData = frd.equipos_danados.map((e) => ({
            nombre: e.nombre || '',
            tipo: '',
            marca: '',
            tipo_dano: e.descripcion || '',
          }))
          replaceEquipos(equiposData)
        }

        // Terceros identificados - replace the array
        if (frd.terceros_identificados && frd.terceros_identificados.length > 0) {
          const tercerosData = frd.terceros_identificados.map((t) => ({
            nombre: t.nombre || '',
            empresa: t.empresa || '',
            rol: t.tipo_relacion || '',
            contacto: '',
          }))
          replaceTerceros(tercerosData)
        }

        // Imágenes de evidencia - replace the array
        if (frd.imagenes_evidencia && frd.imagenes_evidencia.length > 0) {
          const imagenesData = frd.imagenes_evidencia.map((img) => ({
            url: img.url || '',
            descripcion: img.descripcion || '',
            fecha: img.fecha || '',
          }))
          replaceEvidencias(imagenesData)
        }

        // Responsables de investigación - replace the array
        if (frd.responsables_investigacion && frd.responsables_investigacion.length > 0) {
          const responsablesData = frd.responsables_investigacion.map((r) => ({
            nombre: r.nombre || '',
            cargo: r.cargo || '',
            firma: '',
          }))
          replaceResponsables(responsablesData)
        }
      }

      // Also check top-level personas_involucradas from incident prefill
      if (!prefillData.final_report_data?.personas_involucradas?.length && prefillData.personas_involucradas?.length) {
        const personasData = prefillData.personas_involucradas.map((p) => ({
          nombre: p.nombre || '',
          cargo: p.cargo || '',
          empresa: p.empresa || '',
          tipo_lesion: p.tipo_lesion || '',
        }))
        replacePersonas(personasData)
      }

      // Basic description from prefill
      if (!prefillData.final_report_data?.detalles_accidente && prefillData.descripcion) {
        setValue('detalles_accidente', prefillData.descripcion)
        setValue('descripcion_detallada', prefillData.descripcion)
      }

      setHasAutoFilled(true)
      toast.success('Datos pre-llenados desde reportes anteriores')
    }
  }, [prefillData, incident_id, hasAutoFilled, setValue, replaceCausas, replacePersonas, replaceEquipos, replaceTerceros, replaceEvidencias, replaceResponsables])

  // Reset autofill flag when incident changes
  useEffect(() => {
    if (!incident_id) {
      setHasAutoFilled(false)
    }
  }, [incident_id])

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

  // Handler for Express Mode confirmation
  const handleExpressConfirm = async () => {
    if (!expressData || !incident_id) return

    try {
      setIsSubmitting(true)

      // Build form data from express data
      const formData: FinalReportFormData = {
        incident_id,
        company_data: {
          nombre: expressData.empresa,
        },
        tipo_accidente_tabla: {},
        detalles_accidente: expressData.descripcion,
        descripcion_detallada: expressData.descripcion,
        conclusiones: expressData.conclusiones,
        personas_involucradas: expressData.personas.map((p) => ({
          nombre: p.nombre,
          cargo: p.cargo,
          empresa: p.empresa,
          tipo_lesion: p.tipo_lesion,
        })),
        equipos_danados: [],
        terceros_identificados: expressData.terceros?.map((t) => ({
          nombre: t.nombre,
          empresa: t.empresa || '',
          rol: t.rol,
          contacto: '',
        })) || [],
        analisis_causas_raiz: expressData.causasRaiz.map((c) => ({
          problema: c.problema,
          causa_raiz: c.causa_raiz,
          accion_plan: c.accion_plan,
          metodologia: c.metodologia,
        })),
        costos_tabla: expressData.costosCalculados?.map((c) => ({
          concepto: c.concepto,
          monto: c.monto,
          moneda: c.moneda,
        })) || [],
        imagenes_evidencia: expressData.evidencias
          .filter((e) => e.seleccionada)
          .map((e) => ({
            url: e.url,
            descripcion: e.descripcion,
            fecha: e.fecha || '',
          })),
        responsables_investigacion: expressData.responsables?.map((r) => ({
          nombre: r.nombre,
          cargo: r.cargo,
          firma: '',
        })) || [],
        acciones_inmediatas_resumen: expressData.accionesInmediatasResumen || expressData.acciones_tomadas,
        plan_accion_resumen: expressData.planAccionResumen,
        lecciones_aprendidas: expressData.leccionesAprendidas?.join('\n\n') || '',
      }

      await createReport(formData)
      toast.success('Reporte Final creado exitosamente (Modo Express)')
      router.push('/reports/final')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler to switch to Complete mode for editing
  const handleSwitchToComplete = () => {
    // Auto-fill the form with express data before switching
    if (expressData) {
      setValue('company_data.nombre', expressData.empresa)
      setValue('detalles_accidente', expressData.descripcion)
      setValue('descripcion_detallada', expressData.descripcion)
      setValue('conclusiones', expressData.conclusiones)

      if (expressData.personas.length > 0) {
        replacePersonas(
          expressData.personas.map((p) => ({
            nombre: p.nombre,
            cargo: p.cargo,
            empresa: p.empresa,
            tipo_lesion: p.tipo_lesion,
          }))
        )
      }

      if (expressData.causasRaiz.length > 0) {
        replaceCausas(
          expressData.causasRaiz.map((c) => ({
            problema: c.problema,
            causa_raiz: c.causa_raiz,
            accion_plan: c.accion_plan,
            metodologia: c.metodologia,
          }))
        )
      }

      if (expressData.evidencias.length > 0) {
        replaceEvidencias(
          expressData.evidencias.map((e) => ({
            url: e.url,
            descripcion: e.descripcion,
            fecha: e.fecha || '',
          }))
        )
      }

      // Responsables de investigación (incluye supervisor del Flash Report)
      if (expressData.responsables && expressData.responsables.length > 0) {
        replaceResponsables(
          expressData.responsables.map((r) => ({
            nombre: r.nombre,
            cargo: r.cargo,
            firma: '',
          }))
        )
      }

      // Terceros identificados (clientes del Plan de Acción)
      if (expressData.terceros && expressData.terceros.length > 0) {
        replaceTerceros(
          expressData.terceros.map((t) => ({
            nombre: t.nombre,
            empresa: t.empresa || '',
            rol: t.rol,
            contacto: '',
          }))
        )
      }

      // Costos calculados automáticamente
      if (expressData.costosCalculados && expressData.costosCalculados.length > 0) {
        replaceCostos(
          expressData.costosCalculados.map((c) => ({
            concepto: c.concepto,
            monto: c.monto,
            moneda: c.moneda,
          }))
        )
      }

      // Campos de texto
      setValue('acciones_inmediatas_resumen', expressData.accionesInmediatasResumen || expressData.acciones_tomadas)
      setValue('plan_accion_resumen', expressData.planAccionResumen || '')
      setValue('lecciones_aprendidas', expressData.leccionesAprendidas?.join('\n\n') || '')

      setHasAutoFilled(true)
    }

    setMode('complete')
    toast.info('Cambiado a Modo Completo. Puede editar todos los campos.')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Crear Reporte Final"
        description="Informe completo de investigación de incidente"
        backUrl="/reports/final"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection and Reports Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Incident Selection */}
          <Card className="h-fit border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                Selección de Suceso
              </CardTitle>
              <CardDescription>
                Seleccione el suceso para generar el informe final consolidado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <IncidentSelector
                value={incident_id || ''}
                onChange={(value) => {
                  setValue('incident_id', value)
                  setHasAutoFilled(false)
                }}
                error={errors.incident_id?.message}
                required
              />

              {/* Loading indicator */}
              {incident_id && isLoadingPrefill && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando datos de reportes anteriores...
                </div>
              )}

              {/* Success indicator */}
              {hasAutoFilled && prefillData && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Datos pre-llenados exitosamente</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Se han cargado datos de {getSourceReportsCount()} reporte(s) anterior(es).
                    Revise y complete la información en las pestañas inferiores.
                  </AlertDescription>
                </Alert>
              )}

              {/* Info when no incident selected */}
              {!incident_id && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Información</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Al seleccionar un suceso, se cargarán automáticamente los datos de todos los reportes previos vinculados.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Right: Reports Timeline */}
          <ReportTimeline
            prefillData={prefillData}
            isLoading={isLoadingPrefill}
            incidentId={incident_id}
          />
        </div>

        {/* Express Mode Selector - only show when incident is selected */}
        {incident_id && !isLoadingPrefill && (
          <ExpressModeSelector
            mode={mode}
            onModeChange={setMode}
            canUseExpressMode={canUseExpressMode}
            dataCompleteness={dataCompleteness}
            sourceReportsCount={expressData?.sourceReportsCount || 0}
            isLoading={isLoadingExpressData}
          />
        )}

        {/* Express Mode Preview - show when in express mode */}
        {mode === 'express' && expressData && incident_id && (
          <DataPreviewCard
            empresa={expressData.empresa}
            descripcion={expressData.descripcion}
            lugar={expressData.lugar}
            areaZona={expressData.areaZona}
            numeroProdity={expressData.numeroProdity}
            zonal={expressData.zonal}
            causasRaiz={expressData.causasRaiz}
            conclusiones={expressData.conclusiones}
            personas={expressData.personas}
            evidencias={expressData.evidencias}
            analysisCount={expressData.analysisCount}
            accionesInmediatas={expressData.accionesInmediatas}
            planAccionItems={expressData.planAccionItems}
            planAccionProgreso={expressData.planAccionProgreso}
            responsables={expressData.responsables}
            terceros={expressData.terceros}
            leccionesAprendidas={expressData.leccionesAprendidas}
            causalTreeIds={expressData.causalTreeIds}
            fiveWhysIds={expressData.fiveWhysIds}
            fishboneIds={expressData.fishboneIds}
            causalTreeImages={expressData.causalTreeImages}
            onConfirm={handleExpressConfirm}
            onEdit={handleSwitchToComplete}
            isLoading={isSubmitting}
          />
        )}

        {/* Complete Mode - Full Form with Tabs */}
        {mode === 'complete' && (
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
            <TabsTrigger value="accident" className="flex items-center gap-2 py-2.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Accidente</span>
            </TabsTrigger>
            <TabsTrigger value="involved" className="flex items-center gap-2 py-2.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Involucrados</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 py-2.5">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2 py-2.5">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Costos</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 0: Linked Reports Data */}
          <TabsContent value="linked-reports">
            <LinkedReportsData
              sourceReports={prefillData?.source_reports}
              isLoading={isLoadingPrefill}
            />
          </TabsContent>

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
                {prefillData?.tipo && (
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Info className="h-4 w-4" />
                    Tipo desde Flash Report: <Badge variant="secondary">{getSucesoTypeLabel(prefillData.tipo)}</Badge>
                  </CardDescription>
                )}
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
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Personas Involucradas
                      </CardTitle>
                      <CardDescription>
                        Personal afectado o involucrado en el incidente
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPersona}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personas.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay personas registradas. Se cargarán automáticamente al seleccionar un incidente con reportes previos.
                      </p>
                    ) : (
                      personas.map((field, index) => (
                        <Card key={field.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <Input {...register(`personas_involucradas.${index}.nombre`)} placeholder="Nombre" />
                                <InputWithSuggestions {...register(`personas_involucradas.${index}.cargo`)} suggestions={cargoSuggestions} placeholder="Cargo" />
                                <InputWithSuggestions {...register(`personas_involucradas.${index}.empresa`)} suggestions={empresaSuggestions} placeholder="Empresa" />
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

              {/* Equipment */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Equipos Dañados
                      </CardTitle>
                      <CardDescription>
                        Maquinaria, vehículos o equipos afectados
                      </CardDescription>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay equipos registrados. Agregue los equipos dañados si corresponde.
                      </p>
                    ) : (
                      equipos.map((field, index) => (
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Third Parties */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Terceros Identificados
                      </CardTitle>
                      <CardDescription>
                        Empresas o personas externas relacionadas con el incidente
                      </CardDescription>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay terceros registrados. Agregue terceros involucrados si corresponde.
                      </p>
                    ) : (
                      terceros.map((field, index) => (
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Analysis */}
          <TabsContent value="analysis">
            <div className="space-y-6">
              {/* Auto-fill from analyses alert */}
              {prefillData?.source_reports && (
                prefillData.source_reports.five_whys_ids?.length ||
                prefillData.source_reports.fishbone_ids?.length ||
                prefillData.source_reports.causal_tree_ids?.length
              ) && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800">Análisis disponibles</AlertTitle>
                  <AlertDescription className="text-purple-700 flex items-center justify-between">
                    <span>
                      Se encontraron análisis vinculados. Puede extraer automáticamente las causas raíz y conclusiones.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillAnalysis}
                      disabled={isLoadingAnalysis}
                      className="ml-4 border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {isLoadingAnalysis ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Extraer de análisis
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

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
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Costos Asociados
                      </CardTitle>
                      <CardDescription>
                        Estimación de costos directos e indirectos del incidente
                      </CardDescription>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay costos registrados. Agregue los costos asociados al incidente.
                      </p>
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
                </CardContent>
              </Card>

              {/* Evidence Images */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Imágenes de Evidencia
                      </CardTitle>
                      <CardDescription>
                        Fotografías y evidencia visual del incidente
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEvidencia({ url: '', descripcion: '', fecha: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evidencias.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay imágenes de evidencia. Agregue imágenes manualmente o seleccione un incidente con reportes previos que contengan fotografías.
                      </p>
                    ) : (
                      evidencias.map((field, index) => (
                        <Card key={field.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input {...register(`imagenes_evidencia.${index}.url`)} placeholder="URL de la imagen" className="md:col-span-2" />
                                <Input {...register(`imagenes_evidencia.${index}.fecha`)} placeholder="Fecha" type="date" />
                                <Input {...register(`imagenes_evidencia.${index}.descripcion`)} placeholder="Descripción de la imagen" className="md:col-span-3" />
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidencia(index)}>
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

              {/* Investigators */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Responsables de Investigación
                      </CardTitle>
                      <CardDescription>
                        Personal encargado de la investigación del incidente
                      </CardDescription>
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
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay responsables registrados. Agregue los responsables de la investigación.
                      </p>
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
            </div>
          </TabsContent>
        </Tabs>
        )}

        {/* Form Actions - only show in Complete mode */}
        {mode === 'complete' && (
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
        )}
      </form>
    </div>
  )
}
