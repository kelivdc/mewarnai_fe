// src/components/Footer.tsx
// Global footer — kid-friendly, Indonesian, consistent with app tone.
// Requirements: 8.1, 8.2, 8.4, 8.5

import { Link } from '@tanstack/react-router'
import { Heart, Palette, Sparkles } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-amber-200 mt-auto" aria-label="Footer">
      {/* Main footer content */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand column */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-extrabold text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Palette size={24} aria-hidden="true" />
              Mari Mewarnai
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Website mewarnai online yang seru dan aman untuk anak-anak. Upload gambar, warnai sesukamu, dan unduh hasilnya!
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-3 uppercase tracking-wide">
              📍 Jelajahi
            </h3>
            <ul className="space-y-2">
              <li>
                <FooterLink to="/explore" label="Explore Template" />
              </li>
              <li>
                <FooterLink to="/upload" label="Upload Gambar" />
              </li>
              <li>
                <FooterLink to="/my-images" label="Koleksi Kamu" />
              </li>
              <li>
                <FooterLink to="/pricing" label="Harga" />
              </li>
            </ul>
          </div>

          {/* Info column */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-3 uppercase tracking-wide">
              💡 Info
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-slate-500">
                  <Sparkles size={14} className="inline mr-1 text-amber-400" aria-hidden="true" />
                  Aman untuk anak-anak
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-500">
                  🎨 22+ pilihan warna
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-500">
                  📥 Unduh PNG / PDF
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-500">
                  💾 Progres tersimpan
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-amber-100 bg-amber-50/50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            © {year} Mari Mewarnai — dibuat dengan{' '}
            <Heart size={12} className="text-red-400 inline" aria-hidden="true" />{' '}
            untuk anak-anak Indonesia
          </p>
          <p className="text-xs text-slate-400">
            🛡️ Privasi Terjaga · 🔒 Aman · 🌟 Selalu Gratis dicoba
          </p>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// FooterLink helper
// ---------------------------------------------------------------------------

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm text-slate-500 hover:text-orange-500 transition-colors font-medium min-h-[36px] flex items-center"
    >
      {label}
    </Link>
  )
}
