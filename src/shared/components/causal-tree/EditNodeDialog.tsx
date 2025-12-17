'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Circle, Square, Link2, Target, Check, AlertTriangle } from 'lucide-react'
import type {
  NodeType,
  RelationType,
  FactType,
  LinkType,
  UpdateCausalNodeDTO,
  CausalNode,
  ParentLink
} from '@/shared/types/causal-tree'

interface EditNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node: CausalNode | null
  existingNodes: CausalNode[]
  onSubmit: (nodeId: string, data: UpdateCausalNodeDTO) => void
  isLoading?: boolean
}

export function EditNodeDialog({
  open,
  onOpenChange,
  node,
  existingNodes,
  onSubmit,
  isLoading = false,
}: EditNodeDialogProps) {
  const [fact, setFact] = useState('')
  const [factType, setFactType] = useState<FactType>('variacion')
  const [nodeType, setNodeType] = useState<NodeType>('intermediate')
  const [selectedParents, setSelectedParents] = useState<Map<string, LinkType>>(new Map())

  // Reset form when node changes
  useEffect(() => {
    if (node && open) {
      setFact(node.fact)
      setFactType(node.factType)
      setNodeType(node.nodeType)

      // Initialize selected parents from node's parentNodes
      const initialParents = new Map<string, LinkType>()
      if (node.parentNodes) {
        node.parentNodes.forEach(parentId => {
          initialParents.set(parentId, 'confirmada')
        })
      }
      setSelectedParents(initialParents)
    }
  }, [node, open])

  const handleParentToggle = (nodeId: string, checked: boolean) => {
    const newParents = new Map(selectedParents)
    if (checked) {
      newParents.set(nodeId, 'confirmada')
    } else {
      newParents.delete(nodeId)
    }
    setSelectedParents(newParents)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!node || !fact.trim()) return

    const parentLinks: ParentLink[] = Array.from(selectedParents.entries()).map(([id, type]) => ({
      parentNodeId: id,
      linkType: type,
    }))

    // Determine relationType based on number of parents
    let relationType: RelationType = 'chain'
    if (selectedParents.size > 1) {
      relationType = 'conjunctive'
    }

    onSubmit(node.id, {
      fact,
      factType,
      nodeType,
      parentNodes: Array.from(selectedParents.keys()),
      parentLinks,
      relationType,
    })
  }

  if (!node) return null

  // Get available nodes to connect to (excluding self and nodes that would create cycles)
  const availableParentNodes = existingNodes.filter(n => {
    if (n.id === node.id) return false // Can't be own parent
    // Exclude nodes that are children of this node (would create cycle)
    if (n.parentNodes?.includes(node.id)) return false
    return true
  })

  const hasChangedParents = () => {
    const currentParents = new Set(node.parentNodes || [])
    const newParents = new Set(selectedParents.keys())
    if (currentParents.size !== newParents.size) return true
    for (const p of currentParents) {
      if (!newParents.has(p)) return true
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            Editar Hecho #{node.numero}
          </DialogTitle>
          <DialogDescription>
            Modifica el contenido o las conexiones de este nodo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hecho */}
          <div className="space-y-2">
            <Label htmlFor="fact" className="text-sm font-medium">
              Descripción del hecho
            </Label>
            <Textarea
              id="fact"
              value={fact}
              onChange={(e) => setFact(e.target.value)}
              required
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Tipo de Hecho */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de hecho</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFactType('variacion')}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${factType === 'variacion'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${factType === 'variacion' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                `}>
                  <Circle className={`h-3 w-3 ${factType === 'variacion' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-medium">Cambio</span>
              </button>

              <button
                type="button"
                onClick={() => setFactType('permanente')}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${factType === 'permanente'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center
                  ${factType === 'permanente' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                `}>
                  <Square className={`h-3 w-3 ${factType === 'permanente' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-medium">Condición</span>
              </button>
            </div>
          </div>

          {/* Tipo de Nodo */}
          {node.nodeType !== 'final_event' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Clasificación</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNodeType('intermediate')}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                    ${nodeType === 'intermediate'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Link2 className={`h-4 w-4 ${nodeType === 'intermediate' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm">Intermedio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNodeType('root_cause')}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                    ${nodeType === 'root_cause'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Target className={`h-4 w-4 ${nodeType === 'root_cause' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm">Causa Raíz</span>
                </button>
              </div>
            </div>
          )}

          {/* Conexiones (Este es el efecto de...) */}
          {node.nodeType !== 'final_event' && availableParentNodes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-700">
                Este nodo es causado por:
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecciona los nodos que son causas/antecedentes de este hecho
              </p>
              <div className="border-2 border-blue-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1 bg-blue-50/50">
                {availableParentNodes.map((n) => (
                  <label
                    key={n.id}
                    className={`
                      flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
                      ${selectedParents.has(n.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-white border border-transparent'}
                    `}
                  >
                    <Checkbox
                      checked={selectedParents.has(n.id)}
                      onCheckedChange={(checked) => handleParentToggle(n.id, checked as boolean)}
                    />
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        n.nodeType === 'final_event' ? 'bg-red-100 text-red-700 border-red-300' :
                        n.nodeType === 'root_cause' ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-blue-100 text-blue-700 border-blue-300'
                      }`}
                    >
                      #{n.numero}
                    </Badge>
                    <span className="text-sm truncate">{n.fact}</span>
                  </label>
                ))}
              </div>

              {selectedParents.size === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Sin causas seleccionadas, este nodo quedará aislado del árbol
                </div>
              )}

              {hasChangedParents() && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Las conexiones han sido modificadas
                </div>
              )}
            </div>
          )}

          {/* Info para evento final */}
          {node.nodeType === 'final_event' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              El evento final es la raíz del árbol y no puede conectarse a otros nodos como causa.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !fact.trim()}
              className="gap-2"
            >
              {isLoading ? (
                'Guardando...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
