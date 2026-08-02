import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Route publique pour récupérer la liste des diplômes et certifications
export async function GET() {
  try {
    const diplomas = await prisma.diploma.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            city: true,
            country: true,
          },
        },
      },
    })

    return NextResponse.json({ diplomas })
  } catch (error) {
    console.error("[PUBLIC DIPLOMAS GET ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des diplômes" }, { status: 500 })
  }
}
