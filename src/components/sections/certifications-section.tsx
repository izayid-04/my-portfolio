"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  GraduationCap,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { SectionWrapper } from "@/components/layout"

export interface Certification {
  name: string
  issuer: string
  date?: string
  url?: string
  logo?: string
  description?: string
  image?: string
  images?: string[]
}

// ─── Rendu PDF Canvas HD dynamique sans scrollbar ─────────────────────────────
function PdfCanvas({ pdfUrl }: { pdfUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!pdfUrl) return
    let cancelled = false

    async function render() {
      try {
        setLoading(true)
        setError(false)

        if (!(window as any).pdfjsLib) {
          await new Promise<void>((res, rej) => {
            const s = document.createElement("script")
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            s.onload = () => res()
            s.onerror = () => rej()
            document.head.appendChild(s)
          })
        }

        const lib = (window as any).pdfjsLib
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        const doc = await lib.getDocument(pdfUrl).promise
        if (cancelled) return

        const page = await doc.getPage(1)
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return

        const container = canvas.parentElement!
        const width = container.clientWidth || 600
        const vp0 = page.getViewport({ scale: 1.0 })
        const scale = (width / vp0.width) * 1.5 // Rendu HD
        const vp = page.getViewport({ scale })

        canvas.width = vp.width
        canvas.height = vp.height
        canvas.style.width = "100%"
        canvas.style.height = "auto"

        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport: vp }).promise

        if (!cancelled) setLoading(false)
      } catch {
        if (!cancelled) {
          setLoading(false)
          setError(true)
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-inner border border-border/50 min-h-[220px]">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white text-xs text-muted-foreground z-10 py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span>Chargement HD du document PDF...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground py-12">
          <FileText className="size-8 text-rose-400" />
          <span>Aperçu PDF indisponible</span>
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full" />
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
      "Stage réalisé dans le cadre du projet de plateforme web de l'Université Dakar-Bourguiba, développée en équipe de 4 avec Laravel, Angular et MySQL.",
  },
]

export interface CertificationsSectionProps {
  className?: string
  title?: string
  subtitle?: string
  certifications?: Certification[]
}

export function CertificationsSection({
  className,
  title = "Certifications",
  subtitle = "Formations et diplômes",
  certifications: initialCertifications = defaultCertifications,
}: CertificationsSectionProps) {
  // Les certifications sont fournies par le serveur (app/page.tsx) via la prop
  // `certifications`. Pas de re-fetch client ici : ça évite un redimensionnement
  // de la section après le premier rendu (cause du saut de scroll signalé).
  const items = initialCertifications
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const certs = items.length > 0 ? items : initialCertifications

  const handleSelect = (index: number) => {
    if (selectedIndex === index) {
      // Toggle fermeture si déjà sélectionné
      setSelectedIndex(null)
    } else {
      setSelectedIndex(index)
    }
  }

  const selectedCert = selectedIndex !== null ? certs[selectedIndex] : null

  const handlePrev = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + certs.length) % certs.length)
  }

  const handleNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % certs.length)
  }

  return (
    <SectionWrapper
      id={siteConfig.sections.certifications}
      className={cn("border-b border-border/40", className)}
    >
      {/* EN-TÊTE DE SECTION */}
      <div className="mb-8 sm:mb-10 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          id={`${siteConfig.sections.certifications}-heading`}
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-sm font-medium text-foreground sm:text-base"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* 1. SELECTION DES CADRES (LISTE / GALERIE DES DIPLÔMES) */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        {certs.map((cert, i) => {
          const isSelected = selectedIndex === i

          return (
            <motion.button
              key={`${cert.name}-${i}`}
              type="button"
              onClick={() => handleSelect(i)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 cursor-pointer shadow-xs",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                  : "border-border/80 bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {cert.logo ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white border border-border/60 shadow-xs">
                  <Image
                    src={cert.logo}
                    alt=""
                    width={40}
                    height={40}
                    className="object-contain p-1 w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {cert.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {cert.issuer}
                  {cert.date && ` · ${cert.date}`}
                </p>
              </div>

              {/* Petit badge vert si actif */}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 ml-1"
                >
                  <Sparkles className="size-3" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* 2. CADRE DE DÉTAILS DYNAMIQUE AVEC ANIMATION DE ZOOM & CAROUSEL DE SCROLL */}
      <AnimatePresence mode="wait">
        {selectedCert && (
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="rounded-3xl border border-primary/30 bg-card p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden"
          >
            {/* Ligne d'accent supérieure avec dégradé */}
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />

            {/* BARRE DE NAVIGATION EN-TÊTE DU DIPLÔME SÉLECTIONNÉ */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3.5">
                {selectedCert.logo ? (
                  <div className="size-14 rounded-2xl overflow-hidden border border-border bg-white p-1.5 shadow-sm shrink-0">
                    <Image
                      src={selectedCert.logo}
                      alt=""
                      width={56}
                      height={56}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="size-14 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Award className="size-7" />
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {selectedCert.name}
                    </h3>
                    {selectedCert.date && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {selectedCert.date}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Délivré par <strong className="text-foreground">{selectedCert.issuer}</strong>
                  </p>
                </div>
              </div>

              {/* BOUTONS DE DÉFILEMENT (DIPLÔME PRÉCÉDENT / SUIVANT) */}
              {certs.length > 1 && (
                <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-2xl border border-border/80">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="cursor-pointer inline-flex size-8 items-center justify-center rounded-xl bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-all"
                    title="Diplôme précédent"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <span className="text-xs font-mono font-bold px-2 text-muted-foreground">
                    {selectedIndex! + 1} / {certs.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="cursor-pointer inline-flex size-8 items-center justify-center rounded-xl bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground transition-all"
                    title="Diplôme suivant"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {selectedCert.description && (
              <p className="text-sm text-foreground/90 leading-relaxed max-w-3xl">
                {selectedCert.description}
              </p>
            )}

            {/* BLOC DOCUMENT PDF / ATTESTATION DIRECTEMENT RENDU */}
            {(() => {
              const media = selectedCert.images?.length
                ? selectedCert.images
                : selectedCert.image
                ? [selectedCert.image]
                : []

              const pdfSrc = media.find((m) => m?.toLowerCase().includes(".pdf"))
              const imgSrc = media.find((m) => m && !m.toLowerCase().includes(".pdf"))

              return (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      Document officiel & Attestation
                    </h4>

                    {selectedCert.url && (
                      <a
                        href={selectedCert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Visiter le site <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  {pdfSrc ? (
                    <div className="space-y-2">
                      <PdfCanvas pdfUrl={pdfSrc} />
                      <div className="flex justify-end">
                        <a
                          href={pdfSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-all"
                        >
                          <FileText className="size-3.5" /> Ouvrir le fichier PDF brut
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  ) : imgSrc ? (
                    <div className="rounded-2xl border border-border overflow-hidden bg-muted/30">
                      <Image
                        src={imgSrc}
                        alt={`Attestation ${selectedCert.name}`}
                        width={700}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                      Aucun fichier PDF joint pour cette attestation.
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
