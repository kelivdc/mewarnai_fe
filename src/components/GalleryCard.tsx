// src/components/GalleryCard.tsx
// A kid-friendly card representing a single coloring page in the gallery.
// Requirements: 4.1, 4.3, 4.4, 4.5, 8.1, 8.2

import { Link } from '@tanstack/react-router'
import { Paintbrush } from 'lucide-react'

import type { GalleryImage } from '../server/actions/images'

/**
 * Converts a stored file path (which may be an absolute filesystem path like
 * `/home/user/project/uploads/coloring/abc.png`) to a browser-accessible URL
 * served by the `/api/uploads/` route handler.
 *
 * Extracts just the subdirectory (originals|coloring) and filename from the
 * absolute path and constructs `/api/uploads/{subdir}/{filename}`.
 */
function toUploadUrl(absolutePath: string): string {
  // Match the last "originals" or "coloring" segment and the filename after it
  const match = absolutePath.match(/(?:originals|coloring)[/\\][^/\\]+$/)
  if (match) {
    // Normalise Windows-style backslashes if present
    return `/api/uploads/${match[0].replace(/\\/g, '/')}`
  }
  // Fallback: use the basename with the coloring sub-path (best-effort)
  const filename = absolutePath.split(/[/\\]/).pop() ?? ''
  return `/api/uploads/coloring/${filename}`
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GalleryCardProps {
  image: GalleryImage
}

// ---------------------------------------------------------------------------
// GalleryCard
// ---------------------------------------------------------------------------

/**
 * Renders a single coloring page thumbnail card.
 *
 * - Thumbnail: points to `/api/uploads/coloring/{filename}`
 * - Filename is displayed below the thumbnail
 * - A "Lanjutkan" (Continue) badge appears when `hasSave` is true
 * - The entire card is a clickable link navigating to `/color/$imageId`
 * - Minimum 44×44px touch target (WCAG 2.1 AA), 16px+ font, bright colours
 */
export function GalleryCard({ image }: GalleryCardProps) {
  return (
    <Link
      to="/color/$imageId"
      params={{ imageId: String(image.id) }}
      className={[
        // Layout & sizing — min touch target guaranteed by the min-h/min-w
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'min-h-[44px] min-w-[44px]',
        // Visual style
        'bg-white border-2 border-transparent',
        'shadow-md hover:shadow-xl',
        'hover:border-orange-400',
        'transition-all duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400',
      ].join(' ')}
      aria-label={
        image.hasSave
          ? `Lanjutkan mewarnai ${image.filename}`
          : `Mewarnai ${image.filename}`
      }
    >
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={toUploadUrl(image.coloringPath)}
          alt={`Halaman mewarnai: ${image.filename}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />

        {/* "Lanjutkan" badge — only shown when the user has a saved progress */}
        {image.hasSave && (
          <div
            className={[
              'absolute top-2 right-2',
              'flex items-center gap-1',
              'bg-green-500 text-white',
              'text-sm font-bold px-2 py-1 rounded-full',
              'shadow-md',
            ].join(' ')}
            aria-label="Progres tersimpan"
          >
            <Paintbrush size={14} aria-hidden="true" />
            <span>Lanjutkan</span>
          </div>
        )}
      </div>

      {/* ── Card footer: filename ──────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white">
        <span
          className={[
            'flex-1 truncate font-semibold',
            // Minimum 16px font per requirement 8.1
            'text-base text-gray-800',
          ].join(' ')}
          title={image.filename}
        >
          {image.filename}
        </span>

        {/* Bright call-to-action indicator */}
        <span
          className={[
            'shrink-0 rounded-full px-3 py-1 text-sm font-bold',
            'min-h-[44px] flex items-center',
            image.hasSave
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700',
          ].join(' ')}
          aria-hidden="true"
        >
          {image.hasSave ? '▶ Lanjut' : '🎨 Warnai'}
        </span>
      </div>
    </Link>
  )
}
