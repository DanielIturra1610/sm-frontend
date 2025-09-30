'use client'

import { useParams, useRouter } from 'next/navigation'
import { useFiveWhysAnalysis } from '@/shared/hooks/analysis-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, FileText, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FiveWhysDetailPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string | null

  const { data: analysis, error, isLoading } = useFiveWhysAnalysis(analysisId)

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
            <Button onClick={() => router.push('/analysis/five-whys')}>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/analysis/five-whys')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análisis de Cinco Porqués</h1>
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
        <Badge variant="outline">
          Incident: {analysis.incidentId}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Statement */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Declaración del Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-900 font-medium">{analysis.problem}</p>
            </CardContent>
          </Card>

          {/* The Whys */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Cadena de Análisis</h2>
            {analysis.whys.map((why, index) => (
              <div key={index} className="relative">
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </span>
                        Por qué #{index + 1}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        Pregunta:
                      </p>
                      <p className="text-base">{why.question}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        Respuesta:
                      </p>
                      <p className="text-base font-medium">{why.answer}</p>
                    </div>
                    {why.evidence && why.evidence.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                          Evidencia:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {why.evidence.map((ev, idx) => (
                            <li key={idx} className="text-sm">{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {index < analysis.whys.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
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
                <CardDescription>
                  Acciones correctivas y preventivas para abordar la causa raíz
                </CardDescription>
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
                          <Badge
                            variant={item.status === 'completed' ? 'default' : 'secondary'}
                          >
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