// src/routes/gallery.tsx
// Gallery page — shows the current user's own coloring pages.

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Images, ImagePlus } from 'lucide-react'

import { requireAuth } from '../lib/authGuard'
import { getUserImagesQuery } from '../server/actions/images'
import { GalleryCard } from '../components/GalleryCard'

export const Route = createFileRoute('/gallery')({
  beforeLoad: ({ context, location }) => requireAuth({ context, location }),
  component: GalleryPage,
})

// ---------------------------------------------------------------------------
// GalleryPage
// ---------------------------------------------------------------------------

function GalleryPage() {
  const { data: images, isPending, isFetching, isError, error } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => getUserImagesQuery(),
  })

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8 sm:px-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-amber-700 sm:text-4xl">
          🎨 Galeri Mewarnai
        </h1>
        <p className="mt-2 text-base text-amber-600">
          Pilih gambar yang ingin kamu warnai!
        </p>
      </header>

      {/* ── Loading state ───────────────────────────────────────────── */}
      {(isPending || isFetching) && (
        <div
          role="status"
          aria-label="Memuat gambar…"
          className="flex flex-col items-center justify-center gap-4 py-24"
        >
          {/* Spinner ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="text-base font-semibold text-amber-600">Memuat gambar…</p>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────── */}
      {isError && !isPending && (
        <div
          role="alert"
          className="mx-auto max-w-md rounded-2xl bg-red-50 p-6 text-center shadow"
        >
          <p className="text-lg font-bold text-red-600">Oops! Terjadi kesalahan.</p>
          <p className="mt-1 text-base text-red-500">
            {error instanceof Error ? error.message : 'Gagal memuat galeri.'}
          </p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!isPending && !isFetching && !isError && images && images.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Images size={64} className="text-amber-300" aria-hidden="true" />
          <p className="text-xl font-bold text-amber-600">Belum ada gambar nih!</p>
          <p className="text-base text-amber-500">
            Upload gambar dulu untuk mulai mewarnai.
          </p>
          <Link
            to="/upload"
            className="mt-2 flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-base font-bold min-h-[44px] transition-colors"
          >
            <ImagePlus size={20} aria-hidden="true" />
            Upload Gambar
          </Link>
        </div>
      )}

      {/* ── Gallery grid ────────────────────────────────────────────── */}
      {!isPending && !isFetching && images && images.length > 0 && (
        <ul
          className={[
            'grid gap-6',
            // 1 column on mobile, 2 on sm, 3 on lg
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          ].join(' ')}
          aria-label="Daftar halaman mewarnai"
        >
          {images.map((image) => (
            <li key={image.id}>
              <GalleryCard image={image} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
