'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateIncident } from '@/shared/hooks/incident-hooks'
import { useCreateFlashReport, useCreateZeroToleranceReport } from '@/shared/hooks/report-hooks'
import { useAttachmentMutations } from '@/shared/hooks/attachment-hooks'
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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PhotoUploader } from '@/shared/components/attachments/PhotoUploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ArrowLeft, Save, Loader2, X, FileText, Users, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { SUCESO_CATEGORIES, getSucesoTypesByCategory, getSucesoTypeLabel } from '@/shared/constants/suceso-options'
import type { SucesoCategory, SucesoType } from '@/shared/types/api'

// Schema para persona involucrada
const personaInvolucradaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
  tipo_lesion: z.string().optional(),
})

// Schema completo para Suceso + Flash Report
const incidentWithFlashSchema = z.object({
  // === DATOS DEL SUCESO ===
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  severity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Por favor selecciona un nivel de severidad',
  }),
  categoria: z.enum(['accidente', 'incidente', 'tolerancia_0'], {
    required_error: 'Por favor selecciona una categoría de suceso',
  }),
  tipoSuceso: z.string().min(1, 'Por favor selecciona un tipo de suceso'),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  date_time: z.string().min(1, 'La fecha y hora son requeridas'),
  area_zona: z.string().optional(),
  empresa: z.string().optional(),
  supervisor: z.string().optional(),

  // === PERSONAS INVOLUCRADAS ===
  personas_involucradas: z.array(personaInvolucradaSchema).optional().default([]),

  // === DATOS ADICIONALES FLASH REPORT ===
  zonal: z.string().optional(),
  numero_prodity: z.string().optional(),
  acciones_inmediatas: z.string().optional(),
  controles_inmediatos: z.string().optional(),
  factores_riesgo: z.string().optional(),

  // === CLASIFICACIÓN TIPO INCIDENTE ===
  con_baja_il: z.boolean().optional(),
  sin_baja_il: z.boolean().optional(),
  incidente_industrial: z.boolean().optional(),
  incidente_laboral: z.boolean().optional(),

  // === CLASIFICACIÓN PLGF ===
  es_plgf: z.boolean().optional(),
  nivel_plgf: z.enum(['potencial', 'real', 'fatal']).optional(),
  justificacion_plgf: z.string().optional(),
})

type IncidentWithFlashFormValues = z.infer<typeof incidentWithFlashSchema>

export default function CreateIncidentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createIncident } = useCreateIncident()
  const { trigger: createFlashReport } = useCreateFlashReport()
  const { trigger: createZeroToleranceReport } = useCreateZeroToleranceReport()
  const { uploadMultiple } = useAttachmentMutations()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<SucesoCategory | undefined>()

  const form = useForm<IncidentWithFlashFormValues>({
    resolver: zodResolver(incidentWithFlashSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date_time: '',
      area_zona: '',
      empresa: '',
      supervisor: '',
      zonal: '',
      numero_prodity: '',
      acciones_inmediatas: '',
      controles_inmediatos: '',
      factores_riesgo: '',
      justificacion_plgf: '',
      con_baja_il: false,
      sin_baja_il: false,
      incidente_industrial: false,
      incidente_laboral: false,
      es_plgf: false,
      personas_involucradas: [],
    },
  })

  // Field array para personas involucradas
  const { fields: personas, append: appendPersona, remove: removePersona } = useFieldArray({
    control: form.control,
    name: 'personas_involucradas',
  })

  const watchTipoSuceso = form.watch('tipoSuceso')
  const watchEsPlgf = form.watch('es_plgf')

  // Auto-marcar checkboxes según el tipo de suceso seleccionado
  const handleTipoSucesoChange = (value: string) => {
    form.setValue('tipoSuceso', value)

    // Reset checkboxes
    form.setValue('con_baja_il', false)
    form.setValue('sin_baja_il', false)
    form.setValue('incidente_industrial', false)
    form.setValue('incidente_laboral', false)
    form.setValue('es_plgf', false)

    // Auto-marcar según el tipo
    if (value.includes('con_baja')) {
      form.setValue('con_baja_il', true)
    } else if (value.includes('sin_baja')) {
      form.setValue('sin_baja_il', true)
    } else if (value === 'inc_industrial') {
      form.setValue('incidente_industrial', true)
    } else if (value === 'inc_laboral') {
      form.setValue('incidente_laboral', true)
    } else if (value === 'inc_plgf') {
      form.setValue('es_plgf', true)
      form.setValue('incidente_industrial', true)
    }
  }

  const onSubmit = async (data: IncidentWithFlashFormValues) => {
    try {
      setIsSubmitting(true)

      // 1. Crear el Incidente
      // Mapear categoría a type del backend
      const typeMap: Record<string, 'accident' | 'incident' | 'zero_tolerance'> = {
        accidente: 'accident',
        incidente: 'incident',
        tolerancia_0: 'zero_tolerance',
      }

      const incidentData = {
        title: data.title,
        description: data.description,
        severity: data.severity,
        type: typeMap[data.categoria] || 'incident',
        location: data.location,
        date_time: new Date(data.date_time).toISOString(),
        categoria: data.categoria,
        tipoSuceso: data.tipoSuceso as SucesoType,
        area_zona: data.area_zona,
        empresa: data.empresa,
        supervisor: data.supervisor,
        personas_involucradas: data.personas_involucradas,
      }

      const newIncident = await createIncident(incidentData)

      // 2. Subir fotos si hay
      if (pendingFiles.length > 0) {
        try {
          await uploadMultiple(newIncident.id, pendingFiles)
        } catch {
          console.error('Error al subir fotos')
        }
      }

      // 3. Crear reporte automáticamente según la categoría
      const dateTime = new Date(data.date_time)
      const fecha = dateTime.toISOString().split('T')[0]
      const hora = dateTime.toTimeString().slice(0, 5)

      let reportType = 'Flash Report'

      if (data.categoria === 'tolerancia_0') {
        // Crear Zero Tolerance Report
        // Mapear personas_involucradas (remover tipo_lesion que no aplica para ZT)
        const personasZT = data.personas_involucradas?.map(p => ({
          nombre: p.nombre,
          cargo: p.cargo,
          empresa: p.empresa,
        }))

        const zeroToleranceData = {
          incident_id: newIncident.id,
          suceso: data.title,
          tipo: data.tipoSuceso, // t0_accion_insegura | t0_condicion_insegura | t0_stop_work
          lugar: data.location,
          fecha_hora: dateTime.toISOString(),
          area_zona: data.area_zona,
          empresa: data.empresa,
          supervisor_cge: data.supervisor, // Mapeo: supervisor → supervisor_cge
          descripcion: data.description,
          numero_prodity: data.numero_prodity,
          acciones_tomadas: data.acciones_inmediatas, // Mapeo: acciones_inmediatas → acciones_tomadas
          personas_involucradas: personasZT,
          severidad: data.severity,
        }

        await createZeroToleranceReport(zeroToleranceData)
        reportType = 'Reporte Tolerancia Cero'
      } else {
        // Crear Flash Report (para accidentes e incidentes)
        const flashReportData = {
          incident_id: newIncident.id,
          suceso: data.title,
          tipo: getSucesoTypeLabel(data.tipoSuceso),
          fecha,
          hora,
          lugar: data.location,
          area_zona: data.area_zona,
          empresa: data.empresa,
          supervisor: data.supervisor,
          descripcion: data.description,
          zonal: data.zonal,
          numero_prodity: data.numero_prodity,
          acciones_inmediatas: data.acciones_inmediatas,
          controles_inmediatos: data.controles_inmediatos,
          factores_riesgo: data.factores_riesgo,
          con_baja_il: data.con_baja_il,
          sin_baja_il: data.sin_baja_il,
          incidente_industrial: data.incidente_industrial,
          incidente_laboral: data.incidente_laboral,
          es_plgf: data.es_plgf,
          nivel_plgf: data.nivel_plgf,
          justificacion_plgf: data.justificacion_plgf,
          personas_involucradas: data.personas_involucradas,
        }

        await createFlashReport(flashReportData)
      }

      toast.success(
        `Suceso y ${reportType} creados exitosamente${pendingFiles.length > 0 ? ` con ${pendingFiles.length} foto(s)` : ''}`
      )
      router.push(`/incidents/${newIncident.id}`)
    } catch (error) {
      console.error('Error creating incident:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el suceso')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/incidents')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportar Suceso</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {selectedCategoria === 'tolerancia_0'
                ? 'Se creará automáticamente el Suceso y su Reporte Tolerancia Cero'
                : 'Se creará automáticamente el Suceso y su Flash Report'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Card 1: Antecedentes Generales */}
            <Card>
              <CardHeader>
                <CardTitle>Antecedentes Generales</CardTitle>
                <CardDescription>
                  Información básica del suceso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suceso / Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Breve descripción del suceso"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grid: Fecha, Hora, Zonal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="date_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha y Hora *</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategoria !== 'tolerancia_0' && (
                    <FormField
                      control={form.control}
                      name="zonal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zonal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: O'Higgins, Metropolitana"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="numero_prodity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Prodity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Código Prodity"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Grid: Ubicación, Área, Empresa, Supervisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lugar, Comuna, Región *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Angostura, San Fco de Mostazal"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area_zona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Poda Tx, Mantención"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="empresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre de la empresa"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supervisor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jefatura que Reporta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del supervisor"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Clasificación del Suceso */}
            <Card>
              <CardHeader>
                <CardTitle>Clasificación del Suceso</CardTitle>
                <CardDescription>
                  Categoría, tipo y severidad del incidente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grid: Categoría, Tipo, Severidad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedCategoria(value as SucesoCategory)
                            form.setValue('tipoSuceso', '')
                          }}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUCESO_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipoSuceso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Suceso *</FormLabel>
                        <Select
                          onValueChange={handleTipoSucesoChange}
                          defaultValue={field.value}
                          disabled={isSubmitting || !selectedCategoria}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategoria && getSucesoTypesByCategory(selectedCategoria).map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severidad *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona severidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Alerta visual para Tolerancia Cero */}
                {selectedCategoria === 'tolerancia_0' && (
                  <Alert className="border-amber-500 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Evento de Tolerancia Cero:</strong> Este tipo de suceso requiere atención inmediata y genera un Reporte de Tolerancia Cero en lugar de Flash Report.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Checkboxes Tipo Incidente - Solo para accidentes e incidentes */}
                {selectedCategoria !== 'tolerancia_0' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <Label className="text-sm font-medium mb-3 block">Tipo de Incidente/Accidente</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="con_baja_il"
                          checked={form.watch('con_baja_il') || false}
                          onCheckedChange={(checked) => form.setValue('con_baja_il', Boolean(checked))}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="con_baja_il" className="text-sm font-normal cursor-pointer">
                          Con Baja IL
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sin_baja_il"
                          checked={form.watch('sin_baja_il') || false}
                          onCheckedChange={(checked) => form.setValue('sin_baja_il', Boolean(checked))}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="sin_baja_il" className="text-sm font-normal cursor-pointer">
                          Sin Baja IL
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="incidente_industrial"
                          checked={form.watch('incidente_industrial') || false}
                          onCheckedChange={(checked) => form.setValue('incidente_industrial', Boolean(checked))}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="incidente_industrial" className="text-sm font-normal cursor-pointer">
                          Incidente Industrial
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="incidente_laboral"
                          checked={form.watch('incidente_laboral') || false}
                          onCheckedChange={(checked) => form.setValue('incidente_laboral', Boolean(checked))}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="incidente_laboral" className="text-sm font-normal cursor-pointer">
                          Incidente Laboral
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* PLGF - Solo para accidentes e incidentes */}
                {selectedCategoria !== 'tolerancia_0' && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="es_plgf"
                        checked={watchEsPlgf || false}
                        onCheckedChange={(checked) => form.setValue('es_plgf', Boolean(checked))}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="es_plgf" className="text-sm font-medium cursor-pointer">
                        ¿Es un evento PLGF (Potencial de Lesión Grave o Fatal)?
                      </Label>
                    </div>

                    {watchEsPlgf && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-2 border-t">
                        <FormField
                          control={form.control}
                          name="nivel_plgf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel PLGF</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nivel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="potencial">Potencial</SelectItem>
                                  <SelectItem value="real">Real</SelectItem>
                                  <SelectItem value="fatal">Fatal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="justificacion_plgf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Justificación PLGF</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Justifique la clasificación PLGF..."
                                  rows={2}
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Personas Involucradas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personas Involucradas
                  </CardTitle>
                  <CardDescription>
                    Registre las personas afectadas o involucradas en el suceso
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPersona({ nombre: '', cargo: '', empresa: '', tipo_lesion: '' })}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {personas.length === 0 ? (
                  <div className="text-center py-6 border rounded-lg bg-gray-50">
                    <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay personas registradas.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Haga clic en &quot;Agregar&quot; para registrar personas involucradas.
                    </p>
                  </div>
                ) : (
                  personas.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-sm">Persona {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePersona(index)}
                          disabled={isSubmitting}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`personas_involucradas.${index}.nombre`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre completo"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`personas_involucradas.${index}.cargo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Cargo o posición"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`personas_involucradas.${index}.empresa`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Empresa o contratista"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {selectedCategoria !== 'tolerancia_0' && (
                        <FormField
                          control={form.control}
                          name={`personas_involucradas.${index}.tipo_lesion`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Lesión</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Contusión, fractura, etc."
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Card 4: Descripción y Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción y Acciones</CardTitle>
                <CardDescription>
                  Detalles del evento y medidas tomadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Accidente/Incidente *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa detalladamente lo que sucedió..."
                          className="min-h-[120px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Incluya qué sucedió, quién estuvo involucrado y las circunstancias
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Controles Inmediatos - Solo para accidentes e incidentes */}
                {selectedCategoria !== 'tolerancia_0' && (
                  <FormField
                    control={form.control}
                    name="controles_inmediatos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Controles Inmediatos</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Controles implementados inmediatamente..."
                            rows={3}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="acciones_inmediatas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedCategoria === 'tolerancia_0' ? 'Acciones Tomadas' : 'Acciones Inmediatas'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={selectedCategoria === 'tolerancia_0'
                            ? 'Acciones tomadas para corregir la situación...'
                            : 'Acciones tomadas inmediatamente después del suceso...'}
                          rows={3}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Factores de Riesgo - Solo para accidentes e incidentes */}
                {selectedCategoria !== 'tolerancia_0' && (
                  <FormField
                    control={form.control}
                    name="factores_riesgo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Factores de Riesgo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Factores de riesgo identificados..."
                            rows={3}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Card 5: Fotografías */}
            <Card>
              <CardHeader>
                <CardTitle>Fotografías</CardTitle>
                <CardDescription>
                  Evidencia fotográfica del suceso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  {pendingFiles.length === 0 ? (
                    <PhotoUploader
                      onUpload={async (files) => setPendingFiles(prev => [...prev, ...files])}
                      disabled={isSubmitting}
                      maxFiles={10}
                      maxSizeMB={10}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {pendingFiles.map((file, idx) => (
                          <div key={idx} className="relative aspect-square rounded overflow-hidden border">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {pendingFiles.length} foto(s) seleccionadas
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingFiles([])}
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 md:flex-initial"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {selectedCategoria === 'tolerancia_0'
                      ? 'Crear Suceso + Reporte Tolerancia Cero'
                      : 'Crear Suceso + Flash Report'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/incidents')}
                disabled={isSubmitting}
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
