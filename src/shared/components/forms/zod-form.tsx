'use client'

import { ReactNode } from 'react'
import { FormProvider, useForm, UseFormProps, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'
import { FormWrapper } from '@/shared/components/forms/form-wrapper'
import { FormSubmitButton, FormCancelButton, FormActions } from '@/shared/components/forms/form-section'

interface ZodFormProps<T extends FieldValues> {
  schema: ZodSchema<T>
  onSubmit: (data: T) => void | Promise<void>
  children: ReactNode
  defaultValues?: UseFormProps<T>['defaultValues']
  title: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  loading?: boolean
  className?: string
}

export function ZodForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  defaultValues,
  title,
  description,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  onCancel,
  loading = false,
  className
}: ZodFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={className}>
        <FormWrapper title={title} description={description}>
          {children}
          <FormActions>
            {onCancel && (
              <FormCancelButton onClick={onCancel} variant="outline">
                {cancelLabel}
              </FormCancelButton>
            )}
            <FormSubmitButton
              loading={loading}
              type="submit"
              disabled={!form.formState.isValid || loading}
            >
              {submitLabel}
            </FormSubmitButton>
          </FormActions>
        </FormWrapper>
      </form>
    </FormProvider>
  )
}

export { useForm, useFormContext } from 'react-hook-form'
export { zodResolver } from '@hookform/resolvers/zod'