"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import Script from "next/script"

type TurnstileRenderOptions = {
  sitekey: string
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type TurnstileWidgetProps = {
  onChange: (token: string | null) => void
}

export type TurnstileWidgetHandle = {
  reset: () => void
}

/**
 * Widget Cloudflare Turnstile.
 * Si NEXT_PUBLIC_TURNSTILE_SITE_KEY est absent, ne rend rien (ex. dev local).
 */
export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onChange }, ref) {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | undefined>(undefined)
    const onChangeRef = useRef(onChange)

    const [scriptReady, setScriptReady] = useState(false)

    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current !== undefined && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
        onChangeRef.current(null)
      },
    }))

    useEffect(() => {
      if (!SITE_KEY?.trim() || !scriptReady) return

      let cancelled = false
      const host = hostRef.current
      if (!host || !window.turnstile) return

      host.innerHTML = ""
      const inner = document.createElement("div")
      host.appendChild(inner)

      const id = window.turnstile.render(inner, {
        sitekey: SITE_KEY.trim(),
        callback: (token: string) => onChangeRef.current(token),
        "expired-callback": () => onChangeRef.current(null),
        "error-callback": () => onChangeRef.current(null),
      })
      widgetIdRef.current = id

      return () => {
        cancelled = true
        const currentId = widgetIdRef.current
        widgetIdRef.current = undefined
        if (currentId !== undefined && window.turnstile) {
          try {
            window.turnstile.remove(currentId)
          } catch {
            // widget déjà démonté
          }
        }
        if (host) host.innerHTML = ""
        void cancelled
      }
    }, [scriptReady])

    if (!SITE_KEY?.trim()) {
      return null
    }

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
          onLoad={() => setScriptReady(true)}
        />
        <div ref={hostRef} className="flex justify-center" />
      </>
    )
  }
)

export function isTurnstileEnabled(): boolean {
  return Boolean(SITE_KEY?.trim())
}
