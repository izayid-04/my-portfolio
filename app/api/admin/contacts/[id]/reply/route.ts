import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mail"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { replyMessage, subject } = body as { replyMessage?: string; subject?: string }

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: "Le message de réponse ne peut pas être vide." }, { status: 400 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact non trouvé." }, { status: 404 })
    }

    const replySubject = subject?.trim() || `Re: Votre message sur le Portfolio — Ali Izayid`

    // Envoi de la réponse par email au visiteur via Resend
    const sent = await sendEmail({
      to: contact.email,
      subject: replySubject,
      text: replyMessage.trim(),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h3 style="color: #4f46e5; margin-top: 0;">Réponse à votre message</h3>
          <p style="font-size: 15px; color: #374151;">Bonjour ${contact.name},</p>
          <div style="font-size: 15px; color: #1f2937; whitespace: pre-wrap; background-color: #f9fafb; padding: 16px; border-left: 4px solid #4f46e5; margin: 16px 0; border-radius: 6px;">
            ${replyMessage.trim().replace(/\n/g, "<br>")}
          </div>
          
          <div style="margin-top: 24px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; font-size: 13px; color: #6b7280;">
            <p style="margin: 0; font-weight: 600; text-transform: uppercase;">Votre message initial :</p>
            <p style="margin-top: 4px; margin-bottom: 0; font-style: italic;">"${contact.message || "Aucun message"}"</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="margin: 0; font-size: 14px; color: #4b5563;">Cordialement,<br><strong style="color: #111827;">Ali Izayid</strong><br><span style="color: #6b7280; font-size: 13px;">Développeur Fullstack</span></p>
        </div>
      `,
    })

    if (!sent) {
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email via Resend. Vérifiez vos identifiants ou le domaine vérifié." },
        { status: 500 }
      )
    }

    // Marquer comme lu et enregistré la date de réponse
    const updated = await prisma.contact.update({
      where: { id },
      data: {
        isRead: true,
        repliedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      item: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        message: updated.message,
        country_code: updated.countryCode,
        isRead: updated.isRead,
        repliedAt: updated.repliedAt?.toISOString() || null,
        created_at: updated.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("[api/admin/contacts/REPLY]", error)
    return NextResponse.json({ error: "Erreur serveur lors de l'envoi de la réponse." }, { status: 500 })
  }
}
