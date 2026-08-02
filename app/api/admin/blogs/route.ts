import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// GET /api/admin/blogs — liste tous les articles (admin)
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      posts: posts.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        date: p.date.toISOString(),
        readingTime: p.readingTime,
        tags: p.tags,
        image: p.image,
        published: p.published,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[api/admin/blogs GET]", error)
    return NextResponse.json({ posts: [], error: "Erreur lecture base de données." })
  }
}

// POST /api/admin/blogs — créer un nouvel article
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, excerpt, content, date, readingTime, tags, image, published } = body as {
      title?: string
      excerpt?: string
      content?: string
      date?: string
      readingTime?: number
      tags?: string[]
      image?: string
      published?: boolean
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis." },
        { status: 400 }
      )
    }

    const baseSlug = slugify(title)
    let slug = baseSlug
    let attempt = 1
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt}`
      attempt++
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt?.trim() ?? "",
        content: content.trim(),
        date: date ? new Date(date) : new Date(),
        readingTime: readingTime ?? 5,
        tags: tags ?? [],
        image: image?.trim() || null,
        published: published ?? false,
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
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
    console.error("[api/admin/blogs POST]", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'article." }, { status: 500 })
  }
}
