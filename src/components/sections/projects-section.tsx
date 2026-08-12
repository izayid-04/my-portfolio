"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  ExternalLink,
  Building2,
  User,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Filter,
} from "lucide-react"
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
    date: "Avril 2026",
    slug: "tmco",
    tags: ["Django", "Next.js", "Transport", "Mayotte", "3CO"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.Django, name: "Django" },
      { url: projectStackIcons["Next.js"], name: "Next.js" },
    ],
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
    date: "Juin 2026",
    slug: "yeeyo",
    tags: ["Next.js", "Nest.js", "Docker", "CI/CD", "SaaS", "ERP / CRM"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    techIcons: [
      { url: projectStackIcons["Next.js"], name: "Next.js" },
      { url: projectStackIcons["Nest.js"], name: "Nest.js" },
      { url: projectStackIcons.Docker, name: "Docker" },
      { url: projectStackIcons["CI/CD"], name: "CI/CD" },
    ],
    href: "https://www.yeeyo.org/",
    embedSite: false,
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
    date: "Juillet 2026",
    slug: "bonjourcitoyen",
    tags: ["Django", "Next.js", "EdTech", "Examen Civique", "France"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    techIcons: [
      { url: projectStackIcons.Django, name: "Django" },
      { url: projectStackIcons["Next.js"], name: "Next.js" },
    ],
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
    date: "Août 2026",
    slug: "photonum",
    tags: ["Next.js", "Flutter", "App Mobile", "e-Photo", "ANTS"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    techIcons: [
      { url: projectStackIcons["Next.js"], name: "Next.js" },
      { url: projectStackIcons.Flutter, name: "Flutter" },
    ],
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
    date: "Décembre 2025",
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
    date: "Début 2026",
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
    date: "2025",
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

  // Filtres State
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL")
  const [selectedTag, setSelectedTag] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Calcul des options de filtres
  const companyOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo?: string | null; count: number }>()
    let personalCount = 0

    items.forEach((p) => {
      if (p.company) {
        const existing = map.get(p.company.id)
        if (existing) {
          existing.count++
        } else {
          map.set(p.company.id, {
            id: p.company.id,
            name: p.company.name,
            logo: p.company.logo,
            count: 1,
          })
        }
      } else {
        personalCount++
      }
    })

    return {
      list: Array.from(map.values()),
      personalCount,
    }
  }, [items])

  const tagOptions = useMemo(() => {
    const tagMap = new Map<string, number>()
    items.forEach((p) => {
      p.tags?.forEach((t) => {
        tagMap.set(t, (tagMap.get(t) || 0) + 1)
      })
    })
    return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }))
  }, [items])

  const filteredProjects = useMemo(() => {
    return items.filter((p) => {
      if (selectedCompany !== "ALL") {
        if (selectedCompany === "PERSONAL") {
          if (p.company) return false
        } else {
          if (!p.company || p.company.id !== selectedCompany) return false
        }
      }

      if (selectedTag !== "ALL") {
        if (!p.tags || !p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = p.title.toLowerCase().includes(q)
        const matchDesc = p.description.toLowerCase().includes(q)
        const matchCompany = p.company?.name.toLowerCase().includes(q)
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q))
        if (!matchTitle && !matchDesc && !matchCompany && !matchTags) return false
      }

      return true
    })
  }, [items, selectedCompany, selectedTag, searchQuery])

  const activeFiltersCount =
    (selectedCompany !== "ALL" ? 1 : 0) +
    (selectedTag !== "ALL" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

  const resetFilters = () => {
    setSelectedCompany("ALL")
    setSelectedTag("ALL")
    setSearchQuery("")
  }

  const selectedSlug = selectedProject ? getProjectBlogSlug(selectedProject) : null
  const selectedPost = selectedSlug ? getPostBySlug(selectedSlug) : undefined

  return (
    <SectionWrapper
      id={siteConfig.sections.projects}
      className={cn("bg-muted/30", className)}
    >
      <div className="mb-6 sm:mb-8 max-w-2xl">
        <h2
          id={`${siteConfig.sections.projects}-heading`}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* ================= BARRE DE FILTRES (DESKTOP & TABLETTE >= md) ================= */}
      <div className="hidden md:flex flex-col gap-3 mb-8 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, techno ou entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/80 pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Plus de filtres */}
            <button
              type="button"
              onClick={() => setIsFiltersModalOpen(true)}
              className={cn(
                "cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedTag !== "ALL"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              Plus de filtres
              {selectedTag !== "ALL" && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  1
                </span>
              )}
            </button>

            {/* Reset button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="size-3.5 text-primary" />
                Réinitialiser ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Filtre Structure / Entreprise */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Building2 className="size-3.5 text-primary" /> Structure :
          </span>
          <button
            type="button"
            onClick={() => setSelectedCompany("ALL")}
            className={cn(
              "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1.5 border",
              selectedCompany === "ALL"
                ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                : "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Tous ({items.length})
          </button>

          {companyOptions.list.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedCompany(comp.id)}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1.5 border",
                selectedCompany === comp.id
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold shadow-xs"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {comp.logo ? (
                <Image src={comp.logo} alt="" width={14} height={14} className="size-3.5 object-contain rounded-xs" unoptimized />
              ) : (
                <Building2 className="size-3.5 text-muted-foreground" />
              )}
              {comp.name} ({comp.count})
            </button>
          ))}

          {companyOptions.personalCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCompany("PERSONAL")}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1.5 border",
                selectedCompany === "PERSONAL"
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold shadow-xs"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <User className="size-3.5 text-muted-foreground" />
              Projets Personnels ({companyOptions.personalCount})
            </button>
          )}
        </div>
      </div>

      {/* ================= BARRE DE FILTRES ACTION BAR (MOBILE < md) ================= */}
      <div className="flex md:hidden items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-card pl-9 pr-7 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFiltersModalOpen(true)}
          className={cn(
            "cursor-pointer flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-95",
            activeFiltersCount > 0
              ? "border-primary bg-primary text-primary-foreground font-bold"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          <SlidersHorizontal className="size-4" />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-background text-[10px] font-bold text-primary">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs text-muted-foreground">
        <span>
          Affichage de <strong className="text-foreground font-semibold">{filteredProjects.length}</strong> projet(s) sur {items.length}
        </span>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="cursor-pointer text-primary hover:underline font-medium flex items-center gap-1"
          >
            <RotateCcw className="size-3" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Grille des projets */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3 my-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Filter className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Aucun projet ne correspond à vos filtres</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Essayez de modifier votre mot-clé de recherche ou de réinitialiser les filtres par structure.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="size-3.5" />
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
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
      )}

      {/* Modal Détail Projet */}
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

      {/* ================= MODAL DE FILTRES MOBILE (PORTAL) ================= */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isFiltersModalOpen && (
              <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFiltersModalOpen(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <SlidersHorizontal className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Filtres des projets</h3>
                        <p className="text-[11px] text-muted-foreground">Sélectionnez la structure ou la technologie</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFiltersModalOpen(false)}
                      className="cursor-pointer text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Section Recherche */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground block">Rechercher</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Mot-clé, techno..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Structure / Entreprise */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Structure / Entreprise</span>
                      <span className="text-[10px] text-muted-foreground italic">Sélection unique</span>
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCompany("ALL")}
                        className={cn(
                          "cursor-pointer w-full rounded-xl p-2.5 text-xs text-left font-medium transition-all flex items-center justify-between border",
                          selectedCompany === "ALL"
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border/60 bg-muted/30 text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="size-4 text-primary" /> Tous les projets
                        </span>
                        <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                          {items.length}
                        </span>
                      </button>

                      {companyOptions.list.map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setSelectedCompany(comp.id)}
                          className={cn(
                            "cursor-pointer w-full rounded-xl p-2.5 text-xs text-left font-medium transition-all flex items-center justify-between border",
                            selectedCompany === comp.id
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border/60 bg-muted/30 text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {comp.logo ? (
                              <Image src={comp.logo} alt="" width={16} height={16} className="size-4 object-contain rounded-xs" unoptimized />
                            ) : (
                              <Building2 className="size-4 text-muted-foreground" />
                            )}
                            {comp.name}
                          </span>
                          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                            {comp.count}
                          </span>
                        </button>
                      ))}

                      {companyOptions.personalCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCompany("PERSONAL")}
                          className={cn(
                            "cursor-pointer w-full rounded-xl p-2.5 text-xs text-left font-medium transition-all flex items-center justify-between border",
                            selectedCompany === "PERSONAL"
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border/60 bg-muted/30 text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" /> Projets Personnels
                          </span>
                          <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold">
                            {companyOptions.personalCount}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Technologies & Tags */}
                  {tagOptions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Technologies & Tags</span>
                        {selectedTag !== "ALL" && (
                          <button
                            type="button"
                            onClick={() => setSelectedTag("ALL")}
                            className="text-[10px] text-primary hover:underline"
                          >
                            Réinitialiser tag
                          </button>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTag("ALL")}
                          className={cn(
                            "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all border",
                            selectedTag === "ALL"
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border/60 bg-muted/40 text-muted-foreground"
                          )}
                        >
                          Tous
                        </button>
                        {tagOptions.map((t) => (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => setSelectedTag(t.name)}
                            className={cn(
                              "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all border flex items-center gap-1",
                              selectedTag === t.name
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border/60 bg-muted/40 text-muted-foreground"
                            )}
                          >
                            <span>{t.name}</span>
                            <span className="text-[9px] opacity-70">({t.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Modal Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="cursor-pointer flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors text-center"
                      >
                        Réinitialiser
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsFiltersModalOpen(false)}
                      className="cursor-pointer flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity text-center"
                    >
                      Afficher ({filteredProjects.length})
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </SectionWrapper>
  )
}
