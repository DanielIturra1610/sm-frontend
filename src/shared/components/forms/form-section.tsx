'use client'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  separator?: boolean
}

export function FormSection({ title, description, children, className, separator = true }: FormSectionProps) {
  return (
    <Card className={cn('border-0 shadow-none bg-transparent', className)}>
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription className="pt-1">{description}</CardDescription>}
        {separator && <Separator className="mt-3" />}
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface FormActionsProps {
  children: ReactNode
  className?: string
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 pt-6', className)}>
      <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 sm:justify-start mt-4 sm:mt-0">
        {children}
      </div>
    </div>
  )
}

interface FormSubmitButtonProps {
  children: ReactNode
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'warning'
  className?: string
}

export function FormSubmitButton({ 
  children, 
  loading = false, 
  variant = 'primary', 
  className 
}: FormSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      variant={variant} 
      loading={loading}
      className={className}
    >
      {children}
    </Button>
  )
}

interface FormCancelButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'secondary' | 'outline' | 'ghost'
  className?: string
}

export function FormCancelButton({ 
  children, 
  onClick, 
  variant = 'outline', 
  className 
}: FormCancelButtonProps) {
  return (
    <Button 
      type="button" 
      variant={variant} 
      onClick={onClick}
      className={className}
    >
      {children}
    </Button>
  )
}