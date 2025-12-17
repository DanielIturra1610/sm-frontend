'use client'

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
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
  NodeDragHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/shared/components/ui/button'
import { Download, Plus, RotateCcw } from 'lucide-react'
import CausalTreeNode from './CausalTreeNode'
import { AddNodeDialog } from './AddNodeDialog'
import type { CausalNode, CausalTreeAnalysis, AddCausalNodeDTO, NodeRelation, LinkType } from '@/shared/types/causal-tree'

interface CausalTreeDiagramProps {
  analysis: CausalTreeAnalysis
  onAddNode?: (data: AddCausalNodeDTO) => void
  onUpdateNode?: (nodeId: string, data: Partial<CausalNode>) => void
  onDeleteNode?: (nodeId: string) => void
  onMarkAsRootCause?: (nodeId: string) => void
  onEditNode?: (node: CausalNode) => void
  readonly?: boolean
  onImageCaptureReady?: (captureImage: () => Promise<string | null>) => void
}

const nodeTypes = {
  causalNode: CausalTreeNode,
}

// Constants for tree layout
const NODE_WIDTH = 180
const HORIZONTAL_SPACING = 100  // Increased for better separation
const VERTICAL_SPACING = 180   // Increased for better edge visibility

// Tree layout algorithm - positions nodes in vertical tree format
// Final event at TOP, root causes at BOTTOM
function calculateTreeLayout(nodes: CausalNode[], relations?: NodeRelation[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  if (nodes.length === 0) return positions

  // Debug: Log input data
  console.log('calculateTreeLayout input:', {
    nodesCount: nodes.length,
    relationsCount: relations?.length || 0,
    relations: relations,
    nodeTypes: nodes.map(n => ({ id: n.id.slice(0, 8), nodeType: n.nodeType, parentNodes: n.parentNodes }))
  })

  // Create a map for quick node lookup
  const nodeMap = new Map<string, CausalNode>()
  nodes.forEach(n => nodeMap.set(n.id, n))

  // Build parentNodes map from relations if available (more reliable than node.parentNodes)
  // In relations: parentNodeId = causa, childNodeId = efecto
  // So for each node (efecto), we want to find its causes (parentNodeId)
  const nodeParentsMap = new Map<string, string[]>()

  // First, try to build from relations array
  if (relations && relations.length > 0) {
    relations.forEach(rel => {
      // rel.childNodeId is the effect, rel.parentNodeId is the cause
      const parents = nodeParentsMap.get(rel.childNodeId) || []
      parents.push(rel.parentNodeId)
      nodeParentsMap.set(rel.childNodeId, parents)
    })
    console.log('Built nodeParentsMap from relations:', Object.fromEntries(nodeParentsMap))
  } else {
    console.log('No relations available, will use node.parentNodes')
  }

  // Helper to get parents for a node (prefer relations, fallback to node.parentNodes)
  const getParents = (nodeId: string): string[] => {
    if (nodeParentsMap.has(nodeId)) {
      return nodeParentsMap.get(nodeId)!
    }
    const node = nodeMap.get(nodeId)
    return node?.parentNodes || []
  }

  // Find the final event (root of the tree) - it should be at the TOP
  const finalEvent = nodes.find(n => n.nodeType === 'final_event')
  console.log('Final event found:', finalEvent ? { id: finalEvent.id.slice(0, 8), fact: finalEvent.fact?.slice(0, 30) } : 'NOT FOUND')

  // Calculate depth starting from final event
  // Depth 0 = final_event (TOP)
  // Depth N = causes that are N levels deep (BOTTOM)
  const depths = new Map<string, number>()

  // BFS from final event to calculate depths
  function calculateDepths() {
    if (!finalEvent) {
      // Fallback: find nodes with no children (effects) - these are root causes, put at bottom
      // Find nodes with no effects (nothing points to them as a cause)
      const nodesWithEffects = new Set<string>()
      nodes.forEach(node => {
        getParents(node.id).forEach(parentId => nodesWithEffects.add(parentId))
      })

      // Nodes that have effects are intermediate or root causes
      // Nodes that have no effects are final events
      nodes.forEach(n => {
        if (!nodesWithEffects.has(n.id)) {
          // This node has no effects - could be final event
          depths.set(n.id, 0)
        }
      })

      // Calculate remaining depths using BFS from depth-0 nodes
      const queue = Array.from(depths.keys())
      while (queue.length > 0) {
        const currentId = queue.shift()!
        const currentDepth = depths.get(currentId)!
        const parents = getParents(currentId)

        parents.forEach(parentId => {
          if (!depths.has(parentId)) {
            depths.set(parentId, currentDepth + 1)
            queue.push(parentId)
          }
        })
      }

      // Any remaining disconnected nodes
      nodes.forEach(node => {
        if (!depths.has(node.id)) {
          depths.set(node.id, 0)
        }
      })
      return
    }

    // Start from final event at depth 0
    depths.set(finalEvent.id, 0)
    const queue: string[] = [finalEvent.id]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const currentDepth = depths.get(currentId)!

      // Get the causes (parents) of this node - they should be at depth + 1 (below)
      const parents = getParents(currentId)
      parents.forEach(causeId => {
        if (!depths.has(causeId) && nodeMap.has(causeId)) {
          depths.set(causeId, currentDepth + 1)
          queue.push(causeId)
        }
      })
    }

    // Handle any disconnected nodes
    nodes.forEach(node => {
      if (!depths.has(node.id)) {
        depths.set(node.id, 0)
      }
    })
  }

  calculateDepths()

  // Debug log
  console.log('Tree layout depths:', Object.fromEntries(depths))

  // Group nodes by depth level
  const nodesByDepth = new Map<number, CausalNode[]>()
  let maxDepth = 0

  nodes.forEach(node => {
    const depth = depths.get(node.id) || 0
    maxDepth = Math.max(maxDepth, depth)

    const list = nodesByDepth.get(depth) || []
    list.push(node)
    nodesByDepth.set(depth, list)
  })

  // Sort nodes within each level by their numero for consistent ordering
  nodesByDepth.forEach((levelNodes) => {
    levelNodes.sort((a, b) => a.numero - b.numero)
  })

  // Position nodes level by level (depth 0 = top, higher depth = further down)
  for (let depth = 0; depth <= maxDepth; depth++) {
    const levelNodes = nodesByDepth.get(depth) || []
    const nodeCount = levelNodes.length
    const totalWidth = nodeCount * NODE_WIDTH + (nodeCount - 1) * HORIZONTAL_SPACING
    const startX = -totalWidth / 2

    levelNodes.forEach((node, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING) + NODE_WIDTH / 2
      const y = depth * VERTICAL_SPACING
      positions.set(node.id, { x, y })
    })
  }

  console.log('Tree layout positions:', Object.fromEntries(positions))

  return positions
}

export default function CausalTreeDiagram({
  analysis,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onMarkAsRootCause,
  onEditNode,
  readonly = false,
  onImageCaptureReady,
}: CausalTreeDiagramProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedParentNode, setSelectedParentNode] = useState<string | undefined>()
  const [layoutVersion, setLayoutVersion] = useState(0) // Used to force re-layout

  // Track user-moved positions locally to persist across analysis updates
  const userPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())

  // Handler for adding nodes - defined early to be used in useMemo
  const handleAddNode = useCallback((parentNodeId?: string) => {
    setSelectedParentNode(parentNodeId)
    setShowAddDialog(true)
  }, [])

  // Handler to reset layout - just clears user positions and triggers recalculation
  // The actual position update happens in the useEffect below
  const handleResetLayout = useCallback(() => {
    // Clear all user-dragged positions
    userPositionsRef.current.clear()

    // Debug log
    console.log('Reset layout - relations:', analysis.relations)
    console.log('Reset layout - nodes with parentNodes:', analysis.nodes.map(n => ({
      id: n.id.slice(0, 8),
      fact: n.fact?.slice(0, 30),
      parentNodes: n.parentNodes
    })))

    // Force re-calculation by incrementing version
    setLayoutVersion(v => v + 1)
  }, [analysis.relations, analysis.nodes])

  // Helper para obtener el linkType de una relación
  const getLinkType = useCallback((parentId: string, childId: string): LinkType => {
    const relation = analysis.relations?.find(
      r => r.parentNodeId === parentId && r.childNodeId === childId
    )
    return relation?.linkType || 'confirmada'
  }, [analysis.relations])

  // Calculate tree layout positions
  const treePositions = useMemo(() => {
    return calculateTreeLayout(analysis.nodes, analysis.relations)
  }, [analysis.nodes, analysis.relations])

  // Convert CausalNodes to ReactFlow nodes with calculated positions
  // Priority: 1) User-moved position (from drag), 2) Calculated tree position (always recalculated)
  // NOTE: We intentionally ignore stored positions from backend to ensure proper tree layout
  const initialNodes: Node[] = useMemo(() => {
    return analysis.nodes.map((node) => {
      // Check for user-moved position first (only from explicit drag during this session)
      const userPosition = userPositionsRef.current.get(node.id)
      // Always use calculated tree position as the default for proper hierarchical layout
      const calculatedPosition = treePositions.get(node.id) || { x: 0, y: 0 }

      // Only use user position if they explicitly dragged the node
      const position = userPosition || calculatedPosition

      return {
        id: node.id,
        type: 'causalNode',
        position,
        data: {
          causalNode: node,
          onEdit: readonly ? undefined : onEditNode,
          onDelete: readonly ? undefined : onDeleteNode,
          onMarkAsRootCause: readonly ? undefined : onMarkAsRootCause,
          onAddCause: readonly ? undefined : handleAddNode,
        },
      }
    })
  }, [analysis.nodes, treePositions, readonly, onDeleteNode, onMarkAsRootCause, onEditNode, handleAddNode, layoutVersion])

  // Convert relationships to ReactFlow edges with linkType support
  // Edges go FROM effect (top) TO cause (bottom) - visual tree direction
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []
    const addedEdges = new Set<string>()

    // Build map of node parents from relations (more reliable)
    const nodeParentsFromRelations = new Map<string, string[]>()
    if (analysis.relations && analysis.relations.length > 0) {
      analysis.relations.forEach(rel => {
        const parents = nodeParentsFromRelations.get(rel.childNodeId) || []
        parents.push(rel.parentNodeId)
        nodeParentsFromRelations.set(rel.childNodeId, parents)
      })
    }

    // Helper to get parents for a node
    const getNodeParents = (nodeId: string): string[] => {
      if (nodeParentsFromRelations.has(nodeId)) {
        return nodeParentsFromRelations.get(nodeId)!
      }
      const node = analysis.nodes.find(n => n.id === nodeId)
      return node?.parentNodes || []
    }

    analysis.nodes.forEach((node) => {
      // For each node, create edges from the node TO its causes (parentNodes)
      // This makes arrows point downward in the visual tree
      const parents = getNodeParents(node.id)
      parents.forEach((causeId) => {
        const edgeKey = `${node.id}-${causeId}`
        if (addedEdges.has(edgeKey)) return
        addedEdges.add(edgeKey)

        const linkType = getLinkType(causeId, node.id)
        const isConfirmed = linkType === 'confirmada'

        // Color basado en relationType del nodo causa
        const causeNode = analysis.nodes.find(n => n.id === causeId)
        const edgeColor =
          causeNode?.relationType === 'conjunctive' ? '#3b82f6' : // blue for AND
          causeNode?.relationType === 'disjunctive' ? '#f59e0b' : // amber for OR
          '#6b7280' // gray for chain

        edges.push({
          id: edgeKey,
          source: node.id,     // effect (at top)
          target: causeId,     // cause (below)
          type: 'smoothstep',
          animated: !readonly && !isConfirmed,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
          style: {
            stroke: edgeColor,
            strokeWidth: 2,
            strokeDasharray: isConfirmed ? '0' : '5,5',
          },
          label: causeNode?.relationType === 'conjunctive' ? '∧' :
                 causeNode?.relationType === 'disjunctive' ? '∨' : '',
          labelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
          data: {
            linkType,
          },
        })
      })
    })

    return edges
  }, [analysis.nodes, analysis.relations, readonly, getLinkType])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when analysis changes - preserve user-moved positions
  React.useEffect(() => {
    setNodes((currentNodes) => {
      // Preserve positions from current nodes that user has moved
      const currentPositions = new Map<string, { x: number; y: number }>()
      currentNodes.forEach((node) => {
        // If this node has a user-set position, preserve it
        if (userPositionsRef.current.has(node.id)) {
          currentPositions.set(node.id, userPositionsRef.current.get(node.id)!)
        }
      })

      // Apply preserved positions to new nodes
      return initialNodes.map((node) => {
        const preservedPosition = currentPositions.get(node.id)
        if (preservedPosition) {
          return { ...node, position: preservedPosition }
        }
        return node
      })
    })
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

  // Handler for when user finishes dragging a node - save position
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      // Save position to local ref for persistence across re-renders
      userPositionsRef.current.set(node.id, node.position)

      // Also save to backend if handler is provided
      if (onUpdateNode && !readonly) {
        onUpdateNode(node.id, {
          position: node.position,
        })
      }
    },
    [onUpdateNode, readonly]
  )

  const handleNodeSubmit = (data: AddCausalNodeDTO) => {
    if (onAddNode) {
      onAddNode(data)
      setShowAddDialog(false)
      setSelectedParentNode(undefined)
    }
  }

    // High quality image export function - uses html-to-image for proper SVG rendering
  const handleDownloadDiagram = useCallback(async () => {
    try {
      const { toPng } = await import('html-to-image')

      // Find the ReactFlow container
      const flowContainer = document.querySelector('.causal-tree-diagram .react-flow') as HTMLElement
      if (!flowContainer) {
        throw new Error('Diagram container not found')
      }

      // Get the viewport and nodes containers
      const viewport = flowContainer.querySelector('.react-flow__viewport') as HTMLElement
      const nodesContainer = flowContainer.querySelector('.react-flow__nodes') as HTMLElement

      if (!viewport || !nodesContainer) {
        throw new Error('Viewport not found')
      }

      // Calculate bounds of all nodes
      const nodeElements = nodesContainer.querySelectorAll('.react-flow__node')
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      nodeElements.forEach((node) => {
        const nodeEl = node as HTMLElement
        const transform = nodeEl.style.transform
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
        if (match) {
          const x = parseFloat(match[1])
          const y = parseFloat(match[2])
          const width = nodeEl.offsetWidth
          const height = nodeEl.offsetHeight

          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x + width)
          maxY = Math.max(maxY, y + height)
        }
      })

      // Add padding for edges and arrows
      const padding = 120
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      const contentWidth = maxX - minX
      const contentHeight = maxY - minY

      // Store original styles
      const originalViewportTransform = viewport.style.transform
      const originalContainerWidth = flowContainer.style.width
      const originalContainerHeight = flowContainer.style.height
      const originalContainerOverflow = flowContainer.style.overflow

      // Prepare for capture: set viewport to show all content
      viewport.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`
      flowContainer.style.width = `${contentWidth}px`
      flowContainer.style.height = `${contentHeight}px`
      flowContainer.style.overflow = 'visible'

      // Hide controls and panels for clean export
      const controls = flowContainer.querySelector('.react-flow__controls') as HTMLElement
      const panels = flowContainer.querySelectorAll('.react-flow__panel')
      const attribution = flowContainer.querySelector('.react-flow__attribution') as HTMLElement
      const background = flowContainer.querySelector('.react-flow__background') as HTMLElement

      const originalControlsDisplay = controls?.style.display
      const panelDisplays: string[] = []
      const originalAttributionDisplay = attribution?.style.display
      const originalBackgroundDisplay = background?.style.display

      if (controls) controls.style.display = 'none'
      if (attribution) attribution.style.display = 'none'
      if (background) background.style.display = 'none'
      panels.forEach((panel, i) => {
        panelDisplays[i] = (panel as HTMLElement).style.display
        ;(panel as HTMLElement).style.display = 'none'
      })

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 150))

      // Capture with html-to-image (handles SVG properly)
      const dataUrl = await toPng(flowContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 3, // High resolution (3x)
        width: contentWidth,
        height: contentHeight,
        style: {
          width: `${contentWidth}px`,
          height: `${contentHeight}px`,
        },
      })

      // Restore original styles
      viewport.style.transform = originalViewportTransform
      flowContainer.style.width = originalContainerWidth
      flowContainer.style.height = originalContainerHeight
      flowContainer.style.overflow = originalContainerOverflow

      if (controls) controls.style.display = originalControlsDisplay || ''
      if (attribution) attribution.style.display = originalAttributionDisplay || ''
      if (background) background.style.display = originalBackgroundDisplay || ''
      panels.forEach((panel, i) => {
        ;(panel as HTMLElement).style.display = panelDisplays[i] || ''
      })

      // Download the image
      const link = document.createElement('a')
      link.download = `arbol-causal-${analysis.id}-hq.png`
      link.href = dataUrl
      link.click()

      return dataUrl
    } catch (error) {
      console.error('Error downloading diagram:', error)
      alert('Error al descargar el diagrama. Por favor intente de nuevo.')
      return null
    }
  }, [analysis.id])
// Function to get diagram image as data URL (for export)
  const getDiagramImage = useCallback(async (): Promise<string | null> => {
    try {
      const { toPng } = await import('html-to-image')

      const flowContainer = document.querySelector('.causal-tree-diagram .react-flow') as HTMLElement
      if (!flowContainer) {
        console.error('getDiagramImage: flowContainer not found')
        return null
      }

      const viewport = flowContainer.querySelector('.react-flow__viewport') as HTMLElement
      const nodesContainer = flowContainer.querySelector('.react-flow__nodes') as HTMLElement

      if (!viewport || !nodesContainer) {
        console.error('getDiagramImage: viewport or nodesContainer not found')
        return null
      }

      // Calculate bounds of all nodes
      const nodeElements = nodesContainer.querySelectorAll('.react-flow__node')
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      nodeElements.forEach((node) => {
        const nodeEl = node as HTMLElement
        const transform = nodeEl.style.transform
        // Fixed regex with properly escaped parentheses
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
        if (match) {
          const x = parseFloat(match[1])
          const y = parseFloat(match[2])
          const width = nodeEl.offsetWidth
          const height = nodeEl.offsetHeight

          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x + width)
          maxY = Math.max(maxY, y + height)
        }
      })

      // Check if we found any nodes
      if (minX === Infinity) {
        console.error('getDiagramImage: No node positions found')
        return null
      }

      // Add padding for edges and arrows
      const padding = 120
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      const contentWidth = maxX - minX
      const contentHeight = maxY - minY

      console.log('getDiagramImage: Capturing area', { minX, minY, maxX, maxY, contentWidth, contentHeight })

      // Store original styles
      const originalViewportTransform = viewport.style.transform
      const originalContainerWidth = flowContainer.style.width
      const originalContainerHeight = flowContainer.style.height
      const originalContainerOverflow = flowContainer.style.overflow

      // Prepare for capture: set viewport to show all content
      viewport.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`
      flowContainer.style.width = `${contentWidth}px`
      flowContainer.style.height = `${contentHeight}px`
      flowContainer.style.overflow = 'visible'

      // Hide controls and panels for clean export
      const controls = flowContainer.querySelector('.react-flow__controls') as HTMLElement
      const panels = flowContainer.querySelectorAll('.react-flow__panel')
      const attribution = flowContainer.querySelector('.react-flow__attribution') as HTMLElement
      const background = flowContainer.querySelector('.react-flow__background') as HTMLElement

      const originalControlsDisplay = controls?.style.display
      const panelDisplays: string[] = []
      const originalAttributionDisplay = attribution?.style.display
      const originalBackgroundDisplay = background?.style.display

      if (controls) controls.style.display = 'none'
      if (attribution) attribution.style.display = 'none'
      if (background) background.style.display = 'none'
      panels.forEach((panel, i) => {
        panelDisplays[i] = (panel as HTMLElement).style.display
        ;(panel as HTMLElement).style.display = 'none'
      })

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 150))

      // Capture with html-to-image
      const dataUrl = await toPng(flowContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: contentWidth,
        height: contentHeight,
      })

      // Restore original styles
      viewport.style.transform = originalViewportTransform
      flowContainer.style.width = originalContainerWidth
      flowContainer.style.height = originalContainerHeight
      flowContainer.style.overflow = originalContainerOverflow

      if (controls) controls.style.display = originalControlsDisplay || ''
      if (attribution) attribution.style.display = originalAttributionDisplay || ''
      if (background) background.style.display = originalBackgroundDisplay || ''
      panels.forEach((panel, i) => {
        ;(panel as HTMLElement).style.display = panelDisplays[i] || ''
      })

      console.log('getDiagramImage: Image captured successfully, length:', dataUrl?.length)
      return dataUrl
    } catch (error) {
      console.error('Error capturing diagram:', error)
      return null
    }
  }, [])

  // Expose the getDiagramImage function to parent
  useEffect(() => {
    if (onImageCaptureReady) {
      onImageCaptureReady(getDiagramImage)
    }
  }, [onImageCaptureReady, getDiagramImage])

  return (
    <div className="w-full h-[600px] border rounded-lg bg-white causal-tree-diagram">
      <style>{`
        .causal-tree-diagram .react-flow__edges {
          z-index: 0 !important;
        }
        .causal-tree-diagram .react-flow__nodes {
          z-index: 1 !important;
        }
        .causal-tree-diagram .react-flow__edge {
          z-index: 0 !important;
        }
        .causal-tree-diagram .react-flow__node {
          z-index: 1 !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        elevateNodesOnSelect={true}
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
            onClick={handleResetLayout}
            className="shadow-md"
            title="Restablecer posiciones del árbol"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restablecer
          </Button>
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

        <Panel position="bottom-left" className="bg-white p-3 rounded-md shadow-md border">
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-gray-900 border-b pb-1">Simbología</div>

            {/* Formas de nodos */}
            <div className="space-y-1">
              <div className="font-medium text-gray-700">Tipo de Hecho:</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-100"></div>
                <span>Variación (algo que cambió)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
                <span>Permanente (condición preexistente)</span>
              </div>
            </div>

            {/* Tipos de línea */}
            <div className="space-y-1 pt-1 border-t">
              <div className="font-medium text-gray-700">Vinculación:</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-600"></div>
                <span>Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="32" height="2">
                  <line x1="0" y1="1" x2="32" y2="1" stroke="#6b7280" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
                <span>Aparente (no confirmada)</span>
              </div>
            </div>

            {/* Relaciones */}
            <div className="space-y-1 pt-1 border-t">
              <div className="font-medium text-gray-700">Relación:</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-600"></div>
                <span>→ Cadena</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span>∧ Conjuntiva (Y)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500"></div>
                <span>∨ Disyuntiva (O)</span>
              </div>
            </div>

            {/* Colores de nodos */}
            <div className="space-y-1 pt-1 border-t">
              <div className="font-medium text-gray-700">Tipo de Nodo:</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Evento Final (lesión)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Hecho Intermedio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Causa Raíz</span>
              </div>
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
          existingNodes={analysis.nodes}
          onSubmit={handleNodeSubmit}
        />
      )}
    </div>
  )
}
