// src/components/ImageUploadForm.tsx
// Image upload form — TanStack Form with client-side validation.
// Client validates: JPEG/PNG/WebP and ≤ 10 MB before sending.
// Shows inline spinner while uploading, success/error feedback after.
// Requirements: 3.1–3.4, 3.7, 3.8, 8.1, 8.5, 8.6

import { useRef, useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Upload, CheckCircle, XCircle, ImageIcon, Loader2 } from 'lucide-react'

import { uploadImageAction } from '../server/actions/images'
import { Button } from './ui/button'
import { Label } from './ui/label'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const ACCEPTED_LABELS = 'JPEG, PNG, WebP'

// ---------------------------------------------------------------------------
// Toast state type
// ---------------------------------------------------------------------------

type ToastKind = 'success' | 'error'

interface ToastState {
  kind: ToastKind
  message: string
}

// ---------------------------------------------------------------------------
// ImageUploadForm
// ---------------------------------------------------------------------------

export function ImageUploadForm() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [toast, setToast] = useState<ToastState | null>(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const startSpinnerTimer = () => {
    spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), 500)
  }
  const stopSpinnerTimer = () => {
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current)
      spinnerTimerRef.current = null
    }
    setShowSpinner(false)
  }

  const showToast = (kind: ToastKind, message: string) => {
    setToast({ kind, message })
    // Auto-dismiss success toasts after 4 s
    if (kind === 'success') {
      setTimeout(() => setToast(null), 4000)
    }
  }

  // ---------------------------------------------------------------------------
  // TanStack Form
  // ---------------------------------------------------------------------------

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    onSubmit: async ({ value }) => {
      setToast(null)
      startSpinnerTimer()

      try {
        if (!value.file) {
          showToast('error', 'Pilih file gambar terlebih dahulu.')
          return
        }

        const formData = new FormData()
        formData.append('file', value.file)

        const result = await uploadImageAction({ data: formData })

        if (!result.success) {
          showToast('error', result.error ?? 'Gagal mengunggah gambar.')
          return
        }

        // Req 3.7: success notification + invalidate gallery cache
        showToast('success', 'Gambar berhasil diunggah! Mengalihkan ke halaman explore…')

        await queryClient.invalidateQueries({ queryKey: ['images'] })

        // Navigate to explore after brief delay so user sees success toast
        setTimeout(() => {
          navigate({ to: '/explore' })
        }, 1500)
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
        )
      } finally {
        stopSpinnerTimer()
      }
    },
  })

  const isSubmitting = form.state.isSubmitting

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* ── Loading overlay (shown after 500ms — req 8.6) ──────────── */}
      {showSpinner && (
        <div
          role="status"
          aria-label="Sedang mengunggah gambar…"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border px-8 py-6 shadow-xl">
            <Loader2 size={48} className="animate-spin text-brand-green" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">Mengunggah gambar…</p>
          </div>
        </div>
      )}

      {/* ── Toast notification ──────────────────────────────────────── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={[
            'mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-base font-semibold',
            toast.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-700',
          ].join(' ')}
        >
          {toast.kind === 'success' ? (
            <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
          ) : (
            <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
        className="space-y-6"
        aria-label="Form unggah gambar"
      >
        {/* File field */}
        <form.Field
          name="file"
          validators={{
            onChange: ({ value }) => {
              if (!value) return undefined // no file yet — silent
              if (!ACCEPTED_MIME_TYPES.includes(value.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
                return `Format tidak didukung. Gunakan ${ACCEPTED_LABELS}.`
              }
              if (value.size > MAX_FILE_SIZE_BYTES) {
                return 'Ukuran file terlalu besar. Maksimal 5 MB.'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-3">
              <Label
                htmlFor={field.name}
                className="text-base font-bold text-foreground"
              >
                Pilih Gambar
              </Label>

              {/* Drop zone / file picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                aria-label="Klik untuk memilih gambar"
                className={[
                  'relative w-full rounded-2xl border-2 border-dashed transition-colors cursor-pointer',
                  'flex flex-col items-center justify-center gap-3 p-8 text-center',
                  'min-h-[200px]',
                  field.state.meta.errors.length > 0
                    ? 'border-red-400 bg-red-50'
                    : field.state.value
                      ? 'border-green-400 bg-green-50'
                      : 'border-border bg-muted/40 hover:border-brand-green hover:bg-green-50/40',
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {previewUrl ? (
                  // Image preview
                  <img
                    src={previewUrl}
                    alt="Preview gambar yang dipilih"
                    className="max-h-40 max-w-full rounded-xl object-contain shadow"
                  />
                ) : (
                  <ImageIcon
                    size={48}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                )}

                <div className="space-y-1">
                  {field.state.value ? (
                    <>
                      <p className="text-base font-bold text-green-700">
                        {field.state.value.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {(field.state.value.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-semibold text-foreground">
                        Klik untuk memilih gambar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ACCEPTED_LABELS} · Maksimal 5 MB
                      </p>
                    </>
                  )}
                </div>
              </button>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                id={field.name}
                name={field.name}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isSubmitting}
                aria-hidden="true"
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null
                  field.handleChange(picked)

                  // Generate preview URL
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(picked ? URL.createObjectURL(picked) : null)
                }}
              />

              {/* Field-level error (req 3.3 / 3.4) */}
              {field.state.meta.errors.length > 0 && (
                <p
                  id={`${field.name}-error`}
                  role="alert"
                  className="flex items-center gap-1.5 text-base font-semibold text-red-600"
                >
                  <XCircle size={16} aria-hidden="true" />
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Submit button (req 8.2, 8.5: bright color, icon, large) */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.values.file]}>
          {([canSubmit, submitting, file]) => (
            <Button
              type="submit"
              disabled={!canSubmit || !!submitting || !file}
              className={[
                'w-full h-14 text-lg font-extrabold rounded-xl gap-3',
                'bg-brand-green hover:bg-brand-green/90 text-white',
                'min-h-[44px]',
                (!canSubmit || !!submitting || !file) ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {submitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" aria-hidden="true" />
                  Mengunggah…
                </>
              ) : (
                <>
                  <Upload size={22} aria-hidden="true" />
                  Unggah Gambar
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
