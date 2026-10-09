import { SignJWT, jwtVerify } from "jose"

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      throw new Error(
        "JWT_SECRET n'est pas défini. Configurez cette variable d'environnement avant de démarrer l'application."
      )
    }
    // Fallback pour la phase de build Next.js si JWT_SECRET n'est pas injecté
    return new TextEncoder().encode("build_fallback_secret_key_change_in_production")
  }
  return new TextEncoder().encode(secret)
}


export const AUTH_COOKIE_NAME = "admin_token"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
