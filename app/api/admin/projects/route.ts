import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Lister tous les projets (admin)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { company: true },
    })
    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error("GET /api/admin/projects error:", error)
    return NextResponse.json({ error: "Erreur serveur", details: error.message }, { status: 500 })
  }
}

// POST: Créer un projet
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, titleEn, description, descriptionEn, date, slug, tags, image, video, href, githubUrl, embedSite, published, order, companyId } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis." }, { status: 400 })
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        titleEn: titleEn || null,
        description,
        descriptionEn: descriptionEn || null,
        date: date || null,
        slug: slug || null,
        tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        image: image || null,
        video: video || null,
        href: href || null,
        githubUrl: githubUrl || null,
        embedSite: typeof embedSite === "boolean" ? embedSite : true,
        published: typeof published === "boolean" ? published : true,
        order: typeof order === "number" ? order : 0,
        companyId: companyId || null,
      },
      include: { company: true },
    })

    return NextResponse.json({ project: newProject }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/admin/projects error:", error)
    return NextResponse.json({ error: "Erreur lors de la création", details: error.message }, { status: 500 })
  }
}

// PUT: Modifier un projet
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, titleEn, description, descriptionEn, date, slug, tags, image, video, href, githubUrl, embedSite, published, order, companyId } = body

    if (!id) {
      return NextResponse.json({ error: "ID du projet requis pour la modification." }, { status: 400 })
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        titleEn: titleEn || null,
        description,
        descriptionEn: descriptionEn || null,
        date: date || null,
        slug: slug || null,
        tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        image: image || null,
        video: video || null,
        href: href || null,
        githubUrl: githubUrl || null,
        embedSite: typeof embedSite === "boolean" ? embedSite : true,
        published: typeof published === "boolean" ? published : true,
        order: typeof order === "number" ? order : 0,
        companyId: companyId || null,
      },
      include: { company: true },
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error: any) {
    console.error("PUT /api/admin/projects error:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour", details: error.message }, { status: 500 })
  }
}

// DELETE: Supprimer un projet
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID du projet requis" }, { status: 400 })
    }

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Projet supprimé." })
  } catch (error: any) {
    console.error("DELETE /api/admin/projects error:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression", details: error.message }, { status: 500 })
  }
}
