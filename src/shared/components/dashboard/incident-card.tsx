'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { StatusBadge } from '@/shared/components/ui/status-badge'
import { Badge } from '@/shared/components/ui/badge'
import { Calendar, MapPin, User, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Incident } from '@/shared/types/api'
import { ReactNode } from 'react'

interface IncidentCardProps {
  incident: Incident
  children?: ReactNode
  className?: string
}

export function IncidentCard({ incident, children, className }: IncidentCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl truncate">{incident.title}</CardTitle>
              <StatusBadge variant={incident.status} className="flex-shrink-0">
                {incident.status}
              </StatusBadge>
            </div>
            <CardDescription className="mt-1 truncate">{incident.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <StatusBadge variant={incident.severity} size="sm">
              {incident.severity}
            </StatusBadge>
            <StatusBadge variant={incident.type} size="sm">
              {incident.type}
            </StatusBadge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-stegmaier-gray" />
            <span className="text-stegmaier-gray-dark">{incident.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-stegmaier-gray" />
            <span className="text-stegmaier-gray-dark">Reportado: {formatDate(incident.reportedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-stegmaier-gray" />
            <span className="text-stegmaier-gray-dark">Reportado por: {incident.reportedBy}</span>
          </div>
          {incident.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-stegmaier-gray" />
              <span className="text-stegmaier-gray-dark">Asignado a: {incident.assignedTo}</span>
            </div>
          )}
          {incident.tags && incident.tags.length > 0 && (
            <div className="md:col-span-2 flex flex-wrap gap-1 mt-1">
              {incident.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-stegmaier-gray-light">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}