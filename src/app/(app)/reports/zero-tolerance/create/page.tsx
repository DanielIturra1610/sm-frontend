/**
 * Create Zero Tolerance Report Page
 * Critical safety violation reporting
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateZeroToleranceReport } from '@/shared/hooks/report-hooks'
import { zeroToleranceReportSchema, type ZeroToleranceReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react'

const SEVERIDADES = [
  { value: 'low', label: 'Baja', description: 'Incumplimiento menor' },
  { value: 'medium', label: 'Media', description: 'Incumplimiento moderado' },
  { value: 'high', label: 'Alta', description: 'Incumplimiento grave' },
  { value: 'critical', label: 'Crítica', description: 'Riesgo de vida o daño severo' },
]

export default function CreateZeroToleranceReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateZeroToleranceReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ZeroToleranceReportFormData>({
    resolver: zodResolver(zeroToleranceReportSchema),
    defaultValues: {
      severidad: 'medium',
      fotografias: [],
      personas_involucradas: [],
    },
  })

  const { fields: fotografias, append: appendFoto, remove: removeFoto } = useFieldArray({
    control,
    name: 'fotografias',
  })

  const { fields: personas, append: appendPersona, remove: removePersona } = useFieldArray({
    control,
    name: 'personas_involucradas',
  })

  const incident_id = watch('incident_id')
  const severidad = watch('severidad')

  const onSubmit = async (data: ZeroToleranceReportFormData) => {
    try {
      setIsSubmitting(true)
      await createReport(data)
      toast.success('Reporte de Tolerancia Cero creado exitosamente')
      router.push('/reports/zero-tolerance')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ReportFormHeader
        title="Crear Reporte de Tolerancia Cero"
        description="Registro de incumplimientos críticos de seguridad"
        backUrl="/reports/zero-tolerance"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Incidente Relacionado (Opcional)</CardTitle>
            <CardDescription>
              Este reporte puede ser independiente o estar asociado a un incidente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentSelector
              value={incident_id || ''}
              onChange={(value) => setValue('incident_id', value)}
              error={errors.incident_id?.message}
              required={false}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Información del Incumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento</Label>
                <Input
                  id="numero_documento"
                  {...register('numero_documento')}
                  placeholder="Se autogenera si se deja vacío"
                />
                {errors.numero_documento && (
                  <p className="text-sm text-red-600">{errors.numero_documento.message}</p>
                )}
              </div>

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
                <Label htmlFor="suceso">Suceso</Label>
                <Input
                  id="suceso"
                  {...register('suceso')}
                  placeholder="Descripción breve del suceso"
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
                  placeholder="Tipo de incumplimiento"
                />
                {errors.tipo && (
                  <p className="text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lugar">Lugar</Label>
                <Input
                  id="lugar"
                  {...register('lugar')}
                  placeholder="Ubicación del incumplimiento"
                />
                {errors.lugar && (
                  <p className="text-sm text-red-600">{errors.lugar.message}</p>
                )}
              </div>

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
                <Label htmlFor="area_zona">Área/Zona</Label>
                <Input
                  id="area_zona"
                  {...register('area_zona')}
                  placeholder="Área o zona"
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
                  placeholder="Empresa involucrada"
                />
                {errors.empresa && (
                  <p className="text-sm text-red-600">{errors.empresa.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="supervisor_cge">Supervisor CGE</Label>
                <Input
                  id="supervisor_cge"
                  {...register('supervisor_cge')}
                  placeholder="Nombre del supervisor CGE"
                />
                {errors.supervisor_cge && (
                  <p className="text-sm text-red-600">{errors.supervisor_cge.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Describa el incumplimiento en detalle..."
                rows={4}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Severidad del Incumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="severidad">Nivel de Severidad</Label>
              <Select value={severidad} onValueChange={(value) => setValue('severidad', value as any)}>
                <SelectTrigger id="severidad">
                  <SelectValue placeholder="Seleccione la severidad" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERIDADES.map((sev) => (
                    <SelectItem key={sev.value} value={sev.value}>
                      <div>
                        <div className="font-medium">{sev.label}</div>
                        <div className="text-xs text-gray-500">{sev.description}</div>
                      </div>
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

        {/* Actions Taken */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Tomadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="acciones_tomadas">Acciones Inmediatas</Label>
              <Textarea
                id="acciones_tomadas"
                {...register('acciones_tomadas')}
                placeholder="Describa las acciones tomadas..."
                rows={4}
              />
              {errors.acciones_tomadas && (
                <p className="text-sm text-red-600">{errors.acciones_tomadas.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Involved People */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Personas Involucradas</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPersona({ nombre: '', cargo: '', empresa: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Persona
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {personas.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay personas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {personas.map((persona, index) => (
                  <Card key={persona.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`personas_involucradas.${index}.nombre`}>Nombre</Label>
                            <Input
                              {...register(`personas_involucradas.${index}.nombre`)}
                              placeholder="Nombre completo"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`personas_involucradas.${index}.cargo`}>Cargo</Label>
                            <Input
                              {...register(`personas_involucradas.${index}.cargo`)}
                              placeholder="Cargo"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`personas_involucradas.${index}.empresa`}>Empresa</Label>
                            <Input
                              {...register(`personas_involucradas.${index}.empresa`)}
                              placeholder="Empresa"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePersona(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/reports/zero-tolerance')}
            disabled={isMutating || isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isMutating || isSubmitting}>
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
