'use client'

import React, { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, CheckCircle2, List, GitBranch, Circle, Square, Flag, Trash2, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Separator } from '@/shared/components/ui/separator'
import { useToast } from '@/shared/hooks/use-toast'
import {
  useCausalTreeAnalysis,
  useAddCausalNode,
  useDeleteCausalNode,
  useMarkAsRootCause,
  useCompleteCausalTreeAnalysis,
  useUpdateCausalNode,
} from '@/shared/hooks/causal-tree-hooks'
import CausalTreeDiagram from '@/shared/components/causal-tree/CausalTreeDiagram'
import { EditNodeDialog } from '@/shared/components/causal-tree/EditNodeDialog'
import { ExportDialog } from '@/shared/components/causal-tree/ExportDialog'
import type { AddCausalNodeDTO, CausalNode, UpdateCausalNodeDTO } from '@/shared/types/causal-tree'
import { FACT_TYPE_LABELS, NODE_TYPE_LABELS } from '@/shared/types/causal-tree'

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
  const updateNodeMutation = useUpdateCausalNode()

  const [activeTab, setActiveTab] = useState('diagram')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showFactsList, setShowFactsList] = useState(true)
  const [editingNode, setEditingNode] = useState<CausalNode | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const diagramImageCaptureRef = useRef<(() => Promise<string | null>) | null>(null)

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

  const handleEditNode = (node: CausalNode) => {
    setEditingNode(node)
    setShowEditDialog(true)
  }

  const handleUpdateNode = async (nodeId: string, data: UpdateCausalNodeDTO) => {
    try {
      await updateNodeMutation.mutateAsync({ analysisId, nodeId, data })
      toast({
        title: 'Nodo actualizado',
        description: 'El nodo ha sido actualizado correctamente.',
      })
      setShowEditDialog(false)
      setEditingNode(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el nodo.',
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
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/root-cause-analysis')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Análisis
            </Button>
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
          onClick={() => router.push('/root-cause-analysis')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Análisis
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{analysis.title}</h1>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Árbol Causal
              </Badge>
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
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
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
          <div className="flex gap-4">
            {/* Lista de Hechos (Panel Lateral) */}
            {showFactsList && (
              <Card className="w-80 flex-shrink-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Lista de Hechos
                    </CardTitle>
                    <Badge variant="secondary">{analysis.nodes.length}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Hechos numerados del árbol causal
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] overflow-y-auto">
                    <div className="p-3 space-y-2">
                      {/* Evento Final */}
                      {analysis.nodes
                        .filter(n => n.nodeType === 'final_event')
                        .map((node) => (
                          <FactListItem
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            onDelete={!isReadonly ? handleDeleteNode : undefined}
                            onMarkAsRootCause={!isReadonly ? handleMarkAsRootCause : undefined}
                          />
                        ))}

                      {analysis.nodes.filter(n => n.nodeType === 'final_event').length > 0 &&
                       analysis.nodes.filter(n => n.nodeType !== 'final_event').length > 0 && (
                        <Separator className="my-2" />
                      )}

                      {/* Hechos Intermedios y Causas Raíz ordenados por número */}
                      {analysis.nodes
                        .filter(n => n.nodeType !== 'final_event')
                        .sort((a, b) => a.numero - b.numero)
                        .map((node) => (
                          <FactListItem
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            onDelete={!isReadonly ? handleDeleteNode : undefined}
                            onMarkAsRootCause={!isReadonly ? handleMarkAsRootCause : undefined}
                          />
                        ))}

                      {analysis.nodes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No hay hechos registrados</p>
                          <p className="text-xs mt-1">Agrega el primer hecho desde el diagrama</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagrama Principal */}
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Árbol Causal
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFactsList(!showFactsList)}
                  >
                    <List className="h-4 w-4 mr-1" />
                    {showFactsList ? 'Ocultar Lista' : 'Mostrar Lista'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <CausalTreeDiagram
                  analysis={analysis}
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  onMarkAsRootCause={handleMarkAsRootCause}
                  onEditNode={handleEditNode}
                  readonly={isReadonly}
                  onImageCaptureReady={(fn) => { diagramImageCaptureRef.current = fn }}
                />
              </CardContent>
            </Card>
          </div>
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

      {/* Edit Node Dialog */}
      <EditNodeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        node={editingNode}
        existingNodes={analysis.nodes}
        onSubmit={handleUpdateNode}
        isLoading={updateNodeMutation.isPending}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        analysis={analysis}
        onGetDiagramImage={async () => {
          if (diagramImageCaptureRef.current) {
            return await diagramImageCaptureRef.current()
          }
          return null
        }}
        onExportImage={async () => {
          // Trigger the download from CausalTreeDiagram
          const downloadBtn = document.querySelector('.causal-tree-diagram button[title*="Descargar"], .causal-tree-diagram button:has(.lucide-download)') as HTMLButtonElement
          if (downloadBtn) {
            downloadBtn.click()
          }
        }}
      />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

// Componente para cada ítem de la lista de hechos
interface FactListItemProps {
  node: CausalNode
  isSelected: boolean
  onClick: () => void
  onDelete?: (nodeId: string) => void
  onMarkAsRootCause?: (nodeId: string) => void
}

function FactListItem({ node, isSelected, onClick, onDelete, onMarkAsRootCause }: FactListItemProps) {
  const getNodeColor = () => {
    switch (node.nodeType) {
      case 'final_event':
        return 'border-l-red-500 bg-red-50'
      case 'root_cause':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const getNodeBadgeColor = () => {
    switch (node.nodeType) {
      case 'final_event':
        return 'bg-red-500'
      case 'root_cause':
        return 'bg-green-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border-l-4 cursor-pointer
        transition-all hover:shadow-md group
        ${getNodeColor()}
        ${isSelected ? 'ring-2 ring-blue-400 shadow-md' : ''}
      `}
    >
      {/* Número y tipo de hecho */}
      <div className="flex items-start gap-2 mb-1">
        <div className={`
          flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold
          flex items-center justify-center ${getNodeBadgeColor()}
        `}>
          {node.numero || '-'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {NODE_TYPE_LABELS[node.nodeType]}
            </Badge>
            {node.factType && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {node.factType === 'variacion' ? (
                  <><Circle className="h-2 w-2 mr-0.5" /> Var.</>
                ) : (
                  <><Square className="h-2 w-2 mr-0.5" /> Perm.</>
                )}
              </Badge>
            )}
            {node.isRootCause && (
              <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                <Flag className="h-2 w-2 mr-0.5" /> Raíz
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Hecho */}
      <p className="text-sm leading-tight line-clamp-2 pl-8">
        {node.fact}
      </p>

      {/* Evidencias */}
      {node.evidence && node.evidence.length > 0 && (
        <div className="mt-1 pl-8">
          <span className="text-[10px] text-muted-foreground">
            {node.evidence.length} evidencia{node.evidence.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Acciones (al hacer hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onMarkAsRootCause && !node.isRootCause && node.nodeType !== 'final_event' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRootCause(node.id)
            }}
          >
            <Flag className="h-3 w-3" />
          </Button>
        )}
        {onDelete && node.nodeType !== 'final_event' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Indicador de expansión si tiene hijos */}
      {node.childNodes && node.childNodes.length > 0 && (
        <div className="absolute right-2 bottom-2">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
