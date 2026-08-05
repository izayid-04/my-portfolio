"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ExternalLink, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { SectionWrapper } from "@/components/layout"
import { projectStackIcons } from "@/data/tech-icons"
import { getPostBySlug } from "@/data/blog"
import { ProjectDetailModal } from "./project-detail-modal"

export interface ProjectTechIcon {
  url: string
  name: string
}

export interface ProjectCompany {
  id: string
  name: string
  logo?: string | null
  website?: string | null
}

export interface Project {
  title: string
  description: string
  /** Mois et année uniquement, ex. "Juillet 2025" */
  date?: string
  /** Slug du post détaillé dans `src/data/blog.ts` (quand disponible) */
  slug?: string
  tags?: string[]
  /** Image de couverture ou poster si vidéo */
  image?: string
  /** URL d'une vidéo (MP4) : lecture auto muette dans la carte */
  video?: string
  techIcons?: ProjectTechIcon[]
  /** Lien vers le site ou la démo du projet */
  href?: string
  /** Afficher le site en direct dans un cadre (iframe) sur mobile et desktop */
  embedSite?: boolean
  /** Entreprise / Structure reliée */
  company?: ProjectCompany | null
}

function getProjectBlogSlug(project: Project): string | null {
  if (project.slug) return project.slug
  const href = project.href ?? ""

  if (href.includes("udb.sn")) return "udb"
  if (href.includes("biacode.tech")) return "biacode"
  if (href.includes("easytecs.tech") || href.includes("easytecs")) return "easytecs"
  if (href.includes("noraia.onrender.com")) return "nora"

  return null
}

const defaultProjects: Project[] = [
  {
    title: "TMCO – Transport Mobilité Centre-Ouest",
    description:
      "Plateforme web officielle du réseau de transport public collectif de la Communauté de Communes du Centre-Ouest (3CO) à Mayotte, couvrant 5 communes et plus de 50 000 habitants.",
    date: "Octobre 2025",
    slug: "tmco",
    tags: ["Transport", "Mayotte", "Frontend", "DevOps", "3CO"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    href: "https://tmco.yt/",
    embedSite: true,
    company: {
      id: "company-uwezo",
      name: "Agence UWEZO",
      logo: null,
      website: "https://uwezo.yt/",
    },
  },
  {
    title: "YEE YÔ – SaaS de Gestion Commerciale",
    description:
      "Solution SaaS complète de gestion commerciale et d'ERP/CRM conçue pour optimiser le suivi des ventes, la facturation, la gestion des stocks et la caisse enregistreuse pour les entreprises.",
    date: "Décembre 2025",
    slug: "yeeyo",
    tags: ["SaaS", "ERP / CRM", "Full-Stack", "DevOps", "Facturation"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    href: "https://www.yeeyo.org/",
    embedSite: true,
    company: {
      id: "company-biacode",
      name: "BIACode",
      logo: "https://www.biacode.tech/favicon.ico",
      website: "https://www.biacode.tech/",
    },
  },
  {
    title: "BonjourCitoyen – Préparation à l'Examen Civique",
    description:
      "Plateforme EdTech complète permettant aux usagers de se préparer aux examens civiques officiels en France (titre de séjour pluriannuel, carte de résident de 10 ans et naturalisation française).",
    date: "Novembre 2025",
    slug: "bonjourcitoyen",
    tags: ["EdTech", "Examen Civique", "Frontend", "DevOps", "France"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    href: "https://bonjourcitoyen.fr/",
    embedSite: true,
    company: {
      id: "company-uwezo",
      name: "Agence UWEZO",
      logo: null,
      website: "https://uwezo.yt/",
    },
  },
  {
    title: "PhotoNum – Photo d'Identité Numérique e-Photo (ANTS)",
    description:
      "Service web et plateforme liée aux applications mobiles permettant d'obtenir en quelques minutes des photos d'identité numériques avec signature électronique agréées ANTS et Préfecture.",
    date: "Février 2026",
    slug: "photonum",
    tags: ["e-Photo", "ANTS", "Full-Stack", "DevOps", "Préfecture"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    href: "https://photonum.xyz/",
    embedSite: true,
    company: {
      id: "company-uwezo",
      name: "Agence UWEZO",
      logo: null,
      website: "https://uwezo.yt/",
    },
  },
  {
    title: "Université Dakar-Bourguiba (UDB)",
    description:
      "Projet réalisé lors d'un stage de 4 mois avec une équipe de 4 étudiants : site et applications pour l'université. Back-end Laravel, front-end Angular, base MySQL, hébergement OVH.",
    date: "Juillet 2025",
    slug: "udb",
    tags: ["Laravel", "Angular", "MySQL", "OVH"],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.Laravel, name: "Laravel" },
      { url: projectStackIcons.Angular, name: "Angular" },
      { url: projectStackIcons.MySQL, name: "MySQL" },
      { url: projectStackIcons.Git, name: "Git" },
      { url: projectStackIcons.GitHub, name: "GitHub" },
      { url: projectStackIcons.OVH, name: "OVH" },
    ],
    href: "https://udb.sn/",
    embedSite: true,
    company: {
      id: "company-udb",
      name: "Université Dakar-Bourguiba",
      logo: "https://oteutsntabtnhwhsnjzz.supabase.co/storage/v1/object/public/portfolio-assets/institutions/udb-dakar-logo.png",
      website: "https://www.udb.sn/",
    },
  },
  {
    title: "BIACode",
    description:
      "Notre plateforme et agence tech, lancée à trois. BIACode est notre structure dédiée au développement et à l'accompagnement des projets numériques.",
    date: "Septembre 2025",
    slug: "biacode",
    tags: ["Agence", "Plateforme"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.Laravel, name: "Laravel" },
      { url: projectStackIcons.Angular, name: "Angular" },
      { url: projectStackIcons.MySQL, name: "MySQL" },
      { url: projectStackIcons.Git, name: "Git" },
      { url: projectStackIcons.GitHub, name: "GitHub" },
      { url: projectStackIcons.LWS, name: "LWS" },
    ],
    href: "https://www.biacode.tech/",
    embedSite: true,
    company: {
      id: "company-biacode",
      name: "BIACode",
      logo: "https://www.biacode.tech/favicon.ico",
      website: "https://www.biacode.tech/",
    },
  },
  {
    title: "EASYTECS — EasyGEC",
    description:
      "Premier client de l'agence : plateforme pour EASYTECS, structure sénégalaise spécialisée dans les logiciels métiers. EasyGEC est un système d'enregistrement sécurisé et simple pour gérer les faits d'état civil (naissance au décès), garantissant les droits fondamentaux : carte d'identité, droit de vote, héritage, accès à l'école, permis de conduire, etc.",
    date: "Mars 2026",
    slug: "easytecs",
    tags: ["État civil", "e-Gouvernance", "Sénégal"],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.Laravel, name: "Laravel" },
      { url: projectStackIcons.Angular, name: "Angular" },
      { url: projectStackIcons.MySQL, name: "MySQL" },
      { url: projectStackIcons.Git, name: "Git" },
      { url: projectStackIcons.GitHub, name: "GitHub" },
      { url: projectStackIcons.LWS, name: "LWS" },
    ],
    href: "https://www.easytecs.tech/",
    embedSite: true,
    company: {
      id: "company-easytecs",
      name: "EASYTECS",
      logo: "https://www.easytecs.tech/favicon.ico",
      website: "https://www.easytecs.tech/",
    },
  },
  {
    title: "Nora — Assistant IA",
    description:
      "Assistant IA conversationnel : interface web minimaliste pour poser des questions et recevoir des réponses naturelles. Front HTML/CSS/JavaScript, backend Python Flask, déployé sur Render.",
    date: "Janvier 2024",
    slug: "nora",
    tags: ["IA", "Chatbot", "Flask"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.HTML, name: "HTML" },
      { url: projectStackIcons.CSS, name: "CSS" },
      { url: projectStackIcons.JavaScript, name: "JavaScript" },
      { url: projectStackIcons.Python, name: "Python" },
      { url: projectStackIcons.Flask, name: "Flask" },
      { url: projectStackIcons.Git, name: "Git" },
      { url: projectStackIcons.GitHub, name: "GitHub" },
    ],
    href: "https://noraia.onrender.com/",
    embedSite: true,
    company: null,
  },
]

function TechIcon({ url, name }: ProjectTechIcon) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted p-1.5"
      title={name}
    >
      <Image
        src={url}
        alt=""
        width={20}
        height={20}
        className="object-contain opacity-90"
        unoptimized
      />
    </span>
  )
}

const DESKTOP_VIEWPORT_WIDTH = 1280
const DESKTOP_VIEWPORT_HEIGHT = 960

/** Cadre type navigateur avec iframe : site en direct en vue desktop (1280px) puis mis à l'échelle. */
function BrowserPreview({ url, title }: { url: string; title: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  /** Évite les divergences SSR / premier rendu client (iframe + resize) */
  const [iframeReady, setIframeReady] = useState(false)

  useEffect(() => {
    setIframeReady(true)
  }, [])

  useEffect(() => {
    if (!iframeReady) return
    const el = wrapperRef.current
    if (!el) return
    const updateScale = () => {
      const w = el.offsetWidth
      setScale(w > 0 ? w / DESKTOP_VIEWPORT_WIDTH : 1)
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [iframeReady])

  return (
    <div className="flex flex-col overflow-hidden rounded-t-xl bg-card p-1.5 sm:p-2 border-b border-border">
      {/* Vue desktop : iframe 1280×960 → le site affiche sa version desktop, puis on scale pour remplir le cadre */}
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-lg border border-border/60 bg-muted"
        style={{ aspectRatio: "4/3" }}
      >
        {!iframeReady ? (
          <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
        ) : (
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: DESKTOP_VIEWPORT_WIDTH,
              height: DESKTOP_VIEWPORT_HEIGHT,
              transform: `scale(${scale})`,
            }}
          >
            <iframe
              src={url}
              title={`Aperçu : ${title}`}
              width={DESKTOP_VIEWPORT_WIDTH}
              height={DESKTOP_VIEWPORT_HEIGHT}
              className="border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface ProjectsSectionProps {
  className?: string
  title?: string
  subtitle?: string
  projects?: Project[]
}

export function ProjectsSection({
  className,
  title = "Projets",
  subtitle = "Réalisations récentes et side projects",
  projects: initialProjects = defaultProjects,
}: ProjectsSectionProps) {
  const [items, setItems] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.projects) && data.projects.length > 0) {
            const mapped: Project[] = data.projects.map((p: any) => {
              const techIcons: ProjectTechIcon[] = (p.tags || [])
                .map((tag: string) => {
                  const matchedEntry = Object.entries(projectStackIcons).find(
                    ([key]) => key.toLowerCase() === tag.toLowerCase()
                  )
                  return matchedEntry ? { name: tag, url: matchedEntry[1] } : null
                })
                .filter(Boolean) as ProjectTechIcon[]

              return {
                title: p.title,
                description: p.description,
                date: p.date || undefined,
                slug: p.slug || undefined,
                tags: p.tags || [],
                image: p.image || undefined,
                video: p.video || undefined,
                href: p.href || undefined,
                embedSite: Boolean(p.embedSite),
                techIcons: techIcons.length > 0 ? techIcons : undefined,
                company: p.company || null,
              }
            })
            setItems(mapped)
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des projets:", err)
      }
    }
    loadProjects()
  }, [])

  const selectedSlug = selectedProject ? getProjectBlogSlug(selectedProject) : null
  const selectedPost = selectedSlug ? getPostBySlug(selectedSlug) : undefined

  return (
    <SectionWrapper
      id={siteConfig.sections.projects}
      className={cn("bg-muted/30", className)}
    >
      <div className="mb-8 sm:mb-12 max-w-2xl">
        <h2
          id={`${siteConfig.sections.projects}-heading`}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent sm:text-base">{subtitle}</p>
      </div>
      {/* Grille : 1 col mobile pour cadres plus larges, 2–3 cols desktop */}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((project) => (
          <motion.li
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="group flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden text-card-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
              {(project.video || (project.embedSite && project.href) || project.image) && (
                <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 overflow-hidden rounded-t-xl">
                  {project.video ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <video
                        src={project.video}
                        poster={project.image}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        aria-label={`Aperçu vidéo de ${project.title}`}
                      />
                    </div>
                  ) : project.embedSite && project.href ? (
                    <BrowserPreview url={project.href} title={project.title} />
                  ) : project.image ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  {project.date ? (
                    <p className="text-xs font-medium text-muted-foreground">{project.date}</p>
                  ) : <span />}
                  {project.company ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {project.company.logo ? (
                        <Image src={project.company.logo} alt="" width={12} height={12} className="size-3 object-contain rounded-xs" unoptimized />
                      ) : (
                        <Building2 className="size-3" />
                      )}
                      {project.company.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <User className="size-3" />
                      Personnel
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                {project.techIcons && project.techIcons.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.techIcons.map((icon) => (
                      <TechIcon key={icon.name} url={icon.url} name={icon.name} />
                    ))}
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    {project.href && (
                      <Link
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        Voir le site
                        <ExternalLink className="size-4 shrink-0" aria-hidden />
                      </Link>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground",
                        "hover:bg-muted transition-colors cursor-pointer",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      Voir le détail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      <ProjectDetailModal
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={
          selectedProject
            ? {
              title: selectedProject.title,
              description: selectedProject.description,
              date: selectedProject.date,
              tags: selectedProject.tags,
              image: selectedProject.image,
              href: selectedProject.href,
              company: selectedProject.company,
            }
            : { title: "", description: "" }
        }
        post={selectedPost}
      />
    </SectionWrapper>
  )
}
