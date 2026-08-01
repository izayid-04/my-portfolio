import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET: Liste tous les établissements
export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { diplomas: true } },
      },
    })

    return NextResponse.json({ institutions })
  } catch (error) {
    console.error("[INSTITUTIONS GET ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la récupération", institutions: [] })
  }
}

// POST: Créer un nouvel établissement
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, logo, website, city, country } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom de l'établissement est requis" }, { status: 400 })
    }

    const institution = await prisma.institution.create({
      data: {
        name: name.trim(),
        logo: logo || null,
        website: website || null,
        city: city || null,
        country: country || null,
      },
    })

    return NextResponse.json({ success: true, institution })
  } catch (error) {
    console.error("[INSTITUTION POST ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// PUT: Modifier un établissement
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, logo, website, city, country } = body

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        name: name?.trim(),
        logo: logo ?? null,
        website: website ?? null,
        city: city ?? null,
        country: country ?? null,
      },
    })

    return NextResponse.json({ success: true, institution: updated })
  } catch (error) {
    console.error("[INSTITUTION PUT ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// DELETE: Supprimer un établissement
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    await prisma.institution.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[INSTITUTION DELETE ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
