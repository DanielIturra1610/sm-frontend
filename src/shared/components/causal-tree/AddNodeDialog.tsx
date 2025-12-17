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
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { X, ChevronDown, ChevronRight, Circle, Square, Check, Target, Link2 } from 'lucide-react'
import type {
  NodeType,
  RelationType,
  FactType,
  LinkType,
  AddCausalNodeDTO,
  CausalNode,
  ParentLink
} from '@/shared/types/causal-tree'

interface AddNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  parentNodeId?: string
  existingNodes?: CausalNode[]
  onSubmit: (data: AddCausalNodeDTO) => void
  isLoading?: boolean
}

export function AddNodeDialog({
  open,
  onOpenChange,
  analysisId,
  parentNodeId,
  existingNodes = [],
  onSubmit,
  isLoading = false,
}: AddNodeDialogProps) {
  const [formData, setFormData] = useState<Partial<AddCausalNodeDTO>>({
    fact: '',
    nodeType: 'intermediate',
    factType: 'variacion',
    relationType: 'chain',
    parentNodes: parentNodeId ? [parentNodeId] : [],
    parentLinks: parentNodeId ? [{ parentNodeId, linkType: 'confirmada' }] : [],
    evidence: [],
  })
  const [newEvidence, setNewEvidence] = useState('')
  const [selectedParents, setSelectedParents] = useState<Map<string, LinkType>>(
    new Map(parentNodeId ? [[parentNodeId, 'confirmada']] : [])
  )
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get parent node for display
  const getParentNode = (id: string) => existingNodes.find(n => n.id === id)
  const selectedParentNode = parentNodeId ? getParentNode(parentNodeId) : null

  // Reset form when dialog opens/closes or parentNodeId changes
  useEffect(() => {
    if (open) {
      const initialParents = new Map<string, LinkType>()
      if (parentNodeId) {
        initialParents.set(parentNodeId, 'confirmada')
      }
      setSelectedParents(initialParents)
      setFormData({
        fact: '',
        nodeType: 'intermediate',
        factType: 'variacion',
        relationType: 'chain',
        parentNodes: parentNodeId ? [parentNodeId] : [],
        parentLinks: parentNodeId ? [{ parentNodeId, linkType: 'confirmada' }] : [],
        evidence: [],
      })
      setShowAdvanced(false)
    }
  }, [open, parentNodeId])

  // Update relationType based on number of parents
  useEffect(() => {
    if (selectedParents.size > 1 && formData.relationType === 'chain') {
      setFormData(prev => ({ ...prev, relationType: 'conjunctive' }))
    } else if (selectedParents.size <= 1 && formData.relationType !== 'chain') {
      setFormData(prev => ({ ...prev, relationType: 'chain' }))
    }
  }, [selectedParents.size, formData.relationType])

  const handleParentToggle = (nodeId: string, checked: boolean) => {
    const newParents = new Map(selectedParents)
    if (checked) {
      newParents.set(nodeId, 'confirmada')
    } else {
      newParents.delete(nodeId)
    }
    setSelectedParents(newParents)

    const parentLinks: ParentLink[] = Array.from(newParents.entries()).map(([id, type]) => ({
      parentNodeId: id,
      linkType: type,
    }))
    setFormData(prev => ({
      ...prev,
      parentNodes: Array.from(newParents.keys()),
      parentLinks,
    }))
  }

  const handleLinkTypeChange = (nodeId: string, linkType: LinkType) => {
    const newParents = new Map(selectedParents)
    newParents.set(nodeId, linkType)
    setSelectedParents(newParents)

    const parentLinks: ParentLink[] = Array.from(newParents.entries()).map(([id, type]) => ({
      parentNodeId: id,
      linkType: type,
    }))
    setFormData(prev => ({ ...prev, parentLinks }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fact?.trim()) return

    // Determine the effect node:
    // - If parentNodeId is provided (clicked "+" on a node), use it as the effect
    // - Otherwise, use the first manually selected "parent" as the effect (since we're asking "this node is cause of which effect?")
    const effectNodeId = parentNodeId || (selectedParents.size > 0 ? Array.from(selectedParents.keys())[0] : undefined)

    onSubmit({
      analysisId,
      fact: formData.fact,
      nodeType: formData.nodeType as NodeType,
      factType: formData.factType as FactType,
      relationType: formData.relationType as RelationType,
      effectNodeId,  // The node that this new node CAUSES
      parentNodes: [],  // No parent nodes - this new node is a cause, not an effect
      parentLinks: [],
      evidence: formData.evidence || [],
    })

    setFormData({
      fact: '',
      nodeType: 'intermediate',
      factType: 'variacion',
      relationType: 'chain',
      parentNodes: [],
      parentLinks: [],
      evidence: [],
    })
    setSelectedParents(new Map())
    setNewEvidence('')
  }

  const handleAddEvidence = () => {
    if (newEvidence.trim()) {
      setFormData({
        ...formData,
        evidence: [...(formData.evidence || []), newEvidence.trim()],
      })
      setNewEvidence('')
    }
  }

  const handleRemoveEvidence = (index: number) => {
    setFormData({
      ...formData,
      evidence: formData.evidence?.filter((_, i) => i !== index) || [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            {selectedParentNode
              ? `¿Por qué ocurrió el hecho #${selectedParentNode.numero}?`
              : 'Agregar nuevo hecho'
            }
          </DialogTitle>
          {selectedParentNode && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
              <span className="text-muted-foreground">Antecedente:</span>{' '}
              <span className="font-medium">{selectedParentNode.fact}</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
          {/* Hecho Objetivo - Campo principal destacado */}
          <div className="space-y-2">
            <Label htmlFor="fact" className="text-sm font-medium">
              Describe el hecho que causó esto
            </Label>
            <Textarea
              id="fact"
              placeholder="Ej: El trabajador no usaba casco de seguridad"
              value={formData.fact}
              onChange={(e) => setFormData({ ...formData, fact: e.target.value })}
              required
              rows={2}
              className="resize-none text-base"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Describe objetivamente, sin juicios (evita: "mal", "incorrectamente")
            </p>
          </div>

          {/* Tipo de Hecho - Simplificado con íconos claros */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">¿Qué tipo de hecho es?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, factType: 'variacion' })}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${formData.factType === 'variacion'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                  ${formData.factType === 'variacion' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                `}>
                  <Circle className={`h-3.5 w-3.5 ${formData.factType === 'variacion' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">Cambio</div>
                  <div className="text-xs text-muted-foreground">Algo que cambió</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, factType: 'permanente' })}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${formData.factType === 'permanente'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded border-2 flex items-center justify-center shrink-0
                  ${formData.factType === 'permanente' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                `}>
                  <Square className={`h-3.5 w-3.5 ${formData.factType === 'permanente' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">Condición</div>
                  <div className="text-xs text-muted-foreground">Ya existía antes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Selección de antecedente (efecto) - VISIBLE cuando no hay padre pre-seleccionado */}
          {!parentNodeId && existingNodes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-700">
                ¿Este hecho es causa de cuál efecto?
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecciona el nodo que es consecuencia de este hecho
              </p>
              <div className="border-2 border-orange-200 rounded-lg p-2 max-h-40 overflow-y-auto overflow-x-hidden space-y-1 bg-orange-50/50">
                {existingNodes.map((node) => (
                  <label
                    key={node.id}
                    className={`
                      flex items-center gap-2 p-2 rounded cursor-pointer transition-colors overflow-hidden
                      ${selectedParents.has(node.id)
                        ? 'bg-orange-100 border border-orange-300'
                        : 'hover:bg-white border border-transparent'}
                    `}
                  >
                    <Checkbox
                      checked={selectedParents.has(node.id)}
                      onCheckedChange={(checked) => handleParentToggle(node.id, checked as boolean)}
                      className="shrink-0"
                    />
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${
                        node.nodeType === 'final_event' ? 'bg-red-100 text-red-700 border-red-300' :
                        node.nodeType === 'root_cause' ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-blue-100 text-blue-700 border-blue-300'
                      }`}
                    >
                      #{node.numero}
                    </Badge>
                    <span className="text-sm truncate flex-1 min-w-0">{node.fact}</span>
                  </label>
                ))}
              </div>
              {selectedParents.size === 0 && (
                <p className="text-xs text-orange-600 font-medium">
                  ⚠️ Sin seleccionar un efecto, este nodo quedará desconectado del árbol
                </p>
              )}
            </div>
          )}

          {/* ¿Es causa raíz? - Simplificado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">¿Puedes seguir preguntando "por qué"?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, nodeType: 'intermediate' })}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${formData.nodeType === 'intermediate'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                  ${formData.nodeType === 'intermediate' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}
                `}>
                  <Link2 className={`h-3.5 w-3.5 ${formData.nodeType === 'intermediate' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">Sí, tiene causas</div>
                  <div className="text-xs text-muted-foreground">Hecho intermedio</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, nodeType: 'root_cause' })}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                  ${formData.nodeType === 'root_cause'
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
                  ${formData.nodeType === 'root_cause' ? 'border-green-500 bg-green-100' : 'border-gray-300'}
                `}>
                  <Target className={`h-3.5 w-3.5 ${formData.nodeType === 'root_cause' ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">No, es la causa raíz</div>
                  <div className="text-xs text-muted-foreground">Origen del problema</div>
                </div>
              </button>
            </div>
          </div>

          {/* Sección colapsable de opciones avanzadas */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>Opciones avanzadas</span>
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2 overflow-hidden">
              {/* Vinculación con antecedente */}
              {selectedParentNode && (
                <div className="space-y-2">
                  <Label className="text-sm">Tipo de vinculación</Label>
                  <Select
                    value={selectedParents.get(parentNodeId!) || 'confirmada'}
                    onValueChange={(value) => handleLinkTypeChange(parentNodeId!, value as LinkType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmada">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-0.5 bg-gray-600" />
                          <span>Confirmada</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="aparente">
                        <div className="flex items-center gap-2">
                          <svg width="24" height="2">
                            <line x1="0" y1="1" x2="24" y2="1" stroke="#6b7280" strokeWidth="2" strokeDasharray="4,4" />
                          </svg>
                          <span>Aparente</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Selección de múltiples antecedentes */}
              {existingNodes.length > 1 && (
                <div className="space-y-2 overflow-hidden">
                  <Label className="text-sm">Conectar con otros hechos</Label>
                  <div className="border rounded-lg p-2 max-h-32 overflow-y-auto overflow-x-hidden space-y-1">
                    {existingNodes
                      .filter(node => node.id !== parentNodeId)
                      .map((node) => (
                        <label
                          key={node.id}
                          className={`
                            flex items-center gap-2 p-2 rounded cursor-pointer transition-colors min-w-0
                            ${selectedParents.has(node.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                          `}
                        >
                          <Checkbox
                            checked={selectedParents.has(node.id)}
                            onCheckedChange={(checked) => handleParentToggle(node.id, checked as boolean)}
                            className="shrink-0"
                          />
                          <Badge variant="outline" className="text-xs shrink-0">
                            #{node.numero}
                          </Badge>
                          <span className="text-sm truncate min-w-0">{node.fact}</span>
                        </label>
                      ))}
                  </div>
                  {selectedParents.size > 1 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        ¿Cómo se relacionan?
                      </Label>
                      <Select
                        value={formData.relationType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, relationType: value as RelationType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conjunctive">
                            Todos necesarios (Y)
                          </SelectItem>
                          <SelectItem value="disjunctive">
                            Cualquiera suficiente (O)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Evidencia */}
              <div className="space-y-2">
                <Label className="text-sm">Evidencia (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Foto, testimonio, registro..."
                    value={newEvidence}
                    onChange={(e) => setNewEvidence(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddEvidence()
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvidence}
                    disabled={!newEvidence.trim()}
                  >
                    +
                  </Button>
                </div>
                {formData.evidence && formData.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.evidence.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs gap-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Footer con botones */}
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
              disabled={isLoading || !formData.fact?.trim()}
              className="gap-2"
            >
              {isLoading ? (
                'Agregando...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Agregar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
