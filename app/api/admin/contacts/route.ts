import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    const formattedContacts = contacts.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: item.message,
      country_code: item.countryCode,
      isRead: item.isRead,
      repliedAt: item.repliedAt ? item.repliedAt.toISOString() : null,
      created_at: item.createdAt.toISOString(),
    }))

    return NextResponse.json({
      items: formattedContacts,
      source: "prisma",
    })
  } catch (error) {
    console.error("[api/admin/contacts] Erreur lecture Prisma:", error)
    return NextResponse.json(
      {
        items: [],
        source: "ui-fallback",
        warning: "Impossible de charger les messages depuis la base de données.",
      },
      { status: 200 }
    )
  }
}
