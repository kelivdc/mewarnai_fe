// src/routes/my-images.tsx
// My Images page — lets authenticated users view and manage their own uploads.
// Requirements: 7.1–7.5, 8.1, 8.2, 8.5, 8.6

import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Images, Upload, Palette, Calendar, ImageIcon } from 'lucide-react'

import { requireAuth } from '../lib/authGuard'
import { getUserImagesQuery, deleteImageAction } from '../server/actions/images'
import type { GalleryImage } from '../server/actions/images'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Route = createFileRoute('/my-images')({
  beforeLoad: async ({ context, location }) => requireAuth({ context, location }),
  component: MyImagesPage,
})

function toUploadUrl(absolutePath: string): string {
  // Template SVGs served from /public/templates/ — return as-is
  if (absolutePath.startsWith('/templates/')) return absolutePath
  const match = absolutePath.match(/(?:originals|coloring)[/\\][^/\\]+$/)
  if (match) return `/api/uploads/${match[0].replace(/\\/g, '/')}`
  const filename = absolutePath.split(/[/\\]/).pop() ?? ''
  return `/api/uploads/coloring/${filename}`
}

/** Get the best preview URL for an image — colored canvas if saved, B&W base otherwise.
 *  Appends savedAt timestamp as cache-bust so browser shows latest version after re-save. */
function thumbnailUrl(image: GalleryImage): string {
  if (image.hasSave && image.savedAt) {
    return `/api/canvas/${image.id}?v=${new Date(image.savedAt).getTime()}`
  }
  if (image.hasSave) return `/api/canvas/${image.id}`
  return toUploadUrl(image.coloringPath)
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

// Rotating card accent colors for visual variety
const CARD_ACCENTS = [
  { border: 'border-t-pink-400',   badge: 'bg-pink-100 text-pink-700',   icon: 'text-pink-400'   },
  { border: 'border-t-violet-400', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-400' },
  { border: 'border-t-sky-400',    badge: 'bg-sky-100 text-sky-700',      icon: 'text-sky-400'    },
  { border: 'border-t-emerald-400',badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-400' },
  { border: 'border-t-orange-400', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-400' },
  { border: 'border-t-yellow-400', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' },
]

function MyImagesPage() {
  const queryClient = useQueryClient()

  const { data: images = [], isPending, isError, error } = useQuery({
    queryKey: ['my-images'],
    queryFn: () => getUserImagesQuery(),
  })

  const [pendingDelete, setPendingDelete] = React.useState<GalleryImage | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleConfirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    setErrorMessage(null)
    try {
      const result = await deleteImageAction({ data: { imageId: pendingDelete.id } })
      if (!result.success) {
        setErrorMessage(
          result.status === 403
            ? 'You are not allowed to delete this image.'
            : (result.error ?? 'Failed to delete image. Please try again.'),
        )
        setPendingDelete(null)
        setIsDeleting(false)
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['gallery'] })
      await queryClient.invalidateQueries({ queryKey: ['my-images'] })
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setPendingDelete(null)
      setIsDeleting(false)
    }
  }, [pendingDelete, queryClient])

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8"
      style={{
        background: `
          radial-gradient(circle, #f1d5b8 1px, transparent 1px),
          linear-gradient(135deg, #fdf4ff 0%, #eff6ff 50%, #f0fdf4 100%)
        `,
        backgroundSize: '24px 24px, 100% 100%',
      }}
    >
      <LoadingSpinner isLoading={isPending} message="Loading your images…" />

      {/* ── Header ── */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg mb-4">
          <Images size={32} className="text-white" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          My Images
        </h1>
        <p className="mt-2 text-base text-slate-500 font-medium">
          {images.length > 0
            ? `${images.length} image${images.length > 1 ? 's' : ''} uploaded`
            : 'Your uploaded coloring pages live here'}
        </p>
      </header>

      {/* ── Error alert ── */}
      {errorMessage && (
        <div role="alert" className="mx-auto mb-6 max-w-2xl rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3 shadow-sm">
          <span className="text-red-500 text-xl leading-none mt-0.5" aria-hidden="true">⚠️</span>
          <p className="flex-1 text-base font-semibold text-red-700">{errorMessage}</p>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 text-xl leading-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >×</button>
        </div>
      )}

      {/* ── Fetch error ── */}
      {isError && !isPending && (
        <div role="alert" className="mx-auto max-w-md rounded-2xl bg-red-50 p-6 text-center shadow">
          <p className="text-lg font-bold text-red-600">Oops! Something went wrong.</p>
          <p className="mt-1 text-base text-red-500">
            {error instanceof Error ? error.message : 'Failed to load your images.'}
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isPending && !isError && images.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center shadow-inner">
            <ImageIcon size={48} className="text-violet-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-700">No images yet!</p>
            <p className="mt-1 text-base text-slate-400">Upload your first image to start coloring.</p>
          </div>
          <Link
            to="/upload"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-base font-bold shadow-md transition-all active:scale-95"
          >
            <Upload size={18} aria-hidden="true" />
            Upload Image
          </Link>
        </div>
      )}

      {/* ── Image grid ── */}
      {!isPending && !isError && images.length > 0 && (
        <>
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((image, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
              return (
                <div
                  key={image.id}
                  className={`bg-white rounded-2xl shadow-md border-t-4 ${accent.border} overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl`}
                >
                  {/* Thumbnail */}
                  <div className="relative bg-slate-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={thumbnailUrl(image)}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {image.hasSave && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow">
                        <Palette size={11} aria-hidden="true" />
                        In progress
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col gap-3 p-4 flex-1">
                    <p className="text-sm font-bold text-slate-800 break-all leading-snug line-clamp-2" title={image.filename}>
                      {image.filename}
                    </p>

                    <div className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold ${accent.badge}`}>
                      <Calendar size={11} aria-hidden="true" />
                      {formatDate(image.uploadedAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <Link
                        to="/color/$imageId"
                        params={{ imageId: String(image.id) }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-sm font-bold transition-all active:scale-95 min-h-[40px]"
                      >
                        <Palette size={15} aria-hidden="true" />
                        Color
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${image.filename}`}
                        onClick={() => { setErrorMessage(null); setPendingDelete(image) }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-sm font-bold border border-red-200 transition-all active:scale-95 min-h-[40px]"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload more CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-violet-200 hover:border-violet-400 text-violet-600 hover:text-violet-700 text-base font-bold shadow-sm transition-all active:scale-95"
            >
              <Upload size={18} aria-hidden="true" />
              Upload More Images
            </Link>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete Image"
        message={`Are you sure you want to delete "${pendingDelete?.filename}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!isDeleting) setPendingDelete(null) }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
      />
    </div>
  )
}
