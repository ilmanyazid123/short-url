'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ExternalLink, ShieldCheck, Sparkles, Zap } from 'lucide-react'

type Props = {
  data: {
    shortCode: string
    originalUrl: string
    title: string | null
  }
}

const AD_DURATION = 5 // seconds

export function RedirectClient({ data }: Props) {
  const [remaining, setRemaining] = useState(AD_DURATION)
  const visitedRef = useRef(false)

  // Increment visit count once on mount (fire and forget, no state update)
  useEffect(() => {
    if (visitedRef.current) return
    visitedRef.current = true
    fetch(`/api/url/${data.shortCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incrementVisit: true }),
    }).catch((err) => console.error('Failed to record visit:', err))
  }, [data.shortCode])

  // Countdown timer
  useEffect(() => {
    if (remaining > 0) {
      const timer = setInterval(() => {
        setRemaining((r) => Math.max(0, r - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
    // remaining === 0 -> trigger redirect sequence
    const t = setTimeout(() => {
      window.location.href = data.originalUrl
    }, 400)
    return () => clearTimeout(t)
  }, [remaining, data.originalUrl])

  const progress = ((AD_DURATION - remaining) / AD_DURATION) * 100
  const redirecting = remaining === 0

  const handleSkipNow = () => {
    setRemaining(0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Zap className="h-5 w-5" fill="white" />
          </div>
          <span className="text-xl font-bold text-blue-900">ShortURL</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-100/50 overflow-hidden"
        >
          {/* Ad Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-white">
            <div className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Ad · {remaining > 0 ? `${remaining}s` : 'Done'}
            </div>
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
              >
                <Sparkles className="h-7 w-7" />
              </motion.div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Boost Your Productivity Today
              </h2>
              <p className="mt-1 text-sm text-blue-50">
                Discover tools that help you work smarter, not harder.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Lightning fast
                </div>
                <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Secure
                </div>
                <div className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Analytics
                </div>
              </div>
            </div>
          </div>

          {/* Destination info */}
          <div className="px-6 py-5">
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-blue-700">
                  You are being redirected to
                </div>
                <div className="truncate text-sm font-semibold text-blue-900">
                  {data.title || data.originalUrl}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {data.originalUrl}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">
                  {remaining > 0
                    ? `Redirecting in ${remaining} second${remaining > 1 ? 's' : ''}...`
                    : 'Redirecting now...'}
                </span>
                <span className="font-mono text-blue-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.3 }}
                />
              </div>
            </div>

            {/* Action area */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <AnimatePresence mode="wait">
                {remaining > 0 ? (
                  <motion.button
                    key="wait"
                    onClick={handleSkipNow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 sm:w-auto"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Skip Ad Now
                  </motion.button>
                ) : (
                  <motion.div
                    key="redirecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    />
                    Redirecting...
                  </motion.div>
                )}
              </AnimatePresence>

              {redirecting && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs text-green-600"
                >
                  <Check className="h-3 w-3" />
                  Visit recorded · taking you to your destination
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-gray-400">
          By continuing, you will be redirected to an external website. Please
          ensure you trust the destination.
        </p>
      </div>
    </main>
  )
}
