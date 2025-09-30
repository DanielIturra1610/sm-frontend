'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
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

const fiveWhysSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
  problem: z.string().min(10, 'Problem statement must be at least 10 characters'),
  whys: z.array(
    z.object({
      question: z.string().min(5, 'Question must be at least 5 characters'),
      answer: z.string().min(5, 'Answer must be at least 5 characters'),
    })
  ).min(1, 'At least one why is required').max(10, 'Maximum 10 whys allowed'),
})

type FiveWhysFormValues = z.infer<typeof fiveWhysSchema>

function CreateFiveWhysForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId') || ''
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trigger: createAnalysis } = useCreateFiveWhysAnalysis()

  const form = useForm<FiveWhysFormValues>({
    resolver: zodResolver(fiveWhysSchema),
    defaultValues: {
      incidentId,
      problem: '',
      whys: [
        { question: 'Why did this happen?', answer: '' },
        { question: 'Why?', answer: '' },
        { question: 'Why?', answer: '' },
        { question: 'Why?', answer: '' },
        { question: 'Why?', answer: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'whys',
  })

  const onSubmit = async (data: FiveWhysFormValues) => {
    try {
      setIsSubmitting(true)
      const newAnalysis = await createAnalysis(data)
      toast.success('Five Whys analysis created successfully')
      router.push(`/analysis/five-whys/${newAnalysis.id}`)
    } catch (error) {
      console.error('Error creating analysis:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create analysis')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/analysis/five-whys')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Five Whys Analysis</h1>
            <p className="text-muted-foreground">Identify root causes through iterative questioning</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Five Whys Analysis</CardTitle>
            <CardDescription className="text-blue-700">
              The Five Whys technique helps identify the root cause of a problem by asking Why? repeatedly.
              Each answer forms the basis of the next question, drilling down to the fundamental issue.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
            <CardDescription>
              Define the problem and ask why to uncover the root cause
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Incident ID */}
                <FormField
                  control={form.control}
                  name="incidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="incident-id"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        The incident this analysis is related to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Problem Statement */}
                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Clearly describe the problem you're analyzing..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific and objective about what went wrong
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Five Whys */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">The Whys</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask why iteratively to dig deeper into the root cause
                      </p>
                    </div>
                    {fields.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ question: 'Why?', answer: '' })}
                        disabled={isSubmitting}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Why
                      </Button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Why #{index + 1}</CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`whys.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="Why did this occur?"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`whys.${index}.answer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Answer</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isSubmitting}
                                  placeholder="Provide a detailed answer..."
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
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
                    onClick={() => router.push('/analysis/five-whys')}
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

export default function CreateFiveWhysPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <CreateFiveWhysForm />
    </Suspense>
  )
}