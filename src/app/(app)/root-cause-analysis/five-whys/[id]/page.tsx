'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFiveWhysAnalysis, useAddWhyEntry, useDeleteWhyEntry, useUpdateWhyEntry } from '@/shared/hooks/analysis-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ArrowLeft, FileText, AlertCircle, CheckCircle2, ArrowRight, HelpCircle, FileSpreadsheet, FileType, ChevronDown, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react'
import Link from 'next/link'
import { exportToExcel, exportToWord, exportToPDF } from '@/shared/utils/five-whys-export'
import { toast } from 'sonner'
import type { WhyEntry } from '@/shared/types/api'

export default function FiveWhysDetailPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params?.id as string | null

  const { data: analysis, error, isLoading, mutate } = useFiveWhysAnalysis(analysisId)
  const { data: incident } = useIncident(analysis?.incidentId || null)
  const { trigger: addWhyEntry, isMutating: isAdding } = useAddWhyEntry(analysisId || '')
  const { trigger: deleteWhyEntry, isMutating: isDeleting } = useDeleteWhyEntry(analysisId || '')
  const { trigger: updateWhyEntry, isMutating: isUpdating } = useUpdateWhyEntry(analysisId || '')

  // Form state for adding
  const [showAddForm, setShowAddForm] = useState(false)
  const [question, setQuestion] = useState('¿Por qué ocurrió esto?')
  const [answer, setAnswer] = useState('')
  const [evidence, setEvidence] = useState('')
  const [notes, setNotes] = useState('')
  const [isRootCause, setIsRootCause] = useState(false)

  // Edit state
  const [editingEntry, setEditingEntry] = useState<WhyEntry | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const [editEvidence, setEditEvidence] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editIsRootCause, setEditIsRootCause] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  const resetForm = () => {
    setQuestion('¿Por qué ocurrió esto?')
    setAnswer('')
    setEvidence('')
    setNotes('')
    setIsRootCause(false)
    setShowAddForm(false)
  }

  const startEditing = (why: WhyEntry) => {
    setEditingEntry(why)
    setEditQuestion(why.question)
    setEditAnswer(why.answer)
    setEditEvidence(why.evidence?.join('\n') || '')
    setEditNotes(why.notes || '')
    setEditIsRootCause(why.isRootCause)
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    setEditQuestion('')
    setEditAnswer('')
    setEditEvidence('')
    setEditNotes('')
    setEditIsRootCause(false)
  }

  const handleAddWhyEntry = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('La pregunta y la respuesta son requeridas')
      return
    }

    if (question.trim().length < 5) {
      toast.error('La pregunta debe tener al menos 5 caracteres')
      return
    }

    if (answer.trim().length < 10) {
      toast.error('La respuesta debe tener al menos 10 caracteres')
      return
    }

    try {
      const evidenceArray = evidence.trim()
        ? evidence.split('\n').map(e => e.trim()).filter(e => e.length > 0)
        : []

      const nextWhyNumber = (analysis?.whys?.length || 0) + 1

      await addWhyEntry({
        whyNumber: nextWhyNumber,
        question: question.trim(),
        answer: answer.trim(),
        evidence: evidenceArray,
        notes: notes.trim() || undefined,
        isRootCause,
      })

      toast.success('Pregunta "¿Por qué?" agregada exitosamente')
      resetForm()
      await mutate()
    } catch (err) {
      console.error('Error adding why entry:', err)
      toast.error(err instanceof Error ? err.message : 'Error al agregar la pregunta')
    }
  }

  const handleUpdateWhyEntry = async () => {
    if (!editingEntry) return

    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error('La pregunta y la respuesta son requeridas')
      return
    }

    if (editQuestion.trim().length < 5) {
      toast.error('La pregunta debe tener al menos 5 caracteres')
      return
    }

    if (editAnswer.trim().length < 10) {
      toast.error('La respuesta debe tener al menos 10 caracteres')
      return
    }

    try {
      const evidenceArray = editEvidence.trim()
        ? editEvidence.split('\n').map(e => e.trim()).filter(e => e.length > 0)
        : []

      await updateWhyEntry({
        entryId: editingEntry.id,
        data: {
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
          evidence: evidenceArray,
          notes: editNotes.trim() || undefined,
          isRootCause: editIsRootCause,
        }
      })

      toast.success('Pregunta actualizada exitosamente')
      cancelEditing()
      await mutate()
    } catch (err) {
      console.error('Error updating why entry:', err)
      toast.error(err instanceof Error ? err.message : 'Error al actualizar la pregunta')
    }
  }

  const handleDeleteWhyEntry = async () => {
    if (!entryToDelete) return

    try {
      await deleteWhyEntry(entryToDelete)
      toast.success('Pregunta eliminada exitosamente')
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
      await mutate()
    } catch (err) {
      console.error('Error deleting why entry:', err)
      toast.error(err instanceof Error ? err.message : 'Error al eliminar la pregunta')
    }
  }

  const handleMarkAsRootCause = async (entryId: string, currentIsRootCause: boolean) => {
    try {
      await updateWhyEntry({
        entryId,
        data: { isRootCause: !currentIsRootCause }
      })
      toast.success(!currentIsRootCause ? 'Marcado como causa raíz' : 'Desmarcado como causa raíz')
      await mutate()
    } catch (err) {
      console.error('Error updating why entry:', err)
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Análisis
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del análisis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/root-cause-analysis')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const nextWhyNumber = (analysis.whys?.length || 0) + 1
  const isDraft = analysis.status === 'draft'
  // Allow editing unless approved or rejected
  const canEdit = analysis.status !== 'approved' && analysis.status !== 'rejected'

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/root-cause-analysis')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Análisis de Cinco Porqués</h1>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                <HelpCircle className="h-3 w-3 mr-1" />
                5 Porqués
              </Badge>
            </div>
            <p className="text-muted-foreground">Análisis #{analysis.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportToExcel(analysis)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToWord(analysis)}>
                <FileType className="mr-2 h-4 w-4" />
                Exportar a Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(analysis)}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2">
        <Badge className={getStatusColor(analysis.status)}>
          {analysis.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" title={analysis.incidentId}>
          Incidente: {incident?.title || analysis.incidentId.slice(0, 8) + '...'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Statement */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900">Declaración del Problema</CardTitle>
              {analysis.title && (
                <CardDescription className="text-purple-700 font-medium">{analysis.title}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-purple-900 font-medium">{analysis.problemStatement}</p>
            </CardContent>
          </Card>

          {/* The Whys */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Cadena de Análisis</h2>
            </div>

            {analysis.whys && analysis.whys.length > 0 ? (
              <>
                {analysis.whys
                  .sort((a, b) => a.whyNumber - b.whyNumber)
                  .map((why, index) => (
                  <div key={why.id || index} className="relative">
                    {editingEntry?.id === why.id ? (
                      // Edit form
                      <Card className="border-2 border-purple-300">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-purple-600 text-white">
                              {why.whyNumber}
                            </span>
                            Editando: Por qué #{why.whyNumber}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="editQuestion">Pregunta *</Label>
                            <Input
                              id="editQuestion"
                              placeholder="¿Por qué ocurrió esto?"
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editAnswer">Respuesta *</Label>
                            <Textarea
                              id="editAnswer"
                              placeholder="La respuesta a esta pregunta..."
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              disabled={isUpdating}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editEvidence">Evidencia (una por línea)</Label>
                            <Textarea
                              id="editEvidence"
                              placeholder="Documento #123&#10;Foto de la escena"
                              value={editEvidence}
                              onChange={(e) => setEditEvidence(e.target.value)}
                              disabled={isUpdating}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editNotes">Notas adicionales</Label>
                            <Textarea
                              id="editNotes"
                              placeholder="Notas o comentarios adicionales..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              disabled={isUpdating}
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="editIsRootCause"
                              checked={editIsRootCause}
                              onCheckedChange={(checked) => setEditIsRootCause(checked as boolean)}
                              disabled={isUpdating}
                            />
                            <Label htmlFor="editIsRootCause" className="cursor-pointer">
                              Esta es la causa raíz
                            </Label>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={handleUpdateWhyEntry}
                              disabled={isUpdating || !editQuestion.trim() || !editAnswer.trim()}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                'Guardar Cambios'
                              )}
                            </Button>
                            <Button variant="outline" onClick={cancelEditing} disabled={isUpdating}>
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      // Display mode
                      <Card className={`border-2 ${why.isRootCause ? 'border-green-300 bg-green-50' : ''}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${why.isRootCause ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`}>
                                {why.whyNumber}
                              </span>
                              Por qué #{why.whyNumber}
                              {why.isRootCause && (
                                <Badge className="ml-2 bg-green-100 text-green-800">Causa Raíz</Badge>
                              )}
                            </CardTitle>
                            {canEdit && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(why)}
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRootCause(why.id, why.isRootCause)}
                                  disabled={isUpdating}
                                  title={why.isRootCause ? 'Desmarcar como causa raíz' : 'Marcar como causa raíz'}
                                >
                                  <CheckCircle2 className={`h-4 w-4 ${why.isRootCause ? 'text-green-600' : 'text-gray-400'}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEntryToDelete(why.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                  disabled={isDeleting}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">
                              Pregunta:
                            </p>
                            <p className="text-base">{why.question}</p>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm font-semibold text-muted-foreground mb-1">
                              Respuesta:
                            </p>
                            <p className="text-base font-medium">{why.answer}</p>
                          </div>
                          {why.evidence && why.evidence.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold text-muted-foreground mb-2">
                                Evidencia:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {why.evidence.map((ev, idx) => (
                                  <li key={idx} className="text-sm">{ev}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {why.notes && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold text-muted-foreground mb-1">
                                Notas:
                              </p>
                              <p className="text-sm text-muted-foreground">{why.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {index < analysis.whys.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add button after all whys */}
                {canEdit && !showAddForm && !editingEntry && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => setShowAddForm(true)} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Por qué #{nextWhyNumber}
                    </Button>
                  </div>
                )}
              </>
            ) : !showAddForm ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No se han agregado preguntas &quot;¿Por qué?&quot; aún.</p>
                  <p className="text-sm mt-2">Comienza el análisis agregando la primera pregunta.</p>
                  {canEdit && (
                    <Button onClick={() => setShowAddForm(true)} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Primera Pregunta
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Add Why Form */}
            {showAddForm && (
              <>
                {analysis.whys && analysis.whys.length > 0 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>
                )}
                <Card className="border-2 border-purple-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-purple-600 text-white">
                          {nextWhyNumber}
                        </span>
                        Nuevo: Por qué #{nextWhyNumber}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={resetForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Pregunta * (mín. 5 caracteres)</Label>
                      <Input
                        id="question"
                        placeholder="¿Por qué ocurrió esto?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isAdding}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer">Respuesta * (mín. 10 caracteres)</Label>
                      <Textarea
                        id="answer"
                        placeholder="La respuesta a esta pregunta..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={isAdding}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evidence">Evidencia (una por línea)</Label>
                      <Textarea
                        id="evidence"
                        placeholder="Documento #123&#10;Foto de la escena&#10;Testimonio de operador"
                        value={evidence}
                        onChange={(e) => setEvidence(e.target.value)}
                        disabled={isAdding}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        placeholder="Notas o comentarios adicionales..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isAdding}
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRootCause"
                        checked={isRootCause}
                        onCheckedChange={(checked) => setIsRootCause(checked as boolean)}
                        disabled={isAdding}
                      />
                      <Label htmlFor="isRootCause" className="cursor-pointer">
                        Esta es la causa raíz
                      </Label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleAddWhyEntry}
                        disabled={isAdding || !question.trim() || !answer.trim()}
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Guardar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetForm} disabled={isAdding}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Root Cause */}
          {analysis.rootCause ? (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Causa Raíz Identificada
                </CardTitle>
                {analysis.rootCauseCategory && (
                  <CardDescription className="text-green-700">
                    Categoría: {analysis.rootCauseCategory.replace(/_/g, ' ')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-green-900 font-medium">{analysis.rootCause}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Causa Raíz Pendiente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">La causa raíz aún no ha sido identificada. Complete el análisis de los &quot;Por qué&quot; para determinar la causa raíz.</p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>
                  Acciones correctivas y preventivas para abordar la causa raíz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.actionItems.map((item) => (
                    <Card key={item.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={item.actionType === 'corrective' ? 'border-red-300 text-red-700' : 'border-blue-300 text-blue-700'}>
                                {item.actionType === 'corrective' ? 'Correctiva' : 'Preventiva'}
                              </Badge>
                              <Badge variant="outline" className={
                                item.priority === 'high' ? 'border-red-300 text-red-700' :
                                item.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                                'border-gray-300 text-gray-700'
                              }>
                                {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                              </Badge>
                            </div>
                            <p className="font-medium mb-2">{item.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {item.assignedTo && <span>Asignado: {item.assignedTo}</span>}
                              {item.dueDate && <span>Vencimiento: {new Date(item.dueDate).toLocaleDateString()}</span>}
                              {item.completedAt && <span>Completado: {new Date(item.completedAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <Badge
                            variant={item.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {item.status === 'completed' ? 'Completado' : item.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Cronología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Creado Por</p>
                <p className="text-sm text-muted-foreground">{analysis.createdByName || analysis.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Creado En</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(analysis.createdAt).toLocaleString()}
                </p>
              </div>
              {analysis.reviewedBy && (
                <>
                  <div>
                    <p className="text-sm font-medium">Revisado Por</p>
                    <p className="text-sm text-muted-foreground">{analysis.reviewedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Revisado En</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.reviewedAt!).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Niveles de Análisis</span>
                <Badge variant="outline">{analysis.whys?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Related Incident */}
          <Card>
            <CardHeader>
              <CardTitle>Incidente Relacionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incident && (
                <div>
                  <p className="text-sm font-medium">{incident.title}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {incident.severity && (
                      <Badge variant="outline" className="mr-2 text-xs">
                        {incident.severity.toUpperCase()}
                      </Badge>
                    )}
                    {incident.status?.replace('_', ' ')}
                  </div>
                </div>
              )}
              <Link href={`/incidents/${analysis.incidentId}`}>
                <Button variant="outline" className="w-full">
                  Ver Incidente
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Pregunta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteWhyEntry} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
