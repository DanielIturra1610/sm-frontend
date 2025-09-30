'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/lib/utils'

interface FormWrapperProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function FormWrapper({ title, description, children, footer, className }: FormWrapperProps) {
  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}