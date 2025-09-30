'use client'

import { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'

interface InputFieldProps {
  name: string
  label: string
  description?: string
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}

export function InputField({ 
  name, 
  label, 
  description, 
  placeholder, 
  type = "text", 
  required = false,
  className 
}: InputFieldProps) {
  const { control } = useFormContext()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              type={type} 
              {...field} 
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface TextareaFieldProps {
  name: string
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  className?: string
  rows?: number
}

export function TextareaField({ 
  name, 
  label, 
  description, 
  placeholder, 
  required = false,
  className,
  rows = 4
}: TextareaFieldProps) {
  const { control } = useFormContext()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder={placeholder} 
              rows={rows}
              {...field} 
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface SelectFieldProps {
  name: string
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function SelectField({ 
  name, 
  label, 
  description, 
  placeholder, 
  required = false,
  className,
  children
}: SelectFieldProps) {
  const { control } = useFormContext()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {children}
              </SelectContent>
            </Select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface CheckboxFieldProps {
  name: string
  label: string
  description?: string
  required?: boolean
  className?: string
}

export function CheckboxField({ 
  name, 
  label, 
  description, 
  required = false,
  className
}: CheckboxFieldProps) {
  const { control } = useFormContext()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center space-x-2">
            <FormControl>
              <Checkbox 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>
              {label} {required && <span className="text-destructive">*</span>}
            </FormLabel>
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface FormSectionFieldProps {
  name: string
  label: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSectionField({ 
  name, 
  label, 
  description, 
  children, 
  className 
}: FormSectionFieldProps) {
  const { control } = useFormContext()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            {typeof children === 'function' ? children({ ...field }) : children}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}