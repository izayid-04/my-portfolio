import { getTranslations, getLocale } from "next-intl/server"
import { getAllPublishedPosts } from "@/lib/blog"
import { Timeline } from "@/components/ui/timeline"
import { BlogTimelineContent } from "@/components/blog/blog-timeline-content"

export async function generateMetadata() {
  const t = await getTranslations("blog")
  return {
    title: `${t("title")} | Izayid Ali`,
    description: t("subtitle"),
  }
}

function formatTimelineDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
  })
}

export default async function BlogPage() {
  const t = await getTranslations("blog")
  const locale = await getLocale()
  const posts = await getAllPublishedPosts(locale)

  const timelineData = posts.map((post) => ({
    id: post.slug,
    title: formatTimelineDate(post.date, locale),
    content: <BlogTimelineContent key={post.slug} post={post} />,
  }))

  return (
    <div className="min-h-screen pb-24">
      <div className="relative w-full overflow-hidden">
        <Timeline
          data={timelineData}
          title={t("title")}
          subtitle={t("subtitle")}
        />
      </div>
    </div>
  )
}
