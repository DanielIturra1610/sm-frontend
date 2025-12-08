'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileWarning, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  disabled?: boolean
  className?: string
}

interface FilePreview {
  file: File
  preview: string
  error?: string
}

export function PhotoUploader({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = 'image/*',
  disabled = false,
  className,
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten imágenes'
    }
    if (file.size > maxSizeBytes) {
      return `El archivo excede ${maxSizeMB}MB`
    }
    return null
  }

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxFiles - previews.length

    if (fileArray.length > remainingSlots) {
      fileArray.splice(remainingSlots)
    }

    const newPreviews: FilePreview[] = fileArray.map(file => {
      const error = validateFile(file)
      return {
        file,
        preview: error ? '' : URL.createObjectURL(file),
        error,
      }
    })

    setPreviews(prev => [...prev, ...newPreviews])
  }, [maxFiles, previews.length, maxSizeBytes])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const removePreview = useCallback((index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev]
      // Revoke URL to free memory
      if (newPreviews[index].preview) {
        URL.revokeObjectURL(newPreviews[index].preview)
      }
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }, [])

  const handleUpload = async () => {
    const validFiles = previews.filter(p => !p.error).map(p => p.file)
    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      await onUpload(validFiles)
      // Clear previews after successful upload
      previews.forEach(p => {
        if (p.preview) URL.revokeObjectURL(p.preview)
      })
      setPreviews([])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const clearAll = () => {
    previews.forEach(p => {
      if (p.preview) URL.revokeObjectURL(p.preview)
    })
    setPreviews([])
  }

  const validCount = previews.filter(p => !p.error).length
  const canUpload = validCount > 0 && !isUploading && !disabled

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          isDragging && 'border-stegmaier-blue bg-stegmaier-blue/5',
          !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'p-3 rounded-full',
            isDragging ? 'bg-stegmaier-blue/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'h-6 w-6',
              isDragging ? 'text-stegmaier-blue' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="font-medium">
              {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic'}
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, HEIC hasta {maxSizeMB}MB (máx. {maxFiles} archivos)
            </p>
          </div>
        </div>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {validCount} de {previews.length} archivo(s) listos
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isUploading}
            >
              Limpiar todo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border',
                  preview.error ? 'border-red-300 bg-red-50' : 'border-border'
                )}
              >
                {preview.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <FileWarning className="h-8 w-8 text-red-500 mb-1" />
                    <p className="text-xs text-red-600 text-center">{preview.error}</p>
                    <p className="text-xs text-red-500 truncate max-w-full">
                      {preview.file.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={preview.preview}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                      <p className="text-xs text-white truncate">{preview.file.name}</p>
                    </div>
                  </>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePreview(index)
                  }}
                  disabled={isUploading}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir {validCount} foto{validCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
