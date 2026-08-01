import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blogs/[slug] — un article publié par slug (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Article non trouvé." }, { status: 404 })
    }

    return NextResponse.json({
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
      },
    })
  } catch (error) {
    console.error("[api/blogs/[slug] GET]", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
