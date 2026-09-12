'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  ExternalLink,
  Loader2,
  QrCode,
  ChevronDown,
  Menu,
  X,
  Zap,
  ShieldCheck,
  BarChart3,
  Globe,
  ArrowRight,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type ShortUrlItem = {
  id: string
  shortCode: string
  originalUrl: string
  title: string | null
  visits: number
  createdAt: string
  shortUrl: string
}

function getOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export default function Home() {
  const [longUrl, setLongUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortUrlItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setOrigin(getOrigin())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!longUrl.trim()) {
      toast.error('Please enter a URL to shorten')
      return
    }
    setLoading(true)
    setResult(null)
    setCopied(false)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }
      setResult(data)
      toast.success('Your short URL is ready!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const fullShortUrl = result ? `${origin}/r/${result.shortCode}` : ''

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top banner */}
      <div className="bg-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs sm:text-sm">
          <span className="font-semibold">ShortURL</span> — Trusted by millions to shorten, track &amp; share links.{' '}
          <Link href="/login" className="underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-blue-600">
              ShortURL
            </span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700">
              app
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
              Features
            </a>
            <a href="#how" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
              How it works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
              FAQ
            </a>
          </nav>

          {/* CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Log in
            </Link>
            <Link
              href="/login-root"
              className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 px-3 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50"
            >
              <Crown className="h-3.5 w-3.5" />
              Root
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="rounded-md p-2 text-gray-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-200 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50">Features</a>
                <a href="#how" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50">How it works</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50">Pricing</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50">FAQ</a>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mt-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white">Sign up free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-blue-50/60 to-white">
        {/* Decorative */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Shorten your long URLs
              <br />
              <span className="text-blue-600">in one click.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
              ShortURL makes long links manageable. Paste your URL below,
              customize it, share it, and track every click — all for free.
            </p>
          </motion.div>

          {/* Shortener form (TinyURL-style) */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mt-10 rounded-xl border border-gray-200 bg-white p-3 shadow-lg shadow-blue-100/40 sm:p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="Enter a long URL to shorten..."
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Shortening...
                  </>
                ) : (
                  <>Shorten!</>
                )}
              </Button>
            </div>
          </motion.form>

          {/* Result card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-900">
                      Your short URL is ready!
                    </span>
                  </div>
                  <a
                    href={fullShortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1 truncate rounded-lg border border-blue-200 bg-white px-3 py-2.5 font-mono text-sm font-semibold text-blue-900">
                    {fullShortUrl}
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleCopy(fullShortUrl)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => toast.info('QR code feature coming soon!')}
                  >
                    <QrCode className="mr-2 h-4 w-4" /> QR
                  </Button>
                </div>
                <p className="mt-2 truncate text-xs text-gray-500">
                  Original: {result.originalUrl}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              No sign-up required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              Instant shortening
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              Works worldwide
            </span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-gray-100 bg-blue-600 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6">
          <Stat number="2.5B+" label="Links created" />
          <Stat number="50M+" label="Monthly clicks" />
          <Stat number="190+" label="Countries" />
          <Stat number="99.9%" label="Uptime SLA" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage links
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Powerful features for individuals and teams. Free to start, no
              credit card required.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Lightning-fast shortening"
              desc="Get a clean, shareable short URL in milliseconds. No waiting, no captchas, no friction."
            />
            <FeatureCard
              icon={<QrCode className="h-5 w-5" />}
              title="QR codes for every link"
              desc="Generate a QR code for any short URL to share offline — print, packaging, posters, and more."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Click analytics"
              desc="See how many people clicked your link, when, and from where. Insights powered by PostgreSQL."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="5-second ad interstitial"
              desc="Every redirect shows a 5s ad page — monetize your traffic or just confirm visits with a smooth countdown."
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="Custom aliases"
              desc="Make your links memorable with custom short codes like /r/my-link. Perfect for branding."
            />
            <FeatureCard
              icon={<ArrowRight className="h-5 w-5" />}
              title="Dashboard for admins"
              desc="Manage every link from one secure backend. Search, copy, open, or delete with a single click."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Three simple steps. Less than a minute.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Step
              n="1"
              title="Paste your long URL"
              desc="Drop any long, ugly URL into the box above. HTTPS only — we keep your visitors safe."
            />
            <Step
              n="2"
              title="Click Shorten!"
              desc="We instantly generate a short, clean link you can copy with one click."
            />
            <Step
              n="3"
              title="Share &amp; track"
              desc="Share your short URL anywhere. Every click is counted and visible in your admin dashboard."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <PriceCard
              name="Free"
              price="$0"
              period="forever"
              features={[
                'Unlimited short links',
                '5-second ad page',
                'Click counter',
                'Admin dashboard',
              ]}
              cta="Get started"
              href="/login"
            />
            <PriceCard
              name="Pro"
              price="$9"
              period="per month"
              highlighted
              features={[
                'Everything in Free',
                'Custom domain',
                'No ads',
                'QR code downloads',
                'Advanced analytics',
              ]}
              cta="Start free trial"
              href="/login"
            />
            <PriceCard
              name="Business"
              price="$29"
              period="per month"
              features={[
                'Everything in Pro',
                'Team collaboration',
                'API access',
                'Priority support',
                'SSO & SAML',
              ]}
              cta="Contact us"
              href="/login"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            <Faq
              q="Is ShortURL really free?"
              a="Yes. The Free plan lets you create unlimited short links at no cost. Every short link shows a 5-second ad interstitial to keep the service free."
            />
            <Faq
              q="Do I need an account to shorten a URL?"
              a="No. Anyone can paste a URL on the home page and get a short link instantly. Sign in only if you want to manage all your links from the dashboard."
            />
            <Faq
              q="Can I customize my short link?"
              a="Yes. Toggle on 'Use custom alias' (in the admin dashboard) and choose your own short code, like /r/my-link."
            />
            <Faq
              q="How does the 5-second ad page work?"
              a="When someone opens your short URL, they see a brief, skippable ad for 5 seconds before being redirected to your destination. This keeps ShortURL free."
            />
            <Faq
              q="Do you track clicks?"
              a="Yes. Every visit is counted and visible in your admin dashboard. We only count clicks — we never sell your data."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to shorten your first link?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Join millions of users who trust ShortURL to manage, track, and
            share their links every day.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              Shorten a URL now
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign up free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-blue-600">
                  ShortURL
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-gray-500">
                The fast, free, and reliable way to shorten, track, and share
                your links.
              </p>
            </div>
            <FooterCol
              title="Product"
              links={[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'How it works', href: '#how' },
                { label: 'FAQ', href: '#faq' },
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                { label: 'Log in', href: '/login' },
                { label: 'Sign up', href: '/login' },
                { label: 'Admin dashboard', href: '/admin' },
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                { label: 'Terms', href: '#' },
                { label: 'Privacy', href: '#' },
                { label: 'Cookies', href: '#' },
              ]}
            />
          </div>
          <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} ShortURL. All rights reserved.
              Inspired by TinyURL.
            </p>
            <p className="text-xs text-gray-400">
              Built with Next.js, TypeScript, Tailwind &amp; PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-extrabold sm:text-3xl">{number}</div>
      <div className="mt-1 text-xs text-blue-100 sm:text-sm">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600">{desc}</p>
    </div>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="relative">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-200">
        {n}
      </div>
      <h3
        className="mt-4 text-lg font-semibold text-gray-900"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p
        className="mt-1 text-sm text-gray-600"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    </div>
  )
}

function PriceCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  highlighted,
}: {
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  href: string
  highlighted?: boolean
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 ${
        highlighted ? 'border-blue-600 shadow-lg shadow-blue-100' : 'border-gray-200'
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        {name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-gray-900">{price}</span>
        <span className="text-sm text-gray-500">/ {period}</span>
      </div>
      <ul className="mt-6 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border border-blue-200 text-blue-700 hover:bg-blue-50'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-gray-200 bg-white p-4 open:shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-900">
        <span>{q}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-sm text-gray-600">{a}</p>
    </details>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-gray-600 transition-colors hover:text-blue-600"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
