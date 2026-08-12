"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  FileText,
  Upload,
  Loader2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"

// Composant de prévisualisation HD Canvas (élimine la scrollbar native Chrome et utilise notre scrollbar fine universelle)
function AdminCvPreview({ pdfUrl }: { pdfUrl: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [rendering, setRendering] = React.useState(true)

  React.useEffect(() => {
    if (!pdfUrl) return
    let active = true

    async function renderPreview() {
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

        const doc = await pdfjsLib.getDocument(pdfUrl).promise
        if (!active) return

        const container = containerRef.current
        if (!container) return
        container.innerHTML = ""

        const containerWidth = container.clientWidth || 600

        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          if (!active) break
          const page = await doc.getPage(pageNum)
          const unscaledViewport = page.getViewport({ scale: 1.0 })
          const scale = containerWidth / unscaledViewport.width
          const viewport = page.getViewport({ scale: scale * 1.5 })

          const canvas = document.createElement("canvas")
          canvas.className = "w-full h-auto bg-white block shadow-xs border-b border-border/40"
          canvas.height = viewport.height
          canvas.width = viewport.width

          const context = canvas.getContext("2d")
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise
          }
          if (active) container.appendChild(canvas)
        }
      } catch (err) {
        console.error("Erreur de rendu de l'aperçu PDF:", err)
      } finally {
        if (active) setRendering(false)
      }
    }

    renderPreview()
    return () => {
      active = false
    }
  }, [pdfUrl])

  return (
    <div className="relative w-full h-[650px] overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-inner">
      {rendering && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground bg-white">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span>Génération de l'aperçu HD...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full flex flex-col items-center justify-start"
      />
    </div>
  )
}

export function CvTab() {
  const [pdfUrl, setPdfUrl] = React.useState("")
  const [fileName, setFileName] = React.useState("")
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  // Charger le CV actuellement enregistré en BDD
  const fetchCv = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/resume")
      if (res.ok) {
        const data = await res.json()
        if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl)
          setFileName(data.fileName || "CV_Izayid_Ali.pdf")
          setUpdatedAt(data.updatedAt)
        } else {
          setPdfUrl("")
          setFileName("")
          setUpdatedAt(null)
        }
      }
    } catch (err) {
      console.error("Erreur de chargement du CV:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCv()
  }, [fetchCv])

  // Upload du fichier PDF vers Supabase Storage
  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Veuillez sélectionner un fichier au format PDF (.pdf).")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "cv")

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setPdfUrl(data.url)
        setFileName(file.name)
        toast.success("Fichier PDF chargé avec succès ! Cliquez sur 'Enregistrer & Publier'.")
      } else {
        toast.error(data.error || "Échec de l'upload du fichier PDF.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'envoi du fichier PDF.")
    } finally {
      setUploading(false)
    }
  }

  // Soumission / Enregistrement en Base de données
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!pdfUrl.trim()) {
      toast.error("Veuillez fournir l'URL du fichier PDF du CV.")
      return
    }

    try {
      setSaving(true)

      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfUrl: pdfUrl.trim(),
          fileName: fileName || "CV_Izayid_Ali.pdf",
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Le CV PDF a été mis à jour et publié sur le site public ! 🎉")
        setUpdatedAt(data.resume.updatedAt)
      } else {
        toast.error(data.error || "Erreur lors de la sauvegarde.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur de connexion serveur.")
    } finally {
      setSaving(false)
    }
  }

  // Suppression du CV actif
  const handleDelete = async () => {
    try {
      setDeleting(true)

      const res = await fetch("/api/resume", {
        method: "DELETE",
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPdfUrl("")
        setFileName("")
        setUpdatedAt(null)
        toast.success("Le CV PDF a été supprimé avec succès ! 🗑️")
      } else {
        toast.error(data.error || "Erreur lors de la suppression.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur serveur lors de la suppression.")
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-background p-8">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Chargement du CV actuel...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* MODALE DE CONFIRMATION SHADCN POUR LA SUPPRESSION DU CV */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer le CV PDF actuellement publié ?"
        description="Êtes-vous sûr de vouloir supprimer le CV PDF actuel ? Il ne sera plus du tout visible sur le site public."
        confirmText="Oui, supprimer définitivement"
        cancelText="Annuler"
        variant="destructive"
        isLoading={deleting}
        icon={<Trash2 className="size-6 text-rose-500" />}
      />

      {/* BANNIÈRE & HEADER CV */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="size-5 text-rose-400" />
                Gestion du Curriculum Vitae (PDF)
              </h2>
              {pdfUrl ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="size-3" /> CV En Ligne
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                  <AlertCircle className="size-3" /> Aucun PDF configuré
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Uploadez votre CV au format PDF. Il sera automatiquement intégré et affiché sur la page publique <code className="text-primary font-mono font-semibold">/cv</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/cv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <Eye className="size-3.5 text-primary" /> Voir sur le site public
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* UPLOAD FORM & PREVIEW URL */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-12 items-end">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Lien URL du CV PDF dans le Storage</span>
                {updatedAt && (
                  <span className="text-[10px] text-muted-foreground italic">
                    Dernière MAJ : {new Date(updatedAt).toLocaleDateString("fr-FR")} à {new Date(updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                />
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0"
                    title="Télécharger / Ouvrir"
                  >
                    <Download className="size-3.5" /> Fichier
                  </a>
                )}
              </div>
            </div>

            {/* BUTTON UPLOAD PDF */}
            <div className="md:col-span-4">
              <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all shadow-xs">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? "Upload en cours..." : "Uploader un nouveau CV (.PDF)"}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* BOUTON SUPPRIMER LE CV */}
            {pdfUrl ? (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting || saving || uploading}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 transition-all"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    Supprimer le CV
                  </>
                )}
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={saving || uploading || !pdfUrl.trim()}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Enregistrer & Publier le CV
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 📄 PRÉVISUALISATION DU CV PDF */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Aperçu en direct du Cadre PDF
          </h3>
          {pdfUrl && (
            <button
              type="button"
              onClick={fetchCv}
              className="cursor-pointer inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="size-3" /> Actualiser l'aperçu
            </button>
          )}
        </div>

        {pdfUrl ? (
          <AdminCvPreview pdfUrl={pdfUrl} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-12 text-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileText className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Aucun CV PDF à afficher</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Uploadez votre fichier PDF ci-dessus pour prévisualiser le rendu exact du cadre CV.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
