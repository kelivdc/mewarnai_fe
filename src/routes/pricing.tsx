// src/routes/pricing.tsx
// Pricing page — Free / Pro / Premium plans for Mari Mewarnai
// Indonesian UI for Indonesian kids & parents

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  Star,
  ImagePlus,
  Download,
  Droplets,
  Infinity,
  Palette,
  HeartHandshake,
} from 'lucide-react'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

interface Plan {
  id: string
  name: string
  tagline: string
  price: string
  pricePer: string
  color: string          // Tailwind bg class for the header strip
  textColor: string      // text class for price / badge
  borderColor: string    // border class
  badgeBg: string
  badgeText: string
  badge?: string
  icon: React.ReactNode
  features: PlanFeature[]
  cta: string
  ctaTo: string
  popular?: boolean
}

// ---------------------------------------------------------------------------
// Plan data
// ---------------------------------------------------------------------------

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    tagline: 'Coba dulu, tanpa kartu kredit',
    price: 'Rp0',
    pricePer: 'selamanya',
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    icon: <Star size={28} className="text-gray-500" />,
    features: [
      { text: 'Maksimal 3 gambar', included: true },
      { text: 'Konversi ke halaman mewarnai', included: true },
      { text: '22 pilihan warna', included: true },
      { text: 'Simpan & lanjutkan progres', included: true },
      { text: 'Watermark saat unduh', included: true },
      { text: 'Unduh hasil mewarnai', included: true },
      { text: 'Tanpa watermark', included: false },
      { text: 'Konversi gambar prioritas', included: false },
      { text: 'Warna eksklusif tambahan', included: false },
    ],
    cta: 'Mulai Gratis',
    ctaTo: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Untuk anak yang suka mewarnai setiap hari',
    price: 'Rp29.000',
    pricePer: '/ bulan',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-400',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    badge: '🔥 Paling Populer',
    popular: true,
    icon: <Zap size={28} className="text-orange-500" />,
    features: [
      { text: 'Maksimal 500 gambar', included: true, highlight: true },
      { text: 'Konversi ke halaman mewarnai', included: true },
      { text: '22 pilihan warna', included: true },
      { text: 'Simpan & lanjutkan progres', included: true },
      { text: 'Unduh tanpa watermark', included: true, highlight: true },
      { text: 'Unduh sebagai PNG + PDF', included: true, highlight: true },
      { text: 'Konversi gambar prioritas', included: true },
      { text: 'Warna eksklusif tambahan', included: false },
      { text: 'Dukungan prioritas', included: false },
    ],
    cta: 'Coba Pro Sekarang',
    ctaTo: '/register',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Tanpa batas, tanpa kompromi',
    price: 'Rp59.000',
    pricePer: '/ bulan',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-400',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    badge: '👑 Nilai Terbaik',
    icon: <Crown size={28} className="text-purple-500" />,
    features: [
      { text: 'Gambar tak terbatas', included: true, highlight: true },
      { text: 'Konversi ke halaman mewarnai', included: true },
      { text: '22 + 30 warna eksklusif', included: true, highlight: true },
      { text: 'Simpan & lanjutkan progres', included: true },
      { text: 'Unduh tanpa watermark', included: true },
      { text: 'Unduh sebagai PNG + PDF', included: true },
      { text: 'Konversi gambar prioritas', included: true },
      { text: 'Template mewarnai eksklusif', included: true, highlight: true },
      { text: 'Dukungan prioritas 24/7', included: true, highlight: true },
    ],
    cta: 'Pilih Premium',
    ctaTo: '/register',
  },
]

// ---------------------------------------------------------------------------
// FeatureRow
// ---------------------------------------------------------------------------

function FeatureRow({ feature }: { feature: PlanFeature }) {
  return (
    <li
      className={[
        'flex items-start gap-3 py-2',
        !feature.included ? 'opacity-40' : '',
      ].join(' ')}
    >
      {feature.included ? (
        <Check
          size={18}
          className="shrink-0 mt-0.5 text-green-500"
          aria-hidden="true"
        />
      ) : (
        <X size={18} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
      )}
      <span
        className={[
          'text-base leading-snug',
          feature.highlight && feature.included
            ? 'font-bold text-gray-800'
            : 'text-gray-600',
        ].join(' ')}
      >
        {feature.text}
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// PlanCard
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={[
        'relative flex flex-col rounded-3xl border-2 overflow-hidden',
        'bg-white shadow-md hover:shadow-xl transition-shadow duration-300',
        plan.popular ? 'border-orange-400 scale-[1.02]' : plan.borderColor,
      ].join(' ')}
    >
      {/* Popular badge ribbon */}
      {plan.badge && (
        <div
          className={[
            'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow',
            plan.badgeBg,
            plan.badgeText,
          ].join(' ')}
        >
          {plan.badge}
        </div>
      )}

      {/* Header strip */}
      <div
        className={[
          'px-6 pt-8 pb-6',
          plan.popular ? 'bg-orange-500' : plan.id === 'premium' ? 'bg-purple-600' : 'bg-gray-50',
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center justify-center w-14 h-14 rounded-2xl mb-4',
            plan.popular
              ? 'bg-white/20'
              : plan.id === 'premium'
              ? 'bg-white/20'
              : 'bg-white border border-gray-200',
          ].join(' ')}
        >
          {plan.icon}
        </div>
        <h3
          className={[
            'text-2xl font-extrabold',
            plan.popular || plan.id === 'premium' ? 'text-white' : 'text-gray-800',
          ].join(' ')}
        >
          {plan.name}
        </h3>
        <p
          className={[
            'mt-1 text-base',
            plan.popular || plan.id === 'premium'
              ? 'text-white/80'
              : 'text-gray-500',
          ].join(' ')}
        >
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="mt-4 flex items-end gap-1">
          <span
            className={[
              'text-4xl font-extrabold leading-none',
              plan.popular || plan.id === 'premium' ? 'text-white' : 'text-gray-800',
            ].join(' ')}
          >
            {plan.price}
          </span>
          <span
            className={[
              'text-base pb-1',
              plan.popular || plan.id === 'premium'
                ? 'text-white/70'
                : 'text-gray-400',
            ].join(' ')}
          >
            {plan.pricePer}
          </span>
        </div>
      </div>

      {/* Features list */}
      <div className="flex-1 px-6 py-5">
        <ul className="space-y-0 divide-y divide-gray-50">
          {plan.features.map((f, i) => (
            <FeatureRow key={i} feature={f} />
          ))}
        </ul>
      </div>

      {/* CTA button */}
      <div className="px-6 pb-8">
        <Link
          to={plan.ctaTo}
          className={[
            'flex items-center justify-center gap-2 w-full',
            'rounded-2xl px-6 py-4 text-lg font-extrabold',
            'min-h-[52px] transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-4',
            plan.popular
              ? 'bg-orange-500 hover:bg-orange-600 text-white focus-visible:ring-orange-300 shadow-lg hover:shadow-xl'
              : plan.id === 'premium'
              ? 'bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-300 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-gray-300',
          ].join(' ')}
        >
          {plan.id === 'pro' && <Zap size={20} aria-hidden="true" />}
          {plan.id === 'premium' && <Crown size={20} aria-hidden="true" />}
          {plan.id === 'free' && <Star size={20} aria-hidden="true" />}
          {plan.cta}
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Comparison highlight strip
// ---------------------------------------------------------------------------

function HighlightStrip() {
  const items = [
    { icon: <ImagePlus size={22} className="text-orange-500" />, label: 'Upload gambar sendiri' },
    { icon: <Palette size={22} className="text-purple-500" />, label: '22+ pilihan warna' },
    { icon: <Droplets size={22} className="text-blue-500" />, label: 'Flood-fill instan' },
    { icon: <Download size={22} className="text-green-500" />, label: 'Unduh hasil karyamu' },
    { icon: <Infinity size={22} className="text-pink-500" />, label: 'Progres tersimpan' },
    { icon: <HeartHandshake size={22} className="text-red-500" />, label: 'Aman untuk anak' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto px-4 mb-16">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5 text-center"
        >
          {item.icon}
          <span className="text-sm font-bold text-gray-700 leading-snug">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const faqs = [
  {
    q: 'Bisa upgrade atau downgrade kapan saja?',
    a: 'Bisa! Kamu bisa upgrade atau downgrade paket kapan saja. Perubahan berlaku di siklus tagihan berikutnya.',
  },
  {
    q: 'Paket Gratis benar-benar gratis selamanya?',
    a: 'Benar. Paket Gratis tidak ada batas waktu. Kamu bisa menikmati sampai 3 halaman mewarnai selamanya tanpa biaya.',
  },
  {
    q: 'Bagaimana cara bayarnya?',
    a: 'Kami menerima semua kartu kredit dan debit utama, serta transfer bank dan e-wallet (GoPay, OVO, Dana).',
  },
  {
    q: 'Ada uji coba gratis untuk paket berbayar?',
    a: 'Ada! Baik Pro maupun Premium bisa dicoba gratis selama 7 hari. Tidak perlu kartu kredit.',
  },
]

function FAQ() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-8">
        ❓ Pertanyaan Umum
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-base font-bold text-gray-800 mb-1">{faq.q}</p>
            <p className="text-base text-gray-500 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PricingPage
// ---------------------------------------------------------------------------

function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-purple-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="text-center px-4 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 font-bold text-sm px-4 py-2 rounded-full mb-4">
          <Sparkles size={16} aria-hidden="true" />
          Pilih paket yang cocok buat kamu
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Serunya Mewarnai,
          <br />
          <span className="text-orange-500">Tanpa Batas</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Mulai gratis, upgrade kalau sudah suka. Semua paket ada uji coba — tanpa risiko.
        </p>
      </section>

      {/* ── Feature highlights ────────────────────────────────────────── */}
      <HighlightStrip />

      {/* ── Pricing cards ─────────────────────────────────────────────── */}
      <section
        aria-label="Paket harga"
        className="max-w-5xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-8">
          🔒 Pembayaran aman &nbsp;·&nbsp; 🔄 Batal kapan saja &nbsp;·&nbsp; Uji coba gratis 7 hari
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-orange-500 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Siap mulai petualangan mewarnai? 🎨
        </h2>
        <p className="text-white/80 text-base mb-6">
          Daftar gratis sekarang — tidak perlu kartu kredit.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-orange-500 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all min-h-[52px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          <Star size={22} aria-hidden="true" />
          Daftar Gratis Sekarang
        </Link>
      </section>
    </div>
  )
}
