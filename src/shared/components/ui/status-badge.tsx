"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        // Incident Status Variants
        reported: "bg-blue-50 text-blue-700 border border-blue-200",
        investigating: "bg-amber-50 text-amber-700 border border-amber-200",
        in_progress: "bg-orange-50 text-orange-700 border border-orange-200",
        resolved: "bg-green-50 text-green-700 border border-green-200",
        closed: "bg-gray-50 text-gray-700 border border-gray-200",

        // Incident Severity Variants
        low: "bg-blue-50 text-blue-700 border border-blue-200",
        medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        high: "bg-orange-50 text-orange-700 border border-orange-200",
        critical: "bg-red-50 text-red-700 border border-red-200",

        // Incident Type Variants
        safety: "bg-red-50 text-red-700 border border-red-200",
        security: "bg-purple-50 text-purple-700 border border-purple-200",
        environmental: "bg-green-50 text-green-700 border border-green-200",
        quality: "bg-blue-50 text-blue-700 border border-blue-200",
        operational: "bg-gray-50 text-gray-700 border border-gray-200",

        // Generic Status Variants
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-error/10 text-error border border-error/20",
        info: "bg-info/10 text-info border border-info/20",
        default: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      withDot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      withDot: false,
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  dotColor?: string
}

function StatusBadge({
  className,
  variant,
  size,
  withDot,
  dotColor,
  children,
  ...props
}: StatusBadgeProps) {
  const dotColorMap = {
    // Status dot colors
    reported: "bg-blue-500",
    investigating: "bg-amber-500",
    in_progress: "bg-orange-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",

    // Severity dot colors
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",

    // Type dot colors
    safety: "bg-red-500",
    security: "bg-purple-500",
    environmental: "bg-green-500",
    quality: "bg-blue-500",
    operational: "bg-gray-500",

    // Generic dot colors
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
    default: "bg-gray-500",
  }

  const getDotColor = () => {
    if (dotColor) return dotColor
    if (variant && dotColorMap[variant]) return dotColorMap[variant]
    return "bg-gray-500"
  }

  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ variant, size, withDot, className }))}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "size-1.5 rounded-full flex-shrink-0",
            getDotColor()
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// Helper functions for incident-specific badges
export function IncidentStatusBadge({
  status,
  withDot = true,
  ...props
}: {
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed'
  withDot?: boolean
} & Omit<StatusBadgeProps, 'variant' | 'children'>) {
  const statusLabels = {
    reported: "Reported",
    investigating: "Investigating",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed"
  }

  return (
    <StatusBadge variant={status} withDot={withDot} {...props}>
      {statusLabels[status]}
    </StatusBadge>
  )
}

export function IncidentSeverityBadge({
  severity,
  withDot = true,
  ...props
}: {
  severity: 'low' | 'medium' | 'high' | 'critical'
  withDot?: boolean
} & Omit<StatusBadgeProps, 'variant' | 'children'>) {
  const severityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical"
  }

  return (
    <StatusBadge variant={severity} withDot={withDot} {...props}>
      {severityLabels[severity]}
    </StatusBadge>
  )
}

export function IncidentTypeBadge({
  type,
  withDot = false,
  ...props
}: {
  type: 'safety' | 'security' | 'environmental' | 'quality' | 'operational'
  withDot?: boolean
} & Omit<StatusBadgeProps, 'variant' | 'children'>) {
  const typeLabels = {
    safety: "Safety",
    security: "Security",
    environmental: "Environmental",
    quality: "Quality",
    operational: "Operational"
  }

  return (
    <StatusBadge variant={type} withDot={withDot} {...props}>
      {typeLabels[type]}
    </StatusBadge>
  )
}

export { StatusBadge, statusBadgeVariants }