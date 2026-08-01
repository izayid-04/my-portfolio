/**
 * Service d'envoi d'emails transactionnels via Resend API.
 * Variables d'environnement requises :
 * - RESEND_API_KEY : Clé API fournie par Resend (ex: re_123456789)
 * - RESEND_FROM_EMAIL : Adresse d'expédition (ex: contact@ton-domaine.com ou onboarding@resend.dev)
 * - RESEND_FROM_NAME : Nom affiché (ex: Portfolio Iza)
 */

import { Resend } from "resend"

export interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  const fromName = process.env.RESEND_FROM_NAME || "Portfolio"

  if (!apiKey) {
    console.warn("[mail] RESEND_API_KEY non configurée. Envoi ignoré.")
    return false
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>"),
    })

    if (error) {
      console.error("[mail] Erreur Resend:", error)
      return false
    }

    return true
  } catch (e) {
    console.error("[mail] Échec d'envoi d'email via Resend:", e)
    return false
  }
}
