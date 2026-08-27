import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const siteUrl = "https://izayid.dev"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/blog", "/cv", "/contact"]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) => [
    {
      url: `${siteUrl}${path}`,
      alternates: { languages: { fr: `${siteUrl}${path}`, en: `${siteUrl}/en${path}` } },
    },
    {
      url: `${siteUrl}/en${path}`,
      alternates: { languages: { fr: `${siteUrl}${path}`, en: `${siteUrl}/en${path}` } },
    },
  ])

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })
    blogEntries = posts.flatMap((post) => [
      { url: `${siteUrl}/blog/${post.slug}`, lastModified: post.updatedAt },
      { url: `${siteUrl}/en/blog/${post.slug}`, lastModified: post.updatedAt },
    ])
  } catch {
    // Base injoignable au moment du build : le sitemap reste valide sans les articles.
  }

  return [...staticEntries, ...blogEntries]
}
