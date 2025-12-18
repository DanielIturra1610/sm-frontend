/**
 * Edit Flash Report Page
 * Allows editing existing Flash Report with all fields
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFlashReport, useUpdateFlashReport } from '@/shared/hooks/report-hooks'
import { flashReportSchema, type FlashReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export default function EditFlashReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { data: report, isLoading: isLoadingReport } = useFlashReport(id)
  const { trigger: updateReport, isMutating } = useUpdateFlashReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FlashReportFormData>({
    resolver: zodResolver(flashReportSchema),
  })

  // Load existing report data
  useEffect(() => {
    if (report) {
      reset({
        incident_id: report.incident_id,
        suceso: report.suceso || '',
        tipo: report.tipo || '',
        lugar: report.lugar || '',
        fecha: report.fecha || '',
        hora: report.hora || '',
        area_zona: report.area_zona || '',
        empresa: report.empresa || '',
        supervisor: report.supervisor || '',
        descripcion: report.descripcion || '',
        acciones_inmediatas: report.acciones_inmediatas || '',
        controles_inmediatos: report.controles_inmediatos || '',
        factores_riesgo: report.factores_riesgo || '',
        numero_prodity: report.numero_prodity || '',
        zonal: report.zonal || '',
        con_baja_il: report.con_baja_il || false,
        sin_baja_il: report.sin_baja_il || false,
        incidente_industrial: report.incidente_industrial || false,
        incidente_laboral: report.incidente_laboral || false,
      })
    }
  }, [report, reset])

  const onSubmit = async (data: FlashReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
      toast.success('Flash Report actualizado exitosamente')
      router.push(`/reports/flash/${id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el reporte'
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
            <p className="text-center text-gray-500">Reporte no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ReportFormHeader
        title="Editar Flash Report"
        description="Actualiza la información del reporte inicial"
        backUrl={`/reports/flash/${id}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/flash/${id}`)}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
