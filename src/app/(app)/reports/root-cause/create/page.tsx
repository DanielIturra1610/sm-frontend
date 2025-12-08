/**
 * Create Root Cause Report Page
 * Analysis with 5 Whys methodology and dynamic tables
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRootCauseReport } from '@/shared/hooks/report-hooks'
import { rootCauseReportSchema, type RootCauseReportFormData } from '@/lib/validations/report-schemas'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { IncidentSelector } from '@/shared/components/reports/IncidentSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, Plus, Trash2, GitBranch } from 'lucide-react'

const METODOLOGIAS = [
  { value: 'five_whys', label: '5 Por Qués' },
  { value: 'fishbone', label: 'Diagrama de Ishikawa (Espina de Pescado)' },
  { value: 'six_sigma', label: 'Six Sigma' },
  { value: 'fmea', label: 'FMEA (Análisis de Modos de Falla)' },
  { value: 'other', label: 'Otra Metodología' },
]

export default function CreateRootCauseReportPage() {
  const router = useRouter()
  const { trigger: createReport, isMutating } = useCreateRootCauseReport()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RootCauseReportFormData>({
    resolver: zodResolver(rootCauseReportSchema),
    defaultValues: {
      metodologia: 'five_whys',
      analysis_tables: [
        {
          table_number: 1,
          hecho_observacion: '',
          porques: [
            { numero: 1, pregunta: '¿Por qué ocurrió esto?', respuesta: '' },
          ],
          accion_plan: '',
        },
      ],
    },
  })

  const { fields: tables, append: appendTable, remove: removeTable } = useFieldArray({
    control,
    name: 'analysis_tables',
  })

  const incident_id = watch('incident_id')
  const metodologia = watch('metodologia')

  const addWhyToTable = (tableIndex: number) => {
    const currentTable = watch(`analysis_tables.${tableIndex}`)
    const currentWhys = currentTable.porques?.length || 0

    if (currentWhys >= 7) {
      toast.error('Máximo 7 "por qués" por tabla')
      return
    }

    const newWhy = {
      numero: currentWhys + 1,
      pregunta: '¿Por qué?',
      respuesta: '',
    }

    const updatedWhys = [...(currentTable.porques || []), newWhy]
    setValue(`analysis_tables.${tableIndex}.porques`, updatedWhys)
  }

  const removeWhyFromTable = (tableIndex: number, whyIndex: number) => {
    const currentTable = watch(`analysis_tables.${tableIndex}`)
    const updatedWhys = currentTable.porques?.filter((_, idx) => idx !== whyIndex) || []

    // Renumber the remaining whys
    const renumberedWhys = updatedWhys.map((why, idx) => ({
      ...why,
      numero: idx + 1,
    }))

    setValue(`analysis_tables.${tableIndex}.porques`, renumberedWhys)
  }

  const onSubmit = async (data: RootCauseReportFormData) => {
    try {
      setIsSubmitting(true)
      await createReport(data)
      toast.success('Análisis de Causa Raíz creado exitosamente')
      router.push('/reports/root-cause')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el análisis')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ReportFormHeader
        title="Crear Análisis de Causa Raíz"
        description="Análisis profundo utilizando metodología de los 5 Por Qués"
        backUrl="/reports/root-cause"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Incident Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Incidente</CardTitle>
            <CardDescription>
              Seleccione el incidente al cual pertenece este análisis
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

        {/* Methodology Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Metodología de Análisis</CardTitle>
            <CardDescription>
              Seleccione la metodología utilizada para el análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="metodologia">Metodología</Label>
              <Select value={metodologia} onValueChange={(value) => setValue('metodologia', value as any)}>
                <SelectTrigger id="metodologia">
                  <SelectValue placeholder="Seleccione una metodología" />
                </SelectTrigger>
                <SelectContent>
                  {METODOLOGIAS.map((met) => (
                    <SelectItem key={met.value} value={met.value}>
                      {met.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.metodologia && (
                <p className="text-sm text-red-600">{errors.metodologia.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tables */}
        <div className="space-y-4">
          {tables.map((table, tableIndex) => (
            <Card key={table.id} className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <CardTitle>Tabla de Análisis #{tableIndex + 1}</CardTitle>
                  </div>
                  {tables.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTable(tableIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Observation/Fact */}
                <div className="space-y-2">
                  <Label htmlFor={`analysis_tables.${tableIndex}.hecho_observacion`}>
                    Hecho / Observación
                  </Label>
                  <Textarea
                    id={`analysis_tables.${tableIndex}.hecho_observacion`}
                    {...register(`analysis_tables.${tableIndex}.hecho_observacion`)}
                    placeholder="Describa el hecho observado o el problema identificado..."
                    rows={3}
                  />
                  {errors.analysis_tables?.[tableIndex]?.hecho_observacion && (
                    <p className="text-sm text-red-600">
                      {errors.analysis_tables[tableIndex]?.hecho_observacion?.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Whys Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Los 5 Por Qués</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addWhyToTable(tableIndex)}
                      disabled={watch(`analysis_tables.${tableIndex}.porques`)?.length >= 7}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar ¿Por qué?
                    </Button>
                  </div>

                  {watch(`analysis_tables.${tableIndex}.porques`)?.map((why, whyIndex) => (
                    <Card key={whyIndex} className="bg-gray-50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="default">
                            Por qué #{why.numero}
                          </Badge>
                          {whyIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWhyFromTable(tableIndex, whyIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`analysis_tables.${tableIndex}.porques.${whyIndex}.pregunta`}>
                            Pregunta
                          </Label>
                          <Textarea
                            id={`analysis_tables.${tableIndex}.porques.${whyIndex}.pregunta`}
                            {...register(`analysis_tables.${tableIndex}.porques.${whyIndex}.pregunta`)}
                            placeholder="¿Por qué ocurrió esto?"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`analysis_tables.${tableIndex}.porques.${whyIndex}.respuesta`}>
                            Respuesta
                          </Label>
                          <Textarea
                            id={`analysis_tables.${tableIndex}.porques.${whyIndex}.respuesta`}
                            {...register(`analysis_tables.${tableIndex}.porques.${whyIndex}.respuesta`)}
                            placeholder="Respuesta al por qué..."
                            rows={2}
                          />
                          {errors.analysis_tables?.[tableIndex]?.porques?.[whyIndex]?.respuesta && (
                            <p className="text-sm text-red-600">
                              {errors.analysis_tables[tableIndex]?.porques?.[whyIndex]?.respuesta?.message}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Action Plan */}
                <div className="space-y-2">
                  <Label htmlFor={`analysis_tables.${tableIndex}.accion_plan`}>
                    Plan de Acción
                  </Label>
                  <Textarea
                    id={`analysis_tables.${tableIndex}.accion_plan`}
                    {...register(`analysis_tables.${tableIndex}.accion_plan`)}
                    placeholder="Describa el plan de acción para abordar la causa raíz identificada..."
                    rows={3}
                  />
                  {errors.analysis_tables?.[tableIndex]?.accion_plan && (
                    <p className="text-sm text-red-600">
                      {errors.analysis_tables[tableIndex]?.accion_plan?.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              appendTable({
                table_number: tables.length + 1,
                hecho_observacion: '',
                porques: [
                  { numero: 1, pregunta: '¿Por qué ocurrió esto?', respuesta: '' },
                ],
                accion_plan: '',
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Tabla de Análisis
          </Button>

          {errors.analysis_tables && (
            <p className="text-sm text-red-600">
              {typeof errors.analysis_tables.message === 'string' && errors.analysis_tables.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/reports/root-cause')}
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
            Crear Análisis
          </Button>
        </div>
      </form>
    </div>
  )
}
