// src/routes/color/$imageId.tsx
// Canvas coloring view for a specific coloring page image.
// Requirements: 5.1–5.8, 6.1–6.7, 8.1, 8.2, 8.5, 8.6
// Auth guard: Requirements 2.6

import { useRef, useState, useCallback, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Undo2, RotateCcw, Save, Download, Maximize2, Minimize2 } from 'lucide-react'

import { requireAuth } from '../../lib/authGuard'
import { getUserImagesQuery } from '../../server/actions/images'
import { getColoringSaveQuery } from '../../server/actions/coloring'
import { COLOR_PALETTE } from '../../lib/colorPalette'
import ColoringCanvas from '../../components/ColoringCanvas'
import type { ColoringCanvasHandle } from '../../components/ColoringCanvas'
import { ColorPalette } from '../../components/ColorPalette'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ConfirmDialog } from '../../components/ConfirmDialog'

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/color/$imageId')({
  beforeLoad: async ({ context, location }) => requireAuth({ context, location }),
  component: ColorPage,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an absolute filesystem path (e.g. /uploads/coloring/abc.png)
 * to a browser-accessible URL served by the /api/uploads/ route.
 * Requirements: 5.1
 */
function toUploadUrl(absolutePath: string): string {
  // Template SVGs served from /public/templates/ — return as-is
  if (absolutePath.startsWith('/templates/')) return absolutePath
  const match = absolutePath.match(/(?:originals|coloring)[/\\][^/\\]+$/)
  if (match) return `/api/uploads/${match[0].replace(/\\/g, '/')}`
  const filename = absolutePath.split(/[/\\]/).pop() ?? ''
  return `/api/uploads/coloring/${filename}`
}

// ---------------------------------------------------------------------------
// Toast state type
// ---------------------------------------------------------------------------

type ToastState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null

// ---------------------------------------------------------------------------
// ColorPage component
// ---------------------------------------------------------------------------

function ColorPage() {
  const { imageId: imageIdStr } = Route.useParams()
  const imageId = Number(imageIdStr)

  // ── Data fetching ─────────────────────────────────────────────────────────

  const {
    data: images,
    isPending: imagesLoading,
    isError: imagesError,
  } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => getUserImagesQuery(),
  })

  const image = images?.find((img) => img.id === imageId)

  const {
    data: coloringSave,
    isPending: saveLoading,
    isError: saveError,
  } = useQuery({
    queryKey: ['coloring-save', imageId],
    queryFn: () => getColoringSaveQuery({ data: { imageId } }),
    // Only fetch save once we have a valid imageId
    enabled: !isNaN(imageId) && imageId > 0,
    // Always fetch fresh from server — never use a stale cached null
    staleTime: 0,
    gcTime: 0,
  })

  // ── Local state ───────────────────────────────────────────────────────────

  const [activeColor, setActiveColor] = useState<string>(COLOR_PALETTE[0].hex)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<ColoringCanvasHandle>(null)
  const queryClient = useQueryClient()

  // ── Fullscreen mode: toggle class on <html> to hide Nav + Footer ──────
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.classList.add('fullscreen-coloring')
    } else {
      document.documentElement.classList.remove('fullscreen-coloring')
    }
    return () => {
      document.documentElement.classList.remove('fullscreen-coloring')
    }
  }, [isFullscreen])

  // ── Navigation guard for unsaved changes (Req 6.7) ────────────────────────
  // ColoringCanvas already attaches a beforeunload handler when dirty.
  // We additionally guard in-app navigation via a popstate listener.
  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        // Push the state back to keep the user on this page
        window.history.pushState(null, '', window.location.href)
        const confirmed = window.confirm(
          'Kamu punya perubahan yang belum disimpan. Keluar tanpa menyimpan?',
        )
        if (confirmed) {
          window.history.back()
        }
      }
    }
    // Push a state so we can intercept the back button
    if (isDirty) {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty])

  // ── Toast auto-dismiss ────────────────────────────────────────────────────

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo()
  }, [])

  const handleReset = useCallback(() => {
    setShowResetConfirm(true)
  }, [])

  const handleConfirmReset = useCallback(() => {
    canvasRef.current?.reset()
    setShowResetConfirm(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const result = await canvasRef.current?.save(imageId)
      if (!result) {
        setToast({ type: 'error', message: 'Gagal menyimpan — canvas tidak tersedia.' })
        return
      }
      if (result.success) {
        // Invalidate the cached save so re-opening the page fetches fresh data
        await queryClient.invalidateQueries({ queryKey: ['coloring-save', imageId] })
        await queryClient.invalidateQueries({ queryKey: ['my-images'] })
        await queryClient.invalidateQueries({ queryKey: ['gallery'] })
        setToast({ type: 'success', message: '✅ Progres berhasil disimpan!' })
      } else {
        setToast({ type: 'error', message: `❌ ${result.error ?? 'Gagal menyimpan.'}` })
      }
    } finally {
      setIsSaving(false)
    }
  }, [imageId, isSaving, queryClient])

  const handleDownload = useCallback(async () => {
    const blob = await canvasRef.current?.getBlob()
    if (!blob) {
      setToast({ type: 'error', message: 'Gagal mengunduh — canvas tidak tersedia.' })
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    // Strip extension from original filename and use it for the download name
    const baseName = image
      ? image.filename.replace(/\.[^.]+$/, '')
      : 'mewarnai'
    a.href = url
    a.download = `${baseName}-mewarnai.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast({ type: 'success', message: '⬇️ Gambar berhasil diunduh!' })
  }, [image])

  // ── Loading & error states ────────────────────────────────────────────────

  const isLoading = imagesLoading || saveLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner isLoading={true} message="Memuat halaman mewarnai…" fullscreen={false} />
      </div>
    )
  }

  if (imagesError || saveError || !image) {
    return (
      <div
        role="alert"
        className="min-h-screen bg-amber-50 flex items-center justify-center px-4"
      >
        <div className="max-w-md rounded-2xl bg-red-50 p-8 text-center shadow-md">
          <p className="text-2xl font-extrabold text-red-600 mb-2">Oops!</p>
          <p className="text-base text-red-500">
            {!image
              ? 'Gambar tidak ditemukan.'
              : 'Gagal memuat data. Coba muat ulang halaman.'}
          </p>
        </div>
      </div>
    )
  }

  const imageUrl = toUploadUrl(image.coloringPath)
  const savedCanvasData = coloringSave?.canvasData

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={[
      isFullscreen
        ? 'fixed inset-0 z-60 bg-amber-50 flex flex-col'
        : 'min-h-screen bg-amber-50 flex flex-col',
    ].join(' ')}>

      {/* ── SaveSpinner overlay ──────────────────────────────────────── */}
      <LoadingSpinner isLoading={isSaving} message="Menyimpan…" fullscreen={true} />

      {/* ── Toast banner (Req 6.5, 6.6) ─────────────────────────────── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'fixed top-4 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg',
            'text-base font-semibold max-w-sm w-full text-center',
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300',
          ].join(' ')}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setToast(null)}
            className="ml-auto text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Persistent fullscreen toggle (top-right, always visible on desktop) ── */}
      <button
        type="button"
        onClick={() => setIsFullscreen((prev) => !prev)}
        aria-label={isFullscreen ? 'Kembali ke tampilan normal' : 'Tampilkan layar penuh'}
        title={isFullscreen ? 'Kembali Normal' : 'Layar Penuh'}
        className={[
          'fixed top-3 right-3 z-[70] hidden lg:inline-flex items-center gap-1.5',
          'px-3 py-2 rounded-xl text-sm font-bold shadow-md transition-all',
          'min-h-[36px] border',
          isFullscreen
            ? 'bg-white/90 backdrop-blur text-amber-600 border-amber-300 hover:bg-white'
            : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
        ].join(' ')}
      >
        {isFullscreen ? (
          <>
            <Minimize2 size={16} aria-hidden="true" />
            <span>Kembali</span>
          </>
        ) : (
          <>
            <Maximize2 size={16} aria-hidden="true" />
            <span>Layar Penuh</span>
          </>
        )}
      </button>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className={[
        'bg-white border-b border-amber-200 px-4 py-3 flex items-center gap-3',
        isFullscreen ? 'hidden' : '',
      ].join(' ')}>
        <h1 className="text-xl font-extrabold text-amber-700 truncate">
          🎨 {image.filename}
        </h1>
        {isDirty && (
          <span className="ml-auto shrink-0 text-sm font-semibold text-orange-500">
            • Belum disimpan
          </span>
        )}
      </header>

      {/* ── Main layout: canvas left, sidebar right ──────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 gap-0 overflow-hidden">

        {/* ── Canvas area ─────────────────────────────────────────────── */}
        <main
          className={[
            'flex-1 flex justify-center overflow-auto',
            isFullscreen
              ? 'items-start p-0 sm:p-2'   // no vertical centering in fullscreen — prevents top cut-off
              : 'items-center p-0 sm:p-4',
          ].join(' ')}
          aria-label="Area mewarnai"
        >
          <ColoringCanvas
            ref={canvasRef}
            imageUrl={imageUrl}
            coloringSave={savedCanvasData ?? undefined}
            activeColor={activeColor}
            onDirtyChange={setIsDirty}
          />
        </main>

        {/* ── Sidebar: palette + toolbar ───────────────────────────────── */}
        <aside
          className={[
            'lg:w-72 xl:w-80 flex flex-col',
            'bg-white border-t lg:border-t-0 lg:border-l border-amber-200',
            'overflow-y-auto',
            isFullscreen ? 'hidden' : '',
          ].join(' ')}
          aria-label="Panel warna dan alat"
        >

          {/* ── Color palette ─────────────────────────────────────────── */}
          <div className="p-4 border-b border-amber-100">
            <p className="text-base font-extrabold text-amber-700 mb-3">
              🖌️ Pilih Warna
            </p>
            <ColorPalette
              selectedColor={activeColor}
              onColorSelect={setActiveColor}
            />
          </div>

          {/* ── Toolbar ───────────────────────────────────────────────── */}
          <div className="p-4 flex flex-col gap-3">
            <p className="text-base font-extrabold text-amber-700 mb-1">
              🔧 Alat
            </p>

            {/* Undo button (Req 5.7, 8.5) */}
            <button
              type="button"
              onClick={handleUndo}
              aria-label="Batalkan langkah terakhir"
              className={[
                'flex items-center gap-3 w-full rounded-xl px-4 py-3',
                'min-h-[44px]', // WCAG touch target (Req 8.1)
                'bg-amber-50 hover:bg-amber-100 active:bg-amber-200',
                'border-2 border-amber-300 hover:border-amber-500',
                'text-base font-bold text-amber-800',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400',
              ].join(' ')}
            >
              <Undo2 size={22} aria-hidden="true" className="shrink-0 text-amber-600" />
              <span>Urungkan</span>
            </button>

            {/* Reset button (Req 5.8, 8.5) */}
            <button
              type="button"
              onClick={handleReset}
              aria-label="Hapus semua warna dan mulai ulang"
              className={[
                'flex items-center gap-3 w-full rounded-xl px-4 py-3',
                'min-h-[44px]',
                'bg-orange-50 hover:bg-orange-100 active:bg-orange-200',
                'border-2 border-orange-300 hover:border-orange-500',
                'text-base font-bold text-orange-800',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400',
              ].join(' ')}
            >
              <RotateCcw size={22} aria-hidden="true" className="shrink-0 text-orange-600" />
              <span>Mulai Ulang</span>
            </button>

            {/* Save button (Req 6.1, 8.5) */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Simpan progres mewarnai"
              className={[
                'flex items-center gap-3 w-full rounded-xl px-4 py-3',
                'min-h-[44px]',
                'bg-green-500 hover:bg-green-600 active:bg-green-700',
                'disabled:bg-green-300 disabled:cursor-not-allowed',
                'text-base font-bold text-white',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400',
              ].join(' ')}
            >
              <Save size={22} aria-hidden="true" className="shrink-0" />
              <span>{isSaving ? 'Menyimpan…' : 'Simpan'}</span>
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Unduh hasil mewarnai sebagai PNG"
              className={[
                'flex items-center gap-3 w-full rounded-xl px-4 py-3',
                'min-h-[44px]',
                'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
                'text-base font-bold text-white',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400',
              ].join(' ')}
            >
              <Download size={22} aria-hidden="true" className="shrink-0" />
              <span>Unduh PNG</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── Fullscreen floating toolbar ──────────────────────────────── */}
      {isFullscreen && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-amber-200 px-3 py-2">
          <div className="flex items-center gap-2 max-w-full overflow-x-auto">
            {/* Inline color palette — horizontal scroll */}
            <div className="flex items-center gap-1.5 shrink-0">
              {COLOR_PALETTE.map((color) => {
                const isSelected = activeColor?.toLowerCase() === color.hex.toLowerCase()
                return (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    onClick={() => setActiveColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={[
                      'w-8 h-8 rounded-full border-2 shrink-0 transition-all',
                      isSelected
                        ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-700 scale-110'
                        : 'border-gray-300 hover:scale-105',
                    ].join(' ')}
                  />
                )
              })}
            </div>

            <div className="w-px h-8 bg-amber-200 shrink-0" />

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              aria-label="Urungkan"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors shrink-0 min-h-[36px]"
            >
              <Undo2 size={16} aria-hidden="true" />
              Urungkan
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Simpan"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 transition-colors shrink-0 min-h-[36px]"
            >
              <Save size={16} aria-hidden="true" />
              {isSaving ? '...' : 'Simpan'}
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Unduh"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shrink-0 min-h-[36px]"
            >
              <Download size={16} aria-hidden="true" />
              Unduh
            </button>

          </div>
        </div>
      )}

      {/* ── Reset confirmation dialog ── */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Mulai Ulang?"
        message="Semua warna yang sudah kamu warnai akan hilang. Yakin mau mulai ulang?"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
        confirmLabel="Ya, Mulai Ulang"
        cancelLabel="Batal"
      />
    </div>
  )
}
