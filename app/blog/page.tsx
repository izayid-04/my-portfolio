import { getAllPublishedPosts } from "@/lib/blog"
import { Timeline } from "@/components/ui/timeline"
import { BlogTimelineContent } from "@/components/blog/blog-timeline-content"

export const metadata = {
  title: "Blog | Mon portfolio",
  description:
    "Articles et réflexions sur le développement web, l'accessibilité et les bonnes pratiques.",
}

function formatTimelineDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  })
}

export default async function BlogPage() {
  const posts = await getAllPublishedPosts()

  const timelineData = posts.map((post) => ({
    id: post.slug,
    title: formatTimelineDate(post.date),
    content: <BlogTimelineContent key={post.slug} post={post} />,
  }))

  return (
    <div className="min-h-screen pb-24">
      <div className="relative w-full overflow-hidden">
        <Timeline
          data={timelineData}
          title="Blog"
          subtitle="Réalisations et projets : assistant IA, sites et plateformes."
        />
      </div>
    </div>
  )
}
