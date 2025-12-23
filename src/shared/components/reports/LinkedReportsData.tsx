/**
 * LinkedReportsData Component
 * Fetches and displays comprehensive data from all linked reports for a final report
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import {
  Zap,
  AlertTriangle,
  Search,
  HelpCircle,
  GitBranch,
  Network,
  ClipboardList,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
  AlertCircle,
  Target,
  ListChecks,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Hooks
import {
  useFlashReport,
  useImmediateActionsReport,
  useRootCauseReport,
  useActionPlanReport,
} from '@/shared/hooks/report-hooks'
import {
  useFiveWhysAnalysis,
  useFishboneAnalysis,
} from '@/shared/hooks/analysis-hooks'
import { useCausalTreeAnalysis, useCausalTreeNodes } from '@/shared/hooks/causal-tree-hooks'

// Types
import type { SourceReportsInfo } from '@/shared/types/api'

interface LinkedReportsDataProps {
  sourceReports: SourceReportsInfo | null | undefined
  isLoading?: boolean
}

// Component to show Flash Report data
function FlashReportSection({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useFlashReport(reportId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!report) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {report.report_status === 'approved' ? 'Aprobado' : report.report_status === 'submitted' ? 'Enviado' : 'Borrador'}
        </Badge>
        <Link href={`/reports/flash/${reportId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver reporte completo <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {report.descripcion_evento && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Descripción del Evento</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.descripcion_evento}</p>
        </div>
      )}

      {report.acciones_inmediatas && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Acciones Inmediatas Tomadas</p>
          <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-md border-l-4 border-amber-400">{report.acciones_inmediatas}</p>
        </div>
      )}

      {report.personas_involucradas && report.personas_involucradas.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> Personas Involucradas ({report.personas_involucradas.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {report.personas_involucradas.map((persona, idx) => (
              <div key={idx} className="text-sm bg-gray-50 p-2 rounded-md">
                <span className="font-medium">{persona.nombre}</span>
                {persona.cargo && <span className="text-gray-500"> - {persona.cargo}</span>}
                {persona.tipo_lesion && <Badge variant="destructive" className="ml-2 text-xs">{persona.tipo_lesion}</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component to show Immediate Actions data
function ImmediateActionsSection({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useImmediateActionsReport(reportId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!report) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          {report.report_status === 'approved' ? 'Aprobado' : report.report_status === 'submitted' ? 'Enviado' : 'Borrador'}
        </Badge>
        <Link href={`/reports/immediate-actions/${reportId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver reporte completo <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {report.resumen_acciones && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Resumen de Acciones</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.resumen_acciones}</p>
        </div>
      )}

      {report.items && report.items.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Acciones Específicas ({report.items.length})
          </p>
          <div className="space-y-2">
            {report.items.map((item, idx) => {
              const isCompleted = item.avance_real >= 100
              const isInProgress = item.avance_real > 0 && item.avance_real < 100
              return (
                <div key={idx} className="text-sm bg-orange-50 p-3 rounded-md border-l-4 border-orange-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-medium">{item.numero || idx + 1}. {item.tarea}</span>
                      {item.responsable && (
                        <p className="text-gray-500 text-xs mt-1">Responsable: {item.responsable}</p>
                      )}
                      {item.comentario && (
                        <p className="text-gray-600 text-xs mt-1">{item.comentario}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{item.avance_real}%</span>
                      <Badge
                        variant="outline"
                        className={isCompleted ? 'bg-green-50 text-green-700' : isInProgress ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}
                      >
                        {isCompleted ? 'Completado' : isInProgress ? 'En progreso' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Component to show Root Cause Report data
function RootCauseSection({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useRootCauseReport(reportId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!report) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {report.report_status === 'approved' ? 'Aprobado' : report.report_status === 'submitted' ? 'Enviado' : 'Borrador'}
        </Badge>
        <Link href={`/reports/root-cause/${reportId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver reporte completo <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {report.descripcion_problema && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Descripción del Problema</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.descripcion_problema}</p>
        </div>
      )}

      {report.causa_raiz_identificada && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Target className="h-4 w-4" /> Causa Raíz Identificada
          </p>
          <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">{report.causa_raiz_identificada}</p>
        </div>
      )}

      {report.factores_contribuyentes && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Factores Contribuyentes</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.factores_contribuyentes}</p>
        </div>
      )}

      {report.acciones_correctivas && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Acciones Correctivas</p>
          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border-l-4 border-green-400">{report.acciones_correctivas}</p>
        </div>
      )}
    </div>
  )
}

// Component to show Five Whys Analysis data
function FiveWhysSection({ analysisId }: { analysisId: string }) {
  const { data: analysis, isLoading } = useFiveWhysAnalysis(analysisId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!analysis) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{analysis.title}</h4>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
            {analysis.status === 'approved' ? 'Aprobado' : analysis.status === 'in_review' ? 'En revisión' : 'Borrador'}
          </Badge>
        </div>
        <Link href={`/analysis/five-whys/${analysisId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver análisis <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {analysis.problemStatement && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Declaración del Problema</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{analysis.problemStatement}</p>
        </div>
      )}

      {analysis.whys && analysis.whys.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" /> Preguntas y Respuestas ({analysis.whys.length} Por Qués)
          </p>
          <div className="space-y-2">
            {analysis.whys.map((why, idx) => (
              <div
                key={idx}
                className={`text-sm p-3 rounded-md border-l-4 ${
                  why.isRootCause
                    ? 'bg-red-50 border-red-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <p className="font-medium text-gray-800">
                  ¿Por qué #{why.whyNumber}? {why.question}
                </p>
                <p className="text-gray-600 mt-1">{why.answer}</p>
                {why.isRootCause && (
                  <Badge className="mt-2 bg-red-100 text-red-800">Causa Raíz</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.rootCause && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Target className="h-4 w-4" /> Causa Raíz Final
          </p>
          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-md border-l-4 border-red-400 font-medium">{analysis.rootCause}</p>
        </div>
      )}

      {analysis.actionItems && analysis.actionItems.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Acciones Propuestas ({analysis.actionItems.length})</p>
          <div className="space-y-2">
            {analysis.actionItems.map((action, idx) => (
              <div key={idx} className="text-sm bg-green-50 p-2 rounded-md flex items-center justify-between">
                <span>{action.description}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    action.priority === 'high' ? 'bg-red-100 text-red-700' :
                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <Badge variant="outline" className={action.actionType === 'corrective' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                    {action.actionType === 'corrective' ? 'Correctiva' : 'Preventiva'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component to show Fishbone Analysis data
function FishboneSection({ analysisId }: { analysisId: string }) {
  const { data: analysis, isLoading } = useFishboneAnalysis(analysisId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!analysis) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {analysis.status === 'approved' ? 'Aprobado' : analysis.status === 'in_review' ? 'En revisión' : 'Borrador'}
        </Badge>
        <Link href={`/analysis/fishbone/${analysisId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver diagrama <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {analysis.problem && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Problema Analizado</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{analysis.problem}</p>
        </div>
      )}

      {analysis.categories && analysis.categories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Categorías de Causas ({analysis.categories.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.categories.map((category, idx) => (
              <div key={idx} className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                <p className="font-medium text-gray-800">{category.name}</p>
                {category.causes && category.causes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {category.causes.map((cause, cidx) => (
                      <li key={cidx} className="text-sm text-gray-600 flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" />
                        <span>{cause.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.rootCause && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Target className="h-4 w-4" /> Causa Raíz Identificada
          </p>
          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-md border-l-4 border-red-400 font-medium">{analysis.rootCause}</p>
        </div>
      )}
    </div>
  )
}

// Component to show Causal Tree Analysis data
function CausalTreeSection({ analysisId }: { analysisId: string }) {
  const { data: analysis, isLoading: loadingAnalysis } = useCausalTreeAnalysis(analysisId)
  const { data: nodes, isLoading: loadingNodes } = useCausalTreeNodes(analysisId)

  if (loadingAnalysis || loadingNodes) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!analysis) return null

  // Find root causes (nodes marked as root cause)
  const rootCauses = nodes?.filter(n => n.isRootCause) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{analysis.title}</h4>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 mt-1">
            {analysis.status === 'approved' ? 'Aprobado' : analysis.status === 'in_review' ? 'En revisión' : 'Borrador'}
          </Badge>
        </div>
        <Link href={`/causal-tree/${analysisId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver árbol <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {analysis.problemStatement && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Declaración del Problema</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{analysis.problemStatement}</p>
        </div>
      )}

      {nodes && nodes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Network className="h-4 w-4" /> Nodos del Árbol ({nodes.length})
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {nodes.map((node, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded-md border-l-4 ${
                  node.isRootCause
                    ? 'bg-red-50 border-red-400'
                    : node.nodeType === 'root_cause'
                    ? 'bg-green-50 border-green-400'
                    : node.nodeType === 'final_event'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{node.fact}</span>
                  {node.isRootCause && <Badge className="bg-red-100 text-red-800 text-xs">Causa Raíz</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rootCauses.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Target className="h-4 w-4" /> Causas Raíz Identificadas ({rootCauses.length})
          </p>
          <div className="space-y-2">
            {rootCauses.map((cause, idx) => (
              <p key={idx} className="text-sm text-gray-600 bg-red-50 p-3 rounded-md border-l-4 border-red-400 font-medium">
                {cause.fact}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component to show Action Plan data
function ActionPlanSection({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useActionPlanReport(reportId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!report) return null

  const completedItems = report.items?.filter(i => i.estado === 'completed' || (i.avance_real && i.avance_real >= 100)).length || 0
  const totalItems = report.items?.length || 0
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {report.report_status === 'approved' ? 'Aprobado' : report.report_status === 'submitted' ? 'Enviado' : 'Borrador'}
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-gray-600">{progress}%</span>
          </div>
        </div>
        <Link href={`/reports/action-plan/${reportId}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver plan completo <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {report.objetivo && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Objetivo del Plan</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.objetivo}</p>
        </div>
      )}

      {report.items && report.items.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Tareas del Plan ({completedItems}/{totalItems} completadas)
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {report.items.map((item, idx) => (
              <div
                key={idx}
                className={`text-sm p-3 rounded-md border-l-4 ${
                  item.estado === 'completed' || (item.avance_real && item.avance_real >= 100)
                    ? 'bg-green-50 border-green-400'
                    : item.estado === 'in_progress'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.estado === 'completed' || (item.avance_real && item.avance_real >= 100) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : item.estado === 'in_progress' ? (
                        <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-medium">{item.tarea}</span>
                    </div>
                    {item.subtarea && <p className="text-gray-600 text-xs mt-1 ml-6">{item.subtarea}</p>}
                    {item.responsable && <p className="text-gray-500 text-xs mt-1 ml-6">Responsable: {item.responsable}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{item.avance_real || 0}%</span>
                    {item.fecha_limite && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.fecha_limite), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function LinkedReportsData({ sourceReports, isLoading }: LinkedReportsDataProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sourceReports) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay reportes vinculados a este suceso
          </p>
        </CardContent>
      </Card>
    )
  }

  const hasAnyReport =
    sourceReports.flash_report_id ||
    sourceReports.immediate_actions_id ||
    sourceReports.root_cause_id ||
    sourceReports.action_plan_id ||
    (sourceReports.five_whys_ids && sourceReports.five_whys_ids.length > 0) ||
    (sourceReports.fishbone_ids && sourceReports.fishbone_ids.length > 0) ||
    (sourceReports.causal_tree_ids && sourceReports.causal_tree_ids.length > 0)

  if (!hasAnyReport) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay reportes vinculados a este suceso
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Datos Consolidados de Reportes</CardTitle>
        <CardDescription>
          Información detallada extraída de todos los reportes y análisis vinculados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={['flash', 'five-whys', 'action-plan']}>
          {/* Flash Report */}
          {sourceReports.flash_report_id && (
            <AccordionItem value="flash">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <span>Flash Report</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <FlashReportSection reportId={sourceReports.flash_report_id} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Immediate Actions */}
          {sourceReports.immediate_actions_id && (
            <AccordionItem value="immediate-actions">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>Acciones Inmediatas</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ImmediateActionsSection reportId={sourceReports.immediate_actions_id} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Root Cause Report */}
          {sourceReports.root_cause_id && (
            <AccordionItem value="root-cause">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Search className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Reporte de Causa Raíz</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <RootCauseSection reportId={sourceReports.root_cause_id} />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Five Whys Analyses */}
          {sourceReports.five_whys_ids && sourceReports.five_whys_ids.length > 0 && (
            <AccordionItem value="five-whys">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Análisis 5 Por Qués ({sourceReports.five_whys_ids.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {sourceReports.five_whys_ids.map((id, idx) => (
                  <div key={id}>
                    {idx > 0 && <Separator className="my-4" />}
                    <FiveWhysSection analysisId={id} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Fishbone Analyses */}
          {sourceReports.fishbone_ids && sourceReports.fishbone_ids.length > 0 && (
            <AccordionItem value="fishbone">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <GitBranch className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Diagramas Ishikawa ({sourceReports.fishbone_ids.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {sourceReports.fishbone_ids.map((id, idx) => (
                  <div key={id}>
                    {idx > 0 && <Separator className="my-4" />}
                    <FishboneSection analysisId={id} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Causal Tree Analyses */}
          {sourceReports.causal_tree_ids && sourceReports.causal_tree_ids.length > 0 && (
            <AccordionItem value="causal-tree">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Network className="h-4 w-4 text-teal-600" />
                  </div>
                  <span>Árboles Causales ({sourceReports.causal_tree_ids.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {sourceReports.causal_tree_ids.map((id, idx) => (
                  <div key={id}>
                    {idx > 0 && <Separator className="my-4" />}
                    <CausalTreeSection analysisId={id} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Action Plan */}
          {sourceReports.action_plan_id && (
            <AccordionItem value="action-plan">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span>Plan de Acción</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ActionPlanSection reportId={sourceReports.action_plan_id} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
