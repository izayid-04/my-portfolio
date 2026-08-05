import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Liste toutes les entreprises/structures
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { projects: true } },
      },
    })

    return NextResponse.json({ companies })
  } catch (error: any) {
    console.error("[COMPANIES GET ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des entreprises", companies: [] }, { status: 500 })
  }
}

// POST: Créer une nouvelle entreprise
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, logo, website } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Le nom de l'entreprise est requis" }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        logo: logo || null,
        website: website || null,
      },
    })

    return NextResponse.json({ success: true, company }, { status: 201 })
  } catch (error: any) {
    console.error("[COMPANY POST ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la création", details: error.message }, { status: 500 })
  }
}

// PUT: Modifier une entreprise
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, logo, website } = body

    if (!id) {
      return NextResponse.json({ error: "ID de l'entreprise manquant" }, { status: 400 })
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name?.trim(),
        logo: logo ?? null,
        website: website ?? null,
      },
    })

    return NextResponse.json({ success: true, company: updated })
  } catch (error: any) {
    console.error("[COMPANY PUT ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour", details: error.message }, { status: 500 })
  }
}

// DELETE: Supprimer une entreprise
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de l'entreprise manquant" }, { status: 400 })
    }

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[COMPANY DELETE ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la suppression", details: error.message }, { status: 500 })
  }
}
