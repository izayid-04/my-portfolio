import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt"
import { routing } from "@/i18n/routing"

const PUBLIC_ADMIN_PATHS = new Set(["/api/admin/login", "/api/admin/logout"])

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

  // Pages publiques : routage de langue (FR par défaut sans préfixe, EN sous /en)
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Routes admin API (auth)
    "/api/admin/:path*",
    // Pages publiques (routage de langue) : tout sauf /admin, /api, fichiers statiques, _next
    "/((?!admin|api|_next|_vercel|.*\\..*).*)",
  ],
}
