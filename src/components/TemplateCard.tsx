// src/components/TemplateCard.tsx
// Card for a single built-in coloring template on the Explore page.
// Clicking opens the template on a full-screen coloring canvas.
// Uses TanStack Router <Link> for client-side navigation — avoids SSR
// auth check that would fail when BetterAuth cookies aren't forwarded.

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Palette } from 'lucide-react'
import { DIFFICULTY_LABELS, CATEGORY_LABELS, type Template } from '../lib/templates'

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [imgError, setImgError] = useState(false)
  const diff = DIFFICULTY_LABELS[template.difficulty]

  return (
    <Link
      to="/color/template"
      search={{ src: template.src, name: template.name }}
      className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer no-underline"
      aria-label={`Warnai ${template.name}`}
    >
      {/* Thumbnail */}
      <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {imgError ? (
          <div className="flex flex-col items-center gap-2 text-slate-300 py-6">
            <Palette size={32} />
            <span className="text-xs">No preview</span>
          </div>
        ) : (
          <img
            src={template.src}
            alt={template.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Difficulty badge */}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${diff.color}`}>
          {diff.label}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <span className="flex items-center gap-1.5 bg-white text-orange-600 font-bold text-xs px-3 py-1.5 rounded-full shadow">
            <Palette size={12} aria-hidden="true" />
            Warnai Sekarang
          </span>
        </div>
      </div>

      {/* Card info */}
      <div className="p-2.5 flex flex-col gap-1">
        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{template.name}</p>
        <p className="text-xs text-slate-400 font-medium">{CATEGORY_LABELS[template.category]}</p>
      </div>
    </Link>
  )
}
