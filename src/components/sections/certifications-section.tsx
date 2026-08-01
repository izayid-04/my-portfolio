"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Award, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { SectionWrapper } from "@/components/layout"
import { LinkPreview } from "@/components/ui/link-preview"

export interface Certification {
  name: string
  issuer: string
  date?: string
  url?: string
  /** Logo du centre / établissement (petit) */
  logo?: string
  /** Texte affiché en bas quand le certificat est sélectionné */
  description?: string
  /** Image du certificat (ex. attestation de stage) */
  image?: string
  /** Optionnel : plusieurs images (ex. couverture + page 2, etc.) */
  images?: string[]
}

interface CertificationsSectionProps {
  className?: string
  title?: string
  subtitle?: string
  certifications?: Certification[]
}

function CertDetail({ cert }: { cert: Certification }) {
  const media = cert.images?.length
    ? cert.images
    : cert.image
      ? [cert.image]
      : []

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {cert.logo && (
        <span className="relative flex size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={cert.logo}
            alt=""
            width={56}
            height={56}
            className="object-contain p-2"
          />
        </span>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{cert.name}</h3>
        <p className="text-sm text-muted-foreground">
          {cert.issuer}
          {cert.date && ` · ${cert.date}`}
        </p>
        {cert.description && (
          <p className="text-sm text-foreground/90 leading-relaxed">
            {cert.description}
          </p>
        )}
        {cert.url && (
          <div className="pt-2">
            <LinkPreview
              url={cert.url}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Visiter le site <ExternalLink className="size-3.5" />
            </LinkPreview>
          </div>
        )}
      </div>
      {media.length > 0 && (
        <div className="sm:ml-auto shrink-0">
          <div className="flex flex-col gap-3">
            <a
              href={media[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity bg-muted"
            >
              <Image
                src={media[0]}
                alt={`Certificat ${cert.name}`}
                width={220}
                height={160}
                className="object-cover"
              />
            </a>

            {media.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {media.slice(1).map((src, idx) => (
                  <a
                    key={src + idx}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`Certificat ${cert.name} (image ${idx + 2})`}
                      width={90}
                      height={70}
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const defaultCertifications: Certification[] = [
  {
    name: "Licence 3 en Génie Logiciel",
    issuer: "Université Dakar-Bourguiba",
    date: "2025",
    url: "https://www.udb.sn/",
    logo: "https://udb.sn/assets/logo-favicone.png",
    description:
      "Licence 3 en Génie Logiciel (GL) obtenue à l'Université Dakar-Bourguiba. Formation en développement logiciel, bases de données, architectures et projets en équipe.",
  },
  
  {
    name: "Certificat de stage",
    issuer: "Université Dakar-Bourguiba",
    date: "2025",
    url: "https://www.udb.sn/",
    logo: "https://udb.sn/assets/logo-favicone.png",
    description:
      "Stage réalisé dans le cadre du projet de plateforme web de l'Université Dakar-Bourguiba (udb.sn), développée en équipe de 4 avec Laravel, Angular et MySQL, hébergée sur OVH.",
    image: undefined, // À remplir avec l'URL de l'image du certificat si disponible
  },
]

export function CertificationsSection({
  className,
  title = "Certifications",
  subtitle = "Formations et diplômes",
  certifications: initialCertifications = defaultCertifications,
}: CertificationsSectionProps) {
  const [items, setItems] = useState<Certification[]>(initialCertifications)

  useEffect(() => {
    async function loadDiplomas() {
      try {
        const res = await fetch("/api/diplomas")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.diplomas) && data.diplomas.length > 0) {
            const mapped: Certification[] = data.diplomas.map((d: any) => ({
              name: d.title,
              issuer: d.institution?.name || "Formation / Indépendant",
              date: d.date || undefined,
              url: d.url || d.institution?.website || undefined,
              logo: d.institution?.logo || undefined,
              description: d.description || undefined,
              image: d.image || undefined,
            }))
            setItems(mapped)
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des diplômes", err)
      }
    }
    loadDiplomas()
  }, [])

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeCertifications = items.length > 0 ? items : initialCertifications

  const activeSelectedId = selectedId || (activeCertifications[0] ? `${activeCertifications[0].name}-${activeCertifications[0].issuer}` : null)

  const selected = activeCertifications.find(
    (c) => `${c.name}-${c.issuer}` === activeSelectedId
  )

  return (
    <SectionWrapper
      id={siteConfig.sections.certifications}
      className={cn("border-b border-border/40", className)}
    >
      <div className="mb-8 sm:mb-12 max-w-2xl">
        <h2
          id={`${siteConfig.sections.certifications}-heading`}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* Mobile : chaque certificat avec son bloc détail directement en dessous */}
      {/* Desktop : ligne de cartes + un seul bloc détail en bas */}
      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-8">
        {activeCertifications.map((cert, i) => {
          const id = `${cert.name}-${cert.issuer}`
          const isSelected = activeSelectedId === id
          return (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="list-none flex flex-col gap-3 sm:gap-0"
            >
              <button
                type="button"
                onClick={() => setSelectedId(id)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0",
                  isSelected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border shadow-sm hover:border-primary/50"
                )}
              >
                {cert.logo ? (
                  <span className="relative flex size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={cert.logo}
                      alt=""
                      width={40}
                      height={40}
                      className="object-contain p-1"
                    />
                  </span>
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="size-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {cert.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cert.issuer}
                    {cert.date && ` · ${cert.date}`}
                  </p>
                </div>
              </button>

              {/* Détail : sur mobile directement sous le cadre, sur desktop caché ici (affiché dans le bloc unique en bas) */}
              <AnimatePresence mode="wait">
                {isSelected && (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm overflow-hidden sm:hidden"
                  >
                    <CertDetail cert={cert} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>

      {/* Bloc d’informations en bas : uniquement sur desktop (sm:) */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selectedId ?? ""}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden sm:block rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm overflow-hidden"
          >
            <CertDetail cert={selected} />
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
