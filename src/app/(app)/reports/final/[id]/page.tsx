/**
 * Final Report Detail Page
 * View comprehensive final incident report
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useFinalReport,
  useSubmitFinalReport,
  useApproveFinalReport,
  useDeleteFinalReport,
} from '@/shared/hooks/report-hooks'
import { useFinalReportPhotos } from '@/shared/hooks/attachment-hooks'
import { PhotoGallery } from '@/shared/components/attachments'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { toast } from 'sonner'
import { Edit, Send, CheckCircle, Trash2, AlertCircle, Building2, Users, Wrench, DollarSign, FileCheck, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function FinalReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: report, error, isLoading } = useFinalReport(id)
  const { trigger: submitReport, isMutating: isSubmitting } = useSubmitFinalReport(id)
  const { trigger: approveReport, isMutating: isApproving } = useApproveFinalReport(id)
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteFinalReport()
  const { data: photos, isLoading: photosLoading } = useFinalReportPhotos(report?.incident_id || null)

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
      router.push('/reports/final')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el reporte')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el reporte</h3>
            <p className="text-gray-600 mb-4">{error?.message || 'El reporte no fue encontrado'}</p>
            <Button onClick={() => router.push('/reports/final')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Reporte Final de Investigación"
        description={`Creado el ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
        backUrl="/reports/final"
      />

      {/* Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <ReportStatusBadge status={report.report_status} size="lg" />
        <div className="flex gap-2">
          {report.report_status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => router.push(`/reports/final/${id}/edit`)}>
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
            reportType="final-reports"
            reportId={id}
            reportStatus={report.report_status}
          />
        </div>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="accident">Accidente</TabsTrigger>
          <TabsTrigger value="involved">Involucrados</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="costs">Costos</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        {/* Company Data */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Datos de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.company_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.company_data.nombre && (
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{report.company_data.nombre}</p>
                    </div>
                  )}
                  {report.company_data.rut && (
                    <div>
                      <p className="text-sm text-gray-500">RUT</p>
                      <p className="font-medium">{report.company_data.rut}</p>
                    </div>
                  )}
                  {report.company_data.direccion && (
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{report.company_data.direccion}</p>
                    </div>
                  )}
                  {report.company_data.telefono && (
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{report.company_data.telefono}</p>
                    </div>
                  )}
                  {report.company_data.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{report.company_data.email}</p>
                    </div>
                  )}
                  {report.company_data.contacto && (
                    <div>
                      <p className="text-sm text-gray-500">Contacto</p>
                      <p className="font-medium">{report.company_data.contacto}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No hay datos de empresa registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accident Type */}
        <TabsContent value="accident">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Accidente</CardTitle>
            </CardHeader>
            <CardContent>
              {report.tipo_accidente_tabla ? (
                <div className="flex flex-wrap gap-2">
                  {report.tipo_accidente_tabla.con_baja_il && <Badge>Con Baja - IL</Badge>}
                  {report.tipo_accidente_tabla.sin_baja_il && <Badge variant="secondary">Sin Baja - IL</Badge>}
                  {report.tipo_accidente_tabla.incidente_industrial && <Badge>Incidente Industrial</Badge>}
                  {report.tipo_accidente_tabla.incidente_laboral && <Badge>Incidente Laboral</Badge>}
                </div>
              ) : (
                <p className="text-gray-500">No clasificado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Involved Parties */}
        <TabsContent value="involved">
          <div className="space-y-6">
            {/* People */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personas Involucradas ({report.personas_involucradas?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.personas_involucradas && report.personas_involucradas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.personas_involucradas.map((persona, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4 space-y-2">
                          {persona.nombre && <p className="font-semibold">{persona.nombre}</p>}
                          {persona.cargo && <p className="text-sm text-gray-600">{persona.cargo}</p>}
                          {persona.empresa && <p className="text-sm text-gray-600">{persona.empresa}</p>}
                          {persona.tipo_lesion && <Badge variant="destructive">{persona.tipo_lesion}</Badge>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay personas registradas</p>
                )}
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipos Dañados ({report.equipos_danados?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.equipos_danados && report.equipos_danados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.equipos_danados.map((equipo, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4 space-y-2">
                          {equipo.nombre && <p className="font-semibold">{equipo.nombre}</p>}
                          {equipo.tipo && <p className="text-sm text-gray-600">{equipo.tipo}</p>}
                          {equipo.marca && <p className="text-sm text-gray-600">{equipo.marca}</p>}
                          {equipo.tipo_dano && <Badge variant="outline">{equipo.tipo_dano}</Badge>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay equipos registrados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Análisis y Conclusiones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.detalles_accidente && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Detalles del Accidente</p>
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{report.detalles_accidente}</p>
                </div>
              )}
              {report.descripcion_detallada && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Descripción Detallada</p>
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{report.descripcion_detallada}</p>
                </div>
              )}
              {report.conclusiones && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Conclusiones</p>
                  <p className="text-gray-600 whitespace-pre-wrap bg-blue-50 p-4 rounded-md border-l-4 border-l-blue-600">{report.conclusiones}</p>
                </div>
              )}
              {report.lecciones_aprendidas && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Lecciones Aprendidas</p>
                  <p className="text-gray-600 whitespace-pre-wrap bg-green-50 p-4 rounded-md border-l-4 border-l-green-600">{report.lecciones_aprendidas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs */}
        <TabsContent value="costs">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Costos ({report.costos_tabla?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.costos_tabla && report.costos_tabla.length > 0 ? (
                  <div className="space-y-2">
                    {report.costos_tabla.map((costo, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{costo.concepto}</span>
                        <span className="font-semibold">{costo.monto} {costo.moneda}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay costos registrados</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Responsables de Investigación ({report.responsables_investigacion?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.responsables_investigacion && report.responsables_investigacion.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.responsables_investigacion.map((responsable, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4 space-y-2">
                          {responsable.nombre && <p className="font-semibold">{responsable.nombre}</p>}
                          {responsable.cargo && <p className="text-sm text-gray-600">{responsable.cargo}</p>}
                          {responsable.firma && <p className="text-xs text-gray-500">Firma: {responsable.firma}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay responsables registrados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Photos */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Fotos del Incidente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery
                photos={photos || []}
                loading={photosLoading}
                showFinalReportToggle={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
