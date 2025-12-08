'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Edit2,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { EnhancedAttachment } from '@/lib/api/services/attachment-service'

interface PhotoGalleryProps {
  photos: EnhancedAttachment[]
  loading?: boolean
  onDelete?: (id: string) => Promise<void>
  onUpdateCaption?: (id: string, caption: string) => Promise<void>
  onToggleFinalReport?: (id: string, include: boolean) => Promise<void>
  showFinalReportToggle?: boolean
  className?: string
}

export function PhotoGallery({
  photos,
  loading = false,
  onDelete,
  onUpdateCaption,
  onToggleFinalReport,
  showFinalReportToggle = false,
  className,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionValue, setCaptionValue] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return

      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          setZoom(z => Math.min(z + 0.25, 3))
          break
        case '-':
          setZoom(z => Math.max(z - 0.25, 0.5))
          break
        case 'r':
          setRotation(r => (r + 90) % 360)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, photos.length])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setZoom(1)
    setRotation(0)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    setEditingCaption(null)
    setZoom(1)
    setRotation(0)
  }

  const goToPrevious = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1)
    setZoom(1)
    setRotation(0)
  }

  const goToNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1)
    setZoom(1)
    setRotation(0)
  }

  const handleDelete = async (photo: EnhancedAttachment) => {
    if (!onDelete) return
    setActionLoading(photo.id)
    try {
      await onDelete(photo.id)
      if (lightboxIndex !== null) {
        if (photos.length <= 1) {
          closeLightbox()
        } else if (lightboxIndex >= photos.length - 1) {
          setLightboxIndex(photos.length - 2)
        }
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveCaption = async (photo: EnhancedAttachment) => {
    if (!onUpdateCaption) return
    setActionLoading(photo.id)
    try {
      await onUpdateCaption(photo.id, captionValue)
      setEditingCaption(null)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleFinalReport = async (photo: EnhancedAttachment) => {
    if (!onToggleFinalReport) return
    setActionLoading(photo.id)
    try {
      await onToggleFinalReport(photo.id, !photo.include_in_final)
    } finally {
      setActionLoading(null)
    }
  }

  const startEditCaption = (photo: EnhancedAttachment) => {
    setEditingCaption(photo.id)
    setCaptionValue(photo.caption || '')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No hay fotos</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid Gallery */}
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3', className)}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            {/* Thumbnail Image */}
            <img
              src={photo.thumbnail_signed_url || photo.signed_url}
              alt={photo.caption || photo.file_name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

            {/* Final Report Badge */}
            {showFinalReportToggle && photo.include_in_final && (
              <div className="absolute top-2 left-2 bg-stegmaier-blue text-white text-xs px-2 py-0.5 rounded">
                Reporte Final
              </div>
            )}

            {/* Caption preview */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">{photo.caption}</p>
              </div>
            )}

            {/* Quick actions on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(photo)
                  }}
                  disabled={actionLoading === photo.id}
                  className="p-1.5 bg-red-500 hover:bg-red-600 rounded text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95" onClick={closeLightbox}>
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center p-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.signed_url}
              alt={currentPhoto.caption || currentPhoto.file_name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Bottom toolbar */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Photo info */}
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="font-medium">{currentPhoto.file_name}</p>
                  <p className="text-sm text-white/70">
                    {formatFileSize(currentPhoto.file_size)}
                    {currentPhoto.photo_width && currentPhoto.photo_height && (
                      <> &bull; {currentPhoto.photo_width} x {currentPhoto.photo_height}</>
                    )}
                    {currentPhoto.taken_at && (
                      <> &bull; {new Date(currentPhoto.taken_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="text-sm text-white/70">
                  {lightboxIndex + 1} / {photos.length}
                </div>
              </div>

              {/* Caption */}
              <div className="flex items-center gap-2">
                {editingCaption === currentPhoto.id ? (
                  <>
                    <Input
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      placeholder="Agregar descripción..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveCaption(currentPhoto)}
                      disabled={actionLoading === currentPhoto.id}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCaption(null)}
                      className="text-white hover:text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-white/80 flex-1">
                      {currentPhoto.caption || 'Sin descripción'}
                    </p>
                    {onUpdateCaption && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditCaption(currentPhoto)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Actions bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Zoom controls */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-white/70 text-sm min-w-[4ch] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Include in final report toggle */}
                  {showFinalReportToggle && onToggleFinalReport && (
                    <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                      <Checkbox
                        checked={currentPhoto.include_in_final}
                        onCheckedChange={() => handleToggleFinalReport(currentPhoto)}
                        disabled={actionLoading === currentPhoto.id}
                      />
                      <span className="text-sm">Incluir en Reporte Final</span>
                    </label>
                  )}

                  {/* Download */}
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <a href={currentPhoto.signed_url} download={currentPhoto.file_name}>
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </Button>

                  {/* Delete */}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(currentPhoto)}
                      disabled={actionLoading === currentPhoto.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      {actionLoading === currentPhoto.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
