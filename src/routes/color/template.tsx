// src/routes/color/template.tsx
// Coloring canvas for a built-in template from the Explore page.
// Loads the SVG directly from the public folder — no DB image record needed.
// Supports Save to "My Images" via saveTemplateColoringAction.

import { useRef, useState, useCallback, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Undo2, RotateCcw, Download, ArrowLeft, Save, Maximize2, Minimize2 } from 'lucide-react'
import { z } from 'zod'

import { requireAuth } from '../../lib/authGuard'
import { COLOR_PALETTE } from '../../lib/colorPalette'
import ColoringCanvas from '../../components/ColoringCanvas'
import type { ColoringCanvasHandle } from '../../components/ColoringCanvas'
import { ColorPalette } from '../../components/ColorPalette'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { saveTemplateColoringAction } from '../../server/actions/templates'
import { ConfirmDialog } from '../../components/ConfirmDialog'

const searchSchema = z.object({
  src: z.string(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/color/template')({
  beforeLoad: async ({ context, location }) => requireAuth({ context, location }),
  validateSearch: searchSchema,
  component: TemplateColorPage,
})

type ToastState = { type: 'success' | 'error'; message: string } | null

function TemplateColorPage() {
  const { src, name } = Route.useSearch()
  const displayName = name ?? 'Template'

  const [activeColor, setActiveColor] = useState<string>(COLOR_PALETTE[0].hex)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<ColoringCanvasHandle>(null)
  const queryClient = useQueryClient()

  // Fullscreen mode: toggle class on <html> to hide Nav + Footer
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

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])

  // Navigation guard for unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleUndo = useCallback(() => canvasRef.current?.undo(), [])
  const handleReset = useCallback(() => setShowResetConfirm(true), [])
  const handleConfirmReset = useCallback(() => {
    canvasRef.current?.reset()
    setShowResetConfirm(false)
  }, [])

  const handleDownload = useCallback(async () => {
    const blob = await canvasRef.current?.getBlob()
    if (!blob) {
      setToast({ type: 'error', message: 'Gagal mengunduh — canvas tidak tersedia.' })
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${displayName.replace(/\s+/g, '-').toLowerCase()}-mewarnai.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast({ type: 'success', message: '⬇️ Gambar berhasil diunduh!' })
  }, [displayName])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const blob = await canvasRef.current?.getBlob()
      if (!blob) {
        setToast({ type: 'error', message: 'Gagal menyimpan — canvas tidak tersedia.' })
        return
      }

      // Convert Blob → ArrayBuffer → number[]
      const arrayBuffer = await blob.arrayBuffer()
      const canvasBlob = Array.from(new Uint8Array(arrayBuffer))

      const result = await saveTemplateColoringAction({
        data: {
          templateSrc: src,
          templateName: displayName,
          canvasBlob,
        },
      })

      if (result.success) {
        setIsDirty(false)
        await queryClient.invalidateQueries({ queryKey: ['my-images'] })
        await queryClient.invalidateQueries({ queryKey: ['gallery'] })
        setToast({
          type: 'success',
          message: `✅ "${displayName}" disimpan ke My Images!`,
        })
      } else {
        setToast({
          type: 'error',
          message: `❌ ${result.error ?? 'Gagal menyimpan.'}`,
        })
      }
    } catch {
      setToast({ type: 'error', message: '❌ Gagal menyimpan. Coba lagi.' })
    } finally {
      setIsSaving(false)
    }
  }, [src, displayName, isSaving])

  if (!src) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-red-500">Template tidak ditemukan.</p>
          <Link to="/explore" className="mt-4 inline-block text-orange-500 underline">
            Kembali ke Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={[
      isFullscreen
        ? 'fixed inset-0 z-60 bg-amber-50 flex flex-col'
        : 'min-h-screen bg-amber-50 flex flex-col',
    ].join(' ')}>
      <LoadingSpinner isLoading={isSaving} message="Menyimpan…" fullscreen={true} />

      {/* Toast */}
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
          <button type="button" onClick={() => setToast(null)} className="ml-auto text-lg leading-none opacity-60 hover:opacity-100">×</button>
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

      {/* Header */}
      <header className={[
        'bg-white border-b border-amber-200 px-4 py-3 flex items-center gap-3',
        isFullscreen ? 'hidden' : '',
      ].join(' ')}>
        <Link
          to="/explore"
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 shrink-0"
        >
          <ArrowLeft size={16} />
          Explore
        </Link>
        <h1 className="text-lg font-extrabold text-amber-700 truncate">
          🎨 {displayName}
        </h1>
        {isDirty && (
          <span className="ml-auto shrink-0 text-sm font-semibold text-orange-500">
            • Belum disimpan
          </span>
        )}
      </header>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Canvas */}
        <main className={[
          'flex-1 flex justify-center overflow-auto',
          isFullscreen
            ? 'items-start p-0 sm:p-2'
            : 'items-center p-0 sm:p-4',
        ].join(' ')} aria-label="Area mewarnai">
          <ColoringCanvas
            ref={canvasRef}
            imageUrl={src}
            activeColor={activeColor}
            onDirtyChange={setIsDirty}
          />
        </main>

        {/* Sidebar */}
        <aside className={[
          'lg:w-72 xl:w-80 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-amber-200 overflow-y-auto',
          isFullscreen ? 'hidden' : '',
        ].join(' ')} aria-label="Panel warna dan alat">
          {/* Palette */}
          <div className="p-4 border-b border-amber-100">
            <p className="text-base font-extrabold text-amber-700 mb-3">🖌️ Pilih Warna</p>
            <ColorPalette selectedColor={activeColor} onColorSelect={setActiveColor} />
          </div>

          {/* Tools */}
          <div className="p-4 flex flex-col gap-3">
            <p className="text-base font-extrabold text-amber-700 mb-1">🔧 Alat</p>

            <button
              type="button"
              onClick={handleUndo}
              aria-label="Batalkan langkah terakhir"
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 min-h-[44px] bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-500 text-base font-bold text-amber-800 transition-colors"
            >
              <Undo2 size={22} className="shrink-0 text-amber-600" aria-hidden="true" />
              Urungkan
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Hapus semua warna"
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 min-h-[44px] bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 hover:border-orange-500 text-base font-bold text-orange-800 transition-colors"
            >
              <RotateCcw size={22} className="shrink-0 text-orange-600" aria-hidden="true" />
              Mulai Ulang
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Simpan ke My Images"
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 min-h-[44px] bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-base font-bold text-white transition-colors"
            >
              <Save size={22} className="shrink-0" aria-hidden="true" />
              {isSaving ? 'Menyimpan…' : 'Simpan'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              aria-label="Unduh hasil mewarnai sebagai PNG"
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-base font-bold text-white transition-colors"
            >
              <Download size={22} className="shrink-0" aria-hidden="true" />
              Unduh PNG
            </button>
          </div>

          {/* Info box */}
          <div className="mx-4 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 leading-relaxed">
              💡 Klik <strong>Simpan</strong> untuk menyimpan ke koleksi kamu. Hasil mewarnai bisa dilanjutkan kapan saja dari halaman <strong>My Images</strong>.
            </p>
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
                const isSel = activeColor?.toLowerCase() === color.hex.toLowerCase()
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
                      isSel
                        ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-700 scale-110'
                        : 'border-gray-300 hover:scale-105',
                    ].join(' ')}
                  />
                )
              })}
            </div>

            <div className="w-px h-8 bg-amber-200 shrink-0" />

            {/* Undo */}
            <button type="button" onClick={handleUndo} aria-label="Urungkan"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors shrink-0 min-h-[36px]">
              <Undo2 size={16} aria-hidden="true" /> Urungkan
            </button>

            {/* Save */}
            <button type="button" onClick={handleSave} disabled={isSaving} aria-label="Simpan"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 transition-colors shrink-0 min-h-[36px]">
              <Save size={16} aria-hidden="true" /> {isSaving ? '...' : 'Simpan'}
            </button>

            {/* Download */}
            <button type="button" onClick={handleDownload} aria-label="Unduh"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shrink-0 min-h-[36px]">
              <Download size={16} aria-hidden="true" /> Unduh
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
