"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { toast } from "sonner"
import {
  Award,
  Building2,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  Edit2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Institution {
  id: string
  name: string
  logo?: string | null
  website?: string | null
  city?: string | null
  country?: string | null
  _count?: { diplomas: number }
}

interface Diploma {
  id: string
  title: string
  degreeType: string
  fieldOfStudy?: string | null
  description?: string | null
  date?: string | null
  image?: string | null
  url?: string | null
  published: boolean
  institutionId?: string | null
  institution?: Institution | null
}

const DEGREE_TYPES = [
  { value: "LICENCE", label: "Licence" },
  { value: "CERTIFICAT", label: "Certificat / Stage" },
  { value: "MASTER", label: "Master" },
  { value: "BAC", label: "Baccalauréat" },
  { value: "AUTRE", label: "Autre formation" },
]

export function DiplomasTab() {
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [institutions, setInstitutions] = React.useState<Institution[]>([])
  const [diplomas, setDiplomas] = React.useState<Diploma[]>([])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Modal / Form state for Institution
  const [showInstModal, setShowInstModal] = React.useState(false)
  const [editingInstId, setEditingInstId] = React.useState<string | null>(null)
  const [instName, setInstName] = React.useState("")
  const [instLogo, setInstLogo] = React.useState("")
  const [instWebsite, setInstWebsite] = React.useState("")
  const [instCity, setInstCity] = React.useState("")
  const [instCountry, setInstCountry] = React.useState("")
  const [instUploading, setInstUploading] = React.useState(false)
  const [instSaving, setInstSaving] = React.useState(false)

  // Form state for Diploma (Create / Edit)
  const [editingDiplomaId, setEditingDiplomaId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [degreeType, setDegreeType] = React.useState("CERTIFICAT")
  const [fieldOfStudy, setFieldOfStudy] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [date, setDate] = React.useState("")
  const [image, setImage] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [institutionId, setInstitutionId] = React.useState("")
  const [published, setPublished] = React.useState(true)
  const [imageUploading, setImageUploading] = React.useState(false)
  const [savingDiploma, setSavingDiploma] = React.useState(false)

  // Charger les établissements et diplômes
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [resInst, resDip] = await Promise.all([
        fetch("/api/admin/institutions"),
        fetch("/api/admin/diplomas"),
      ])

      if (resInst.ok) {
        const dataInst = await resInst.json()
        setInstitutions(dataInst.institutions || [])
      }

      if (resDip.ok) {
        const dataDip = await resDip.json()
        setDiplomas(dataDip.diplomas || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Upload d'image vers Supabase Storage API
  const handleUploadImage = async (file: File, isLogo = false) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      if (isLogo) setInstUploading(true)
      else setImageUploading(true)

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Échec de l'upload")
        return
      }

      if (isLogo) {
        setInstLogo(data.url)
      } else {
        setImage(data.url)
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'upload")
    } finally {
      if (isLogo) setInstUploading(false)
      else setImageUploading(false)
    }
  }

  const resetInstForm = () => {
    setShowInstModal(false)
    setEditingInstId(null)
    setInstName("")
    setInstLogo("")
    setInstWebsite("")
    setInstCity("")
    setInstCountry("")
  }

  const handleEditInstitution = (inst: Institution) => {
    setEditingInstId(inst.id)
    setInstName(inst.name)
    setInstLogo(inst.logo || "")
    setInstWebsite(inst.website || "")
    setInstCity(inst.city || "")
    setInstCountry(inst.country || "")
    setShowInstModal(true)
  }

  // Soumission Établissement (Créer ou Éditer)
  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instName.trim()) return

    try {
      setInstSaving(true)
      const method = editingInstId ? "PUT" : "POST"
      const payload = {
        id: editingInstId || undefined,
        name: instName,
        logo: instLogo || null,
        website: instWebsite || null,
        city: instCity || null,
        country: instCountry || null,
      }

      const res = await fetch("/api/admin/institutions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.institution) {
        if (editingInstId) {
          setInstitutions((prev) => prev.map((inst) => (inst.id === editingInstId ? data.institution : inst)))
          toast.success("Établissement mis à jour avec succès !")
        } else {
          setInstitutions((prev) => [...prev, data.institution])
          toast.success("Établissement créé avec succès !")
        }
        resetInstForm()
      } else {
        toast.error(data.error || "Erreur d'enregistrement")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la sauvegarde")
    } finally {
      setInstSaving(false)
    }
  }

  // Supprimer un établissement
  const handleDeleteInstitution = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet établissement ?")) return
    try {
      const res = await fetch(`/api/admin/institutions?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setInstitutions((prev) => prev.filter((item) => item.id !== id))
        toast.success("Établissement supprimé.")
      } else {
        toast.error("Erreur lors de la suppression de l'établissement")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la suppression")
    }
  }

  // Soumission Diplôme (Créer ou Éditer)
  const handleSaveDiploma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setSavingDiploma(true)

      const payload = {
        id: editingDiplomaId || undefined,
        title,
        degreeType,
        fieldOfStudy: fieldOfStudy || null,
        description: description || null,
        date: date || null,
        image: image || null,
        url: url || null,
        institutionId: institutionId || null,
        published,
      }

      const method = editingDiplomaId ? "PUT" : "POST"
      const res = await fetch("/api/admin/diplomas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.diploma) {
        toast.success(editingDiplomaId ? "Diplôme mis à jour avec succès !" : "Nouveau diplôme ajouté avec succès !")

        // Rafraîchir immédiatement les diplômes depuis la BDD
        await fetchData()
        resetForm()
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur de connexion")
    } finally {
      setSavingDiploma(false)
    }
  }

  const handleEditDiploma = (dip: Diploma) => {
    setEditingDiplomaId(dip.id)
    setTitle(dip.title)
    setDegreeType(dip.degreeType || "CERTIFICAT")
    setFieldOfStudy(dip.fieldOfStudy || "")
    setDescription(dip.description || "")
    setDate(dip.date || "")
    setImage(dip.image || "")
    setUrl(dip.url || "")
    setInstitutionId(dip.institutionId || "")
    setPublished(dip.published)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDeleteDiploma = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce diplôme ?")) return
    try {
      const res = await fetch(`/api/admin/diplomas?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setDiplomas((prev) => prev.filter((d) => d.id !== id))
        toast.success("Diplôme supprimé.")
      } else {
        toast.error("Erreur lors de la suppression du diplôme")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur réseau lors de la suppression")
    }
  }

  const resetForm = () => {
    setEditingDiplomaId(null)
    setTitle("")
    setDegreeType("CERTIFICAT")
    setFieldOfStudy("")
    setDescription("")
    setDate("")
    setImage("")
    setUrl("")
    setInstitutionId("")
    setPublished(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-background p-8">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Chargement des diplômes et établissements...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* GESTION ÉTABLISSEMENTS / UNIVERSITÉS */}
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Établissements & Universités ({institutions.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Créez les universités ou centres où vous avez obtenu vos diplômes/certificats
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetInstForm()
              setShowInstModal(true)
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            Ajouter un établissement
          </button>
        </div>

        {/* LISTE DES ÉTABLISSEMENTS */}
        <div className="flex flex-wrap gap-3">
          {institutions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">Aucun établissement créé. Cliquez sur "+ Ajouter un établissement".</p>
          ) : (
            institutions.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs shadow-xs"
              >
                {inst.logo ? (
                  <Image src={inst.logo} alt={inst.name} width={28} height={28} className="size-7 object-contain rounded-md" />
                ) : (
                  <Building2 className="size-5 text-muted-foreground" />
                )}
                <div>
                  <span className="font-semibold text-foreground block">{inst.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {inst.city && inst.country ? `${inst.city}, ${inst.country}` : "Aucune localisation"}
                  </span>
                </div>
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditInstitution(inst)}
                    className="cursor-pointer text-muted-foreground hover:text-primary p-1 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteInstitution(inst.id)}
                    className="cursor-pointer text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
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

      {/* MODAL CRÉATION / ÉDITION ÉTABLISSEMENT */}
      {showInstModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto min-h-screen w-full">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                {editingInstId ? "Éditer l'établissement" : "Nouvel Établissement"}
              </h3>
              <button
                type="button"
                onClick={resetInstForm}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitution} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nom de l'université / centre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Université Dakar-Bourguiba"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Ville</label>
                  <input
                    type="text"
                    placeholder="Ex: Dakar"
                    value={instCity}
                    onChange={(e) => setInstCity(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Pays</label>
                  <input
                    type="text"
                    placeholder="Ex: Sénégal"
                    value={instCountry}
                    onChange={(e) => setInstCountry(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Site Web</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={instWebsite}
                  onChange={(e) => setInstWebsite(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Logo Établissement (Supabase Storage)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="URL ou téléverser ci-contre"
                    value={instLogo}
                    onChange={(e) => setInstLogo(e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                    {instUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetInstForm}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={instSaving}
                  className="cursor-pointer rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {instSaving ? "Enregistrement..." : editingInstId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* FORMULAIRE GESTION DIPLÔMES */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* COLONNE GAUCHE: FORMULAIRE */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSaveDiploma} className="rounded-2xl border border-border bg-background p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                {editingDiplomaId ? "Éditer le diplôme" : "Nouveau diplôme"}
              </h3>
              {editingDiplomaId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer text-xs text-muted-foreground hover:underline"
                >
                  Annuler l'édition
                </button>
              )}
            </div>

            {/* TITRE */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Titre du diplôme / certificat *</label>
              <input
                type="text"
                required
                placeholder="Ex: Licence 3 en Génie Logiciel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* TYPE & ÉTABLISSEMENT */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type de diplôme</label>
                <Select value={degreeType} onValueChange={(val) => setDegreeType(val)}>
                  <SelectTrigger className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground">
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {DEGREE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Établissement (optionnel)</label>
                <Select value={institutionId || "none"} onValueChange={(val) => setInstitutionId(val === "none" ? "" : val)}>
                  <SelectTrigger className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground">
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="none">-- Aucun / En ligne --</SelectItem>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* DOMAINE & DATE */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Spécialité / Domaine</label>
                <input
                  type="text"
                  placeholder="Ex: Génie Logiciel"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Année / Période</label>
                <input
                  type="text"
                  placeholder="Ex: 2025"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description / Détails</label>
              <textarea
                rows={3}
                placeholder="Précisez la formation, les compétences acquises ou les projets réalisés..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* IMAGE / ATTESTATION / PDF UPLOAD */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Document / Attestation / Diplôme (Image ou PDF)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="URL de l'image ou du PDF"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                />
                <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                  {imageUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Upload
                  <input
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadImage(file, false)
                    }}
                  />
                </label>
              </div>
            </div>

            {/* LIEN URL */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Lien Web / Vérification</label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground"
              />
            </div>

            {/* PUBLICATION CHECKBOX */}
            <label className="flex cursor-pointer items-center gap-2 text-xs pt-1">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="size-4 rounded border border-input accent-primary"
              />
              <span className="text-foreground">Publier sur le site public</span>
            </label>

            <button
              type="submit"
              disabled={savingDiploma}
              className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-xs"
            >
              {savingDiploma ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Enregistrement...
                </>
              ) : editingDiplomaId ? (
                "Mettre à jour le diplôme"
              ) : (
                "Ajouter le diplôme"
              )}
            </button>
          </form>
        </div>

        {/* COLONNE DROITE: LISTE DES DIPLÔMES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="size-4 text-primary" />
              Diplômes enregistrés ({diplomas.length})
            </h3>
          </div>

          <div className="space-y-3">
            {diplomas.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
                Aucun diplôme enregistré pour le moment.
              </div>
            ) : (
              diplomas.map((dip) => (
                <div
                  key={dip.id}
                  className="group relative rounded-2xl border border-border bg-background p-4 shadow-xs hover:border-primary/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {dip.institution?.logo ? (
                        <Image
                          src={dip.institution.logo}
                          alt={dip.institution.name}
                          width={40}
                          height={40}
                          className="size-10 object-contain rounded-xl bg-muted p-1 border border-border/60 shrink-0"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <GraduationCap className="size-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground truncate">{dip.title}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              dip.degreeType === "LICENCE"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : dip.degreeType === "CERTIFICAT"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}
                          >
                            {dip.degreeType}
                          </span>
                          {!dip.published && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/20">
                              Masqué
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dip.institution?.name || "Sans établissement de rattachement"}
                          {dip.date && ` · ${dip.date}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditDiploma(dip)}
                        className="cursor-pointer text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Éditer"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDiploma(dip.id)}
                        className="cursor-pointer text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {dip.description && (
                    <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2 pl-13">
                      {dip.description}
                    </p>
                  )}

                  {dip.image && (
                    <div className="pl-13 pt-1">
                      <a
                        href={dip.image}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                      >
                        {dip.image.toLowerCase().includes(".pdf") ? (
                          <>
                            <FileText className="size-3.5 text-rose-400" /> Consulter le document PDF
                          </>
                        ) : (
                          <>
                            <ImageIcon className="size-3.5" /> Voir l'attestation / image
                          </>
                        )}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
