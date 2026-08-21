import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/blogs/[id] — un article par ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: "Article non trouvé." }, { status: 404 })

    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        titleEn: post.titleEn,
        excerpt: post.excerpt,
        excerptEn: post.excerptEn,
        content: post.content,
        contentEn: post.contentEn,
        date: post.date.toISOString(),
        readingTime: post.readingTime,
        tags: post.tags,
        image: post.image,
        published: post.published,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("[api/admin/blogs/[id] GET]", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

// PATCH /api/admin/blogs/[id] — modifier un article
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, titleEn, excerpt, excerptEn, content, contentEn, date, readingTime, tags, image, published } = body as {
      title?: string
      titleEn?: string
      excerpt?: string
      excerptEn?: string
      content?: string
      contentEn?: string
      date?: string
      readingTime?: number
      tags?: string[]
      image?: string
      published?: boolean
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (titleEn !== undefined) updateData.titleEn = titleEn.trim() || null
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim()
    if (excerptEn !== undefined) updateData.excerptEn = excerptEn.trim() || null
    if (content !== undefined) updateData.content = content.trim()
    if (contentEn !== undefined) updateData.contentEn = contentEn.trim() || null
    if (date !== undefined) updateData.date = new Date(date)
    if (readingTime !== undefined) updateData.readingTime = readingTime
    if (tags !== undefined) updateData.tags = tags
    if (image !== undefined) updateData.image = image?.trim() || null
    if (published !== undefined) updateData.published = published

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        titleEn: post.titleEn,
        excerpt: post.excerpt,
        excerptEn: post.excerptEn,
        content: post.content,
        contentEn: post.contentEn,
        date: post.date.toISOString(),
        readingTime: post.readingTime,
        tags: post.tags,
        image: post.image,
        published: post.published,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("[api/admin/blogs/[id] PATCH]", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'article." }, { status: 500 })
  }
}

// DELETE /api/admin/blogs/[id] — supprimer un article
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/admin/blogs/[id] DELETE]", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'article." }, { status: 500 })
  }
}
