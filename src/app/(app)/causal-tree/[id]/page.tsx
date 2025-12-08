'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText, Download, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useToast } from '@/shared/hooks/use-toast'
import {
  useCausalTreeAnalysis,
  useAddCausalNode,
  useDeleteCausalNode,
  useMarkAsRootCause,
  useCompleteCausalTreeAnalysis,
  useAddPreventiveMeasure,
} from '@/shared/hooks/causal-tree-hooks'
import CausalTreeDiagram from '@/shared/components/causal-tree/CausalTreeDiagram'
import type { AddCausalNodeDTO, AddPreventiveMeasureDTO } from '@/shared/types/causal-tree'

export default function CausalTreeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const analysisId = params.id as string

  const { data: analysis, isLoading, error } = useCausalTreeAnalysis(analysisId)
  const addNodeMutation = useAddCausalNode()
  const deleteNodeMutation = useDeleteCausalNode()
  const markRootCauseMutation = useMarkAsRootCause()
  const completeMutation = useCompleteCausalTreeAnalysis()

  const [activeTab, setActiveTab] = useState('diagram')

  const handleAddNode = async (data: AddCausalNodeDTO) => {
    try {
      await addNodeMutation.mutateAsync(data)
      toast({
        title: 'Nodo agregado',
        description: 'El nodo ha sido agregado al árbol causal.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar el nodo. Intenta nuevamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este nodo?')) return

    try {
      await deleteNodeMutation.mutateAsync({ analysisId, nodeId })
      toast({
        title: 'Nodo eliminado',
        description: 'El nodo ha sido eliminado del árbol.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el nodo.',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsRootCause = async (nodeId: string) => {
    try {
      await markRootCauseMutation.mutateAsync({ analysisId, nodeId })
      toast({
        title: 'Causa raíz marcada',
        description: 'El nodo ha sido marcado como causa raíz.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo marcar como causa raíz.',
        variant: 'destructive',
      })
    }
  }

  const handleCompleteAnalysis = async () => {
    if (!analysis) return

    if (analysis.rootCauses.length === 0) {
      toast({
        title: 'Análisis incompleto',
        description: 'Debes identificar al menos una causa raíz antes de completar.',
        variant: 'destructive',
      })
      return
    }

    try {
      await completeMutation.mutateAsync({
        analysisId,
        rootCauses: analysis.rootCauses,
      })
      toast({
        title: 'Análisis completado',
        description: 'El análisis ha sido marcado como completado.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo completar el análisis.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar el análisis.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isReadonly = analysis.status === 'completed' || analysis.status === 'reviewed'

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/causal-tree')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Análisis
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{analysis.title}</h1>
              <Badge variant={analysis.status === 'completed' ? 'default' : 'outline'}>
                {analysis.status === 'draft' && 'Borrador'}
                {analysis.status === 'in_progress' && 'En Progreso'}
                {analysis.status === 'completed' && 'Completado'}
                {analysis.status === 'reviewed' && 'Revisado'}
                {analysis.status === 'archived' && 'Archivado'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{analysis.finalEvent}</p>
          </div>

          <div className="flex gap-2">
            {!isReadonly && analysis.rootCauses.length > 0 && (
              <Button onClick={handleCompleteAnalysis} disabled={completeMutation.isPending}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completar Análisis
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Nodos Totales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.nodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Causas Raíz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analysis.rootCauses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Medidas Preventivas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analysis.preventiveMeasures.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Niveles del Árbol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...analysis.nodes.map((n) => n.level), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="diagram">Diagrama</TabsTrigger>
          <TabsTrigger value="rootCauses">Causas Raíz</TabsTrigger>
          <TabsTrigger value="measures">Medidas Preventivas</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram">
          <Card>
            <CardContent className="pt-6">
              <CausalTreeDiagram
                analysis={analysis}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
                onMarkAsRootCause={handleMarkAsRootCause}
                readonly={isReadonly}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rootCauses">
          <Card>
            <CardHeader>
              <CardTitle>Causas Raíz Identificadas</CardTitle>
              <CardDescription>
                Nodos sin antecedentes que representan las causas básicas del evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.rootCauses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No se han identificado causas raíz aún.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.rootCauses.map((rootCauseId) => {
                    const node = analysis.nodes.find((n) => n.id === rootCauseId)
                    if (!node) return null
                    return (
                      <Card key={node.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <p className="font-medium mb-2">{node.fact}</p>
                          {node.evidence.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {node.evidence.map((e, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {e}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measures">
          <Card>
            <CardHeader>
              <CardTitle>Medidas Preventivas y Correctivas</CardTitle>
              <CardDescription>
                Acciones para prevenir la recurrencia de las causas identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.preventiveMeasures.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No se han definido medidas preventivas.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.preventiveMeasures.map((measure) => (
                    <Card key={measure.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium flex-1">{measure.description}</p>
                          <Badge
                            variant={
                              measure.priority === 'high'
                                ? 'destructive'
                                : measure.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {measure.priority === 'high' && 'Alta'}
                            {measure.priority === 'medium' && 'Media'}
                            {measure.priority === 'low' && 'Baja'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">
                            {measure.measureType === 'preventive' ? 'Preventiva' : 'Correctiva'}
                          </Badge>
                          <Badge variant="outline">
                            {measure.status === 'pending' && 'Pendiente'}
                            {measure.status === 'in_progress' && 'En Progreso'}
                            {measure.status === 'completed' && 'Completada'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Información del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Descripción</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.description || 'Sin descripción'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Evento Final</Label>
                <p className="text-sm text-muted-foreground mt-1">{analysis.finalEvent}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Estado</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.status === 'draft' && 'Borrador'}
                  {analysis.status === 'in_progress' && 'En Progreso'}
                  {analysis.status === 'completed' && 'Completado'}
                  {analysis.status === 'reviewed' && 'Revisado'}
                  {analysis.status === 'archived' && 'Archivado'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
