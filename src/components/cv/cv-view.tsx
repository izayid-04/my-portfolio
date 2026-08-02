"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function CvView() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true)
        const res = await fetch("/api/resume")
        if (res.ok) {
          const data = await res.json()
          if (data.pdfUrl) {
            setPdfUrl(data.pdfUrl)
            setFileName(data.fileName || "CV_Izayid_Ali.pdf")
            setUpdatedAt(data.updatedAt)
          }
        }
      } catch (err) {
        console.error("Erreur chargement CV PDF:", err)
      } finally {
        setLoading(false)
      }
    }
    loadResume()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/60 via-background to-background pb-20 pt-6 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* BARRE DE NAVIGATION & ACTIONS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground rounded-xl border border-border bg-background px-3 py-2"
            >
              <ArrowLeft className="size-4" />
              Retour au portfolio
            </Link>

            <div className="hidden md:block h-6 w-px bg-border" />

            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Curriculum Vitae — Izayid Ali
              </h1>
              {updatedAt && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> Mis à jour le {new Date(updatedAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  Plein écran <ExternalLink className="size-3.5" />
                </a>

                <a
                  href={pdfUrl}
                  download={fileName || "CV_Izayid_Ali.pdf"}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Download className="size-3.5" />
                  Télécharger le CV (PDF)
                </a>
              </>
            )}
          </div>
        </div>

        {/* CADRE / CONTENEUR PDF DYNAMIQUE */}
        {loading ? (
          <div className="flex h-[75vh] items-center justify-center rounded-3xl border border-border bg-card shadow-sm p-8">
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Chargement du document PDF...</span>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="space-y-4">
            <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <iframe
                src={`${pdfUrl}#toolbar=1`}
                className="w-full h-[82vh] border-0 rounded-3xl"
                title="Curriculum Vitae Izayid Ali"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/40 p-4 rounded-2xl border border-border">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-400" />
                Document officiel synchronisé en direct depuis le Dashboard.
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Problème d'affichage ? Ouvrir directement le PDF <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-16 text-center space-y-4 shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <FileText className="size-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-bold text-foreground">Aucun CV PDF disponible</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le document CV n'a pas encore été uploadé dans l'espace d'administration. Vous pouvez l'ajouter depuis le Dashboard Admin dans la section <strong className="text-foreground">"Mon CV (PDF)"</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
