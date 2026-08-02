"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react"

export function CvView() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Récupération des données du CV
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

  // 2. Chargement du document PDF via PDF.js
  useEffect(() => {
    if (!pdfUrl) return

    let active = true

    async function initPdfJs() {
      try {
        setRendering(true)
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Impossible de charger PDF.js"))
            document.head.appendChild(script)
          })
        }

        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        const task = pdfjsLib.getDocument(pdfUrl)
        const doc = await task.promise

        if (active) {
          setPdfDoc(doc)
          setNumPages(doc.numPages)
        }
      } catch (err) {
        console.error("Erreur d'initialisation PDF.js:", err)
      } finally {
        if (active) setRendering(false)
      }
    }

    initPdfJs()

    return () => {
      active = false
    }
  }, [pdfUrl])

  // 3. Dessin des pages sur les éléments <canvas>
  useEffect(() => {
    if (!pdfDoc || numPages === 0 || !containerRef.current) return

    let cancelled = false

    async function renderPages() {
      const container = containerRef.current
      if (!container) return

      // Vider le conteneur avant rendu
      container.innerHTML = ""

      const containerWidth = container.clientWidth || 600

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (cancelled) break

        try {
          const page = await pdfDoc.getPage(pageNum)
          if (cancelled) break

          const unscaledViewport = page.getViewport({ scale: 1.0 })
          // Ajustement parfait à 100% de la largeur du conteneur sans marge
          const scale = containerWidth / unscaledViewport.width
          const viewport = page.getViewport({ scale: scale * 1.5 }) // Rendu HD 1.5x

          const canvas = document.createElement("canvas")
          canvas.className = "w-full h-auto bg-white block shadow-xs border-b border-border/40"
          canvas.height = viewport.height
          canvas.width = viewport.width

          const context = canvas.getContext("2d")
          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise
          }

          if (!cancelled) {
            container.appendChild(canvas)
          }
        } catch (e) {
          console.error(`Erreur rendu page ${pageNum}:`, e)
        }
      }
    }

    renderPages()

    return () => {
      cancelled = true
    }
  }, [pdfDoc, numPages])

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden p-2 sm:p-4">
      {/* Masquage strict et total des barres de scroll tout en permettant le défilement fluide */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* CONTENEUR SUR MESURE (MAX-W-[640px]) */}
      <div className="mx-auto w-full max-w-[640px] flex flex-col h-full space-y-2">
        {/* EN-TÊTE COMPACTE */}
        <header className="flex items-center justify-between gap-2 bg-card px-3 py-1.5 rounded-xl border border-border/80 shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground rounded-lg border border-border bg-background px-2.5 py-1 hover:bg-accent"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Retour</span>
            </Link>

            <div className="h-3.5 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-3.5" />
              </span>
              <h1 className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-none">
                CV Izayid Ali
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {pdfUrl && (
              <>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Ouvrir PDF brut</span>
                </a>

                <a
                  href={pdfUrl}
                  download={fileName || "CV_Izayid_Ali.pdf"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>Télécharger</span>
                </a>
              </>
            )}
          </div>
        </header>

        {/* ZONE PRINCIPALE DE VISIONNAGE RENDU CANVAS SANS AUCUNE BARRE DE SCROLL NAVIGATEUR */}
        <main className="flex-1 min-h-0 relative w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-xs flex flex-col">
          {/* BARRE FENÊTRE DE HAUT */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border text-xs text-muted-foreground shrink-0 z-10">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500/80" />
              <span className="size-2 rounded-full bg-amber-500/80" />
              <span className="size-2 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-[10px] text-foreground/80 font-medium ml-1.5 truncate">
                {fileName || "CV_Izayid_Ali.pdf"}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <CheckCircle2 className="size-3" /> CV Officiel
            </span>
          </div>

          {loading || (rendering && !pdfDoc) ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-card">
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Chargement HD du CV...</span>
              </div>
            </div>
          ) : pdfUrl ? (
            /* RENDU HTML5 CANVAS PUR : Zéro iframe, Zéro barre de scroll navigateur visible, Zéro décalage */
            <div
              ref={containerRef}
              className="flex-1 min-h-0 w-full relative bg-white overflow-y-auto hide-scrollbar flex flex-col items-center justify-start"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-card">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h2 className="text-xs font-bold text-foreground">Aucun CV disponible</h2>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ajoutez votre fichier PDF depuis le Dashboard Admin dans la section <strong className="text-foreground">"Mon CV (PDF)"</strong>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
