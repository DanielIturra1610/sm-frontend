'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDocument } from '@/shared/hooks/document-hooks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ArrowLeft, Download, FileText, AlertCircle, CheckCircle2, Share2 } from 'lucide-react'

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params?.id as string | null

  const { data: document, error, isLoading } = useDocument(documentId)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al Cargar el Documento
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del documento'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/documents')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Documentos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      generating: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      approved: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.generating
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Documentos
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">Documento #{document.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {document.downloadUrl && document.status !== 'generating' && (
            <Button asChild>
              <a href={document.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2">
        <Badge className={getStatusColor(document.status)}>
          {document.status.toUpperCase()}
        </Badge>
        <Badge variant="outline">{document.type.replace('_', ' ')}</Badge>
        <Badge variant="secondary">{document.metadata.format.toUpperCase()}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Document Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview/Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Documento</CardTitle>
              <CardDescription>
                {document.content.sections.length} secciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {document.content.sections.map((section) => (
                <div key={section.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                  {section.type === 'text' && (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {section.content}
                      </p>
                    </div>
                  )}
                  {section.type === 'table' && (
                    <div className="text-sm text-muted-foreground">
                      [Table content - {section.content}]
                    </div>
                  )}
                  {section.type === 'chart' && (
                    <div className="text-sm text-muted-foreground">
                      [Chart content - {section.content}]
                    </div>
                  )}
                  {section.type === 'image' && (
                    <div className="text-sm text-muted-foreground">
                      [Image content - {section.content}]
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Variables Used */}
          {document.content.variables && Object.keys(document.content.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
                <CardDescription>Variables utilizadas para generar este documento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(document.content.variables).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{key}</span>
                      <span className="truncate">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Formato</p>
                <p className="text-sm text-muted-foreground">
                  {document.metadata.format.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Idioma</p>
                <p className="text-sm text-muted-foreground">{document.metadata.language}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-sm text-muted-foreground">{document.metadata.version}</p>
              </div>
              {document.metadata.pageCount && (
                <div>
                  <p className="text-sm font-medium">Paginas</p>
                  <p className="text-sm text-muted-foreground">{document.metadata.pageCount}</p>
                </div>
              )}
              {document.metadata.size && (
                <div>
                  <p className="text-sm font-medium">Tamaño</p>
                  <p className="text-sm text-muted-foreground">
                    {(document.metadata.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Linea de Tiempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Generado Por</p>
                <p className="text-sm text-muted-foreground">{document.generatedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Generado En</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.createdAt).toLocaleString()}
                </p>
              </div>
              {document.approvedBy && (
                <>
                  <div>
                    <p className="text-sm font-medium">Aprobado Por</p>
                    <p className="text-sm text-muted-foreground">{document.approvedBy}</p>
                  </div>  
                  <div>
                    <p className="text-sm font-medium">Aprobado En</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(document.approvedAt!).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {document.status === 'ready' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aprobar Documento
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Solicitar Firma
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}