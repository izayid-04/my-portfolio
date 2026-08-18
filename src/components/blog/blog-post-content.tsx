"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface BlogPostContentProps {
  content: string
  coverImage?: string
}

export function BlogPostContent({ content, coverImage }: BlogPostContentProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const sections = content.split(/(?=^## )/m).filter(Boolean)
  const showImage = Boolean(coverImage) && !imageFailed

  return (
    <div className="space-y-10">
      {showImage ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={coverImage!}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : coverImage ? (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      ) : null}

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg">
        {sections.map((section, i) => {
          const lines = section.trim().split("\n")
          const first = lines[0]
          const isHeading = first?.startsWith("## ")
          const title = isHeading ? first.replace(/^## /, "").trim() : null
          const body = (isHeading ? lines.slice(1).join("\n") : section).trim()

          return (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35 }}
              className="mt-10 first:mt-0"
            >
              {title && (
                <h2 className="text-xl font-semibold text-foreground md:text-2xl">
                  {title}
                </h2>
              )}
              <div className="mt-4 text-muted-foreground">
                <MarkdownBody text={body} />
              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}

function MarkdownBody({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let remaining = text
  const codeBlockRe = /```[\w]*\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRe.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim()
    if (before) parts.push(<Paragraphs key={parts.length} text={before} />)
    parts.push(
      <pre
        key={parts.length}
        className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm"
      >
        <code>{match[1].trimEnd()}</code>
      </pre>
    )
    lastIndex = match.index + match[0].length
  }
  const after = text.slice(lastIndex).trim()
  if (after) parts.push(<Paragraphs key={parts.length} text={after} />)

  if (parts.length === 0) parts.push(<Paragraphs text={text} />)
  return <>{parts}</>
}

function Paragraphs({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/)
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((l) => l.startsWith("- "))
          return (
            <ul key={i} className="mb-4 ml-4 list-disc space-y-1">
              {items.map((line, j) => (
                <li key={j}>{line.replace(/^- /, "").trim()}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {trimmed}
          </p>
        )
      })}
    </>
  )
}
