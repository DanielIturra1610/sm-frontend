/**
 * Edit Zero Tolerance Report Page
 * Allows editing zero tolerance incident reports
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useZeroToleranceReport, useUpdateZeroToleranceReport } from '@/shared/hooks/report-hooks'
import { zeroToleranceReportSchema, type ZeroToleranceReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Save, AlertTriangle } from 'lucide-react'

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

export default function EditZeroToleranceReportPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { data: report, isLoading: isLoadingReport } = useZeroToleranceReport(id)
  const { trigger: updateReport, isMutating } = useUpdateZeroToleranceReport(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ZeroToleranceReportFormData>({
    resolver: zodResolver(zeroToleranceReportSchema),
  })

  // Load existing report data
  useEffect(() => {
    if (report) {
      reset({
        incident_id: report.incident_id,
        numero_documento: report.numero_documento || '',
        suceso: report.suceso || '',
        tipo: report.tipo || '',
        lugar: report.lugar || '',
        fecha_hora: report.fecha_hora || '',
        area_zona: report.area_zona || '',
        empresa: report.empresa || '',
        supervisor_cge: report.supervisor_cge || '',
        descripcion: report.descripcion || '',
        numero_prodity: report.numero_prodity || '',
        severidad: report.severidad || 'medium',
        acciones_tomadas: report.acciones_tomadas || '',
        personas_involucradas: report.personas_involucradas || [],
      })
    }
  }, [report, reset])

  const onSubmit = async (data: ZeroToleranceReportFormData) => {
    try {
      setIsSubmitting(true)
      // @ts-expect-error - useSWRMutation type signature issue
      await updateReport(data)
      toast.success('Reporte de Tolerancia Cero actualizado exitosamente')
      router.push(`/reports/zero-tolerance/${id}`)
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
            <p className="text-center text-gray-500">Reporte de Tolerancia Cero no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ReportFormHeader
        title="Editar Reporte de Tolerancia Cero"
        description="Modifica el reporte de condiciones de tolerancia cero"
        backUrl={`/reports/zero-tolerance/${id}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle>Información General</CardTitle>
            </div>
            <CardDescription>
              Datos del incidente de tolerancia cero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_hora">Fecha y Hora</Label>
                <Input
                  id="fecha_hora"
                  type="datetime-local"
                  {...register('fecha_hora')}
                />
                {errors.fecha_hora && (
                  <p className="text-sm text-red-600">{errors.fecha_hora.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento</Label>
                <Input
                  id="numero_documento"
                  placeholder="Ej: ZT-2024-001"
                  {...register('numero_documento')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar</Label>
                <Input
                  id="lugar"
                  placeholder="Ubicación del incidente"
                  {...register('lugar')}
                />
                {errors.lugar && (
                  <p className="text-sm text-red-600">{errors.lugar.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_zona">Área/Zona</Label>
                <Input
                  id="area_zona"
                  placeholder="Área o zona"
                  {...register('area_zona')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  placeholder="Nombre de la empresa"
                  {...register('empresa')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor_cge">Supervisor CGE</Label>
                <Input
                  id="supervisor_cge"
                  placeholder="Nombre del supervisor CGE"
                  {...register('supervisor_cge')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zero Tolerance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Tolerancia Cero</CardTitle>
            <CardDescription>
              Descripción específica de la condición detectada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suceso">Suceso</Label>
                <Input
                  id="suceso"
                  placeholder="Tipo de suceso"
                  {...register('suceso')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  placeholder="Tipo de tolerancia cero"
                  {...register('tipo')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Incidente</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el incidente de tolerancia cero..."
                rows={4}
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acciones_tomadas">Acciones Tomadas</Label>
              <Textarea
                id="acciones_tomadas"
                placeholder="Acciones inmediatas tomadas..."
                rows={4}
                {...register('acciones_tomadas')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_prodity">Número Prodity</Label>
              <Input
                id="numero_prodity"
                placeholder="Número de referencia Prodity"
                {...register('numero_prodity')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severidad">Severidad</Label>
              <Select
                value={watch('severidad')}
                onValueChange={(value) => setValue('severidad', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severidad && (
                <p className="text-sm text-red-600">{errors.severidad.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>
              El schema actual de Zero Tolerance usa personas_involucradas como array.
              Los campos específicos se manejan mediante el array de personas.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/reports/zero-tolerance/${id}`)}
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
