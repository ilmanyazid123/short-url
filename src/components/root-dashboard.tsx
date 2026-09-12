'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
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
  ArrowRight,
  BarChart3,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Database,
  Cpu,
  Settings,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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

type SystemInfo = {
  database: {
    provider: string
    host: string
    table: string
    totalUrls: number
    totalVisits: number
    maxVisits: number
    avgVisits: number
  }
  topUrls: {
    shortCode: string
    originalUrl: string
    title: string | null
    visits: number
    createdAt: string
  }[]
  recentUrls: {
    shortCode: string
    originalUrl: string
    title: string | null
    visits: number
    createdAt: string
  }[]
  env: Record<string, string>
  timestamp: string
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
  return `${Math.floor(d / 30)}mo ago`
}

function getOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function RootDashboard({ username }: { username: string }) {
  const router = useRouter()
  const [list, setList] = useState<ShortUrlItem[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [resettingVisits, setResettingVisits] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(getOrigin())
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [urlsRes, sysRes] = await Promise.all([
        fetch('/api/urls'),
        fetch('/api/system/info'),
      ])
      if (urlsRes.ok) {
        const data = await urlsRes.json()
        setList(data.urls)
      }
      if (sysRes.ok) {
        const data = await sysRes.json()
        setSystemInfo(data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load data')
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAll()
    setRefreshing(false)
    toast.success('Refreshed')
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Signed out')
      router.push('/login-root')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
      setLoggingOut(false)
    }
  }

  const handleCopy = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(code)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDeleteOne = async (code: string) => {
    const prev = list
    setList((l) => l.filter((u) => u.shortCode !== code))
    try {
      const res = await fetch(`/api/url/${code}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('URL deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete')
      setList(prev)
    }
  }

  const handleDeleteAll = async () => {
    setDeletingAll(true)
    try {
      const res = await fetch('/api/urls/all', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`Deleted ${data.deleted} URLs`)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setDeletingAll(false)
    }
  }

  const handleResetVisits = async () => {
    setResettingVisits(true)
    try {
      const res = await fetch('/api/urls/reset-visits', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success(`Reset ${data.reset} visit counters`)
      fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setResettingVisits(false)
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

  return (
    <div className="min-h-screen flex flex-col bg-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-purple-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-200">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-purple-900">ShortURL</span>
            <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
              Root
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 sm:flex">
              <Crown className="h-3 w-3" />
              {username || 'root'}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:from-purple-700 hover:to-purple-900 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <Crown className="h-7 w-7 text-purple-600" />
              Root Control Panel
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Highest authority · Full database access · All actions are logged
            </p>
          </div>

          {/* Top warning banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-700" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold">You have root privileges</p>
              <p className="mt-0.5 text-purple-700">
                This account can perform destructive operations (bulk delete,
                reset visit counters) that cannot be undone. Verify each action
                before confirming.
              </p>
            </div>
          </motion.div>

          {/* System overview */}
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Cpu className="h-5 w-5 text-purple-600" />
              System Overview
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <RootStatCard
                icon={<Link2 className="h-4 w-4" />}
                label="Total URLs"
                value={systemInfo?.database.totalUrls ?? 0}
              />
              <RootStatCard
                icon={<Eye className="h-4 w-4" />}
                label="Total Visits"
                value={systemInfo?.database.totalVisits ?? 0}
              />
              <RootStatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Max Visits"
                value={systemInfo?.database.maxVisits ?? 0}
              />
              <RootStatCard
                icon={<Activity className="h-4 w-4" />}
                label="Avg Visits"
                value={systemInfo?.database.avgVisits ?? 0}
              />
            </div>
          </section>

          {/* Top URLs + Recent Activity */}
          <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top URLs */}
            <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Top 5 Most Visited
              </h3>
              <div className="space-y-2">
                {systemInfo?.topUrls && systemInfo.topUrls.length > 0 ? (
                  systemInfo.topUrls.map((u, i) => (
                    <div
                      key={u.shortCode}
                      className="flex items-center gap-3 rounded-lg border border-purple-50 bg-purple-50/40 p-2.5"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-xs font-semibold text-purple-700">
                          /r/{u.shortCode}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {u.title || u.originalUrl}
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                        {u.visits}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No URLs yet</p>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Activity className="h-4 w-4 text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {systemInfo?.recentUrls && systemInfo.recentUrls.length > 0 ? (
                  systemInfo.recentUrls.map((u) => (
                    <div
                      key={u.shortCode}
                      className="flex items-center gap-3 rounded-lg border border-purple-50 bg-purple-50/40 p-2.5"
                    >
                      <Clock className="h-4 w-4 flex-shrink-0 text-purple-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-xs font-semibold text-purple-700">
                          /r/{u.shortCode}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {u.title || u.originalUrl}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {timeAgo(u.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No recent activity</p>
                )}
              </div>
            </div>
          </section>

          {/* All URLs table */}
          <section className="mb-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  All Short URLs
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Full database listing · root has delete access to any URL
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by URL, code, or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-purple-100 pl-9 focus-visible:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
              {filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                    <Link2 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {search ? 'No matches found' : 'No URLs in database'}
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {search
                      ? 'Try a different search term.'
                      : 'The database is empty. URLs created via the public form will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="max-h-[640px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-purple-50 text-left text-xs uppercase tracking-wide text-purple-700">
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
                    <tbody className="divide-y divide-purple-50">
                      {filteredList.map((u) => {
                        const fullUrl = `${origin}/r/${u.shortCode}`
                        return (
                          <tr
                            key={u.id}
                            className="group transition-colors hover:bg-purple-50/40"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                                  <Link2 className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <a
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block truncate font-mono text-xs font-semibold text-purple-700 hover:underline sm:text-sm"
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
                                className="block truncate text-xs text-gray-600 hover:text-purple-700 hover:underline"
                                title={u.originalUrl}
                              >
                                {u.originalUrl}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
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
                                        onClick={() => handleCopy(fullUrl, u.shortCode)}
                                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-700"
                                        aria-label="Copy link"
                                      >
                                        {copiedCode === u.shortCode ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
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
                                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-700"
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
                                        onClick={() => handleDeleteOne(u.shortCode)}
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
          </section>

          {/* Danger Zone */}
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border-2 border-red-200 bg-red-50/40 p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete ALL URLs
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Permanently delete every short URL in the database. This
                  cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="mt-4 w-full"
                      disabled={deletingAll}
                    >
                      {deletingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete all ({list.length}) URLs
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete ALL short URLs?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all{' '}
                        <strong>{list.length}</strong> short URLs from the
                        database. Affected short links will stop working
                        immediately. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAll}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold text-amber-700">
                  <RefreshCw className="h-4 w-4" />
                  Reset Visit Counters
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Set visit count to 0 for all URLs. The URLs themselves are
                  kept intact.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-4 w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                      disabled={resettingVisits}
                    >
                      {resettingVisits ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset all visit counters
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Reset all visit counters?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will set the visit counter to 0 for every short
                        URL. Analytics history will be lost. The URLs themselves
                        remain functional.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetVisits}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Yes, reset counters
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </section>

          {/* System Info */}
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Database className="h-5 w-5 text-purple-600" />
              System Information
            </h2>
            <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Database className="h-3 w-3" />
                    Database
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Provider</dt>
                      <dd className="font-mono text-gray-900">
                        {systemInfo?.database.provider || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Host</dt>
                      <dd className="font-mono text-gray-900">
                        {systemInfo?.database.host || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Table</dt>
                      <dd className="font-mono text-gray-900">
                        {systemInfo?.database.table || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total URLs</dt>
                      <dd className="font-mono text-gray-900">
                        {systemInfo?.database.totalUrls ?? '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total Visits</dt>
                      <dd className="font-mono text-gray-900">
                        {systemInfo?.database.totalVisits ?? '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Settings className="h-3 w-3" />
                    Environment
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    {systemInfo?.env &&
                      Object.entries(systemInfo.env).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <dt className="text-gray-500">{k}</dt>
                          <dd className="truncate font-mono text-gray-900">
                            {v}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
              <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                Last updated: {systemInfo?.timestamp || '—'}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-gray-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-purple-800">
              <Crown className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium text-gray-700">ShortURL Root</span>
            <span className="text-gray-400">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-purple-500" />
              Highest authority
            </span>
          </div>
          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ShortURL · Root control panel
          </div>
        </div>
      </footer>
    </div>
  )
}

function RootStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
          {icon}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold text-purple-900">{value}</div>
    </div>
  )
}
