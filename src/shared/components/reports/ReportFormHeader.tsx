/**
 * Report Form Header Component
 * Reusable header for report forms
 */

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useRouter } from 'next/navigation'

interface ReportFormHeaderProps {
  title: string
  description?: string
  backUrl: string
}

export function ReportFormHeader({ title, description, backUrl }: ReportFormHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => router.push(backUrl)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
    </div>
  )
}
