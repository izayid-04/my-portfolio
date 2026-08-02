import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/blogs — liste des articles publiés (public)
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        date: true,
        readingTime: true,
        tags: true,
        image: true,
      },
    })

    return NextResponse.json({
      posts: posts.map((p: any) => ({
        ...p,
        date: p.date.toISOString(),
      })),
    })
  } catch (error) {
    console.error("[api/blogs GET]", error)
    return NextResponse.json({ posts: [] })
  }
}
