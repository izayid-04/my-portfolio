import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt"

const PUBLIC_ADMIN_PATHS = new Set(["/api/admin/login", "/api/admin/logout"])

export async function proxy(request: NextRequest) {
  if (PUBLIC_ADMIN_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/admin/:path*"],
}
