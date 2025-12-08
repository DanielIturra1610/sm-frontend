'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Skull, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PLGFLevel } from "@/shared/types/api"

const plgfBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      level: {
        potencial: "border-yellow-500 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        real: "border-orange-500 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        fatal: "border-red-600 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      },
    },
    defaultVariants: {
      level: "potencial",
    },
  }
)

const levelConfig: Record<PLGFLevel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  potencial: { label: "PLGF Potencial", icon: AlertCircle },
  real: { label: "PLGF Real", icon: AlertTriangle },
  fatal: { label: "PLGF Fatal", icon: Skull },
}

export interface PLGFBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof plgfBadgeVariants> {
  level: PLGFLevel
  showIcon?: boolean
  showLabel?: boolean
}

function PLGFBadge({
  className,
  level,
  showIcon = true,
  showLabel = true,
  ...props
}: PLGFBadgeProps) {
  const config = levelConfig[level]
  const Icon = config.icon

  return (
    <div className={cn(plgfBadgeVariants({ level }), className)} {...props}>
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

export { PLGFBadge, plgfBadgeVariants }
