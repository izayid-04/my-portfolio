"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { toast } from "sonner"
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  Loader2,
  Building2,
  X,
  Briefcase,
  User,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TranslateButton } from "@/components/admin/translate-button"

export interface CompanyData {
  id: string
  name: string
  logo?: string | null
  website?: string | null
}

export interface ProjectData {
  id: string
  title: string
  titleEn?: string | null
  description: string
  descriptionEn?: string | null
  date?: string | null
  slug?: string | null
  tags: string[]
  image?: string | null
  video?: string | null
  href?: string | null
  githubUrl?: string | null
  embedSite: boolean
  published: boolean
  order: number
  companyId?: string | null
  company?: CompanyData | null
  createdAt: string
  updatedAt: string
}

export function ProjectsTab() {
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [projects, setProjects] = React.useState<ProjectData[]>([])
  const [companies, setCompanies] = React.useState<CompanyData[]>([])

  // Modal pour créer/gérer les Entreprises
  const [showCompanyModal, setShowCompanyModal] = React.useState(false)
  const [editingCompanyId, setEditingCompanyId] = React.useState<string | null>(null)
  const [companyName, setCompanyName] = React.useState("")
  const [companyLogo, setCompanyLogo] = React.useState("")
  const [companyWebsite, setCompanyWebsite] = React.useState("")
  const [uploadingCompanyLogo, setUploadingCompanyLogo] = React.useState(false)
  const [savingCompany, setSavingCompany] = React.useState(false)

  // Form State (Projet)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [titleEn, setTitleEn] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [descriptionEn, setDescriptionEn] = React.useState("")
  const [date, setDate] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [tagsInput, setTagsInput] = React.useState("")
  const [image, setImage] = React.useState("")
  const [video, setVideo] = React.useState("")
  const [href, setHref] = React.useState("")
  const [hasPublicRepo, setHasPublicRepo] = React.useState(false)
  const [githubUrl, setGithubUrl] = React.useState("")
  const [companyId, setCompanyId] = React.useState("")
  const [embedSite, setEmbedSite] = React.useState(true)
  const [published, setPublished] = React.useState(true)
  const [order, setOrder] = React.useState("0")

  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

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

  const fetchCompanies = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/companies")
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies || [])
      }
    } catch (err) {
      console.error("Erreur de chargement des entreprises:", err)
    }
  }, [])

  React.useEffect(() => {
    fetchProjects()
    fetchCompanies()
  }, [fetchProjects, fetchCompanies])

  const resetCompanyForm = () => {
    setShowCompanyModal(false)
    setEditingCompanyId(null)
    setCompanyName("")
    setCompanyLogo("")
    setCompanyWebsite("")
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setTitleEn("")
    setDescription("")
    setDescriptionEn("")
    setDate("")
    setSlug("")
    setTagsInput("")
    setImage("")
    setVideo("")
    setHref("")
    setHasPublicRepo(false)
    setGithubUrl("")
    setCompanyId("")
    setEmbedSite(true)
    setPublished(true)
    setOrder("0")
  }

  const handleEdit = (project: ProjectData) => {
    setEditingId(project.id)
    setTitle(project.title)
    setTitleEn(project.titleEn || "")
    setDescription(project.description)
    setDescriptionEn(project.descriptionEn || "")
    setDate(project.date || "")
    setSlug(project.slug || "")
    setTagsInput(project.tags.join(", "))
    setImage(project.image || "")
    setVideo(project.video || "")
    setHref(project.href || "")
    const hasGithub = Boolean(project.githubUrl && project.githubUrl.trim())
    setHasPublicRepo(hasGithub)
    setGithubUrl(project.githubUrl || "")
    setCompanyId(project.companyId || "")
    setEmbedSite(project.embedSite)
    setPublished(project.published)
    setOrder(String(project.order || 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Upload d'image vers Supabase Storage API
  const handleUploadImage = async (file: File, isCompanyLogo = false) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", isCompanyLogo ? "companies" : "projects")

    try {
      if (isCompanyLogo) setUploadingCompanyLogo(true)
      else setUploadingImage(true)

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Échec de l'upload")
        return
      }

      if (isCompanyLogo) {
        setCompanyLogo(data.url)
      } else {
        setImage(data.url)
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'upload")
    } finally {
      if (isCompanyLogo) setUploadingCompanyLogo(false)
      else setUploadingImage(false)
    }
  }

  // Créer ou éditer une Entreprise
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) return

    try {
      setSavingCompany(true)
      const method = editingCompanyId ? "PUT" : "POST"
      const payload = {
        id: editingCompanyId || undefined,
        name: companyName.trim(),
        logo: companyLogo || null,
        website: companyWebsite || null,
      }

      const res = await fetch("/api/admin/companies", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.company) {
        if (editingCompanyId) {
          setCompanies((prev) => prev.map((c) => (c.id === editingCompanyId ? data.company : c)))
          toast.success("Entreprise mise à jour avec succès !")
        } else {
          setCompanies((prev) => [...prev, data.company])
          // Sélectionner automatiquement la nouvelle entreprise créée
          setCompanyId(data.company.id)
          toast.success("Entreprise créée avec succès !")
        }
        resetCompanyForm()
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement de l'entreprise")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la sauvegarde")
    } finally {
      setSavingCompany(false)
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette entreprise ?")) return
    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id))
        if (companyId === id) setCompanyId("")
        toast.success("Entreprise supprimée.")
      } else {
        toast.error("Erreur lors de la suppression de l'entreprise")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la suppression")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error("Le titre et la description sont requis.")
      return
    }

    try {
      setSaving(true)

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        id: editingId || undefined,
        title,
        titleEn: titleEn || null,
        description,
        descriptionEn: descriptionEn || null,
        date: date || null,
        slug: slug || null,
        tags: tagsArray,
        image: image || null,
        video: video || null,
        href: href || null,
        githubUrl: hasPublicRepo && githubUrl.trim() ? githubUrl.trim() : null,
        companyId: companyId || null,
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
          toast.success("Projet mis à jour avec succès !")
        } else {
          setProjects((prev) => [data.project, ...prev])
          toast.success("Projet créé avec succès !")
        }
        resetForm()
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la sauvegarde")
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
        toast.success("Projet supprimé.")
      } else {
        toast.error("Erreur lors de la suppression du projet")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la suppression")
    }
  }

  const togglePublished = async (project: ProjectData) => {
    const nextState = !project.published
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: nextState } : p)))

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...project, published: nextState }),
      })
      if (!res.ok) throw new Error("Échec de la mise à jour")
      toast.success(nextState ? "Projet publié." : "Projet dépublié.")
    } catch (err) {
      console.error("Erreur bascule publication:", err)
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: project.published } : p)))
      toast.error("Erreur lors du changement de statut")
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
            Créez, modifiez et reliez vos projets à des entreprises/structures ou marquez-les en projets personnels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetCompanyForm()
              setShowCompanyModal(true)
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Building2 className="size-3.5" />
            Gérer les Entreprises ({companies.length})
          </button>
          <button
            type="button"
            onClick={() => {
              fetchProjects()
              fetchCompanies()
            }}
            className="cursor-pointer rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Rafraîchir
          </button>
        </div>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Titre EN (optionnel, affiché sur /en)</label>
                  <TranslateButton sourceText={title} kind="title" onTranslated={setTitleEn} />
                </div>
                <input
                  type="text"
                  placeholder="English title"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* SÉLECTION ENTREPRISE / STRUCTURE OU PERSONNEL */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-primary" />
                    Structure / Entreprise de réalisation
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetCompanyForm()
                      setShowCompanyModal(true)
                    }}
                    className="cursor-pointer text-[11px] text-primary hover:underline font-medium"
                  >
                    + Créer entreprise
                  </button>
                </div>
                <Select
                  value={companyId || "none"}
                  onValueChange={(val) => setCompanyId(val === "none" ? "" : val)}
                >
                  <SelectTrigger className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground">
                    <SelectValue placeholder="Sélectionner une entreprise / structure" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground shrink-0" />
                        <span>Projet Personnel (Aucune entreprise / structure)</span>
                      </div>
                    </SelectItem>
                    {companies.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        <div className="flex items-center gap-2">
                          {comp.logo ? (
                            <Image
                              src={comp.logo}
                              alt={comp.name}
                              width={16}
                              height={16}
                              className="size-4 object-contain rounded-xs shrink-0"
                              unoptimized
                            />
                          ) : (
                            <Building2 className="size-4 text-muted-foreground shrink-0" />
                          )}
                          <span>{comp.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground italic">
                  {companyId
                    ? `Le projet sera relié à l'entreprise : ${companies.find((c) => c.id === companyId)?.name || ""}`
                    : "Si non sélectionné, ce projet sera identifié comme un Projet Personnel."}
                </p>
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

            {/* LIENS & DÉPÔT GITHUB */}
            <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="size-4 text-primary" />
                Liens & Dépôt Source
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">URL Démo / Site public</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Slug Article lié (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: udb, biacode"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* BOUTON D'ACTIVATION DU DÉPÔT GITHUB PUBLIC */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPublicRepo}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setHasPublicRepo(checked)
                      if (!checked) setGithubUrl("")
                    }}
                    className="size-4 rounded border-input accent-primary"
                  />
                  <span>Ce projet dispose d'un dépôt GitHub public</span>
                </label>

                {hasPublicRepo && (
                  <div className="pt-1 space-y-1.5">
                    <label className="text-xs font-medium text-foreground block">
                      Lien du dépôt GitHub (Code public) *
                    </label>
                    <input
                      type="url"
                      required={hasPublicRepo}
                      placeholder="https://github.com/izayid-04/nom-du-projet"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full rounded-xl border border-primary/50 bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Ce lien générera un bouton ouvrant le code source GitHub dans un nouvel onglet.
                    </p>
                  </div>
                )}
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Description EN (optionnel)</label>
                <TranslateButton sourceText={description} kind="description" onTranslated={setDescriptionEn} />
              </div>
              <textarea
                rows={4}
                placeholder="English description"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
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
                      if (file) handleUploadImage(file, false)
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

                            {proj.company ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {proj.company.logo ? (
                                  <Image src={proj.company.logo} alt={proj.company.name} width={12} height={12} className="size-3 object-contain rounded-xs" unoptimized />
                                ) : (
                                  <Building2 className="size-3" />
                                )}
                                {proj.company.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                                <User className="size-3" />
                                Personnel
                              </span>
                            )}
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

      {/* MODAL CRÉATION / ÉDITION ENTREPRISE */}
      {showCompanyModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto min-h-screen w-full">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Gérer les Entreprises & Structures ({companies.length})
              </h3>
              <button
                type="button"
                onClick={resetCompanyForm}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* FORMULAIRE D'AJOUT D'ENTREPRISE */}
            <form onSubmit={handleSaveCompany} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-foreground">
                {editingCompanyId ? "Modifier l'entreprise" : "Nouvelle Entreprise / Structure"}
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BIACode, EASYTECS"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Logo de l'entreprise (Supabase Storage)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="URL du logo"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                    {uploadingCompanyLogo ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadImage(file, true)
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Site Web (Optionnel)</label>
                <input
                  type="url"
                  placeholder="https://www.biacode.tech/"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingCompanyId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCompanyId(null)
                      setCompanyName("")
                      setCompanyLogo("")
                      setCompanyWebsite("")
                    }}
                    className="cursor-pointer text-xs text-muted-foreground hover:underline"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="cursor-pointer rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {savingCompany ? "Enregistrement..." : editingCompanyId ? "Mettre à jour" : "Ajouter entreprise"}
                </button>
              </div>
            </form>

            {/* LISTE DES ENTREPRISES CRÉÉES */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <p className="text-xs font-medium text-muted-foreground">Entreprises existantes :</p>
              {companies.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Aucune entreprise créée pour le moment.</p>
              ) : (
                companies.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      {comp.logo ? (
                        <Image src={comp.logo} alt={comp.name} width={24} height={24} className="size-6 object-contain rounded-xs" unoptimized />
                      ) : (
                        <Building2 className="size-4 text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-semibold text-foreground block">{comp.name}</span>
                        {comp.website && <span className="text-[10px] text-muted-foreground">{comp.website}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompanyId(comp.id)
                          setCompanyName(comp.name)
                          setCompanyLogo(comp.logo || "")
                          setCompanyWebsite(comp.website || "")
                        }}
                        className="cursor-pointer text-muted-foreground hover:text-primary p-1 rounded-md"
                        title="Modifier"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCompany(comp.id)}
                        className="cursor-pointer text-muted-foreground hover:text-destructive p-1 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
