// src/routes/pricing.tsx
// Pricing page — Free / Pro / Premium plans for Mari Mewarnai

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
    name: 'Free',
    tagline: 'Try it out, no credit card needed',
    price: '$0',
    pricePer: 'forever',
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    icon: <Star size={28} className="text-gray-500" />,
    features: [
      { text: 'Up to 3 images', included: true },
      { text: 'Convert to coloring page', included: true },
      { text: '22 color choices', included: true },
      { text: 'Save & resume progress', included: true },
      { text: 'Watermark on downloads', included: true },
      { text: 'Download your coloring', included: true },
      { text: 'No watermark', included: false },
      { text: 'Priority image conversion', included: false },
      { text: 'Extra exclusive colors', included: false },
    ],
    cta: 'Get Started Free',
    ctaTo: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For kids who love to color a lot',
    price: '$2.99',
    pricePer: '/ month',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-400',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    badge: '🔥 Most Popular',
    popular: true,
    icon: <Zap size={28} className="text-orange-500" />,
    features: [
      { text: 'Up to 500 images', included: true, highlight: true },
      { text: 'Convert to coloring page', included: true },
      { text: '22 color choices', included: true },
      { text: 'Save & resume progress', included: true },
      { text: 'Download without watermark', included: true, highlight: true },
      { text: 'Download as PNG + PDF', included: true, highlight: true },
      { text: 'Priority image conversion', included: true },
      { text: 'Extra exclusive colors', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Try Pro Now',
    ctaTo: '/register',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'No limits, no compromises',
    price: '$5.99',
    pricePer: '/ month',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-400',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    badge: '👑 Best Value',
    icon: <Crown size={28} className="text-purple-500" />,
    features: [
      { text: 'Unlimited images', included: true, highlight: true },
      { text: 'Convert to coloring page', included: true },
      { text: '22 + 30 exclusive colors', included: true, highlight: true },
      { text: 'Save & resume progress', included: true },
      { text: 'Download without watermark', included: true },
      { text: 'Download as PNG + PDF', included: true },
      { text: 'Priority image conversion', included: true },
      { text: 'Exclusive coloring templates', included: true, highlight: true },
      { text: '24/7 priority support', included: true, highlight: true },
    ],
    cta: 'Go Premium',
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
    { icon: <ImagePlus size={22} className="text-orange-500" />, label: 'Upload your own pictures' },
    { icon: <Palette size={22} className="text-purple-500" />, label: '22+ color choices' },
    { icon: <Droplets size={22} className="text-blue-500" />, label: 'Instant flood-fill' },
    { icon: <Download size={22} className="text-green-500" />, label: 'Download your artwork' },
    { icon: <Infinity size={22} className="text-pink-500" />, label: 'Progress saved' },
    { icon: <HeartHandshake size={22} className="text-red-500" />, label: 'Safe for kids' },
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
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.',
  },
  {
    q: 'Is the Free plan really free forever?',
    a: 'Absolutely. The Free plan has no time limit. You can enjoy up to 3 coloring pages forever at no cost.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept all major credit and debit cards, as well as PayPal.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes! Both Pro and Premium come with a free 7-day trial. No credit card required to start.',
  },
]

function FAQ() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-8">
        ❓ Frequently Asked Questions
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
          Choose the plan that's right for you
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          More Coloring Fun,
          <br />
          <span className="text-orange-500">No Limits</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Start free, upgrade when you love it. Every plan includes a trial — no risk.
        </p>
      </section>

      {/* ── Feature highlights ────────────────────────────────────────── */}
      <HighlightStrip />

      {/* ── Pricing cards ─────────────────────────────────────────────── */}
      <section
        aria-label="Pricing plans"
        className="max-w-5xl mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-8">
          🔒 Secure payments &nbsp;·&nbsp; 🔄 Cancel any time &nbsp;·&nbsp; 7-day free trial on paid plans
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-orange-500 py-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Ready to start your coloring adventure? 🎨
        </h2>
        <p className="text-white/80 text-base mb-6">
          Sign up free today — no credit card required.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-orange-500 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all min-h-[52px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          <Star size={22} aria-hidden="true" />
          Sign Up Free Now
        </Link>
      </section>
    </div>
  )
}
