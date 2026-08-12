import { SignJWT, jwtVerify } from "jose"

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET n'est pas défini. Configurez cette variable d'environnement avant de démarrer l'application."
  )
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

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
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
