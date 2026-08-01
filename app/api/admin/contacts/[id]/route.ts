import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isRead } = body as { isRead?: boolean }

    if (typeof isRead !== "boolean") {
      return NextResponse.json({ error: "isRead doit être un booléen." }, { status: 400 })
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { isRead },
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
    console.error("[api/admin/contacts/PATCH]", error)
    return NextResponse.json({ error: "Impossible de mettre à jour le statut du message." }, { status: 500 })
  }
}
