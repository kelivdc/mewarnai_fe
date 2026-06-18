// src/routes/explore.tsx
// Explore page — browse built-in B&W coloring templates by category & search.

import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { z } from 'zod'

import { requireAuth } from '../lib/authGuard'
import {
  TEMPLATES,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type TemplateCategory,
} from '../lib/templates'
import { TemplateCard } from '../components/TemplateCard'

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
})

export const Route = createFileRoute('/explore')({
  beforeLoad: async ({ context, location }) => requireAuth({ context, location }),
  validateSearch: searchSchema,
  component: ExplorePage,
})

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TemplateCategory[]

function ExplorePage() {
  const { q: initialQ, category: initialCat } = Route.useSearch()

  const [search, setSearch] = useState(initialQ ?? '')
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>(
    (initialCat as TemplateCategory) ?? 'all',
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      return matchCat && matchQ
    })
  }, [search, activeCategory])

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-8"
      style={{
        background: `
          radial-gradient(circle, #f1d5b8 1px, transparent 1px),
          linear-gradient(135deg, #fef9ee 0%, #fdf4ff 50%, #eff6ff 100%)
        `,
        backgroundSize: '24px 24px, 100% 100%',
      }}
    >
      {/* ── Header ── */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg mb-4">
          <Sparkles size={32} className="text-white" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
          Explore Templates
        </h1>
        <p className="mt-2 text-base text-slate-500 font-medium">
          Pilih gambar hitam-putih favoritmu dan mulai mewarnai!
        </p>
      </header>

      {/* ── Search bar ── */}
      <div className="mx-auto max-w-lg mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari gambar... (kucing, roket, kue...)"
            aria-label="Cari template gambar"
            className="w-full h-12 pl-11 pr-10 rounded-2xl border-2 border-slate-200 bg-white shadow-sm text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="mx-auto max-w-4xl mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <CategoryPill
            label="✨ All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {ALL_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="mx-auto max-w-5xl mb-4">
        <p className="text-sm font-semibold text-slate-500">
          {filtered.length === 0
            ? 'Tidak ada gambar ditemukan'
            : `${filtered.length} gambar ditemukan`}
          {search && (
            <span className="text-slate-400"> untuk "{search}"</span>
          )}
        </p>
      </div>

      {/* ── Template grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="text-6xl">🔍</div>
          <p className="text-xl font-bold text-slate-600">Gambar tidak ditemukan</p>
          <p className="text-base text-slate-400">Coba kata kunci atau kategori lain</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setActiveCategory('all') }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all active:scale-95"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategoryPill
// ---------------------------------------------------------------------------

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 min-h-[36px] border-2',
        active
          ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent shadow-md'
          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
