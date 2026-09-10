'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  const [title, setTitle] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [customAlias, setCustomAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortUrlItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

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
        body: JSON.stringify({
          url: longUrl,
          customCode: useCustom ? customAlias : undefined,
          title: title || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }
      setResult(data)
      toast.success('Short URL created!')
      setLongUrl('')
      setTitle('')
      setCustomAlias('')
      setUseCustom(false)
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
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-blue-900">ShortURL</span>
            <span className="ml-1 hidden rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700 sm:inline">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Shortener */}
      <section
        id="shortener"
        className="relative flex-1 overflow-hidden"
      >
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-blue-50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles className="h-3 w-3" />
              Fast · Free · Secure
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Shorten your long URLs in
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {' '}
                one click
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
              Paste any long URL below, get a short link you can share anywhere.
              Powered by PostgreSQL · visit tracking included.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/60 sm:p-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="longUrl" className="text-sm font-medium text-gray-700">
                  Long URL
                </Label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                  <Input
                    id="longUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://your-long-url.com/path?with=params"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="h-12 border-blue-100 pl-10 text-base focus-visible:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Marketing campaign link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 border-blue-100 focus-visible:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-blue-50 bg-blue-50/50 px-3 py-2.5">
                <div>
                  <Label
                    htmlFor="customToggle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Use custom alias
                  </Label>
                  <p className="text-xs text-gray-500">
                    Choose your own short code instead of random.
                  </p>
                </div>
                <Switch
                  id="customToggle"
                  checked={useCustom}
                  onCheckedChange={setUseCustom}
                />
              </div>

              <AnimatePresence initial={false}>
                {useCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-1">
                      <Label
                        htmlFor="customAlias"
                        className="text-sm font-medium text-gray-700"
                      >
                        Custom alias
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700">
                          /r/
                        </span>
                        <Input
                          id="customAlias"
                          type="text"
                          placeholder="my-link"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          className="h-11 flex-1 border-blue-100 font-mono focus-visible:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        3–30 chars: letters, numbers, hyphen, underscore.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Shortening...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" fill="white" />
                    Shorten URL
                  </>
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
                className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-lg shadow-blue-100"
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
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1 truncate rounded-lg border border-blue-200 bg-white px-3 py-2.5 font-mono text-sm font-medium text-blue-900">
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
                </div>
                {result.title && (
                  <div className="mt-2 truncate text-xs text-gray-500">
                    Title: {result.title}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features strip */}
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureItem
              icon={<Zap className="h-4 w-4" />}
              title="Instant shortening"
              desc="Get your short URL in milliseconds."
            />
            <FeatureItem
              icon={<ShieldCheck className="h-4 w-4" />}
              title="5-second ad page"
              desc="Every redirect shows a 5s ad interstitial."
            />
            <FeatureItem
              icon={<Sparkles className="h-4 w-4" />}
              title="Visit analytics"
              desc="Admin dashboard tracks every click."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-gray-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Zap className="h-3 w-3 text-white" fill="white" />
            </div>
            <span className="font-medium text-gray-700">ShortURL</span>
            <span className="text-gray-400">·</span>
            <span>Simple &amp; fast</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 transition-colors hover:underline"
          >
            <ShieldCheck className="h-3 w-3" />
            Admin login
          </Link>
        </div>
      </footer>
    </div>
  )
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
    </div>
  )
}
