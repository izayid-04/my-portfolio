"use client"

import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { ExternalLink, Github, X, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { BlogPostContent } from "@/components/blog/blog-post-content"
import type { BlogPost } from "@/types"

export interface ProjectDetailModalProps {
  open: boolean
  onClose: () => void
  project: {
    title: string
    description: string
    date?: string
    tags?: string[]
    image?: string
    href?: string
    githubUrl?: string | null
    company?: {
      id: string
      name: string
      logo?: string | null
      website?: string | null
    } | null
  }
  post?: BlogPost
}

export function ProjectDetailModal({
  open,
  onClose,
  project,
  post,
}: ProjectDetailModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-muted/30 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="project-detail-title"
                    className="text-xl font-semibold text-foreground"
                  >
                    {project.title}
                  </h2>
                  {project.company ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {project.company.logo ? (
                        <Image src={project.company.logo} alt="" width={14} height={14} className="size-3.5 object-contain rounded-xs" unoptimized />
                      ) : (
                        <Building2 className="size-3.5" />
                      )}
                      {project.company.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <User className="size-3" />
                      Projet Personnel
                    </span>
                  )}
                </div>
                {project.date && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.date}
                  </p>
                )}
                {project.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "max-sm:mt-8 rounded-lg border border-border bg-background/60 p-2 text-muted-foreground",
                  "hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                )}
                aria-label="Fermer"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              {project.image && (
                <div className="mb-5 overflow-hidden rounded-xl border border-border bg-muted">
                  <div className="relative aspect-[16/7]">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {project.description}
              </p>

              {post?.content ? (
                <BlogPostContent content={post.content} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Aucun contenu détaillé disponible pour ce projet pour le moment.
                </div>
              )}

              {(project.href || project.githubUrl) ? (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium",
                        "text-foreground hover:bg-muted cursor-pointer transition-colors"
                      )}
                    >
                      Voir le site
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium",
                        "text-foreground hover:border-primary/60 hover:bg-muted cursor-pointer transition-colors shadow-xs"
                      )}
                    >
                      <Github className="size-4" aria-hidden />
                      <span>Code Source GitHub</span>
                      <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

