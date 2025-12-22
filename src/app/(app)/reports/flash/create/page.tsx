/**
 * Create Flash Report Page
 * Complete form with all fields, validation, and best practices
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFlashReport } from '@/shared/hooks/report-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { flashReportSchema, type FlashReportFormData } from '@/lib/validations/report-schemas'
import { getSucesoTypeLabel } from '@/shared/constants/suceso-options'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save, Image as ImageIcon } from 'lucide-react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export default function CreateFlashReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateFlashReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FlashReportFormData>({
    resolver: zodResolver(flashReportSchema),
    defaultValues: {
      con_baja_il: false,
      sin_baja_il: false,
      incidente_industrial: false,
      incidente_laboral: false,
      es_plgf: false,
    },
  })

  const incident_id = watch('incident_id')

  // Fetch incident details when incident is selected
  const { data: selectedIncident } = useIncident(incident_id || '')

  // Auto-fill form fields when incident is selected
  useEffect(() => {
    if (selectedIncident) {
      // Auto-fill basic fields
      setValue('suceso', selectedIncident.title || '')
      setValue('tipo', selectedIncident.tipoSuceso ? getSucesoTypeLabel(selectedIncident.tipoSuceso) : '')
      setValue('lugar', selectedIncident.location || '')
      setValue('descripcion', selectedIncident.description || '')

      // Auto-fill new fields from incident
      setValue('area_zona', selectedIncident.area_zona || '')
      setValue('empresa', selectedIncident.empresa || '')
      setValue('supervisor', selectedIncident.supervisor || '')

      // Parse date and time from reportedAt
      if (selectedIncident.reportedAt) {
        const date = new Date(selectedIncident.reportedAt)
        const dateStr = date.toISOString().split('T')[0]
        const timeStr = date.toTimeString().slice(0, 5)
        setValue('fecha', dateStr)
        setValue('hora', timeStr)
      }

      // Auto-fill incident type checkboxes based on tipoSuceso
      const tipo = selectedIncident.tipoSuceso || ''

      // Reset all checkboxes first
      setValue('con_baja_il', false)
      setValue('sin_baja_il', false)
      setValue('incidente_industrial', false)
      setValue('incidente_laboral', false)
      setValue('es_plgf', false)

      // Set appropriate checkbox based on type
      if (tipo.includes('con_baja')) {
        setValue('con_baja_il', true)
      } else if (tipo.includes('sin_baja')) {
        setValue('sin_baja_il', true)
      } else if (tipo === 'inc_industrial') {
        setValue('incidente_industrial', true)
      } else if (tipo === 'inc_laboral') {
        setValue('incidente_laboral', true)
      } else if (tipo === 'inc_plgf') {
        setValue('es_plgf', true)
        setValue('incidente_industrial', true) // PLGF is typically industrial
      }

      toast.success('Campos rellenados automáticamente desde el suceso')
    }
  }, [selectedIncident, setValue])

  const onSubmit = async (data: FlashReportFormData) => {
    try {
      setIsSubmitting(true)
      await createReport(data)
      toast.success('Flash Report creado exitosamente')
      router.push('/reports/flash')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el reporte'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ReportFormHeader
        title="Crear Flash Report"
        description="Reporte inicial del incidente (debe crearse dentro de 24 horas)"
        backUrl="/reports/flash"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Incidente</CardTitle>
            <CardDescription>
              Seleccione el incidente al cual pertenece este reporte
            </CardDescription>
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

        {/* Basic Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica del Evento</CardTitle>
            <CardDescription>
              Datos iniciales sobre el suceso ocurrido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suceso">Suceso</Label>
                <Input
                  id="suceso"
                  {...register('suceso')}
                  placeholder="Ej: Accidente, Incidente, Casi accidente"
                />
                {errors.suceso && (
                  <p className="text-sm text-red-600">{errors.suceso.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  {...register('tipo')}
                  placeholder="Tipo de evento"
                />
                {errors.tipo && (
                  <p className="text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  {...register('fecha')}
                />
                {errors.fecha && (
                  <p className="text-sm text-red-600">{errors.fecha.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  {...register('hora')}
                />
                {errors.hora && (
                  <p className="text-sm text-red-600">{errors.hora.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar</Label>
                <Input
                  id="lugar"
                  {...register('lugar')}
                  placeholder="Ubicación del evento"
                />
                {errors.lugar && (
                  <p className="text-sm text-red-600">{errors.lugar.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_zona">Área/Zona</Label>
                <Input
                  id="area_zona"
                  {...register('area_zona')}
                  placeholder="Área o zona específica"
                />
                {errors.area_zona && (
                  <p className="text-sm text-red-600">{errors.area_zona.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  {...register('empresa')}
                  placeholder="Nombre de la empresa"
                />
                {errors.empresa && (
                  <p className="text-sm text-red-600">{errors.empresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  {...register('supervisor')}
                  placeholder="Nombre del supervisor"
                />
                {errors.supervisor && (
                  <p className="text-sm text-red-600">{errors.supervisor.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Type Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación del Incidente</CardTitle>
            <CardDescription>
              Seleccione el tipo de incidente/accidente según corresponda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="con_baja_il"
                  checked={watch('con_baja_il') || false}
                  onCheckedChange={(checked) => setValue('con_baja_il', Boolean(checked))}
                />
                <Label htmlFor="con_baja_il" className="text-sm font-normal cursor-pointer">
                  Con Baja IL
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sin_baja_il"
                  checked={watch('sin_baja_il') || false}
                  onCheckedChange={(checked) => setValue('sin_baja_il', Boolean(checked))}
                />
                <Label htmlFor="sin_baja_il" className="text-sm font-normal cursor-pointer">
                  Sin Baja IL
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="incidente_industrial"
                  checked={watch('incidente_industrial') || false}
                  onCheckedChange={(checked) => setValue('incidente_industrial', Boolean(checked))}
                />
                <Label htmlFor="incidente_industrial" className="text-sm font-normal cursor-pointer">
                  Incidente Industrial
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="incidente_laboral"
                  checked={watch('incidente_laboral') || false}
                  onCheckedChange={(checked) => setValue('incidente_laboral', Boolean(checked))}
                />
                <Label htmlFor="incidente_laboral" className="text-sm font-normal cursor-pointer">
                  Incidente Laboral
                </Label>
              </div>
            </div>

            {/* PLGF Classification */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="es_plgf"
                  checked={watch('es_plgf') || false}
                  onCheckedChange={(checked) => setValue('es_plgf', Boolean(checked))}
                />
                <Label htmlFor="es_plgf" className="text-sm font-medium cursor-pointer">
                  ¿Es un evento PLGF (Potencial de Lesión Grave o Fatal)?
                </Label>
              </div>

              {watch('es_plgf') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="nivel_plgf">Nivel PLGF</Label>
                    <Select
                      value={watch('nivel_plgf') || ''}
                      onValueChange={(value) => setValue('nivel_plgf', value as 'potencial' | 'real' | 'fatal')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="potencial">Potencial</SelectItem>
                        <SelectItem value="real">Real</SelectItem>
                        <SelectItem value="fatal">Fatal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="justificacion_plgf">Justificación PLGF</Label>
                    <Textarea
                      id="justificacion_plgf"
                      {...register('justificacion_plgf')}
                      placeholder="Justifique la clasificación PLGF..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Incident Photos Preview */}
        {selectedIncident?.attachments && selectedIncident.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Fotografías del Suceso
              </CardTitle>
              <CardDescription>
                Fotos asociadas al suceso seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedIncident.attachments.map((attachment, index) => (
                  <div key={attachment.id || index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={attachment.url}
                      alt={attachment.filename || `Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description and Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción y Análisis</CardTitle>
            <CardDescription>
              Detalles del evento y medidas tomadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Describa lo ocurrido..."
                rows={4}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acciones_inmediatas">Acciones Inmediatas</Label>
              <Textarea
                id="acciones_inmediatas"
                {...register('acciones_inmediatas')}
                placeholder="Acciones tomadas inmediatamente..."
                rows={3}
              />
              {errors.acciones_inmediatas && (
                <p className="text-sm text-red-600">{errors.acciones_inmediatas.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="controles_inmediatos">Controles Inmediatos</Label>
              <Textarea
                id="controles_inmediatos"
                {...register('controles_inmediatos')}
                placeholder="Controles implementados..."
                rows={3}
              />
              {errors.controles_inmediatos && (
                <p className="text-sm text-red-600">{errors.controles_inmediatos.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="factores_riesgo">Factores de Riesgo</Label>
              <Textarea
                id="factores_riesgo"
                {...register('factores_riesgo')}
                placeholder="Factores de riesgo identificados..."
                rows={3}
              />
              {errors.factores_riesgo && (
                <p className="text-sm text-red-600">{errors.factores_riesgo.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Identifiers */}
        <Card>
          <CardHeader>
            <CardTitle>Identificadores</CardTitle>
            <CardDescription>
              Códigos y números de referencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_prodity">Número Prodity</Label>
                <Input
                  id="numero_prodity"
                  {...register('numero_prodity')}
                  placeholder="Código Prodity"
                />
                {errors.numero_prodity && (
                  <p className="text-sm text-red-600">{errors.numero_prodity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zonal">Zonal</Label>
                <Input
                  id="zonal"
                  {...register('zonal')}
                  placeholder="Zona o región"
                />
                {errors.zonal && (
                  <p className="text-sm text-red-600">{errors.zonal.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/reports/flash')}
            disabled={isMutating || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isMutating || isSubmitting}
          >
            {(isMutating || isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Crear Reporte
          </Button>
        </div>
      </form>
    </div>
  )
}
