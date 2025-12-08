/**
 * Report Status Badge Component
 * Displays report status with appropriate styling
 */

import { Badge } from '@/shared/components/ui/badge'
import {
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  FileCheck,
  AlertCircle,
} from 'lucide-react'
import type { ReportStatus } from '@/shared/types/api'

interface ReportStatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md' | 'lg'
}

export function ReportStatusBadge({ status, size = 'md' }: ReportStatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: 'Borrador',
      variant: 'secondary' as const,
      icon: Edit,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    submitted: {
      label: 'Enviado',
      variant: 'default' as const,
      icon: Clock,
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    under_review: {
      label: 'En Revisión',
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    },
    approved: {
      label: 'Aprobado',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    rejected: {
      label: 'Rechazado',
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    in_progress: {
      label: 'En Progreso',
      variant: 'default' as const,
      icon: Clock,
      className: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    completed: {
      label: 'Completado',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    published: {
      label: 'Publicado',
      variant: 'default' as const,
      icon: FileCheck,
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    },
    closed: {
      label: 'Cerrado',
      variant: 'secondary' as const,
      icon: CheckCircle,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  }

  const config = statusConfig[status] || statusConfig.draft
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )
}
