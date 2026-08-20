"use client"

import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"

let initialized = false

function initPosthog() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Les pageviews sont envoyées manuellement au changement de route (App Router = SPA)
    capture_pageview: false,
    capture_pageleave: true,
  })
  initialized = true
}

function PosthogRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY) return
    const q = searchParams?.toString()
    const url = q ? `${pathname}?${q}` : pathname
    posthog.capture("$pageview", { $current_url: window.location.origin + url })
  }, [pathname, searchParams])

  return null
}

/**
 * PostHog (analytics produit : pageviews, événements, sessions).
 * Définir NEXT_PUBLIC_POSTHOG_KEY (et éventuellement NEXT_PUBLIC_POSTHOG_HOST) dans .env.local
 */
export function PosthogProvider() {
  if (!POSTHOG_KEY) {
    return null
  }

  initPosthog()

  return (
    <Suspense fallback={null}>
      <PosthogRouteTracker />
    </Suspense>
  )
}
