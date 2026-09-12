'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff, Crown, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function RootLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPath = searchParams.get('from') || '/root'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Prefill root credentials for demo convenience
    setUsername('root')
    setPassword('root-password-2026')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please enter username and password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      if (data.role !== 'root') {
        throw new Error(
          'These credentials belong to a regular admin. Use /login instead.'
        )
      }
      toast.success('Welcome back, root!')
      router.push(fromPath)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-purple-200 bg-white p-6 shadow-xl shadow-purple-100/60 sm:p-8"
      >
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-200">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Root Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Highest authority · Full system control
          </p>
        </div>

        <div className="mb-5 flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-xs text-purple-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-semibold">Restricted area</p>
            <p className="mt-0.5">
              Root credentials grant full database management capabilities,
              including bulk delete and visit counter reset. Use with caution.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Root Username
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="root"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 border-purple-100 focus-visible:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Root Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-purple-100 pr-11 focus-visible:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-700"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-gradient-to-r from-purple-600 to-purple-800 font-semibold text-white shadow-sm transition-colors hover:from-purple-700 hover:to-purple-900 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Enter Root Mode
              </>
            )}
          </Button>
        </form>

        {/* Demo hint */}
        <div className="mt-5 rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-2.5 text-xs text-purple-700">
          <span className="font-semibold">Demo root credentials</span> are
          pre-filled above. Just press &ldquo;Enter Root Mode&rdquo;.
        </div>

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-gray-500 transition-colors hover:text-purple-700"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-gray-500 transition-colors hover:text-blue-700"
          >
            Regular admin login
          </Link>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Authorized root personnel only · All actions are logged
      </p>
    </div>
  )
}

export default function RootLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-purple-100/60 blur-3xl" />
      </div>

      {/* Top brand badge */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-200">
          <Crown className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-purple-900">ShortURL Root</span>
      </div>

      <Suspense
        fallback={
          <div className="flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          </div>
        }
      >
        <RootLoginForm />
      </Suspense>
    </main>
  )
}
