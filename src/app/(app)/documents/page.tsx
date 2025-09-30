'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocuments } from '@/shared/hooks/document-hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Plus, Search, FileText, Download, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DocumentsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, error, isLoading } = useDocuments(
    typeFilter || statusFilter ? { type: typeFilter, status: statusFilter } : undefined
  )

  const getStatusColor = (status: string) => {
    const colors = {
      generating: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      approved: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || colors.generating
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      generating: Loader2,
      ready: CheckCircle2,
      approved: CheckCircle2,
      expired: Clock,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return status === 'generating' ? (
      <Icon className="h-4 w-4 animate-spin" />
    ) : (
      <Icon className="h-4 w-4" />
    )
  }

  const getTypeIcon = (type: string) => {
    return <FileText className="h-5 w-5" />
  }

  const filteredDocuments = data?.data?.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Genera y gestiona documentación de seguridad</p>
        </div>
        <Link href="/documents/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generar Documento
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de Documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los Tipos</SelectItem>
                <SelectItem value="incident_report">Reporte de Incidente</SelectItem>
                <SelectItem value="analysis_report">Reporte de Análisis</SelectItem>
                <SelectItem value="action_plan">Plan de Acción</SelectItem>
                <SelectItem value="compliance_report">Reporte de Cumplimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los Estados</SelectItem>
                <SelectItem value="generating">Generando</SelectItem>
                <SelectItem value="ready">Listo</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.data?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Listos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.data?.filter((d) => d.status === 'ready').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.data?.filter((d) => d.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Generando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.data?.filter((d) => d.status === 'generating').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron documentos</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter || statusFilter
                  ? 'Intenta ajustar tus filtros'
                  : 'Comienza generando tu primer documento'}
              </p>
              {!searchQuery && !typeFilter && !statusFilter && (
                <Link href="/documents/generate">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generar Documento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card
                key={document.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/documents/${document.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    {getTypeIcon(document.type)}
                    <Badge className={getStatusColor(document.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(document.status)}
                        {document.status}
                      </span>
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{document.title}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {document.type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formato</span>
                      <span className="font-medium">{document.metadata.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generado Por</span>
                      <span className="font-medium truncate ml-2">{document.generatedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado</span>
                      <span className="font-medium">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {document.metadata.pageCount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Páginas</span>
                        <span className="font-medium">{document.metadata.pageCount}</span>
                      </div>
                    )}
                  </div>
                  {document.downloadUrl && document.status !== 'generating' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(document.downloadUrl, '_blank')
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}