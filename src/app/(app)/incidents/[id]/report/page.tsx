'use client'

import { useParams, useRouter } from 'next/navigation'
import { useIncident } from '@/shared/hooks/incident-hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Search,
  ClipboardList,
  FileCheck,
  Shield,
  ArrowRight,
} from 'lucide-react'

export default function IncidentReportPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params?.id as string

  const { data: incident, isLoading, error } = useIncident(incidentId)

  const reportTypes = [
    {
      id: 'flash',
      title: 'Flash Report',
      description: 'Reporte inicial del incidente (dentro de 24 horas)',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      href: `/reports/flash/create?incidentId=${incidentId}`,
      timeframe: '24 horas',
    },
    {
      id: 'immediate',
      title: 'Acciones Inmediatas',
      description: 'Plan de acciones inmediatas (24-48 horas)',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: `/reports/immediate-actions/create?incidentId=${incidentId}`,
      timeframe: '24-48 horas',
    },
    {
      id: 'root-cause',
      title: 'Análisis Causa Raíz',
      description: 'Análisis detallado de causas raíz (2-7 días)',
      icon: Search,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: `/reports/root-cause/create?incidentId=${incidentId}`,
      timeframe: '2-7 días',
    },
    {
      id: 'action-plan',
      title: 'Plan de Acción',
      description: 'Plan de acción correctiva y preventiva (7-14 días)',
      icon: ClipboardList,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: `/reports/action-plan/create?incidentId=${incidentId}`,
      timeframe: '7-14 días',
    },
    {
      id: 'final',
      title: 'Reporte Final',
      description: 'Informe final consolidado del incidente',
      icon: FileCheck,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      href: `/reports/final/create?incidentId=${incidentId}`,
      timeframe: 'Al completar',
    },
    {
      id: 'zero-tolerance',
      title: 'Tolerancia Cero',
      description: 'Reporte de política de tolerancia cero',
      icon: Shield,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: `/reports/zero-tolerance/create?incidentId=${incidentId}`,
      timeframe: 'Inmediato',
    },
  ]

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
              Error al Cargar el Incidente
            </CardTitle>
            <CardDescription>
              {error?.message || 'Error al cargar los detalles del incidente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/incidents')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Incidentes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/incidents/${incidentId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Incidente
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generar Reporte</h1>
        <p className="text-gray-600">
          Selecciona el tipo de reporte para el incidente: <strong>{incident.title}</strong>
        </p>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(report.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.iconColor}`} />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {report.timeframe}
                  </span>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  <span>Crear reporte</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
