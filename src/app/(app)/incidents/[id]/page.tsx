'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { useIncidentPhotoManager } from '@/shared/hooks/attachment-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { PhotoGallery } from '@/shared/components/attachments/PhotoGallery'
import { PhotoUploader } from '@/shared/components/attachments/PhotoUploader'
import { ArrowLeft, FileText, AlertCircle, Camera, Plus, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params?.id as string | null
  const [showUploader, setShowUploader] = useState(false)

  const { data: incident, error, isLoading } = useIncident(incidentId)

  const {
    photos,
    isLoading: photosLoading,
    isMutating,
    upload: uploadPhotos,
    delete: deletePhoto,
    updateCaption,
    toggleFinalReport,
  } = useIncidentPhotoManager(incidentId)

  const handleUpload = async (files: File[]) => {
    try {
      await uploadPhotos(files)
      toast.success('Fotos subidas exitosamente')
      setShowUploader(false)
    } catch {
      toast.error('Error al subir fotos')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto(id)
      toast.success('Foto eliminada')
    } catch {
      toast.error('Error al eliminar foto')
    }
  }

  const handleUpdateCaption = async (id: string, caption: string) => {
    try {
      await updateCaption(id, caption)
      toast.success('Descripcion actualizada')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleToggleFinalReport = async (id: string, include: boolean) => {
    try {
      await toggleFinalReport(id, include)
      toast.success(include ? 'Foto incluida en reporte' : 'Foto excluida del reporte')
    } catch {
      toast.error('Error al actualizar')
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

  if (error || !incident) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Suceso
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del suceso'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/incidents')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Sucesos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getStatusColor = (status: string) => {
    const colors = {
      reported: 'bg-gray-100 text-gray-800',
      investigating: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-slate-100 text-slate-800',
    }
    return colors[status as keyof typeof colors] || colors.reported
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/incidents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{incident.title}</h1>
            <p className="text-muted-foreground">Suceso #{incident.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/incidents/${incident.id}/report`)}>
            <FileText className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Status and Severity */}
      <div className="flex gap-2">
        <Badge className={getSeverityColor(incident.severity)}>
          {incident.severity.toUpperCase()}
        </Badge>
        <Badge className={getStatusColor(incident.status)}>
          {incident.status.replace('_', ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline">{incident.type}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{incident.location}</p>
            </CardContent>
          </Card>

{/* Photos Section */}          <Card>            <CardHeader>              <div className="flex items-center justify-between">                <div>                  <CardTitle className="flex items-center gap-2">                    <Camera className="h-5 w-5" />                    Fotos del Incidente                  </CardTitle>                  <CardDescription>                    {photos.length} foto(s) adjuntas                  </CardDescription>                </div>                <Button                  variant="outline"                  size="sm"                  onClick={() => setShowUploader(!showUploader)}                >                  {showUploader ? (                    <>                      <ChevronUp className="mr-2 h-4 w-4" />                      Cerrar                    </>                  ) : (                    <>                      <Plus className="mr-2 h-4 w-4" />                      Agregar Fotos                    </>                  )}                </Button>              </div>            </CardHeader>            <CardContent className="space-y-4">              {showUploader && (                <PhotoUploader                  onUpload={handleUpload}                  disabled={isMutating}                  maxFiles={10}                  maxSizeMB={10}                />              )}              <PhotoGallery                photos={photos}                loading={photosLoading}                onDelete={handleDelete}                onUpdateCaption={handleUpdateCaption}                onToggleFinalReport={handleToggleFinalReport}                showFinalReportToggle={true}              />            </CardContent>          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Línea de Tiempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Reportado El</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(incident.reportedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Reportado Por</p>
                <p className="text-sm text-muted-foreground">{incident.reportedBy}</p>
              </div>
              {incident.assignedTo && (
                <div>
                  <p className="text-sm font-medium">Asignado A</p>
                  <p className="text-sm text-muted-foreground">{incident.assignedTo}</p>
                </div>
              )}
              {incident.assignedAt && (
                <div>
                  <p className="text-sm font-medium">Asignado El</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(incident.assignedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {incident.resolvedAt && (
                <div>
                  <p className="text-sm font-medium">Resuelto El</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(incident.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow State */}
          {incident.workflowState && (
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Trabajo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Paso Actual</p>
                  <p className="text-sm text-muted-foreground">
                    {incident.workflowState.currentStep}
                  </p>
                </div>
                {incident.workflowState.completedSteps &&
                 incident.workflowState.completedSteps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Pasos Completados</p>
                    <div className="space-y-1">
                      {incident.workflowState.completedSteps.map((step, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          ✓ {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/analysis/five-whys?incidentId=${incident.id}`}>
                <Button variant="outline" className="w-full">
                  Iniciar Análisis de 5 Porqués
                </Button>
              </Link>
              <Link href={`/analysis/fishbone?incidentId=${incident.id}`}>
                <Button variant="outline" className="w-full">
                  Iniciar Análisis de Espina de Pescado
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}