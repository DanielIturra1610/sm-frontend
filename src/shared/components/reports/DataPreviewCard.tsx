/**
 * Data Preview Card Component
 * Shows a preview of extracted data for Express Mode in Final Report
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
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
} from 'lucide-react'
import type { PersonaConsolidada, EvidenciaConsolidada } from '@/shared/utils/finalReportExtractors'

interface CausaRaiz {
  problema: string
  causa_raiz: string
  accion_plan: string
  metodologia: string
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
        <Accordion type="multiple" defaultValue={['empresa', 'causas']} className="w-full">
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
                <div className="flex gap-2 pt-2">
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
              </div>
            </AccordionContent>
          </AccordionItem>

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
                          </div>
                          <div className="flex gap-1">
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
