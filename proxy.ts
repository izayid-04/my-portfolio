import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt"
import { routing } from "@/i18n/routing"

const PUBLIC_ADMIN_PATHS = new Set(["/api/admin/login", "/api/admin/logout"])
const ADMIN_ACCESS_COOKIE = "admin_gate_unlocked"

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Routes admin API : vérification de session, jamais de routage de langue
  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_PATHS.has(pathname)) {
      return NextResponse.next()
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = token ? await verifyToken(token) : null

    if (!session) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Protection des pages d'administration (/admin et /admin/login)
  if (pathname.startsWith("/admin")) {
    const configuredSecret = process.env.ADMIN_ACCESS_KEY?.trim()
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const session = token ? await verifyToken(token) : null

    // Si une clé secrète ADMIN_ACCESS_KEY est configurée dans .env
    if (configuredSecret) {
      const urlKey = request.nextUrl.searchParams.get("key")
      const gateCookie = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value

      // Si l'utilisateur fournit la bonne clé dans l'URL ?key=...
      if (urlKey === configuredSecret) {
        const response = NextResponse.redirect(
          new URL(pathname === "/admin/login" ? "/admin/login" : "/admin", request.url)
        )
        // Mémorise l'autorisation d'accès pour ce navigateur pendant 30 jours
        response.cookies.set(ADMIN_ACCESS_COOKIE, configuredSecret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        })
        return response
      }

      // Si ni session active, ni cookie d'accès valide -> feindre un 404 introuvable
      const isGateValid = gateCookie === configuredSecret
      if (!session && !isGateValid) {
        return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 })
      }
    }

    // Protection de la page /admin principale : exige d'être déjà connecté
    if (pathname === "/admin") {
      if (!session) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    }

    // Si déjà connecté et va sur /admin/login -> rediriger directement sur /admin
    if (pathname === "/admin/login" && session) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const response = NextResponse.next()
    // Empêcher l'indexation de l'admin par les moteurs de recherche
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
    return response
  }

  // Pages publiques : routage de langue (FR par défaut sans préfixe, EN sous /en)
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Routes admin API (auth)
    "/api/admin/:path*",
    // Pages admin
    "/admin/:path*",
    // Pages publiques (routage de langue) : tout sauf /admin, /api, fichiers statiques, _next
    "/((?!admin|api|_next|_vercel|.*\\..*).*)",
  ],
}
