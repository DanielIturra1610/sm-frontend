'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  GitBranch,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Flag
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { CausalNode } from '@/shared/types/causal-tree'

interface CausalTreeNodeData {
  causalNode: CausalNode
  onEdit?: (node: CausalNode) => void
  onDelete?: (nodeId: string) => void
  onMarkAsRootCause?: (nodeId: string) => void
}

const CausalTreeNode = ({ data }: NodeProps<CausalTreeNodeData>) => {
  const { causalNode, onEdit, onDelete, onMarkAsRootCause } = data

  const getNodeIcon = () => {
    switch (causalNode.nodeType) {
      case 'final_event':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'root_cause':
        return <Target className="h-4 w-4 text-green-600" />
      default:
        return <GitBranch className="h-4 w-4 text-blue-600" />
    }
  }

  const getNodeColor = () => {
    switch (causalNode.nodeType) {
      case 'final_event':
        return 'border-red-500 bg-red-50'
      case 'root_cause':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  const getNodeTypeLabel = () => {
    switch (causalNode.nodeType) {
      case 'final_event':
        return 'Evento Final'
      case 'root_cause':
        return 'Causa Raíz'
      default:
        return 'Intermedio'
    }
  }

  const getRelationTypeLabel = () => {
    switch (causalNode.relationType) {
      case 'chain':
        return 'Cadena (A → B)'
      case 'conjunctive':
        return 'Conjuntiva (A ∧ B)'
      case 'disjunctive':
        return 'Disyuntiva (A ∨ B)'
      default:
        return ''
    }
  }

  return (
    <>
      {/* Target Handle (entrada) */}
      {causalNode.nodeType !== 'final_event' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500 !w-3 !h-3"
          isConnectable={true}
        />
      )}

      <Card className={`min-w-[280px] max-w-[350px] ${getNodeColor()} border-2 shadow-lg`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getNodeIcon()}
              <Badge variant="outline" className="text-xs">
                {getNodeTypeLabel()}
              </Badge>
              {causalNode.isRootCause && (
                <Badge className="bg-green-600 text-white text-xs">
                  <Flag className="h-3 w-3 mr-1" />
                  Raíz
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(causalNode)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onMarkAsRootCause && !causalNode.isRootCause && (
                  <DropdownMenuItem onClick={() => onMarkAsRootCause(causalNode.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Marcar como Raíz
                  </DropdownMenuItem>
                )}
                {onDelete && causalNode.nodeType !== 'final_event' && (
                  <DropdownMenuItem
                    onClick={() => onDelete(causalNode.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fact */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900 line-clamp-3">
              {causalNode.fact}
            </p>
          </div>

          {/* Relation Type */}
          {causalNode.parentNodes.length > 0 && (
            <div className="text-xs text-gray-600 mb-2">
              Relación: <span className="font-medium">{getRelationTypeLabel()}</span>
            </div>
          )}

          {/* Evidence Count */}
          {causalNode.evidence && causalNode.evidence.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Badge variant="secondary" className="text-xs">
                {causalNode.evidence.length} evidencia{causalNode.evidence.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {/* Level */}
          <div className="mt-2 text-xs text-gray-500">
            Nivel: {causalNode.level}
          </div>
        </div>
      </Card>

      {/* Source Handle (salida) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
        isConnectable={true}
      />
    </>
  )
}

export default memo(CausalTreeNode)
