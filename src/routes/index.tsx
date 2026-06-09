// src/routes/index.tsx
// Homepage — hero landing page for guests, redirect to /gallery for auth'd users.

import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { LogIn, UserPlus, Palette, ImagePlus, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // Authenticated users skip the landing page and go straight to the gallery
    if (context.user) {
      throw redirect({ to: '/gallery' })
    }
  },
  component: HomePage,
})

// ---------------------------------------------------------------------------
// Feature highlight card
// ---------------------------------------------------------------------------

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white border-2 border-orange-100 p-6 text-center shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 text-orange-500">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-gray-800">{title}</h3>
      <p className="text-base text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------

function HomePage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-orange-50 via-yellow-50 to-white">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 pt-16 pb-12 text-center">
        {/* Big emoji mascot */}
        <div
          className="text-8xl select-none animate-bounce"
          role="img"
          aria-label="Palet warna"
          style={{ animationDuration: '2.5s' }}
        >
          🎨
        </div>

        <div className="space-y-3 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-500 leading-tight">
            Mari Mewarnai!
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-gray-600">
            Aplikasi mewarnai seru untuk anak-anak 🌈
          </p>
          <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Upload gambar, ubah jadi halaman mewarnai hitam putih, lalu warnai
            langsung di browser — simpan dan lanjutkan kapan saja!
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            to="/register"
            className={[
              'flex items-center gap-2 px-8 py-4 rounded-2xl',
              'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
              'text-white text-lg font-extrabold',
              'min-h-[52px] min-w-[180px] justify-center',
              'shadow-lg hover:shadow-xl transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300',
            ].join(' ')}
          >
            <UserPlus size={22} aria-hidden="true" />
            Daftar Gratis
          </Link>

          <Link
            to="/login"
            className={[
              'flex items-center gap-2 px-8 py-4 rounded-2xl',
              'bg-white hover:bg-orange-50 active:bg-orange-100',
              'text-orange-500 text-lg font-extrabold',
              'border-2 border-orange-400 hover:border-orange-500',
              'min-h-[52px] min-w-[180px] justify-center',
              'shadow hover:shadow-md transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300',
            ].join(' ')}
          >
            <LogIn size={22} aria-hidden="true" />
            Sudah Punya Akun
          </Link>

          <Link
            to="/pricing"
            className={[
              'flex items-center gap-2 px-6 py-4 rounded-2xl',
              'bg-transparent hover:bg-orange-50',
              'text-orange-400 hover:text-orange-600 text-base font-bold',
              'min-h-[52px] justify-center',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300',
            ].join(' ')}
          >
            Lihat harga →
          </Link>
        </div>
      </section>

      {/* ── Feature highlights ────────────────────────────────────────── */}
      <section
        aria-label="Fitur unggulan"
        className="px-4 py-12 max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-extrabold text-center text-gray-700 mb-8">
          ✨ Apa yang bisa kamu lakukan?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ImagePlus size={28} />}
            title="Upload Gambar"
            description="Upload foto atau gambar favoritmu, kami ubah jadi halaman mewarnai hitam putih otomatis."
          />
          <FeatureCard
            icon={<Palette size={28} />}
            title="Warnai di Browser"
            description="Pilih warna dari 22 pilihan warna cerah, lalu klik area gambar untuk langsung mewarnai!"
          />
          <FeatureCard
            icon={<Sparkles size={28} />}
            title="Simpan Progres"
            description="Simpan hasil mewarnaimu dan lanjutkan lagi kapan saja — tidak perlu mulai dari awal."
          />
        </div>
      </section>

      {/* ── Bottom CTA strip ──────────────────────────────────────────── */}
      <section className="bg-orange-500 py-10 px-4 text-center">
        <p className="text-xl sm:text-2xl font-extrabold text-white mb-4">
          Siap mulai mewarnai? 🖌️
        </p>
        <Link
          to="/register"
          className={[
            'inline-flex items-center gap-2 px-8 py-4 rounded-2xl',
            'bg-white hover:bg-orange-50 text-orange-500',
            'text-lg font-extrabold',
            'min-h-[52px]',
            'shadow-lg hover:shadow-xl transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white',
          ].join(' ')}
        >
          <UserPlus size={22} aria-hidden="true" />
          Daftar Sekarang — Gratis!
        </Link>
      </section>
    </div>
  )
}
