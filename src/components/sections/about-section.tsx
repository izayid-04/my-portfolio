"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { SectionWrapper } from "@/components/layout"
import { techCategories } from "@/data/tech-icons"
import { InteractiveTerminal } from "@/components/ui/interactive-terminal"

interface AboutSectionProps {
  className?: string
  children?: React.ReactNode
}

export function AboutSection({ className, children }: AboutSectionProps) {
  const t = useTranslations("about")
  const paragraphs = t.raw("paragraphs") as string[]

  return (
    <SectionWrapper
      id={siteConfig.sections.about}
      className={cn("bg-muted/30", className)}
    >
      {/* Haut : Terminal CLI large (à gauche lg:col-span-7) + Texte À propos (à droite lg:col-span-5) */}
      <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-10 lg:items-center min-w-0">
        
        {/* Terminal CLI très large */}
        <motion.div
          className="lg:col-span-7 w-full min-w-0 order-2 sm:order-2 lg:order-1"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <InteractiveTerminal />
        </motion.div>

        {/* Texte À propos */}
        <motion.div
          className="lg:col-span-5 min-w-0 order-1 sm:order-1 lg:order-2"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id={`${siteConfig.sections.about}-heading`}
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-foreground">
            {t("eyebrow")}
          </p>
          <div className="mt-6 space-y-5">
            {paragraphs.map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-base leading-relaxed text-muted-foreground md:text-lg"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bas : grille complète de technos par catégorie */}
      <motion.div
        className="mt-10 sm:mt-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="mb-6 sm:mb-8 text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
          {t("stackTitle")}
        </h3>
        <div className="grid gap-4 sm:gap-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0">
          {techCategories.map((cat) => (
            <div key={cat.key} className="min-w-0">
              <p className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`techCategories.${cat.key}`)}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cat.items.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border bg-card px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs text-foreground shadow-sm shrink-0"
                  >
                    {tech.name === "GitHub" ? (
                      <Github className="size-4 shrink-0 text-foreground" aria-hidden />
                    ) : (
                      <Image
                        src={tech.icon}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0"
                        unoptimized
                      />
                    )}
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {children}
    </SectionWrapper>
  )
}
