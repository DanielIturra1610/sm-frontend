'use client'

import React, { useState } from 'react'
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
import { X } from 'lucide-react'
import type { NodeType, RelationType, AddCausalNodeDTO } from '@/shared/types/causal-tree'

interface AddNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisId: string
  parentNodeId?: string
  onSubmit: (data: AddCausalNodeDTO) => void
  isLoading?: boolean
}

export function AddNodeDialog({
  open,
  onOpenChange,
  analysisId,
  parentNodeId,
  onSubmit,
  isLoading = false,
}: AddNodeDialogProps) {
  const [formData, setFormData] = useState<Partial<AddCausalNodeDTO>>({
    fact: '',
    nodeType: 'intermediate',
    relationType: 'chain',
    parentNodes: parentNodeId ? [parentNodeId] : [],
    evidence: [],
  })
  const [newEvidence, setNewEvidence] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fact?.trim()) return

    onSubmit({
      analysisId,
      fact: formData.fact,
      nodeType: formData.nodeType as NodeType,
      relationType: formData.relationType as RelationType,
      parentNodes: formData.parentNodes || [],
      evidence: formData.evidence || [],
    })

    // Reset form
    setFormData({
      fact: '',
      nodeType: 'intermediate',
      relationType: 'chain',
      parentNodes: parentNodeId ? [parentNodeId] : [],
      evidence: [],
    })
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nodo Causal</DialogTitle>
          <DialogDescription>
            Describe el hecho objetivo que contribuyó al evento. Evita juicios e interpretaciones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fact">Hecho Objetivo *</Label>
            <Textarea
              id="fact"
              placeholder="Describe el hecho de manera objetiva..."
              value={formData.fact}
              onChange={(e) => setFormData({ ...formData, fact: e.target.value })}
              required
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nodeType">Tipo de Nodo *</Label>
              <Select
                value={formData.nodeType}
                onValueChange={(value) =>
                  setFormData({ ...formData, nodeType: value as NodeType })
                }
              >
                <SelectTrigger id="nodeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="root_cause">Causa Raíz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationType">Tipo de Relación *</Label>
              <Select
                value={formData.relationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, relationType: value as RelationType })
                }
              >
                <SelectTrigger id="relationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chain">Cadena (A → B)</SelectItem>
                  <SelectItem value="conjunctive">Conjuntiva (A ∧ B → C)</SelectItem>
                  <SelectItem value="disjunctive">Disyuntiva (A ∨ B → C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidencia</Label>
            <div className="flex gap-2">
              <Input
                id="evidence"
                placeholder="Agregar evidencia objetiva..."
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEvidence()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEvidence}
                disabled={!newEvidence.trim()}
              >
                Agregar
              </Button>
            </div>

            {formData.evidence && formData.evidence.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.evidence.map((item, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.fact?.trim()}>
              {isLoading ? 'Agregando...' : 'Agregar Nodo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
