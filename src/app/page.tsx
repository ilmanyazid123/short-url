'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Loader2,
  Search,
  Sparkles,
  ArrowRight,
  BarChart3,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type ShortUrlItem = {
  id: string
  shortCode: string
  originalUrl: string
  title: string | null
  visits: number
  createdAt: string
  shortUrl: string
}

type ApiResult = {
  urls: ShortUrlItem[]
  total: number
  totalVisits: number
}

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
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
  const [list, setList] = useState<ShortUrlItem[]>([])
  const [stats, setStats] = useState({ total: 0, totalVisits: 0 })
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(getOrigin())
  }, [])

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch('/api/urls')
      if (!res.ok) throw new Error('Failed to load')
      const data: ApiResult = await res.json()
      setList(data.urls)
      setStats({ total: data.total, totalVisits: data.totalVisits })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load your URLs')
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

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
      fetchList()
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

  const handleDelete = async (code: string) => {
    const prev = list
    setList((l) => l.filter((u) => u.shortCode !== code))
    try {
      const res = await fetch(`/api/url/${code}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('URL deleted')
      fetchList()
    } catch {
      toast.error('Failed to delete')
      setList(prev)
    }
  }

  const filteredList = list.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.shortCode.toLowerCase().includes(q) ||
      u.originalUrl.toLowerCase().includes(q) ||
      (u.title?.toLowerCase().includes(q) ?? false)
    )
  })

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
            <a
              href="#dashboard"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-blue-700 sm:inline-block"
            >
              Dashboard
            </a>
            <a
              href="#shortener"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New
            </a>
          </div>
        </div>
      </header>

      {/* Hero / Shortener */}
      <section
        id="shortener"
        className="relative overflow-hidden border-b border-blue-100"
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
              Track visits and manage all your links from one dashboard.
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
        </div>
      </section>

      {/* Dashboard */}
      <section id="dashboard" className="flex-1 bg-gray-50/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all your shortened URLs in one place.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by URL, code, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-blue-100 pl-9 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard
              icon={<Link2 className="h-4 w-4" />}
              label="Total Links"
              value={stats.total}
              accent="blue"
            />
            <StatCard
              icon={<Eye className="h-4 w-4" />}
              label="Total Visits"
              value={stats.totalVisits}
              accent="blue"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Avg Visits/Link"
              value={stats.total ? Math.round(stats.totalVisits / stats.total) : 0}
              accent="blue"
            />
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
            {filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Link2 className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {search ? 'No matches found' : 'No short URLs yet'}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  {search
                    ? 'Try a different search term.'
                    : 'Create your first short URL using the form above.'}
                </p>
                {!search && (
                  <a
                    href="#shortener"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Create one <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            ) : (
              <div className="max-h-[640px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-blue-50 text-left text-xs uppercase tracking-wide text-blue-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Short Link</th>
                      <th className="hidden px-4 py-3 font-semibold md:table-cell">
                        Destination
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Visits
                      </th>
                      <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {filteredList.map((u) => {
                      const fullUrl = `${origin}/r/${u.shortCode}`
                      return (
                        <tr
                          key={u.id}
                          className="group transition-colors hover:bg-blue-50/40"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                                <Link2 className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <a
                                  href={fullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate font-mono text-xs font-semibold text-blue-700 hover:underline sm:text-sm"
                                >
                                  /r/{u.shortCode}
                                </a>
                                {u.title && (
                                  <div className="truncate text-xs text-gray-500">
                                    {u.title}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden max-w-xs px-4 py-3 md:table-cell">
                            <a
                              href={u.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-xs text-gray-600 hover:text-blue-700 hover:underline"
                              title={u.originalUrl}
                            >
                              {u.originalUrl}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              <Eye className="h-3 w-3" />
                              {u.visits}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {timeAgo(u.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(fullUrl)}
                                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                      aria-label="Copy link"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                      aria-label="Open link"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>Open</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(u.shortCode)}
                                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                      aria-label="Delete link"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ShortURL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: 'blue'
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          {icon}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold text-blue-900">{value}</div>
    </div>
  )
}
