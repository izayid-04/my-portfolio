/**
 * Vérification Cloudflare Turnstile côté serveur.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret?.trim()) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY manquant — vérification ignorée")
    return false
  }
  if (!token?.trim()) return false

  const params = new URLSearchParams()
  params.set("secret", secret)
  params.set("response", token)
  if (remoteIp) params.set("remoteip", remoteIp)

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!res.ok) return false

  const data = (await res.json()) as { success?: boolean }
  return data.success === true
}
