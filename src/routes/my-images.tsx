// src/routes/my-images.tsx
// My Images page — lets authenticated users view and manage their own uploads.
// Requirements: 7.1–7.5, 8.1, 8.2, 8.5, 8.6
// Auth guard: Requirements 2.6

import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash2, Images } from 'lucide-react'

import { requireAuth } from '../lib/authGuard'
import { getUserImagesQuery, deleteImageAction } from '../server/actions/images'
import type { GalleryImage } from '../server/actions/images'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingSpinner } from '../components/LoadingSpinner'

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute('/my-images')({
  beforeLoad: ({ context, location }) => requireAuth({ context, location }),
  component: MyImagesPage,
})

// ---------------------------------------------------------------------------
// URL helper (mirrors GalleryCard.toUploadUrl)
// ---------------------------------------------------------------------------

function toUploadUrl(absolutePath: string): string {
  const match = absolutePath.match(/(?:originals|coloring)[/\\][^/\\]+$/)
  if (match) {
    return `/api/uploads/${match[0].replace(/\\/g, '/')}`
  }
  const filename = absolutePath.split(/[/\\]/).pop() ?? ''
  return `/api/uploads/coloring/${filename}`
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

// ---------------------------------------------------------------------------
// Column helper
// ---------------------------------------------------------------------------

const columnHelper = createColumnHelper<GalleryImage>()

// ---------------------------------------------------------------------------
// MyImagesPage
// ---------------------------------------------------------------------------

function MyImagesPage() {
  const queryClient = useQueryClient()

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data: images = [], isPending, isError, error } = useQuery({
    queryKey: ['my-images'],
    queryFn: () => getUserImagesQuery(),
  })

  // ── Delete dialog state ────────────────────────────────────────────────
  const [pendingDelete, setPendingDelete] = React.useState<GalleryImage | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleConfirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return

    setIsDeleting(true)
    setErrorMessage(null)

    try {
      const result = await deleteImageAction({ data: { imageId: pendingDelete.id } })

      if (!result.success) {
        // Req 7.4 / 8.2: 403 gets a specific Indonesian message
        if (result.status === 403) {
          setErrorMessage('Kamu tidak punya izin untuk menghapus gambar ini.')
        } else {
          setErrorMessage(result.error ?? 'Gagal menghapus gambar. Coba lagi.')
        }
        setPendingDelete(null)
        setIsDeleting(false)
        return
      }

      // Success: invalidate both gallery and my-images queries (req 7.3, 7.5)
      await queryClient.invalidateQueries({ queryKey: ['gallery'] })
      await queryClient.invalidateQueries({ queryKey: ['my-images'] })
    } catch {
      setErrorMessage('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPendingDelete(null)
      setIsDeleting(false)
    }
  }, [pendingDelete, queryClient])

  // ── Table columns ──────────────────────────────────────────────────────
  const columns = React.useMemo(
    () => [
      // Thumbnail
      columnHelper.display({
        id: 'thumbnail',
        header: 'Gambar',
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <img
              src={toUploadUrl(row.original.coloringPath)}
              alt={`Thumbnail: ${row.original.filename}`}
              className="h-16 w-16 rounded-lg object-cover border border-gray-200 shadow-sm"
              loading="lazy"
            />
          </div>
        ),
      }),

      // Filename
      columnHelper.accessor('filename', {
        header: 'Nama File',
        cell: ({ getValue }) => (
          <span className="text-base font-semibold text-gray-800 break-all">
            {getValue()}
          </span>
        ),
      }),

      // Uploaded date
      columnHelper.accessor('uploadedAt', {
        header: 'Tanggal Upload',
        cell: ({ getValue }) => (
          <span className="text-base text-gray-600 whitespace-nowrap">
            {formatDate(getValue())}
          </span>
        ),
      }),

      // Delete action
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            aria-label={`Hapus gambar ${row.original.filename}`}
            onClick={() => {
              setErrorMessage(null)
              setPendingDelete(row.original)
            }}
            className={[
              // Req 8.2: bright distinct color — red
              // Req 8.5: icon + touch target ≥ 44px
              'flex items-center justify-center gap-2',
              'min-h-[44px] min-w-[44px] px-3 rounded-xl',
              'bg-red-500 hover:bg-red-600 active:bg-red-700',
              'text-white text-base font-semibold',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <Trash2 size={20} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Hapus</span>
          </button>
        ),
      }),
    ],
    [],
  )

  // ── TanStack Table instance ────────────────────────────────────────────
  const table = useReactTable({
    data: images,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8 sm:px-8">
      {/* ── Loading spinner (req 8.6: shown after 500ms) ───────────────── */}
      <LoadingSpinner isLoading={isPending} message="Memuat gambar kamu…" />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-amber-700 sm:text-4xl">
          🖼️ Gambar Saya
        </h1>
        <p className="mt-2 text-base text-amber-600">
          Kelola gambar yang sudah kamu upload.
        </p>
      </header>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {errorMessage && (
        <div
          role="alert"
          className="mx-auto mb-6 max-w-2xl rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3 shadow"
        >
          <span className="text-red-500 text-xl leading-none mt-0.5" aria-hidden="true">⚠️</span>
          <div className="flex-1">
            <p className="text-base font-semibold text-red-700">{errorMessage}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup pesan error"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Fetch error state ─────────────────────────────────────────────── */}
      {isError && !isPending && (
        <div
          role="alert"
          className="mx-auto max-w-md rounded-2xl bg-red-50 p-6 text-center shadow"
        >
          <p className="text-lg font-bold text-red-600">Oops! Terjadi kesalahan.</p>
          <p className="mt-1 text-base text-red-500">
            {error instanceof Error ? error.message : 'Gagal memuat daftar gambar.'}
          </p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!isPending && !isError && images.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Images size={64} className="text-amber-300" aria-hidden="true" />
          <p className="text-xl font-bold text-amber-600">Belum ada gambar nih!</p>
          <p className="text-base text-amber-500">
            Upload gambar dulu untuk mulai mewarnai.
          </p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {!isPending && !isError && images.length > 0 && (
        <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl shadow-md bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b-2 border-amber-100 bg-amber-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-base font-bold text-amber-700 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={[
                    'border-b border-gray-100 transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30',
                    'hover:bg-orange-50',
                  ].join(' ')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Confirm delete dialog ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Hapus Gambar"
        message={`Apakah kamu yakin ingin menghapus gambar ini?${pendingDelete ? ` "${pendingDelete.filename}" akan dihapus secara permanen.` : ''}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setPendingDelete(null)
        }}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isLoading={isDeleting}
      />
    </div>
  )
}
