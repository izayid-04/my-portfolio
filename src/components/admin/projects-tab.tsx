"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  Loader2,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react"

export interface ProjectData {
  id: string
  title: string
  description: string
  date?: string | null
  slug?: string | null
  tags: string[]
  image?: string | null
  video?: string | null
  href?: string | null
  embedSite: boolean
  published: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export function ProjectsTab() {
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [projects, setProjects] = React.useState<ProjectData[]>([])

  // Form State (Create / Edit)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [date, setDate] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [tagsInput, setTagsInput] = React.useState("")
  const [image, setImage] = React.useState("")
  const [video, setVideo] = React.useState("")
  const [href, setHref] = React.useState("")
  const [embedSite, setEmbedSite] = React.useState(true)
  const [published, setPublished] = React.useState(true)
  const [order, setOrder] = React.useState("0")

  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch (err) {
      console.error("Erreur de chargement des projets:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setDescription("")
    setDate("")
    setSlug("")
    setTagsInput("")
    setImage("")
    setVideo("")
    setHref("")
    setEmbedSite(true)
    setPublished(true)
    setOrder("0")
    setStatusMessage(null)
  }

  const handleEdit = (project: ProjectData) => {
    setEditingId(project.id)
    setTitle(project.title)
    setDescription(project.description)
    setDate(project.date || "")
    setSlug(project.slug || "")
    setTagsInput(project.tags.join(", "))
    setImage(project.image || "")
    setVideo(project.video || "")
    setHref(project.href || "")
    setEmbedSite(project.embedSite)
    setPublished(project.published)
    setOrder(String(project.order || 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Upload d'image vers Supabase Storage API
  const handleUploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "projects")

    try {
      setUploadingImage(true)
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Échec de l'upload")
        return
      }

      setImage(data.url)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'upload")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setStatusMessage({ type: "error", text: "Le titre et la description sont requis." })
      return
    }

    try {
      setSaving(true)
      setStatusMessage(null)

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        id: editingId || undefined,
        title,
        description,
        date: date || null,
        slug: slug || null,
        tags: tagsArray,
        image: image || null,
        video: video || null,
        href: href || null,
        embedSite,
        published,
        order: parseInt(order) || 0,
      }

      const method = editingId ? "PUT" : "POST"
      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.project) {
        if (editingId) {
          setProjects((prev) => prev.map((p) => (p.id === editingId ? data.project : p)))
          setStatusMessage({ type: "success", text: "Projet mis à jour avec succès !" })
        } else {
          setProjects((prev) => [data.project, ...prev])
          setStatusMessage({ type: "success", text: "Projet créé avec succès !" })
        }
        resetForm()
      } else {
        setStatusMessage({ type: "error", text: data.error || "Erreur lors de l'enregistrement" })
      }
    } catch (err) {
      console.error(err)
      setStatusMessage({ type: "error", text: "Erreur réseau lors de la sauvegarde" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
        if (editingId === id) resetForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const togglePublished = async (project: ProjectData) => {
    const nextState = !project.published
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: nextState } : p)))

    try {
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...project, published: nextState }),
      })
    } catch (err) {
      console.error("Erreur bascule publication:", err)
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: project.published } : p)))
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FolderGit2 className="size-6 text-primary" />
            Gestion des Projets
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Créez, modifiez et organisez vos projets affichés dynamiquement sur la page d'accueil.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchProjects}
          className="cursor-pointer rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Rafraîchir
        </button>
      </div>

      {/* FORM & LIST GRID */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* COLONNE GAUCHE: FORMULAIRE (5 colonnes) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FolderGit2 className="size-4 text-primary" />
                {editingId ? "Modifier le projet" : "Ajouter un nouveau projet"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Annuler
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                className={`rounded-xl p-3 text-xs flex items-center gap-2 border ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                {statusMessage.type === "success" && <CheckCircle2 className="size-4 shrink-0" />}
                {statusMessage.text}
              </div>
            )}

            {/* TITRE & DATE */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Titre du projet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Université Dakar-Bourguiba (UDB)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Période / Date</label>
                  <input
                    type="text"
                    placeholder="Ex: Juillet 2025"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* LIENS & SLUG */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">URL Démo / Site</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Slug Article lié (opt)</label>
                <input
                  type="text"
                  placeholder="Ex: udb, biacode"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Description détaillée *</label>
              <textarea
                required
                rows={4}
                placeholder="Présentez les objectifs, l'équipe et les technologies utilisées..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* TAGS */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Technologies / Tags (séparés par des virgules)</label>
              <input
                type="text"
                placeholder="Ex: Laravel, Angular, MySQL, OVH"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* IMAGE DE COUVERTURE */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Image de couverture (Supabase Storage)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="URL ou téléverser ci-contre"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-medium hover:bg-accent transition-colors">
                  {uploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadImage(file)
                    }}
                  />
                </label>
              </div>
              {image && (
                <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-border">
                  <Image src={image} alt="Aperçu" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* OPTIONS (Checkboxes) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={embedSite}
                  onChange={(e) => setEmbedSite(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                Afficher le site en aperçu direct (iframe)
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                Publier le projet (visible sur le portfolio)
              </label>
            </div>

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enregistrement...
                </>
              ) : editingId ? (
                "Mettre à jour le projet"
              ) : (
                "Créer le projet en BDD"
              )}
            </button>
          </form>
        </div>

        {/* COLONNE DROITE: LISTE DES PROJETS (7 colonnes) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Projets enregistrés ({projects.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Chargement des projets depuis la BDD...
              </div>
            ) : projects.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground italic">
                Aucun projet trouvé. Créez-en un via le formulaire à gauche.
              </p>
            ) : (
              <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className={`rounded-xl border p-4 transition-all space-y-3 ${
                      editingId === proj.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-background hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {proj.image ? (
                          <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border">
                            <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="size-12 shrink-0 rounded-xl bg-muted flex items-center justify-center">
                            <FolderGit2 className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-foreground truncate">{proj.title}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                proj.published
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {proj.published ? "Publié" : "Brouillon"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {proj.date || "Date non définie"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePublished(proj)}
                          className="cursor-pointer text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title={proj.published ? "Passer en brouillon" : "Publier"}
                        >
                          {proj.published ? <Eye className="size-4 text-emerald-400" /> : <EyeOff className="size-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(proj)}
                          className="cursor-pointer text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id)}
                          className="cursor-pointer text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* TAGS & LINKS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {proj.href && (
                        <a
                          href={proj.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          Lien site <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
