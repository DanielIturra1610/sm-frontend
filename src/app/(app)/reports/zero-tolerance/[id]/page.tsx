/**
 * Zero Tolerance Report Detail Page
 * View and manage a specific zero tolerance report
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useZeroToleranceReport,
  useSubmitZeroToleranceReport,
  useApproveZeroToleranceReport,
  useDeleteZeroToleranceReport,
} from '@/shared/hooks/report-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import { ExportButtons } from '@/shared/components/reports/ExportButtons'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Edit, Send, CheckCircle, Trash2, AlertCircle, ShieldAlert, User, AlertTriangle, Hash } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const SEVERIDAD_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  low: { label: 'Baja', className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle },
  medium: { label: 'Media', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle },
  high: { label: 'Alta', className: 'bg-red-100 text-red-800 border-red-300', icon: ShieldAlert },
  critical: { label: 'Crítica', className: 'bg-purple-100 text-purple-800 border-purple-300', icon: ShieldAlert },
}

export default function ZeroToleranceReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: report, error, isLoading } = useZeroToleranceReport(id)
  const { trigger: submitReport, isMutating: isSubmitting } = useSubmitZeroToleranceReport(id)
  const { trigger: approveReport, isMutating: isApproving } = useApproveZeroToleranceReport(id)
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteZeroToleranceReport()

  // Get incident data for correlativo
  const { data: incident } = useIncident(report?.incident_id || '')
  const correlativo = incident?.incidentNumber || incident?.correlativo || ''

  const handleSubmit = async () => {
    try {
      await submitReport()
      toast.success('Reporte enviado para revisión')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el reporte')
    }
  }

  const handleApprove = async () => {
    try {
      await approveReport()
      toast.success('Reporte aprobado exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar el reporte')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReport(id)
      toast.success('Reporte eliminado exitosamente')
      router.push('/reports/zero-tolerance')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el reporte')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el reporte</h3>
            <p className="text-gray-600 mb-4">{error?.message || 'El reporte no fue encontrado'}</p>
            <Button onClick={() => router.push('/reports/zero-tolerance')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const severidadConfig = report.severidad ? SEVERIDAD_CONFIG[report.severidad] : null
  const SeveridadIcon = severidadConfig?.icon || AlertCircle

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ReportFormHeader
        title="Detalle de Reporte de Tolerancia Cero"
        description={`Creado el ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
        backUrl="/reports/zero-tolerance"
      />

      {/* Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <ReportStatusBadge status={report.report_status} size="lg" />
          {severidadConfig && (
            <Badge className={`${severidadConfig.className} flex items-center gap-1 text-base px-3 py-1`}>
              <SeveridadIcon className="h-4 w-4" />
              Severidad: {severidadConfig.label}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {report.report_status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => router.push(`/reports/zero-tolerance/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {report.report_status === 'submitted' && (
            <Button onClick={handleApprove} disabled={isApproving}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          )}
          <ExportButtons
            reportType="zero-tolerance"
            reportId={id}
            reportStatus={report.report_status}
            metadata={{
              empresa: report.empresa,
              tipoIncidente: report.tipo,
              fecha: report.fecha_hora ? new Date(report.fecha_hora).toISOString().split('T')[0] : undefined,
              correlativo: correlativo || report.numero_documento,
            }}
          />
        </div>
      </div>

      {/* Document Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Información del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Correlativo - Prominente */}
            {correlativo && (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <p className="text-sm text-gray-500 mb-2">Suceso Asociado</p>
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-slate-600" />
                  <span className="font-mono font-bold text-2xl text-slate-800">{correlativo}</span>
                </div>
              </div>
            )}
            {/* Número de Documento - Secundario */}
            {report.numero_documento && (
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500">Nº Documento</p>
                <p className="font-mono text-sm text-gray-600">{report.numero_documento}</p>
              </div>
            )}
            {/* Número Prodity */}
            {report.numero_prodity && (
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500">Número Prodity</p>
                <p className="font-mono text-sm text-gray-600">{report.numero_prodity}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalles del Incumplimiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.suceso && (
              <div>
                <p className="text-sm text-gray-500">Suceso</p>
                <p className="font-medium">{report.suceso}</p>
              </div>
            )}
            {report.tipo && (
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{report.tipo}</p>
              </div>
            )}
            {report.fecha_hora && (
              <div>
                <p className="text-sm text-gray-500">Fecha y Hora</p>
                <p className="font-medium">{format(new Date(report.fecha_hora), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
              </div>
            )}
            {report.lugar && (
              <div>
                <p className="text-sm text-gray-500">Lugar</p>
                <p className="font-medium">{report.lugar}</p>
              </div>
            )}
            {report.area_zona && (
              <div>
                <p className="text-sm text-gray-500">Área/Zona</p>
                <p className="font-medium">{report.area_zona}</p>
              </div>
            )}
            {report.empresa && (
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{report.empresa}</p>
              </div>
            )}
            {report.supervisor_cge && (
              <div>
                <p className="text-sm text-gray-500">Supervisor CGE</p>
                <p className="font-medium">{report.supervisor_cge}</p>
              </div>
            )}
          </div>

          {report.descripcion && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Descripción</p>
                <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                  {report.descripcion}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions Taken */}
      {report.acciones_tomadas && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acciones Tomadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 whitespace-pre-wrap bg-green-50 p-4 rounded-md border-l-4 border-l-green-600">
              {report.acciones_tomadas}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Involved People */}
      {report.personas_involucradas && report.personas_involucradas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personas Involucradas ({report.personas_involucradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.personas_involucradas.map((persona, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {persona.nombre && (
                        <div>
                          <p className="text-xs text-gray-500">Nombre</p>
                          <p className="font-medium">{persona.nombre}</p>
                        </div>
                      )}
                      {persona.cargo && (
                        <div>
                          <p className="text-xs text-gray-500">Cargo</p>
                          <p className="text-sm">{persona.cargo}</p>
                        </div>
                      )}
                      {persona.empresa && (
                        <div>
                          <p className="text-xs text-gray-500">Empresa</p>
                          <p className="text-sm">{persona.empresa}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
