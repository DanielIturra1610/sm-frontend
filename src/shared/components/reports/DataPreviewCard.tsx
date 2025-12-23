/**
 * Data Preview Card Component
 * Shows a preview of extracted data for Express Mode in Final Report
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Progress } from '@/shared/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import {
  CheckCircle2,
  AlertTriangle,
  Users,
  FileSearch,
  Image,
  Building2,
  ClipboardList,
  Sparkles,
  Edit2,
  Zap,
  ListTodo,
  ExternalLink,
  GitBranch,
  UserCheck,
  Lightbulb,
  Clock,
  User,
} from 'lucide-react'
import type { PersonaConsolidada, EvidenciaConsolidada } from '@/shared/utils/finalReportExtractors'

interface CausaRaiz {
  problema: string
  causa_raiz: string
  accion_plan: string
  metodologia: string
}

interface ResponsableData {
  nombre: string
  cargo: string
  rol?: string
}

interface ActionPlanItemSummary {
  tarea: string
  responsable?: string
  estado: string
  avance_real: number
  fin?: string
}

interface DataPreviewCardProps {
  empresa: string
  descripcion: string
  causasRaiz: CausaRaiz[]
  conclusiones: string
  personas: PersonaConsolidada[]
  evidencias: EvidenciaConsolidada[]
  analysisCount: {
    fiveWhys: number
    fishbone: number
    causalTree: number
  }
  // New props
  accionesInmediatas?: string
  planAccionItems?: ActionPlanItemSummary[]
  planAccionProgreso?: number
  responsables?: ResponsableData[]
  leccionesAprendidas?: string[]
  causalTreeIds?: string[]
  fiveWhysIds?: string[]
  fishboneIds?: string[]
  onConfirm: () => void
  onEdit: () => void
  isLoading?: boolean
}

export function DataPreviewCard({
  empresa,
  descripcion,
  causasRaiz,
  conclusiones,
  personas,
  evidencias,
  analysisCount,
  accionesInmediatas,
  planAccionItems = [],
  planAccionProgreso = 0,
  responsables = [],
  leccionesAprendidas = [],
  causalTreeIds = [],
  fiveWhysIds = [],
  fishboneIds = [],
  onConfirm,
  onEdit,
  isLoading = false,
}: DataPreviewCardProps) {
  const totalAnalyses = analysisCount.fiveWhys + analysisCount.fishbone + analysisCount.causalTree

  const getBadgeColor = (metodologia: string) => {
    if (metodologia.includes('5 Por') || metodologia.includes('5 Why')) return 'bg-blue-100 text-blue-800'
    if (metodologia.includes('Ishikawa') || metodologia.includes('Fishbone')) return 'bg-green-100 text-green-800'
    if (metodologia.includes('Arbol') || metodologia.includes('Causal')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800">Atrasada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>
    }
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Vista Previa de Datos Extraidos
            </CardTitle>
            <CardDescription>
              Revise los datos consolidados de {totalAnalyses} analisis y otros reportes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button size="sm" onClick={onConfirm} disabled={isLoading}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirmar y Crear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={['empresa', 'causas', 'personas', 'planAccion']} className="w-full">
          {/* Company Info */}
          <AccordionItem value="empresa">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Datos de Empresa</span>
                {empresa && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6 space-y-2">
                {empresa ? (
                  <p className="text-sm"><strong>Empresa:</strong> {empresa}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin datos de empresa</p>
                )}
                {descripcion && (
                  <p className="text-sm"><strong>Descripcion:</strong> {descripcion.slice(0, 200)}{descripcion.length > 200 ? '...' : ''}</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Root Causes */}
          <AccordionItem value="causas">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-muted-foreground" />
                <span>Causas Raiz</span>
                <Badge variant="secondary" className="ml-2">{causasRaiz.length}</Badge>
                {causasRaiz.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6 space-y-3">
                {causasRaiz.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">No se encontraron causas raiz en los analisis</span>
                  </div>
                ) : (
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {causasRaiz.map((causa, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getBadgeColor(causa.metodologia)}>
                              {causa.metodologia}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{causa.causa_raiz}</p>
                          {causa.accion_plan && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Accion:</strong> {causa.accion_plan}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Analysis count summary */}
                <div className="flex gap-2 pt-2 flex-wrap">
                  {analysisCount.fiveWhys > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {analysisCount.fiveWhys} x 5 Por Ques
                    </Badge>
                  )}
                  {analysisCount.fishbone > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {analysisCount.fishbone} x Ishikawa
                    </Badge>
                  )}
                  {analysisCount.causalTree > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {analysisCount.causalTree} x Arbol Causal
                    </Badge>
                  )}
                </div>

                {/* Links to analyses */}
                {(causalTreeIds.length > 0 || fiveWhysIds.length > 0 || fishboneIds.length > 0) && (
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {causalTreeIds.map((id, idx) => (
                      <Link key={id} href={`/causal-tree/${id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Ver Arbol Causal {causalTreeIds.length > 1 ? idx + 1 : ''}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ))}
                    {fiveWhysIds.map((id, idx) => (
                      <Link key={id} href={`/analysis/five-whys/${id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Ver 5 Por Ques {fiveWhysIds.length > 1 ? idx + 1 : ''}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ))}
                    {fishboneIds.map((id, idx) => (
                      <Link key={id} href={`/analysis/fishbone/${id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Ver Ishikawa {fishboneIds.length > 1 ? idx + 1 : ''}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Immediate Actions */}
          {accionesInmediatas && (
            <AccordionItem value="accionesInmediatas">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Acciones Inmediatas</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{accionesInmediatas}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Action Plan */}
          {planAccionItems.length > 0 && (
            <AccordionItem value="planAccion">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-blue-500" />
                  <span>Plan de Accion</span>
                  <Badge variant="secondary" className="ml-2">{planAccionItems.length} tareas</Badge>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso del plan</span>
                      <span>{planAccionProgreso}%</span>
                    </div>
                    <Progress value={planAccionProgreso} className="h-2" />
                  </div>

                  {/* Task list */}
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {planAccionItems.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.tarea}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {item.responsable && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {item.responsable}
                                  </span>
                                )}
                                {item.fin && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(item.fin).toLocaleDateString('es-CL')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getEstadoBadge(item.estado)}
                              <span className="text-xs text-muted-foreground">{item.avance_real}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* People */}
          <AccordionItem value="personas">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Personas Involucradas</span>
                <Badge variant="secondary" className="ml-2">{personas.length}</Badge>
                {personas.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6">
                {personas.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Sin personas registradas</p>
                ) : (
                  <ScrollArea className="max-h-40">
                    <div className="space-y-2">
                      {personas.map((persona, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium">{persona.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {persona.cargo}{persona.empresa && ` - ${persona.empresa}`}
                            </p>
                            {persona.tipo_lesion && (
                              <p className="text-xs text-red-600">Lesion: {persona.tipo_lesion}</p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {persona.fuentes.map((fuente, fIdx) => (
                              <Badge key={fIdx} variant="outline" className="text-xs">
                                {fuente}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Responsables */}
          {responsables.length > 0 && (
            <AccordionItem value="responsables">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Responsables de Investigacion</span>
                  <Badge variant="secondary" className="ml-2">{responsables.length}</Badge>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6">
                  <div className="grid grid-cols-2 gap-2">
                    {responsables.map((resp, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border">
                        <p className="text-sm font-medium">{resp.nombre}</p>
                        <p className="text-xs text-muted-foreground">{resp.cargo}</p>
                        {resp.rol && <p className="text-xs text-blue-600">{resp.rol}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Evidence */}
          <AccordionItem value="evidencias">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <span>Evidencia</span>
                <Badge variant="secondary" className="ml-2">{evidencias.length}</Badge>
                {evidencias.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6">
                {evidencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Sin imagenes de evidencia</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {evidencias.slice(0, 6).map((ev, idx) => (
                      <div key={idx} className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={ev.url}
                          alt={ev.descripcion}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                          {ev.fuente}
                        </Badge>
                      </div>
                    ))}
                    {evidencias.length > 6 && (
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          +{evidencias.length - 6} mas
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Lessons Learned */}
          {leccionesAprendidas.length > 0 && (
            <AccordionItem value="lecciones">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Lecciones Aprendidas</span>
                  <Badge variant="secondary" className="ml-2">{leccionesAprendidas.length}</Badge>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6">
                  <ul className="space-y-2">
                    {leccionesAprendidas.map((leccion, idx) => (
                      <li key={idx} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>{leccion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Conclusions */}
          <AccordionItem value="conclusiones">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span>Conclusiones Generadas</span>
                {conclusiones && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-6">
                {conclusiones ? (
                  <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border max-h-40 overflow-auto">
                    {conclusiones}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin conclusiones generadas</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Manualmente
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmar y Crear Reporte
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
