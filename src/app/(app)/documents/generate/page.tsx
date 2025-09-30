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
      toast.success('Document generation started')
      router.push(`/documents/${newDocument.id}`)
    } catch (error) {
      console.error('Error generating document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate document')
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Generate Document</h1>
            <p className="text-muted-foreground">Create safety documentation from templates</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Document Generation</CardTitle>
            <CardDescription className="text-blue-700">
              Select a document type and template to automatically generate professional safety
              documentation. You can customize the content and export in various formats.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Configure your document generation settings</CardDescription>
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
                      <FormLabel>Document Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incident_report">Incident Report</SelectItem>
                          <SelectItem value="analysis_report">Analysis Report</SelectItem>
                          <SelectItem value="action_plan">Action Plan</SelectItem>
                          <SelectItem value="compliance_report">Compliance Report</SelectItem>
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
                      <FormLabel>Document Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter document title..."
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
                      <FormLabel>Template *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting || templatesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredTemplates.length === 0 ? (
                            <SelectItem value="no-templates" disabled>
                              No templates available
                            </SelectItem>
                          ) : (
                            filteredTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                                {template.isDefault && ' (Default)'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a pre-configured template for your document
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
                      <FormLabel>Output Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
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
                        <FormLabel>Incident ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Link to incident..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Reference an incident
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
                        <FormLabel>Analysis ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Link to analysis..."
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Reference an analysis
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
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Document
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/documents')}
                    disabled={isSubmitting}
                  >
                    Cancel
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