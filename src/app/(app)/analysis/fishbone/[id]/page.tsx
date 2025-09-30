'use client'

import { useParams, useRouter } from 'next/navigation'
import { useFishboneAnalysis } from '@/shared/hooks/analysis-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function FishboneDetailPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string | null

  const { data: analysis, error, isLoading } = useFishboneAnalysis(analysisId)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Análisis
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del análisis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/analysis/fishbone')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const categoryColors = [
    'border-blue-500 bg-blue-50',
    'border-green-500 bg-green-50',
    'border-purple-500 bg-purple-50',
    'border-orange-500 bg-orange-50',
    'border-pink-500 bg-pink-50',
    'border-teal-500 bg-teal-50',
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/analysis/fishbone')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análisis de Espina de Pescado</h1>
            <p className="text-muted-foreground">Análisis #{analysis.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2">
        <Badge className={getStatusColor(analysis.status)}>
          {analysis.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline">Incident: {analysis.incidentId}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Diagram */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem (Effect) */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Problema (Efecto)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-900 font-medium text-lg">{analysis.problem}</p>
            </CardContent>
          </Card>

          {/* Categories and Causes */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Categorías de Causas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.categories.map((category, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${categoryColors[index % categoryColors.length]}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.causes.length} causas identificadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.causes.map((cause, causeIndex) => (
                        <li key={causeIndex} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-1">•</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{cause.description}</p>
                            {cause.subCauses && cause.subCauses.length > 0 && (
                              <ul className="ml-4 mt-1 space-y-1">
                                {cause.subCauses.map((subCause, subIndex) => (
                                  <li key={subIndex} className="text-xs text-muted-foreground">
                                    ◦ {subCause}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {cause.evidence && cause.evidence.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground font-semibold">Evidencia:</p>
                                <ul className="ml-2 space-y-0.5">
                                  {cause.evidence.map((ev, evIndex) => (
                                    <li key={evIndex} className="text-xs text-muted-foreground">
                                      - {ev}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Root Cause */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Causa Raíz Identificada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-900 font-medium">{analysis.rootCause}</p>
            </CardContent>
          </Card>

          {/* Action Items */}
          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Acciones correctivas y preventivas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.actionItems.map((item) => (
                    <Card key={item.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">{item.description}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Asignado: {item.assignedTo}</span>
                              <span>Vencimiento: {new Date(item.dueDate).toLocaleDateString()}</span>
                              <span>Prioridad: {item.priority}</span>
                            </div>
                          </div>
                          <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Cronología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Creado Por</p>
                <p className="text-sm text-muted-foreground">{analysis.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Creado En</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(analysis.createdAt).toLocaleString()}
                </p>
              </div>
              {analysis.reviewedBy && (
                <>
                  <div>
                    <p className="text-sm font-medium">Revisado Por</p>
                    <p className="text-sm text-muted-foreground">{analysis.reviewedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Revisado En</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.reviewedAt!).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Categorías</span>
                <Badge variant="outline">{analysis.categories.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Causas Totales</span>
                <Badge variant="outline">
                  {analysis.categories.reduce((sum, cat) => sum + cat.causes.length, 0)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Related Incident */}
          <Card>
            <CardHeader>
              <CardTitle>Incidente Relacionado</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/incidents/${analysis.incidentId}`}>
                <Button variant="outline" className="w-full">
                  Ver Incidente #{analysis.incidentId.slice(0, 8)}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}