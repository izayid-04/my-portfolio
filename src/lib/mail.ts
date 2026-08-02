import { Resend } from "resend"
import nodemailer from "nodemailer"

export interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

function getSmtpTransporter() {
  const host = process.env.MAILTRAP_SMTP_HOST
  const port = process.env.MAILTRAP_SMTP_PORT
  const user = process.env.MAILTRAP_SMTP_USER
  const pass = process.env.MAILTRAP_SMTP_PASS

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: port === "465",
      auth: { user, pass },
    })
  }
  return null
}

async function sendViaSmtp(options: SendEmailOptions): Promise<boolean> {
  const transporter = getSmtpTransporter()
  if (!transporter) {
    console.warn("[mail] Aucun serveur SMTP configuré pour le fallback.")
    return false
  }

  const fromEmail = process.env.MAILTRAP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@portfolio.dev"
  const fromName = process.env.MAILTRAP_FROM_NAME || process.env.RESEND_FROM_NAME || "Portfolio Iza"

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>"),
    })
    console.log(`[mail] Email envoyé avec succès via SMTP à ${options.to}`)
    return true
  } catch (e) {
    console.error("[mail] Échec d'envoi SMTP:", e)
    return false
  }
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  const fromName = process.env.RESEND_FROM_NAME || "Portfolio"

  // 1. Tenter l'envoi via Resend API
  if (apiKey) {
    try {
      const resend = new Resend(apiKey)
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html ?? options.text.replace(/\n/g, "<br>"),
      })

      if (!error && data) {
        console.log(`[mail] Email envoyé avec succès via Resend à ${options.to}`)
        return true
      }

      console.warn(`[mail] Resend n'a pas pu livrer à ${options.to} (${error?.message}). Tentative via le relais SMTP...`)
    } catch (e) {
      console.warn(`[mail] Resend indisponible pour ${options.to}. Tentative via le relais SMTP...`, e)
    }
  }

  // 2. Fallback automatique SMTP (Mailtrap) pour le développement et les adresses de test
  return await sendViaSmtp(options)
}
