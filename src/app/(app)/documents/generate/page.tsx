'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGenerateDocument, useDocumentTemplates } from '@/shared/hooks/document-hooks'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const generateDocumentSchema = z.object({
  type: z.enum(['incident_report', 'analysis_report', 'action_plan', 'compliance_report']),
  templateId: z.string().min(1, 'Template is required'),
  format: z.enum(['pdf', 'docx', 'html']).optional(),
  incidentId: z.string().optional(),
  analysisId: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
})

type GenerateDocumentFormValues = z.infer<typeof generateDocumentSchema>

export default function GenerateDocumentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: generateDocument } = useGenerateDocument()
  const { data: templates, isLoading: templatesLoading } = useDocumentTemplates()

  const form = useForm<GenerateDocumentFormValues>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      type: 'incident_report',
      format: 'pdf',
      title: '',
    },
  })

  const selectedType = form.watch('type')
  const filteredTemplates = templates?.filter((t) => t.type === selectedType) || []

  const onSubmit = async (data: GenerateDocumentFormValues) => {
    try {
      setIsSubmitting(true)

      const requestData = {
        type: data.type,
        templateId: data.templateId,
        format: data.format || 'pdf',
        data: {
          title: data.title,
          ...(data.incidentId && { incidentId: data.incidentId }),
          ...(data.analysisId && { analysisId: data.analysisId }),
        },
      }

      const newDocument = await generateDocument(requestData)
      toast.success('Generación de documento iniciada')
      router.push(`/documents/${newDocument.id}`)
    } catch (error) {
      console.error('Error generating document:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar el documento')
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
            onClick={() => router.push('/documents')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Generar Documento</h1>
            <p className="text-muted-foreground">Crear documentación de seguridad a partir de plantillas</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Acerca de la Generación de Documentos</CardTitle>
            <CardDescription className="text-blue-700">
              Seleccione un tipo de documento y una plantilla para generar automáticamente documentación
              profesional de seguridad. Puede personalizar el contenido y exportar en varios formatos.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Documento</CardTitle>
            <CardDescription>Configure la configuración de generación de documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Document Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de documento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incident_report">Reporte de Incidente</SelectItem>
                          <SelectItem value="analysis_report">Reporte de Análisis</SelectItem>
                          <SelectItem value="action_plan">Plan de Acción</SelectItem>
                          <SelectItem value="compliance_report">Reporte de Cumplimiento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Documento *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el título del documento..."
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Template Selection */}
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting || templatesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar una plantilla" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredTemplates.length === 0 ? (
                            <SelectItem value="no-templates" disabled>
                              No hay plantillas disponibles
                            </SelectItem>
                          ) : (
                            filteredTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                                {template.isDefault && ' (Por defecto)'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Elija una plantilla preconfigurada para su documento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Format */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato de Salida</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">Word (DOCX)</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional References */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del Incidente (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enlace al incidente..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Referenciar un incidente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analysisId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del Análisis (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enlace al análisis..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Referenciar un análisis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-initial"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generar Documento
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/documents')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}