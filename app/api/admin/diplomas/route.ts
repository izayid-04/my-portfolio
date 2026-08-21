import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Liste tous les diplômes avec leurs établissements
export async function GET() {
  try {
    const diplomas = await prisma.diploma.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        institution: true,
      },
    })

    return NextResponse.json({ diplomas })
  } catch (error: any) {
    console.error("[DIPLOMAS GET ERROR]", error)
    return NextResponse.json({ error: error?.message || "Erreur lors de la récupération", diplomas: [] })
  }
}

// POST: Créer un diplôme
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, titleEn, degreeType, fieldOfStudy, description, descriptionEn, date, image, url, published, institutionId } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Le titre du diplôme est requis" }, { status: 400 })
    }

    const diploma = await prisma.diploma.create({
      data: {
        title: title.trim(),
        titleEn: titleEn || null,
        degreeType: degreeType || "CERTIFICAT",
        fieldOfStudy: fieldOfStudy || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        date: date || null,
        image: image || null,
        url: url || null,
        published: published ?? true,
        institutionId: institutionId || null,
      },
      include: {
        institution: true,
      },
    })

    return NextResponse.json({ success: true, diploma })
  } catch (error) {
    console.error("[DIPLOMA POST ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la création du diplôme" }, { status: 500 })
  }
}

// PUT: Modifier un diplôme
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, titleEn, degreeType, fieldOfStudy, description, descriptionEn, date, image, url, published, institutionId } = body

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const updated = await prisma.diploma.update({
      where: { id },
      data: {
        title: title?.trim(),
        titleEn: titleEn || null,
        degreeType: degreeType || "CERTIFICAT",
        fieldOfStudy: fieldOfStudy ?? null,
        description: description ?? null,
        descriptionEn: descriptionEn || null,
        date: date ?? null,
        image: image ?? null,
        url: url ?? null,
        published: published ?? true,
        institutionId: institutionId || null,
      },
      include: {
        institution: true,
      },
    })

    return NextResponse.json({ success: true, diploma: updated })
  } catch (error) {
    console.error("[DIPLOMA PUT ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// DELETE: Supprimer un diplôme
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    await prisma.diploma.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DIPLOMA DELETE ERROR]", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
