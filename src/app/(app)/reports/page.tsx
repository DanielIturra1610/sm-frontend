/**
 * Reports Page - Main Reports Hub
 * Central hub for all incident reports
 */

'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import {
  FileText,
  AlertCircle,
  Search,
  ClipboardList,
  FileCheck,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function ReportsPage() {
  const router = useRouter()

  const reportTypes = [
    {
      id: 'flash',
      title: 'Flash Report',
      description: 'Reporte inicial del incidente (dentro de 24 horas)',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/reports/flash',
      timeframe: '24 horas',
    },
    {
      id: 'immediate',
      title: 'Acciones Inmediatas',
      description: 'Plan de acciones inmediatas (24-48 horas)',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/reports/immediate-actions',
      timeframe: '24-48 horas',
    },
    {
      id: 'root-cause',
      title: 'Análisis Causa Raíz',
      description: 'Análisis detallado de causas raíz (2-7 días)',
      icon: Search,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/reports/root-cause',
      timeframe: '2-7 días',
    },
    {
      id: 'action-plan',
      title: 'Plan de Acción',
      description: 'Plan de acción correctiva y preventiva (7-14 días)',
      icon: ClipboardList,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/reports/action-plan',
      timeframe: '7-14 días',
    },
    {
      id: 'final',
      title: 'Reporte Final',
      description: 'Informe final consolidado del incidente',
      icon: FileCheck,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/reports/final',
      timeframe: 'Al completar',
    },
    {
      id: 'zero-tolerance',
      title: 'Tolerancia Cero',
      description: 'Reporte de política de tolerancia cero',
      icon: Shield,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/reports/zero-tolerance',
      timeframe: 'Inmediato',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes de Incidentes</h1>
        <p className="text-gray-600">Gestiona todos los reportes relacionados con incidentes de seguridad</p>
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
                  <span>Ver reportes</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Reportes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">12</span>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">En Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">8</span>
              <Clock className="h-4 w-4 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">45</span>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">65</span>
              <FileCheck className="h-4 w-4 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
