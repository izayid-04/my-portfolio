import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import { getPostBySlugFromDB, getAllSlugsFromDB } from "@/lib/blog"
import { BlogPostContent } from "@/components/blog/blog-post-content"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllSlugsFromDB()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)
  if (!post) return { title: "Article | Blog" }
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)
  if (!post) notFound()

  const dateFormatted = new Date(post.date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen pb-24">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour au blog
        </Link>
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {dateFormatted}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readingTime} min de lecture
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
        <BlogPostContent content={post.content} coverImage={post.image} />
      </article>
    </div>
  )
}
