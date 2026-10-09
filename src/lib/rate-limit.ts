// Simple in-memory rate limiter for Edge/Node runtimes
interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Nettoyage régulier des entrées expirées (toutes les 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref?.()
}

export interface RateLimitOptions {
  windowMs: number // Durée de la fenêtre en millisecondes
  max: number // Nombre maximal de requêtes autorisées
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Vérifie si une clé (ex: IP ou IP:route) dépasse le seuil autorisé.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(key, newRecord)
    return {
      success: true,
      remaining: options.max - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= options.max) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count += 1
  return {
    success: true,
    remaining: Math.max(0, options.max - record.count),
    resetTime: record.resetTime,
  }
}
