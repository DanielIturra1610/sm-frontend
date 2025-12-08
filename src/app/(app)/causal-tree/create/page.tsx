'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useToast } from '@/shared/hooks/use-toast'
import { useCreateCausalTreeAnalysis } from '@/shared/hooks/causal-tree-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import type { CreateCausalTreeAnalysisDTO } from '@/shared/types/causal-tree'

export default function CreateCausalTreePage() {
  const router = useRouter()
  const { toast } = useToast()
  const createMutation = useCreateCausalTreeAnalysis()
  const { data: incidentsData } = useIncidents({ status: 'open', limit: 100 })

  const [formData, setFormData] = useState<CreateCausalTreeAnalysisDTO>({
    incidentId: '',
    title: '',
    finalEvent: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.incidentId || !formData.title || !formData.finalEvent) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      })
      return
    }

    try {
      const analysis = await createMutation.mutateAsync(formData)
      toast({
        title: 'Análisis creado',
        description: 'El análisis de árbol causal ha sido creado exitosamente.',
      })
      router.push(`/causal-tree/${analysis.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el análisis. Por favor, intenta nuevamente.',
        variant: 'destructive',
      })
    }
  }

  const handleIncidentChange = (incidentId: string) => {
    setFormData({ ...formData, incidentId })

    // Auto-fill title if empty
    if (!formData.title && incidentsData) {
      const incident = incidentsData.incidents.find((i) => i.id === incidentId)
      if (incident) {
        setFormData({
          ...formData,
          incidentId,
          title: `Análisis Causal - ${incident.title}`,
        })
      }
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/causal-tree')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Análisis
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Análisis de Árbol Causal</h1>
        <p className="text-muted-foreground mt-2">
          Crea un nuevo análisis causal para investigar las causas raíz de un incidente
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Define el incidente y el evento final a analizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incidentId">Incidente Asociado *</Label>
                <Select
                  value={formData.incidentId}
                  onValueChange={handleIncidentChange}
                  required
                >
                  <SelectTrigger id="incidentId">
                    <SelectValue placeholder="Selecciona un incidente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentsData?.incidents.map((incident) => (
                      <SelectItem key={incident.id} value={incident.id}>
                        {incident.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selecciona el incidente que será analizado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título del Análisis *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Análisis Causal - Caída en área de producción"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalEvent">Evento Final (Lesión/Daño) *</Label>
                <Textarea
                  id="finalEvent"
                  placeholder="Describe el evento final o lesión que será el punto de partida del análisis..."
                  value={formData.finalEvent}
                  onChange={(e) => setFormData({ ...formData, finalEvent: e.target.value })}
                  required
                  rows={3}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Este será el nodo raíz del árbol causal (hecho final o lesión)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción adicional del análisis (opcional)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Methodology Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Guía de Metodología</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="font-semibold">Pasos para el Análisis de Árbol Causal:</p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Definir el evento final o lesión (punto de partida)</li>
                  <li>
                    Preguntar: <strong>&quot;¿Qué fue necesario para que esto ocurriera?&quot;</strong>
                  </li>
                  <li>
                    Preguntar: <strong>&quot;¿Fue necesario algo más?&quot;</strong>
                  </li>
                  <li>Continuar hasta identificar las causas básicas (sin antecedentes)</li>
                  <li>Trabajar solo con hechos objetivos, evitar juicios e interpretaciones</li>
                </ol>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-blue-900 font-medium">Tipos de Relación:</p>
                  <ul className="mt-2 space-y-1 text-blue-800">
                    <li><strong>Cadena (A → B):</strong> Una causa lleva a un efecto</li>
                    <li><strong>Conjuntiva (A ∧ B → C):</strong> Ambas causas son necesarias</li>
                    <li><strong>Disyuntiva (A ∨ B → C):</strong> Cualquiera de las causas es suficiente</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/causal-tree')}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Análisis
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
