"use client"

import * as React from "react"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, User, UserCheck } from "lucide-react"

interface ProfileUser {
  id: string
  name: string | null
  email: string
  role: string
  createdAt?: string
}

interface ProfileTabProps {
  onProfileUpdated?: (user: ProfileUser) => void
}

export function ProfileTab({ onProfileUpdated }: ProfileTabProps) {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Form states
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  // UI toggles & status
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)

  // Fetch initial profile data
  const fetchProfile = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/profile")
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setName(data.user.name || "")
          setEmail(data.user.email || "")
        }
      }
    } catch (err) {
      console.error("Erreur de chargement du profil", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.")
      return
    }

    if (newPassword && newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit comporter au moins 8 caractères.")
      return
    }

    try {
      setSaving(true)
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Une erreur est survenue lors de la mise à jour.")
      } else {
        toast.success("Profil mis à jour avec succès !")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        if (onProfileUpdated && data.user) {
          onProfileUpdated(data.user)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Erreur de connexion au serveur.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-background p-8">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Chargement du profil...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* HEADER AVATAR / INFO CARD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <User className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground truncate">{name || "Administrateur"}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="size-3" />
              Compte ADMIN
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
        {/* SECTION 1: INFORMATIONS PERSONNELLES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <UserCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Informations personnelles</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Adresse Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@domaine.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SÉCURITÉ & MOT DE PASSE */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <KeyRound className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Modifier le mot de passe (optionnel)</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Obligatoire uniquement si vous changez de mot de passe"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8 caractères min."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirmer le nouveau mot de passe</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
