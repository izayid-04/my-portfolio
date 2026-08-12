import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME, verifyToken, type JWTPayload } from "@/lib/jwt"

export { createToken, verifyToken } from "@/lib/jwt"
export type { JWTPayload } from "@/lib/jwt"

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function getAuthSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  return await verifyToken(token)
}
