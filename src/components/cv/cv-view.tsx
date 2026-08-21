"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react"

export function CvView() {
  const t = useTranslations("cv")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [zoomScale, setZoomScale] = useState<number>(100) // 60% à 170%
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  })
  const touchPanRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(
    null
  )
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)
  const zoomScaleRef = useRef(100)

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

  // 3. Dessin haute définition des pages sur les <canvas>
  useEffect(() => {
    if (!pdfDoc || numPages === 0 || !containerRef.current) return

    let cancelled = false

    async function renderPages() {
      const container = containerRef.current
      if (!container) return

      // Vider le conteneur avant rendu
      container.innerHTML = ""

      const containerWidth = container.clientWidth || 560

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (cancelled) break

        try {
          const page = await pdfDoc.getPage(pageNum)
          if (cancelled) break

          const unscaledViewport = page.getViewport({ scale: 1.0 })
          const scale = containerWidth / unscaledViewport.width
          const viewport = page.getViewport({ scale: scale * 1.5 }) // Rendu HD

          const canvas = document.createElement("canvas")
          canvas.className = "w-full h-auto bg-white block shadow-xs border-b border-border/40 select-none pointer-events-none"
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

  // 4. Gestion du Zoom au Ctrl + Molette de la souris / Touchpad
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomDelta = e.deltaY < 0 ? 10 : -10
        setZoomScale((prev) => Math.min(Math.max(prev + zoomDelta, 60), 170))
      }
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      viewport.removeEventListener("wheel", handleWheel)
    }
  }, [pdfUrl])

  // Garde zoomScaleRef synchronisé pour lecture dans les listeners tactiles natifs (évite les closures obsolètes)
  useEffect(() => {
    zoomScaleRef.current = zoomScale
  }, [zoomScale])

  // 4bis. Gestion tactile : déplacer à un doigt, pincer pour zoomer à deux doigts
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function distanceBetween(t0: Touch, t1: Touch) {
      return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchPanRef.current = null
        pinchRef.current = {
          distance: distanceBetween(e.touches[0], e.touches[1]),
          scale: zoomScaleRef.current,
        }
      } else if (e.touches.length === 1) {
        pinchRef.current = null
        touchPanRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          scrollLeft: viewport.scrollLeft,
          scrollTop: viewport.scrollTop,
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const distance = distanceBetween(e.touches[0], e.touches[1])
        const ratio = distance / pinchRef.current.distance
        setZoomScale(Math.min(Math.max(Math.round(pinchRef.current.scale * ratio), 60), 170))
      } else if (e.touches.length === 1 && touchPanRef.current) {
        e.preventDefault()
        const dx = e.touches[0].clientX - touchPanRef.current.x
        const dy = e.touches[0].clientY - touchPanRef.current.y
        viewport.scrollLeft = touchPanRef.current.scrollLeft - dx
        viewport.scrollTop = touchPanRef.current.scrollTop - dy
      }
    }

    const handleTouchEndOrCancel = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchPanRef.current = null
        pinchRef.current = null
      } else if (e.touches.length === 1) {
        pinchRef.current = null
        touchPanRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          scrollLeft: viewport.scrollLeft,
          scrollTop: viewport.scrollTop,
        }
      }
    }

    viewport.addEventListener("touchstart", handleTouchStart, { passive: true })
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false })
    viewport.addEventListener("touchend", handleTouchEndOrCancel, { passive: true })
    viewport.addEventListener("touchcancel", handleTouchEndOrCancel, { passive: true })
    return () => {
      viewport.removeEventListener("touchstart", handleTouchStart)
      viewport.removeEventListener("touchmove", handleTouchMove)
      viewport.removeEventListener("touchend", handleTouchEndOrCancel)
      viewport.removeEventListener("touchcancel", handleTouchEndOrCancel)
    }
  }, [pdfUrl])

  // 5. Gestion du glisser / déplacer à la main (Drag to Pan avec curseur Grab / Grabbing)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !viewportRef.current) return
    e.preventDefault()
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    viewportRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx
    viewportRef.current.scrollTop = dragStartRef.current.scrollTop - dy
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 15, 170))
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 15, 60))
  const handleResetZoom = () => setZoomScale(100)

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden p-2 pt-6 sm:p-4 pb-20 sm:pb-24 relative select-none">
      {/* Masquage strict des barres de scroll tout en conservant le défilement fluide */}
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

      {/* CONTENEUR PRINCIPAL DU CADRE PDF ET DES BOUTONS DE ZOOM ACCOLÉS */}
      <div className="mx-auto w-full max-w-[560px] flex flex-col h-full space-y-2 relative">
        {/* BOUTONS DE ZOOM ACCOLÉS STRICTEMENT AU BORD DROIT DU CADRE PDF */}
        {pdfUrl && (
          <div className="absolute -right-11 sm:-right-13 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-1 sm:p-1.5 shadow-xl">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 170}
              className="cursor-pointer inline-flex size-8 sm:size-9 items-center justify-center rounded-xl bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground disabled:opacity-40 transition-all shadow-xs"
              title="Zoomer (+)"
            >
              <Plus className="size-4" />
            </button>

            <span className="text-[10px] font-mono font-bold text-muted-foreground py-0.5 text-center select-none">
              {zoomScale}%
            </span>

            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 60}
              className="cursor-pointer inline-flex size-8 sm:size-9 items-center justify-center rounded-xl bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground disabled:opacity-40 transition-all shadow-xs"
              title="Dézoomer (-)"
            >
              <Minus className="size-4" />
            </button>

            {zoomScale !== 100 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="cursor-pointer mt-0.5 inline-flex size-7 items-center justify-center rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                title="Réinitialiser à 100%"
              >
                <RotateCcw className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* EN-TÊTE COMPACTE ALIGNÉE AU CADRE */}
        <header className="flex items-center justify-between gap-2 bg-card px-3 py-1.5 rounded-xl border border-border/80 shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground rounded-lg border border-border bg-background px-2.5 py-1 hover:bg-accent"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">{t("back")}</span>
            </Link>

            <div className="h-3.5 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-3.5" />
              </span>
              <h1 className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-none">
                {t("title")}
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
                  <span className="hidden sm:inline">{t("rawPdf")}</span>
                </a>

                <a
                  href={pdfUrl}
                  download={fileName || "CV_Izayid_Ali.pdf"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>{t("download")}</span>
                </a>
              </>
            )}
          </div>
        </header>

        {/* CADRE FENÊTRE PRINCIPALE */}
        <main className="flex-1 min-h-0 relative w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-xs flex flex-col">
          {/* BARRE FENÊTRE MAC-STYLE DE HAUT */}
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
              <CheckCircle2 className="size-3" /> {t("official")}
            </span>
          </div>

          {loading || (rendering && !pdfDoc) ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-card">
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>{t("loading")}</span>
              </div>
            </div>
          ) : pdfUrl ? (
            /* ZONE CANVAS INTERACTIVE AVEC GESTION CORRIGÉE DU PANNING ET DE L'ORIGINE DU ZOOM */
            <div
              ref={viewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`flex-1 min-h-0 w-full relative bg-white overflow-auto hide-scrollbar touch-none flex flex-col p-1 transition-colors ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              } ${zoomScale > 100 ? "items-start" : "items-center"}`}
            >
              <div
                className="flex flex-col items-center justify-start transition-all duration-200"
                style={{
                  width: zoomScale > 100 ? `${zoomScale}%` : "100%",
                  minWidth: "100%",
                }}
              >
                <div
                  ref={containerRef}
                  className="w-full flex flex-col items-center justify-start pointer-events-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomScale / 100})`,
                    transformOrigin: zoomScale > 100 ? "top left" : "top center",
                  }}
                />
              </div>
            </div>
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
