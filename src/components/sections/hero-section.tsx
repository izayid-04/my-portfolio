"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { motion } from "motion/react"
import { BadgeCheck, FileText, Github, Linkedin, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { SectionWrapper } from "@/components/layout"
import { socialLinks } from "@/config/site"
import { techCategories } from "@/data/tech-icons"

const ringConfigs = [
  { size: 1180, rotate: "hero-spin-slow", iconSize: 40, iconCount: 9, radiusRatio: 0.48 },
  { size: 900, rotate: "hero-spin-reverse", iconSize: 38, iconCount: 7, radiusRatio: 0.47 },
  { size: 660, rotate: "hero-spin-slow", iconSize: 34, iconCount: 5, radiusRatio: 0.46 },
]

const githubHeroIcon = "github-local-icon"

const techByName = new Map(
  techCategories.flatMap((category) => category.items.map((item) => [item.name, item.icon] as const))
)

const ringIconOffsets = ringConfigs.reduce<number[]>((offsets, ring, index) => {
  offsets.push(index === 0 ? 0 : offsets[index - 1] + ringConfigs[index - 1].iconCount)
  return offsets
}, [])

const heroIconUrls = [
  techByName.get("Next.js"),
  techByName.get("Angular"),
  techByName.get("React"),
  techByName.get("TypeScript"),
  techByName.get("Node.js"),
  techByName.get("Nest.js"),
  techByName.get("Laravel"),
  techByName.get("Spring Boot"),
  techByName.get("Docker"),
  techByName.get("Linux"),
  techByName.get("AWS"),
  techByName.get("Git"),
  techByName.get("GitLab"),
  githubHeroIcon,
].filter((value): value is string => Boolean(value))

export function HeroSection({ className }: { className?: string }) {
  const t = useTranslations("hero")
  const github = socialLinks.find((item) => item.label === "GitHub")?.href ?? "https://github.com/izayid-04"
  const linkedin =
    socialLinks.find((item) => item.label === "LinkedIn")?.href ?? "https://www.linkedin.com/in/ali-izayid/"
  const icons = heroIconUrls

  return (
    <SectionWrapper
      id={siteConfig.sections.hero}
      className={cn(
        "relative overflow-hidden flex min-h-[92vh] flex-col justify-center border-b border-border/40",
        className
      )}
      containerClassName="flex flex-col items-center text-center"
    >
      <style>{`
        @keyframes hero-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hero-spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes hero-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -14px, 0) scale(1.04); }
        }
        .hero-spin-slow { animation: hero-spin-slow 80s linear infinite; }
        .hero-spin-reverse { animation: hero-spin-reverse 90s linear infinite; }
        .hero-float {
          animation: hero-float 7s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        {ringConfigs.map((ring, ringIndex) => (
          <div
            key={`ring-${ring.size}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.3] sm:scale-100"
            style={{ width: ring.size, height: ring.size }}
          >
            <div className={cn("absolute inset-0", ring.rotate)}>
              {new Array(ring.iconCount).fill(0).map((_, iconIndex) => {
                const icon =
                  ringIndex === 2 && iconIndex === 0
                    ? githubHeroIcon
                    : icons[(ringIconOffsets[ringIndex] + iconIndex) % icons.length]
                const angleOffset = (ringIndex * Math.PI) / (ring.iconCount * 2)
                const angle = (iconIndex / ring.iconCount) * Math.PI * 2 + angleOffset
                const radius = ring.size * ring.radiusRatio
                const x = (Math.cos(angle) * radius).toFixed(2)
                const y = (Math.sin(angle) * radius).toFixed(2)
                const isGithubIcon = icon === githubHeroIcon

                return (
                  <div
                    key={`icon-${ringIndex}-${iconIndex}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    {isGithubIcon ? (
                      <Github
                        style={{ width: ring.iconSize + 4, height: ring.iconSize + 4 }}
                        className="text-foreground drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
                        strokeWidth={2.25}
                      />
                    ) : (
                      <Image
                        src={icon}
                        alt=""
                        width={ring.iconSize}
                        height={ring.iconSize}
                        className="object-contain opacity-95 drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                        unoptimized
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl hero-float" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl hero-float" />
        <div className="absolute -right-10 top-[52%] h-72 w-72 rounded-full bg-teal-400/15 blur-3xl hero-float" />
        <div className="absolute left-1/2 top-[62%] h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl hero-float" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-md"
      >
        <BadgeCheck className="size-4 text-primary" />
        {t("badge")}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="relative z-10 mb-6 rounded-full border border-border/70 bg-card/70 p-2 shadow-xl backdrop-blur-md"
      >
        <Image
          src="/logo.png"
          alt="Izayid Ali"
          width={128}
          height={128}
          className="size-24 rounded-full object-contain sm:size-28"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="relative z-10 max-w-4xl"
      >
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("name")}
        </p>
        <h1 className="text-balance text-3xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base md:text-lg">
          {t("subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.24 }}
        className="relative z-10 mt-8 flex flex-wrap justify-center gap-3"
      >
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:scale-[1.03] hover:border-primary/60"
        >
          <Github className="size-4" />
          {t("github")}
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:scale-[1.03] hover:border-primary/60"
        >
          <Linkedin className="size-4" />
          {t("linkedin")}
        </a>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:scale-[1.03] hover:bg-primary/15"
        >
          <Mail className="size-4" />
          {t("contact")}
        </Link>
        <Link
          href="/cv"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:scale-[1.03] hover:border-primary/60"
        >
          <FileText className="size-4" />
          {t("cv")}
        </Link>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--background))_10%,transparent_38%,transparent_72%,hsl(var(--background))_100%)]" />

      <div className="relative z-10 mt-8 text-xs uppercase tracking-[0.18em] text-primary/80">
        {t("portfolioLabel")}
      </div>
    </SectionWrapper>
  )
}
