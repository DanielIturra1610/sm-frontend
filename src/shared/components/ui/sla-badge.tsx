"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const slaBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
  {
    variants: {
      status: {
        on_time: "bg-green-50 text-green-700 border border-green-200",
        at_risk: "bg-amber-50 text-amber-700 border border-amber-200",
        overdue: "bg-red-50 text-red-700 border border-red-200",
        completed: "bg-blue-50 text-blue-700 border border-blue-200",
        not_set: "bg-gray-50 text-gray-500 border border-gray-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "not_set",
      size: "default",
    },
  }
)

export type SLAStatus = "on_time" | "at_risk" | "overdue" | "completed" | "not_set"

export interface SLABadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof slaBadgeVariants> {
  deadline?: string | Date | null
  slaStatus?: string | null
  showIcon?: boolean
  showTimeRemaining?: boolean
}

function formatTimeRemaining(deadline: Date): string {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()

  if (diff <= 0) {
    const overdueDiff = Math.abs(diff)
    const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d overdue`
    }
    return `${hours}h overdue`
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0) {
    return `${days}d ${remainingHours}h left`
  }
  return `${hours}h left`
}

function getSLAStatusFromDeadline(deadline: Date | null): SLAStatus {
  if (!deadline) return "not_set"

  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hoursRemaining = diff / (1000 * 60 * 60)

  if (diff <= 0) return "overdue"
  if (hoursRemaining <= 24) return "at_risk"
  return "on_time"
}

const statusLabels: Record<SLAStatus, string> = {
  on_time: "On Time",
  at_risk: "At Risk",
  overdue: "Overdue",
  completed: "Completed",
  not_set: "No SLA",
}

const statusIcons: Record<SLAStatus, React.ReactNode> = {
  on_time: <CheckCircle className="h-3 w-3" />,
  at_risk: <AlertTriangle className="h-3 w-3" />,
  overdue: <XCircle className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  not_set: <Clock className="h-3 w-3" />,
}

function SLABadge({
  className,
  deadline,
  slaStatus,
  size,
  showIcon = true,
  showTimeRemaining = true,
  ...props
}: SLABadgeProps) {
  const deadlineDate = deadline
    ? (typeof deadline === 'string' ? new Date(deadline) : deadline)
    : null

  // Determine status - use provided slaStatus or calculate from deadline
  let status: SLAStatus = "not_set"
  if (slaStatus) {
    status = slaStatus as SLAStatus
  } else if (deadlineDate) {
    status = getSLAStatusFromDeadline(deadlineDate)
  }

  const timeRemaining = deadlineDate && showTimeRemaining && status !== "completed" && status !== "not_set"
    ? formatTimeRemaining(deadlineDate)
    : null

  return (
    <span
      data-slot="sla-badge"
      className={cn(slaBadgeVariants({ status, size, className }))}
      {...props}
    >
      {showIcon && statusIcons[status]}
      <span>{statusLabels[status]}</span>
      {timeRemaining && (
        <span className="text-[10px] opacity-80">({timeRemaining})</span>
      )}
    </span>
  )
}

// Helper component for displaying SLA deadline as formatted date
export function SLADeadlineDisplay({
  deadline,
  className,
}: {
  deadline?: string | Date | null
  className?: string
}) {
  if (!deadline) return null

  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline

  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      Due: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

// Compact version showing only time remaining
export function SLATimeRemaining({
  deadline,
  className,
}: {
  deadline?: string | Date | null
  className?: string
}) {
  if (!deadline) return null

  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const status = getSLAStatusFromDeadline(deadlineDate)
  const timeRemaining = formatTimeRemaining(deadlineDate)

  const colorClasses = {
    on_time: "text-green-600",
    at_risk: "text-amber-600",
    overdue: "text-red-600",
    completed: "text-blue-600",
    not_set: "text-gray-500",
  }

  return (
    <span className={cn("text-xs font-medium", colorClasses[status], className)}>
      {timeRemaining}
    </span>
  )
}

export { SLABadge, slaBadgeVariants }
