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
import { getSucesoCategoryLabel, getSucesoTypeLabel } from '@/shared/constants/suceso-options'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Separator } from '@/shared/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Save, Send } from 'lucide-react'

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
    },
  })

  const incident_id = watch('incident_id')
  const con_baja_il = watch('con_baja_il')
  const sin_baja_il = watch('sin_baja_il')
  const incidente_industrial = watch('incidente_industrial')
  const incidente_laboral = watch('incidente_laboral')

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
      
      // Parse date and time from reportedAt
      if (selectedIncident.reportedAt) {
        const date = new Date(selectedIncident.reportedAt)
        const dateStr = date.toISOString().split('T')[0]
        const timeStr = date.toTimeString().slice(0, 5)
        setValue('fecha', dateStr)
        setValue('hora', timeStr)
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
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    // Save as draft without full validation
    handleSubmit(onSubmit)()
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

        {/* Incident Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación del Incidente/Accidente</CardTitle>
            <CardDescription>
              Seleccione el tipo de incidente o accidente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="con_baja_il"
                checked={con_baja_il}
                onCheckedChange={(checked) => setValue('con_baja_il', checked as boolean)}
              />
              <Label
                htmlFor="con_baja_il"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Con Baja - Incapacidad Laboral
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sin_baja_il"
                checked={sin_baja_il}
                onCheckedChange={(checked) => setValue('sin_baja_il', checked as boolean)}
              />
              <Label
                htmlFor="sin_baja_il"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sin Baja - Incapacidad Laboral
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incidente_industrial"
                checked={incidente_industrial}
                onCheckedChange={(checked) => setValue('incidente_industrial', checked as boolean)}
              />
              <Label
                htmlFor="incidente_industrial"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incidente Industrial
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incidente_laboral"
                checked={incidente_laboral}
                onCheckedChange={(checked) => setValue('incidente_laboral', checked as boolean)}
              />
              <Label
                htmlFor="incidente_laboral"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incidente Laboral
              </Label>
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
