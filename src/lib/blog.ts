import { blogPosts as staticBlogPosts } from "@/data/blog"
import type { BlogPost } from "@/types/blog"
import { prisma } from "@/lib/prisma"

/**
 * Récupère tous les articles publiés (DB + fallback statique)
 */
export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    })

    const mapped: BlogPost[] = dbPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      date: p.date.toISOString(),
      readingTime: p.readingTime,
      tags: p.tags,
      image: p.image ?? undefined,
    }))

    // Merge avec les articles statiques (les articles DB ont la priorité)
    const dbSlugs = new Set(mapped.map((p) => p.slug))
    const staticFallback = staticBlogPosts.filter((p) => !dbSlugs.has(p.slug))

    return [...mapped, ...staticFallback].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch {
    return [...staticBlogPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }
}

/**
 * Récupère un article par slug (DB + fallback statique)
 */
export async function getPostBySlugFromDB(slug: string): Promise<BlogPost | null> {
  try {
    const dbPost = await prisma.blogPost.findFirst({
      where: { slug, published: true },
    })

    if (dbPost) {
      return {
        slug: dbPost.slug,
        title: dbPost.title,
        excerpt: dbPost.excerpt,
        content: dbPost.content,
        date: dbPost.date.toISOString(),
        readingTime: dbPost.readingTime,
        tags: dbPost.tags,
        image: dbPost.image ?? undefined,
      }
    }

    // Fallback aux articles statiques
    return staticBlogPosts.find((p) => p.slug === slug) ?? null
  } catch {
    return staticBlogPosts.find((p) => p.slug === slug) ?? null
  }
}

/**
 * Récupère tous les slugs (DB + statiques) pour generateStaticParams
 */
export async function getAllSlugsFromDB(): Promise<string[]> {
  try {
    const dbSlugs = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    })
    const staticSlugs = staticBlogPosts.map((p) => p.slug)
    const all = new Set([...dbSlugs.map((p) => p.slug), ...staticSlugs])
    return Array.from(all)
  } catch {
    return staticBlogPosts.map((p) => p.slug)
  }
}
