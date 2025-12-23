/**
 * Express Mode Selector Component
 * Allows user to choose between Express Mode and Complete Mode
 * for Final Report creation
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { Zap, FileEdit, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { ReportMode } from '@/shared/hooks/useExpressMode'

interface ExpressModeSelectorProps {
  mode: ReportMode
  onModeChange: (mode: ReportMode) => void
  canUseExpressMode: boolean
  dataCompleteness: number
  sourceReportsCount: number
  isLoading?: boolean
}

export function ExpressModeSelector({
  mode,
  onModeChange,
  canUseExpressMode,
  dataCompleteness,
  sourceReportsCount,
  isLoading = false,
}: ExpressModeSelectorProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Modo de Creacion</CardTitle>
        <CardDescription>
          Seleccione como desea crear el Reporte Final
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Express Mode Card */}
          <button
            type="button"
            onClick={() => canUseExpressMode && onModeChange('express')}
            disabled={!canUseExpressMode || isLoading}
            className={`
              relative p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'express'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : canUseExpressMode
                  ? 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }
            `}
          >
            {mode === 'express' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg
                ${mode === 'express' ? 'bg-primary text-white' : 'bg-amber-100 text-amber-700'}
              `}>
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Modo Express</h3>
                  <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Genera automaticamente el reporte usando datos de reportes anteriores
                </p>

                {/* Data completeness indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Datos disponibles</span>
                    <span className="font-medium">{dataCompleteness}%</span>
                  </div>
                  <Progress value={dataCompleteness} className="h-1.5" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {sourceReportsCount > 0 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>{sourceReportsCount} reportes vinculados</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span>Sin reportes vinculados</span>
                      </>
                    )}
                  </div>
                </div>

                {!canUseExpressMode && (
                  <p className="text-xs text-amber-600 mt-2">
                    Necesita al menos 2 reportes vinculados con datos
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Complete Mode Card */}
          <button
            type="button"
            onClick={() => onModeChange('complete')}
            disabled={isLoading}
            className={`
              relative p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'complete'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }
            `}
          >
            {mode === 'complete' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg
                ${mode === 'complete' ? 'bg-primary text-white' : 'bg-blue-100 text-blue-700'}
              `}>
                <FileEdit className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Modo Completo</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete manualmente todos los campos del formulario con control total
                </p>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Control total sobre cada campo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Pre-llenado automatico disponible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Ideal para casos especiales</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Mode action hint */}
        {mode === 'express' && canUseExpressMode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <Zap className="h-4 w-4 inline mr-1" />
              <strong>Modo Express activo:</strong> Revise los datos extraidos abajo y confirme para crear el reporte rapidamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
