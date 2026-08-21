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
        titleEn: p.titleEn,
        excerpt: p.excerpt,
        excerptEn: p.excerptEn,
        content: p.content,
        contentEn: p.contentEn,
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
        titleEn: titleEn?.trim() || null,
        excerpt: excerpt?.trim() ?? "",
        excerptEn: excerptEn?.trim() || null,
        content: content.trim(),
        contentEn: contentEn?.trim() || null,
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
    console.error("[api/admin/blogs POST]", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'article." }, { status: 500 })
  }
}
