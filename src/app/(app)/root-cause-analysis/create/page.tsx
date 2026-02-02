'use client'

import React, { useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  GitBranch,
  Fish,
  HelpCircle,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/forms/form'
import { useToast } from '@/shared/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'
import { useCreateCausalTreeAnalysis } from '@/shared/hooks/causal-tree-hooks'
import { useCreateFishboneAnalysis, useCreateFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'

type MethodologyType = 'causal-tree' | 'fishbone' | 'five-whys' | null

const METHODOLOGIES = [
  {
    id: 'causal-tree' as const,
    name: 'Árbol Causal',
    icon: GitBranch,
    color: 'border-green-500 bg-green-50 hover:bg-green-100',
    selectedColor: 'border-green-500 bg-green-100 ring-2 ring-green-500',
    description: 'Metodología sistemática que construye un árbol de causas desde el evento final hasta las causas básicas.',
    bestFor: 'Análisis profundo de incidentes complejos con múltiples factores causales.',
    features: ['Visualización gráfica', 'Relaciones conjuntivas/disyuntivas', 'Identificación de causas básicas'],
  },
  {
    id: 'fishbone' as const,
    name: 'Diagrama Ishikawa',
    icon: Fish,
    color: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
    selectedColor: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500',
    description: 'Organiza las causas potenciales en categorías usando el marco de las 6M.',
    bestFor: 'Brainstorming estructurado y análisis de causas por categorías.',
    features: ['6 categorías predefinidas', 'Vista de espina de pescado', 'Múltiples causas por categoría'],
  },
  {
    id: 'five-whys' as const,
    name: '5 Porqués',
    icon: HelpCircle,
    color: 'border-purple-500 bg-purple-50 hover:bg-purple-100',
    selectedColor: 'border-purple-500 bg-purple-100 ring-2 ring-purple-500',
    description: 'Técnica iterativa que profundiza en la causa raíz mediante preguntas sucesivas.',
    bestFor: 'Análisis rápido de problemas con una cadena causal lineal.',
    features: ['Simple y directo', 'Hasta 10 niveles de profundidad', 'Fácil de documentar'],
  },
]

// Schemas for each methodology
const causalTreeSchema = z.object({
  incidentId: z.string().min(1, 'Selecciona un suceso'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  finalEvent: z.string().min(10, 'El evento final debe tener al menos 10 caracteres'),
  description: z.string().optional(),
})

const fishboneSchema = z.object({
  incidentId: z.string().min(1, 'Selecciona un suceso'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  problem: z.string().min(10, 'La declaración del problema debe tener al menos 10 caracteres'),
})

const fiveWhysSchema = z.object({
  incidentId: z.string().min(1, 'Selecciona un suceso'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  problemStatement: z.string().min(10, 'La descripción del problema debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
})

function CreateAnalysisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const preselectedIncidentId = searchParams.get('incidentId') || ''

  const [selectedMethodology, setSelectedMethodology] = useState<MethodologyType>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const step2Ref = useRef<HTMLDivElement>(null)

  // Handle methodology selection with auto-scroll to step 2
  const handleMethodologySelect = (methodId: MethodologyType) => {
    setSelectedMethodology(methodId)
    // Scroll to step 2 after a small delay for render
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  // Fetch incidents (all statuses for analysis)
  const { data: incidentsData } = useIncidents({ limit: 100 })

  // Mutations for each methodology
  const createCausalTree = useCreateCausalTreeAnalysis()
  const { trigger: createFishbone } = useCreateFishboneAnalysis()
  const { trigger: createFiveWhys } = useCreateFiveWhysAnalysis()

  // Forms for each methodology
  const causalTreeForm = useForm<z.infer<typeof causalTreeSchema>>({
    resolver: zodResolver(causalTreeSchema),
    defaultValues: {
      incidentId: preselectedIncidentId,
      title: '',
      finalEvent: '',
      description: '',
    },
  })

  const fishboneForm = useForm<z.infer<typeof fishboneSchema>>({
    resolver: zodResolver(fishboneSchema),
    defaultValues: {
      incidentId: preselectedIncidentId,
      title: '',
      problem: '',
    },
  })

  const fiveWhysForm = useForm<z.infer<typeof fiveWhysSchema>>({
    resolver: zodResolver(fiveWhysSchema),
    defaultValues: {
      incidentId: preselectedIncidentId,
      title: '',
      problemStatement: '',
    },
  })

  const handleSubmitCausalTree = async (data: z.infer<typeof causalTreeSchema>) => {
    try {
      setIsSubmitting(true)
      const analysis = await createCausalTree.mutateAsync(data)
      toast({
        title: 'Análisis creado',
        description: 'El análisis de árbol causal ha sido creado exitosamente.',
      })
      router.push(`/root-cause-analysis/causal-tree/${analysis.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el análisis.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFishbone = async (data: z.infer<typeof fishboneSchema>) => {
    try {
      setIsSubmitting(true)
      // Backend expects category names as strings (enum values)
      const defaultCategories = [
        'people',
        'method',
        'machine',
        'material',
        'measurement',
        'environment',
      ]
      const analysis = await createFishbone({
        ...data,
        categories: defaultCategories as any,
      })
      sonnerToast.success('Análisis de espina de pescado creado exitosamente')
      router.push(`/root-cause-analysis/fishbone/${analysis.id}`)
    } catch (error) {
      console.error('Error creating fishbone:', error)
      sonnerToast.error('Error al crear el análisis')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFiveWhys = async (data: z.infer<typeof fiveWhysSchema>) => {
    try {
      setIsSubmitting(true)
      const analysis = await createFiveWhys(data)
      sonnerToast.success('Análisis de 5 porqués creado exitosamente')
      router.push(`/root-cause-analysis/five-whys/${analysis.id}`)
    } catch (error) {
      sonnerToast.error('Error al crear el análisis')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIncidentSelect = (incidentId: string) => {
    const incident = incidentsData?.data?.find((i) => i.id === incidentId)

    // Update all forms with selected incident
    causalTreeForm.setValue('incidentId', incidentId)
    fishboneForm.setValue('incidentId', incidentId)
    fiveWhysForm.setValue('incidentId', incidentId)

    if (incident) {
      // Auto-fill Causal Tree form
      if (!causalTreeForm.getValues('title')) {
        causalTreeForm.setValue('title', `Análisis Causal - ${incident.title}`)
      }
      if (!causalTreeForm.getValues('finalEvent')) {
        causalTreeForm.setValue('finalEvent', incident.description)
      }

      // Auto-fill Fishbone form
      if (!fishboneForm.getValues('title')) {
        fishboneForm.setValue('title', `Análisis Ishikawa - ${incident.title}`)
      }
      if (!fishboneForm.getValues('problem')) {
        fishboneForm.setValue('problem', incident.description)
      }

      // Auto-fill Five Whys form
      if (!fiveWhysForm.getValues('title')) {
        fiveWhysForm.setValue('title', `Análisis 5 Porqués - ${incident.title}`)
      }
      if (!fiveWhysForm.getValues('problemStatement')) {
        fiveWhysForm.setValue('problemStatement', incident.description)
      }
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/root-cause-analysis')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Análisis
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Crear Análisis de Causa Raíz</h1>
        <p className="text-muted-foreground mt-2">
          Selecciona la metodología y completa la información para iniciar el análisis
        </p>
      </div>

      {/* Step 1: Select Methodology */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </span>
            Selecciona la Metodología
          </CardTitle>
          <CardDescription>
            Elige la metodología más adecuada para tu análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {METHODOLOGIES.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethodology === method.id

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleMethodologySelect(method.id)}
                  className={`
                    relative p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected ? method.selectedColor : method.color}
                  `}
                >
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-current" />
                  )}
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <div className="text-xs">
                    <p className="font-medium text-current mb-1">Mejor para:</p>
                    <p className="text-muted-foreground">{method.bestFor}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {method.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/50 border"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Fill Form (conditional based on methodology) */}
      {selectedMethodology && (
        <Card ref={step2Ref}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </span>
              Información del Análisis
            </CardTitle>
            <CardDescription>
              Completa los datos requeridos para crear el análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Causal Tree Form */}
            {selectedMethodology === 'causal-tree' && (
              <Form {...causalTreeForm}>
                <form onSubmit={causalTreeForm.handleSubmit(handleSubmitCausalTree)} className="space-y-6">
                  <FormField
                    control={causalTreeForm.control}
                    name="incidentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suceso Asociado *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleIncidentSelect(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un suceso..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentsData?.data?.map((incident) => (
                              <SelectItem key={incident.id} value={incident.id}>
                                {incident.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={causalTreeForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Análisis *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Análisis Causal - Caída en área de producción" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={causalTreeForm.control}
                    name="finalEvent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evento Final (Lesión/Daño) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe el evento final o lesión que será el punto de partida del análisis..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este será el nodo raíz del árbol causal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={causalTreeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción adicional del análisis..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/root-cause-analysis')}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Crear Análisis
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Fishbone Form */}
            {selectedMethodology === 'fishbone' && (
              <Form {...fishboneForm}>
                <form onSubmit={fishboneForm.handleSubmit(handleSubmitFishbone)} className="space-y-6">
                  <FormField
                    control={fishboneForm.control}
                    name="incidentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suceso Asociado *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleIncidentSelect(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un suceso..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentsData?.data?.map((incident) => (
                              <SelectItem key={incident.id} value={incident.id}>
                                {incident.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={fishboneForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Análisis *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Análisis Ishikawa - Derrame de ácido en planta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={fishboneForm.control}
                    name="problem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Declaración del Problema (Efecto) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe claramente el efecto o problema que será la 'cabeza' del diagrama..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este será el efecto principal del diagrama de espina de pescado. Las categorías 6M se crearán automáticamente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Categorías 6M que se crearán:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
                      <span>• Personas</span>
                      <span>• Métodos</span>
                      <span>• Máquinas</span>
                      <span>• Materiales</span>
                      <span>• Mediciones</span>
                      <span>• Entorno</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/root-cause-analysis')}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Crear Análisis
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Five Whys Form */}
            {selectedMethodology === 'five-whys' && (
              <Form {...fiveWhysForm}>
                <form onSubmit={fiveWhysForm.handleSubmit(handleSubmitFiveWhys)} className="space-y-6">
                  <FormField
                    control={fiveWhysForm.control}
                    name="incidentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suceso Asociado *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleIncidentSelect(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un suceso..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incidentsData?.data?.map((incident) => (
                              <SelectItem key={incident.id} value={incident.id}>
                                {incident.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={fiveWhysForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Análisis *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Análisis de derrame de aceite en zona de producción"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Un título descriptivo para identificar este análisis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={fiveWhysForm.control}
                    name="problemStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Declaración del Problema *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe claramente el problema que estás analizando..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Sé específico y objetivo sobre lo que salió mal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">Siguiente paso:</h4>
                    <p className="text-sm text-purple-800">
                      Después de crear el análisis, podrás agregar las preguntas &quot;¿Por qué?&quot; y sus respuestas en la página de detalle del análisis.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/root-cause-analysis')}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Crear Análisis
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CreateRootCauseAnalysisPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6">Cargando...</div>}>
      <CreateAnalysisContent />
    </Suspense>
  )
}
