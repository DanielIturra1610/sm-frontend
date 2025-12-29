/**
 * ReportTimeline Component
 * Displays a beautiful timeline of all reports linked to an incident
 * with clickable links to each report's detail page
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Zap,
  AlertTriangle,
  Search,
  ClipboardList,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  GitBranch,
  Network,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PrefillData } from '@/shared/types/api'

interface ReportTimelineProps {
  prefillData: PrefillData | null | undefined
  isLoading?: boolean
  incidentId?: string
}

interface TimelineItem {
  id: string
  type: string
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  href: string
  status?: 'completed' | 'draft' | 'in_progress'
  date?: string
  description?: string
  order: number
}

const REPORT_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  basePath: string
  order: number
}> = {
  flash_report: {
    label: 'Flash Report',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    basePath: '/reports/flash',
    order: 1,
  },
  immediate_actions: {
    label: 'Acciones Inmediatas',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    basePath: '/reports/immediate-actions',
    order: 2,
  },
  root_cause: {
    label: 'Causa Raíz',
    icon: <Search className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    basePath: '/reports/root-cause',
    order: 3,
  },
  five_whys: {
    label: '5 Porqués',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    basePath: '/root-cause-analysis/five-whys',
    order: 4,
  },
  fishbone: {
    label: 'Diagrama Ishikawa',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    basePath: '/root-cause-analysis/fishbone',
    order: 5,
  },
  causal_tree: {
    label: 'Árbol Causal',
    icon: <Network className="h-5 w-5" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    basePath: '/root-cause-analysis/causal-tree',
    order: 6,
  },
  action_plan: {
    label: 'Plan de Acción',
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    basePath: '/reports/action-plan',
    order: 7,
  },
  zero_tolerance: {
    label: 'Tolerancia Cero',
    icon: <ShieldAlert className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    basePath: '/reports/zero-tolerance',
    order: 8,
  },
  final_report: {
    label: 'Informe Final',
    icon: <FileCheck className="h-5 w-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    basePath: '/reports/final',
    order: 9,
  },
}

export function ReportTimeline({ prefillData, isLoading, incidentId }: ReportTimelineProps) {
  const timelineItems = useMemo(() => {
    if (!prefillData?.source_reports) return []

    const items: TimelineItem[] = []
    const sr = prefillData.source_reports

    // Flash Report
    if (sr.flash_report_id) {
      const config = REPORT_CONFIG.flash_report
      items.push({
        id: sr.flash_report_id,
        type: 'flash_report',
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        href: `${config.basePath}/${sr.flash_report_id}`,
        status: 'completed',
        order: config.order,
        description: 'Reporte inicial del incidente',
      })
    }

    // Immediate Actions
    if (sr.immediate_actions_id) {
      const config = REPORT_CONFIG.immediate_actions
      items.push({
        id: sr.immediate_actions_id,
        type: 'immediate_actions',
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        href: `${config.basePath}/${sr.immediate_actions_id}`,
        status: 'completed',
        order: config.order,
        description: 'Acciones tomadas inmediatamente',
      })
    }

    // Root Cause
    if (sr.root_cause_id) {
      const config = REPORT_CONFIG.root_cause
      items.push({
        id: sr.root_cause_id,
        type: 'root_cause',
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        href: `${config.basePath}/${sr.root_cause_id}`,
        status: 'completed',
        order: config.order,
        description: 'Análisis de causa raíz',
      })
    }

    // Five Whys (multiple)
    if (sr.five_whys_ids?.length) {
      const config = REPORT_CONFIG.five_whys
      sr.five_whys_ids.forEach((id, index) => {
        items.push({
          id,
          type: 'five_whys',
          label: sr.five_whys_ids!.length > 1 ? `${config.label} #${index + 1}` : config.label,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
          borderColor: config.borderColor,
          href: `${config.basePath}/${id}`,
          status: 'completed',
          order: config.order + (index * 0.1),
          description: 'Análisis de los 5 porqués',
        })
      })
    }

    // Fishbone (multiple)
    if (sr.fishbone_ids?.length) {
      const config = REPORT_CONFIG.fishbone
      sr.fishbone_ids.forEach((id, index) => {
        items.push({
          id,
          type: 'fishbone',
          label: sr.fishbone_ids!.length > 1 ? `${config.label} #${index + 1}` : config.label,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
          borderColor: config.borderColor,
          href: `${config.basePath}/${id}`,
          status: 'completed',
          order: config.order + (index * 0.1),
          description: 'Diagrama causa-efecto',
        })
      })
    }

    // Causal Tree (multiple)
    if (sr.causal_tree_ids?.length) {
      const config = REPORT_CONFIG.causal_tree
      sr.causal_tree_ids.forEach((id, index) => {
        items.push({
          id,
          type: 'causal_tree',
          label: sr.causal_tree_ids!.length > 1 ? `${config.label} #${index + 1}` : config.label,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
          borderColor: config.borderColor,
          href: `${config.basePath}/${id}`,
          status: 'completed',
          order: config.order + (index * 0.1),
          description: 'Árbol de causas',
        })
      })
    }

    // Action Plan
    if (sr.action_plan_id) {
      const config = REPORT_CONFIG.action_plan
      items.push({
        id: sr.action_plan_id,
        type: 'action_plan',
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        href: `${config.basePath}/${sr.action_plan_id}`,
        status: 'completed',
        order: config.order,
        description: 'Plan de acciones correctivas',
      })
    }

    // Zero Tolerance
    if (sr.zero_tolerance_id) {
      const config = REPORT_CONFIG.zero_tolerance
      items.push({
        id: sr.zero_tolerance_id,
        type: 'zero_tolerance',
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        href: `${config.basePath}/${sr.zero_tolerance_id}`,
        status: 'completed',
        order: config.order,
        description: 'Reporte de tolerancia cero',
      })
    }

    // Sort by order
    return items.sort((a, b) => a.order - b.order)
  }, [prefillData])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prefillData || timelineItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <FileText className="h-5 w-5" />
            Historial de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {incidentId
                ? 'No hay reportes previos vinculados a este suceso'
                : 'Seleccione un suceso para ver los reportes vinculados'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Historial de Reportes
            <Badge variant="secondary" className="ml-2">
              {timelineItems.length} reporte{timelineItems.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {timelineItems.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 flex items-center gap-4">
                {/* Timeline indicator */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${item.bgColor} ${item.borderColor} border-2 flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  {index < timelineItems.length - 1 && (
                    <div className="absolute top-12 w-0.5 h-8 bg-gray-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : item.status === 'in_progress'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {item.status === 'completed' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Completado</>
                      ) : item.status === 'in_progress' ? (
                        <><Clock className="h-3 w-3 mr-1" /> En progreso</>
                      ) : (
                        'Borrador'
                      )}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(item.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Final Report indicator */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-white border-t border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-800">Informe Final</h4>
              <p className="text-sm text-emerald-600">
                Consolidación de toda la información recopilada
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white">
              En creación
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
