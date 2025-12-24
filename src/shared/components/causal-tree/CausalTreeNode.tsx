'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  GitBranch,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Circle,
  Square
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
        return <AlertTriangle className="h-3 w-3 text-red-600" />
      case 'root_cause':
        return <Target className="h-3 w-3 text-green-600" />
      default:
        return <GitBranch className="h-3 w-3 text-blue-600" />
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

  // Obtener la forma del nodo según factType
  // Círculo = variación, Cuadrado = permanente
  const isCircle = causalNode.factType === 'variacion'
  
  const getNodeShape = () => {
    return isCircle ? 'rounded-full' : 'rounded-lg'
  }

  // Para círculos: dimensiones fijas y centrado. Para cuadrados: ancho flexible
  const getNodeSize = () => {
    return isCircle 
      ? 'w-[180px] h-[180px] flex items-center justify-center' 
      : 'min-w-[160px] max-w-[220px]'
  }

  const getFactTypeIcon = () => {
    return isCircle
      ? <Circle className="h-3 w-3" />
      : <Square className="h-3 w-3" />
  }

  return (
    <>
      {/* Target Handle (entrada) */}
      {causalNode.nodeType !== 'final_event' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500 !w-2 !h-2"
          isConnectable={true}
        />
      )}

      {/* Nodo con forma según factType */}
      <div className={`${getNodeSize()} ${getNodeColor()} ${getNodeShape()} border-2 shadow-md bg-white`}>
        <div className={isCircle ? "p-4 text-center" : "p-3"}>
          {/* Header compacto */}
          <div className={"flex items-center gap-1 mb-1 " + (isCircle ? "justify-center flex-wrap" : "justify-between")}>
            <div className="flex items-center gap-1">
              {getNodeIcon()}
              {getFactTypeIcon()}
              {causalNode.isRootCause && (
                <Flag className="h-3 w-3 text-green-600" />
              )}
            </div>

            {/* Menú de opciones para TODOS los nodos (círculos y cuadrados) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(causalNode)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onMarkAsRootCause && !causalNode.isRootCause && causalNode.nodeType !== 'final_event' && (
                  <DropdownMenuItem onClick={() => onMarkAsRootCause(causalNode.id)}>
                    <Flag className="h-3 w-3 mr-2" />
                    Marcar Causa Raíz
                  </DropdownMenuItem>
                )}
                {onDelete && causalNode.nodeType !== 'final_event' && (
                  <DropdownMenuItem
                    onClick={() => onDelete(causalNode.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fact - texto principal */}
          <p className={"text-xs font-medium text-gray-900 " + (isCircle ? "line-clamp-4" : "line-clamp-3 mb-1")}>
            {causalNode.fact}
          </p>

          {/* Info adicional solo para cuadrados */}
          {!isCircle && (
            <div className="text-[10px] text-gray-500">
              N{causalNode.level}
              {causalNode.evidence && causalNode.evidence.length > 0 && (
                <span> • {causalNode.evidence.length} ev.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Source Handle (salida) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-2 !h-2"
        isConnectable={true}
      />
    </>
  )
}

export default memo(CausalTreeNode)
