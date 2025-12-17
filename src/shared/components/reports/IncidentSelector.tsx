/**
 * Suceso Selector Component
 * Select a suceso for report creation
 */

'use client'

import { useIncidents } from '@/shared/hooks/incident-hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import type { Incident } from '@/shared/types/api'

interface IncidentSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function IncidentSelector({ value, onChange, error, required = true }: IncidentSelectorProps) {
  const { data: incidentsResponse, isLoading, error: fetchError } = useIncidents()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Suceso {required && <span className="text-red-500">*</span>}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="space-y-2">
        <Label>Suceso {required && <span className="text-red-500">*</span>}</Label>
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>Error al cargar sucesos</span>
        </div>
      </div>
    )
  }

  const incidents = incidentsResponse?.data || []

  return (
    <div className="space-y-2">
      <Label htmlFor="incident_id">
        Suceso {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="incident_id" className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Seleccionar suceso" />
        </SelectTrigger>
        <SelectContent>
          {incidents.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No hay sucesos disponibles
            </div>
          ) : (
            incidents.map((incident: Incident) => (
              <SelectItem key={incident.id} value={incident.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{incident.title}</span>
                  <span className="text-xs text-gray-500">
                    {incident.severity} - {incident.location}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
