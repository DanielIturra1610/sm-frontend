'use client'

import React, { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/shared/components/ui/button'
import { Download, Plus, ZoomIn, ZoomOut } from 'lucide-react'
import CausalTreeNode from './CausalTreeNode'
import { AddNodeDialog } from './AddNodeDialog'
import type { CausalNode, CausalTreeAnalysis, AddCausalNodeDTO } from '@/shared/types/causal-tree'

interface CausalTreeDiagramProps {
  analysis: CausalTreeAnalysis
  onAddNode?: (data: AddCausalNodeDTO) => void
  onUpdateNode?: (nodeId: string, data: Partial<CausalNode>) => void
  onDeleteNode?: (nodeId: string) => void
  onMarkAsRootCause?: (nodeId: string) => void
  readonly?: boolean
}

const nodeTypes = {
  causalNode: CausalTreeNode,
}

export default function CausalTreeDiagram({
  analysis,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onMarkAsRootCause,
  readonly = false,
}: CausalTreeDiagramProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedParentNode, setSelectedParentNode] = useState<string | undefined>()

  // Convert CausalNodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => {
    return analysis.nodes.map((node) => ({
      id: node.id,
      type: 'causalNode',
      position: node.position,
      data: {
        causalNode: node,
        onEdit: readonly ? undefined : (n: CausalNode) => {
          // Handle edit
          console.log('Edit node:', n)
        },
        onDelete: readonly ? undefined : onDeleteNode,
        onMarkAsRootCause: readonly ? undefined : onMarkAsRootCause,
      },
    }))
  }, [analysis.nodes, readonly, onDeleteNode, onMarkAsRootCause])

  // Convert relationships to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []

    analysis.nodes.forEach((node) => {
      node.parentNodes.forEach((parentId) => {
        const edgeType = node.relationType === 'conjunctive' ? 'smoothstep' : 'default'
        const edgeColor =
          node.relationType === 'conjunctive' ? '#3b82f6' : // blue for AND
          node.relationType === 'disjunctive' ? '#f59e0b' : // amber for OR
          '#6b7280' // gray for chain

        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: edgeType,
          animated: !readonly,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
          style: {
            stroke: edgeColor,
            strokeWidth: 2,
          },
          label: node.relationType === 'conjunctive' ? '∧' :
                 node.relationType === 'disjunctive' ? '∨' : '',
        })
      })
    })

    return edges
  }, [analysis.nodes, readonly])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when analysis changes
  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      if (!readonly) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [readonly, setEdges]
  )

  const handleAddNode = (parentNodeId?: string) => {
    setSelectedParentNode(parentNodeId)
    setShowAddDialog(true)
  }

  const handleNodeSubmit = (data: AddCausalNodeDTO) => {
    if (onAddNode) {
      onAddNode(data)
      setShowAddDialog(false)
      setSelectedParentNode(undefined)
    }
  }

  const handleDownloadDiagram = async () => {
    const { toPng } = await import('html2canvas')
    const diagramElement = document.querySelector('.react-flow') as HTMLElement
    if (diagramElement) {
      try {
        const dataUrl = await toPng(diagramElement)
        const link = document.createElement('a')
        link.download = `arbol-causal-${analysis.id}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Error downloading diagram:', error)
      }
    }
  }

  return (
    <div className="w-full h-[600px] border rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />

        <Panel position="top-right" className="flex gap-2">
          {!readonly && (
            <Button
              size="sm"
              onClick={() => handleAddNode()}
              className="shadow-md"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Nodo
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadDiagram}
            className="shadow-md"
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </Panel>

        <Panel position="bottom-left" className="bg-white p-3 rounded-md shadow-md">
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-gray-900">Leyenda:</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-600"></div>
              <span>→ Cadena (A → B)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span>∧ Conjuntiva (A ∧ B → C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-amber-500"></div>
              <span>∨ Disyuntiva (A ∨ B → C)</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {!readonly && (
        <AddNodeDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          analysisId={analysis.id}
          parentNodeId={selectedParentNode}
          onSubmit={handleNodeSubmit}
        />
      )}
    </div>
  )
}
