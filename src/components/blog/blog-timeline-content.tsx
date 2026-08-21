"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ArrowRight, Clock, FileText } from "lucide-react"
import type { BlogPostListItem } from "@/types"
import { cn } from "@/lib/utils"

interface BlogTimelineContentProps {
  post: BlogPostListItem
}

export function BlogTimelineContent({ post }: BlogTimelineContentProps) {
  const t = useTranslations("blog")
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(post.image) && !imageFailed

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "block rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all",
          "hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {showImage ? (
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-48">
              <Image
                src={post.image!}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 12rem"
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : (
            <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:h-32 sm:w-48">
              <FileText className="size-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground group-hover:underline">
              {post.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {post.readingTime} {t("minRead")}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-0.5 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t("readMore")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
