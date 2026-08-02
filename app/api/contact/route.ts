import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mail"
import { verifyRecaptchaV2 } from "@/lib/recaptcha"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/contact —
 * 1. Enregistre le message dans PostgreSQL/Supabase via Prisma.
 * 2. Envoie une notification par email à l'admin avec bouton de redirection vers le Dashboard Admin.
 * 3. Envoie une confirmation automatique par email au visiteur via Resend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message, countryCode, recaptchaToken } = body as {
      name?: string
      email?: string
      phone?: string
      message?: string
      countryCode?: string
      recaptchaToken?: string
    }

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Nom et email sont requis." },
        { status: 400 }
      )
    }

    const secretConfigured = Boolean(process.env.RECAPTCHA_SECRET_KEY?.trim())
    const siteKeyConfigured = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim())

    if (secretConfigured && siteKeyConfigured) {
      if (!recaptchaToken?.trim()) {
        return NextResponse.json(
          { error: "Veuillez valider le captcha." },
          { status: 400 }
        )
      }
      const forwarded = request.headers.get("x-forwarded-for")
      const remoteIp = forwarded?.split(",")[0]?.trim()
      const ok = await verifyRecaptchaV2(recaptchaToken.trim(), remoteIp)
      if (!ok) {
        return NextResponse.json(
          { error: "Captcha invalide ou expiré. Réessayez." },
          { status: 400 }
        )
      }
    }

    const userName = name.trim()
    const userEmail = email.trim()
    const userPhone = phone?.trim() || null
    const userCountryCode = countryCode?.trim() || null
    const userMessage = message?.trim() || null

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"
    const adminDashboardLink = `${appUrl}/admin`

    // 1. Enregistrement du message dans la base de données PostgreSQL via Prisma
    try {
      await prisma.contact.create({
        data: {
          name: userName,
          email: userEmail,
          phone: userPhone,
          countryCode: userCountryCode,
          message: userMessage,
        },
      })
    } catch (dbError) {
      console.error("[api/contact] Erreur sauvegarde Prisma contact:", dbError)
    }

    // 2. Email de notification envoyé à l'administrateur avec BOUTON DE REDIRECTION VERS LE DASHBOARD ADMIN
    const toEmail = process.env.CONTACT_TO_EMAIL
    if (toEmail) {
      await sendEmail({
        to: toEmail,
        subject: `[Portfolio] Nouveau message de ${userName}`,
        text: `Nouveau message de ${userName} (${userEmail}):\n\n${userMessage || ""}\n\nVoir dans le Dashboard Admin: ${adminDashboardLink}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #10b981;"></span>
              <h2 style="color: #111827; margin: 0; font-size: 18px;">Nouveau message reçu depuis le Portfolio</h2>
            </div>
            
            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nom :</strong> ${userName}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email :</strong> <a href="mailto:${userEmail}" style="color: #4f46e5;">${userEmail}</a></p>
              ${userPhone ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Téléphone :</strong> ${userPhone}</p>` : ""}
              ${userCountryCode ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Pays :</strong> ${userCountryCode}</p>` : ""}
            </div>

            <div style="background-color: #f3f4f6; padding: 16px; border-left: 4px solid #4f46e5; border-radius: 6px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Message :</p>
              <p style="margin-top: 8px; margin-bottom: 0; font-size: 15px; color: #111827; white-space: pre-wrap;">${userMessage || "Aucun contenu"}</p>
            </div>

            <!-- BOUTON REDIRECTION DIRECTE VERS LE DASHBOARD ADMIN -->
            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${adminDashboardLink}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
                Accéder au Dashboard Admin →
              </a>
            </div>
          </div>
        `,
      })
    }

    // 3. Email de confirmation automatique envoyé à l'utilisateur (visiteur)
    try {
      await sendEmail({
        to: userEmail,
        subject: `Confirmation de réception — Portfolio Ali Izayid`,
        text: `Bonjour ${userName},\n\nMerci d'avoir pris contact avec moi ! J'ai bien reçu votre message et je vous répondrai dans les plus brefs délais.\n\nRécapitulatif de votre message :\n"${userMessage || ""}"\n\nÀ très vite,\nAli Izayid`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-top: 0; font-size: 20px;">Merci pour votre message, ${userName} !</h2>
            <p style="font-size: 15px; color: #374151;">Bonjour ${userName},</p>
            <p style="font-size: 15px; color: #374151;">J'ai bien reçu votre message envoyé depuis mon portfolio. Je prendrai connaissance de votre demande et vous répondrai dans les meilleurs délais.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-left: 4px solid #4f46e5; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Récapitulatif de votre message :</p>
              <p style="margin-top: 8px; margin-bottom: 0; font-size: 14px; font-style: italic; color: #1f2937; white-space: pre-wrap;">"${userMessage || "Aucun contenu"}"</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="margin: 0; font-size: 14px; color: #4b5563;">Cordialement,<br><strong style="color: #111827;">Ali Izayid</strong><br><span style="color: #6b7280; font-size: 13px;">Développeur Fullstack</span></p>
          </div>
        `,
      })
    } catch (visitorEmailError) {
      console.warn("[api/contact] Note: Envoi email au visiteur ignoré (Resend mode test):", visitorEmailError)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[api/contact]", e)
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    )
  }
}
