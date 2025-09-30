'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateFishboneAnalysis } from '@/shared/hooks/analysis-hooks'
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
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fishboneSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
  problem: z.string().min(10, 'Problem statement must be at least 10 characters'),
  categories: z.array(
    z.object({
      name: z.string().min(2, 'Category name must be at least 2 characters'),
      causes: z.array(
        z.object({
          description: z.string().min(5, 'Cause description must be at least 5 characters'),
        })
      ).min(1, 'At least one cause is required'),
    })
  ).min(1, 'At least one category is required'),
})

type FishboneFormValues = z.infer<typeof fishboneSchema>

const defaultCategories = [
  { name: 'People', causes: [{ description: '' }] },
  { name: 'Methods', causes: [{ description: '' }] },
  { name: 'Machines', causes: [{ description: '' }] },
  { name: 'Materials', causes: [{ description: '' }] },
  { name: 'Measurements', causes: [{ description: '' }] },
  { name: 'Environment', causes: [{ description: '' }] },
]

function CreateFishboneFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId') || ''
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createAnalysis } = useCreateFishboneAnalysis()

  const form = useForm<FishboneFormValues>({
    resolver: zodResolver(fishboneSchema),
    defaultValues: {
      incidentId,
      problem: '',
      categories: defaultCategories,
    },
  })

  const onSubmit = async (data: FishboneFormValues) => {
    try {
      setIsSubmitting(true)
      const newAnalysis = await createAnalysis(data)
      toast.success('Fishbone analysis created successfully')
      router.push(`/analysis/fishbone/${newAnalysis.id}`)
    } catch (error) {
      console.error('Error creating analysis:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create analysis')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/analysis/fishbone')} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Fishbone Analysis</h1>
            <p className="text-muted-foreground">Identify root causes using the Ishikawa diagram</p>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Fishbone Diagram</CardTitle>
            <CardDescription className="text-blue-700">
              The Fishbone (Ishikawa) diagram helps identify multiple potential causes of a problem
              by organizing them into categories. Common categories include: People, Methods, Machines,
              Materials, Measurements, and Environment (6M framework).
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="incidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="incident-id" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement (Effect) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Clearly describe the effect or problem..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the &quot;head&quot; of the fishbone - the effect you&apos;re analyzing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> For this simplified version, edit categories directly in the form after creation.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-initial">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/analysis/fishbone')}
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

export default function CreateFishbonePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <CreateFishboneFormContent />
    </Suspense>
  )
}