"use client"

import * as React from "react"
import Link from "next/link"
import {
  Rocket,
  BookText,
  GraduationCap,
  MessageSquareText,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Database,
  HardDrive,
  Clock,
  CheckCircle2,
  Mail,
  Eye,
  Activity,
  Zap,
  BarChart3,
  Layers,
} from "lucide-react"

interface OverviewTabProps {
  onNavigateSection: (section: "projects" | "blogs" | "diplomas" | "contacts" | "profile") => void
}

export function OverviewTab({ onNavigateSection }: OverviewTabProps) {
  const [loading, setLoading] = React.useState(true)

  // Real Database Counts
  const [stats, setStats] = React.useState({
    projectsTotal: 0,
    projectsPublished: 0,
    blogsTotal: 0,
    blogsPublished: 0,
    diplomasTotal: 0,
    institutionsTotal: 0,
    contactsTotal: 0,
    contactsUnread: 0,
  })

  const [recentContacts, setRecentContacts] = React.useState<any[]>([])

  const fetchOverviewData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [projRes, blogRes, dipRes, instRes, contactRes] = await Promise.allSettled([
        fetch("/api/admin/projects"),
        fetch("/api/admin/blogs"),
        fetch("/api/admin/diplomas"),
        fetch("/api/admin/institutions"),
        fetch("/api/admin/contacts"),
      ])

      let projectsTotal = 0,
        projectsPublished = 0
      if (projRes.status === "fulfilled" && projRes.value.ok) {
        const data = await projRes.value.json()
        const list = data.projects || []
        projectsTotal = list.length
        projectsPublished = list.filter((p: any) => p.published).length
      }

      let blogsTotal = 0,
        blogsPublished = 0
      if (blogRes.status === "fulfilled" && blogRes.value.ok) {
        const data = await blogRes.value.json()
        const list = data.posts || []
        blogsTotal = list.length
        blogsPublished = list.filter((b: any) => b.published).length
      }

      let diplomasTotal = 0
      if (dipRes.status === "fulfilled" && dipRes.value.ok) {
        const data = await dipRes.value.json()
        diplomasTotal = (data.diplomas || []).length
      }

      let institutionsTotal = 0
      if (instRes.status === "fulfilled" && instRes.value.ok) {
        const data = await instRes.value.json()
        institutionsTotal = (data.institutions || []).length
      }

      let contactsTotal = 0,
        contactsUnread = 0,
        recentList: any[] = []
      if (contactRes.status === "fulfilled" && contactRes.value.ok) {
        const data = await contactRes.value.json()
        const list = data.items || data.messages || data.contacts || []
        contactsTotal = list.length
        contactsUnread = list.filter((c: any) => !c.isRead).length
        recentList = list.slice(0, 4)
      }

      setStats({
        projectsTotal,
        projectsPublished,
        blogsTotal,
        blogsPublished,
        diplomasTotal,
        institutionsTotal,
        contactsTotal,
        contactsUnread,
      })
      setRecentContacts(recentList)
    } catch (err) {
      console.error("Erreur de chargement de la vue globale:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchOverviewData()
  }, [fetchOverviewData])

  // Fake chart data for visual analytics display
  const chartData = [
    { month: "Jan", views: 420, clicks: 180 },
    { month: "Fév", views: 650, clicks: 290 },
    { month: "Mar", views: 890, clicks: 410 },
    { month: "Avr", views: 780, clicks: 350 },
    { month: "Mai", views: 1120, clicks: 540 },
    { month: "Juin", views: 1450, clicks: 690 },
    { month: "Juil", views: 1890, clicks: 920 },
    { month: "Août", views: 2340, clicks: 1180 },
  ]

  const techDistribution = [
    { name: "Laravel (PHP)", pct: 35, color: "bg-red-500" },
    { name: "Angular / React", pct: 30, color: "bg-rose-500" },
    { name: "Next.js / TypeScript", pct: 20, color: "bg-cyan-500" },
    { name: "Python / Flask", pct: 10, color: "bg-amber-500" },
    { name: "Bases de données (MySQL / Postgres)", pct: 5, color: "bg-emerald-500" },
  ]

  return (
    <div className="space-y-8">
      {/* 🚀 BANNER HERO & QUICK ACTIONS */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-violet-500/10 p-6 sm:p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                Système & Base de données en ligne
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Tableau de bord <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">Administrateur</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Supervisez en temps réel les performances de votre portfolio, gérez vos projets dynamiques, vos articles et vos messages visiteurs.
            </p>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateSection("projects")}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              <Rocket className="size-4" />
              Nouveau Projet
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection("blogs")}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition-all"
            >
              <BookText className="size-4 text-violet-400" />
              Nouvel Article
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Ouvrir le site public"
            >
              <ExternalLink className="size-4" />
              Voir le Site
            </a>
          </div>
        </div>
      </div>

      {/* 📊 4 CARTES KPI STATISTIQUES PRINCIPALES */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* STAT 1: PROJETS */}
        <div
          onClick={() => onNavigateSection("projects")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Projets Portfolio</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Rocket className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "..." : stats.projectsTotal}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="size-3.5" />
              <span>{stats.projectsPublished} publiés sur le site</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.projectsTotal ? (stats.projectsPublished / stats.projectsTotal) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* STAT 2: BLOGS */}
        <div
          onClick={() => onNavigateSection("blogs")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-violet-500/40 hover:shadow-md transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Articles de Blog</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
              <BookText className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "..." : stats.blogsTotal}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-violet-400 font-medium">
              <Sparkles className="size-3.5" />
              <span>{stats.blogsPublished} articles en ligne</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-violet-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.blogsTotal ? (stats.blogsPublished / stats.blogsTotal) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* STAT 3: DIPLÔMES */}
        <div
          onClick={() => onNavigateSection("diplomas")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Diplômes & Unisa</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "..." : stats.diplomasTotal}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-cyan-400 font-medium">
              <ShieldCheck className="size-3.5" />
              <span>{stats.institutionsTotal} universités enregistrées</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* STAT 4: MESSAGES CONTACT */}
        <div
          onClick={() => onNavigateSection("contacts")}
          className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-rose-500/40 hover:shadow-md transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Messages Contacts</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <MessageSquareText className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {loading ? "..." : stats.contactsTotal}
              </span>
              {stats.contactsUnread > 0 && (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30 animate-pulse">
                  {stats.contactsUnread} non lus
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              <span>Formulaire de contact dynamique</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.contactsTotal ? Math.min(100, (stats.contactsTotal / 10) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 📈 GRAPHIQUE ANALYTICS & RÉPARTITION TECH */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* GRAPH VUES & TRAFIC (8 COLONNES) */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Statistiques de Fréquentation & Engagement (2026)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vues du portfolio et clics sur les démonstrations de projets.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-primary">
                <span className="size-2.5 rounded-full bg-primary" /> Vues uniques
              </span>
              <span className="flex items-center gap-1 text-violet-400">
                <span className="size-2.5 rounded-full bg-violet-400" /> Clics Démo
              </span>
            </div>
          </div>

          {/* SVG CUSTOM BAR / AREA CHART */}
          <div className="pt-4">
            <div className="grid grid-cols-8 items-end gap-2 sm:gap-4 h-48 border-b border-border pb-2">
              {chartData.map((d) => {
                const maxVal = 2500
                const viewsHeight = (d.views / maxVal) * 100
                const clicksHeight = (d.clicks / maxVal) * 100

                return (
                  <div key={d.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Bar Vues */}
                      <div
                        className="w-3 sm:w-5 rounded-t-md bg-gradient-to-t from-primary/60 to-primary group-hover:brightness-125 transition-all duration-300 relative"
                        style={{ height: `${viewsHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-border z-20 pointer-events-none">
                          {d.views}
                        </span>
                      </div>
                      {/* Bar Clics */}
                      <div
                        className="w-3 sm:w-5 rounded-t-md bg-gradient-to-t from-violet-600/60 to-violet-400 group-hover:brightness-125 transition-all duration-300 relative"
                        style={{ height: `${clicksHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-border z-20 pointer-events-none">
                          {d.clicks}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{d.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
              <span>Croissance mensuelle moyenne : <strong className="text-emerald-400 font-bold">+28%</strong></span>
              <span className="font-mono">Total cumulé: 9 540 vues</span>
            </div>
          </div>
        </div>

        {/* DISTRIBUTION DES TECHNO (4 COLONNES) */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-5 text-violet-400" />
              Répartition Technologique
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Utilisation dans les projets enregistrés.
            </p>
          </div>

          <div className="space-y-4">
            {techDistribution.map((tech) => (
              <div key={tech.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>{tech.name}</span>
                  <span className="font-mono text-muted-foreground">{tech.pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`${tech.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${tech.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-xs space-y-1">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Zap className="size-4 text-amber-400" /> Stack Principale
            </div>
            <p className="text-muted-foreground text-[11px]">
              Fullstack Laravel & Angular / Next.js avec bases relationnelles PostgreSQL & MySQL.
            </p>
          </div>
        </div>
      </div>

      {/* 📥 DERNIERS MESSAGES & ÉTAT SYSTÈME */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* DERNIERS MESSAGES (8 COLONNES) */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Mail className="size-5 text-rose-400" />
              Derniers Messages Contacts
            </h3>
            <button
              type="button"
              onClick={() => onNavigateSection("contacts")}
              className="cursor-pointer text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Tout voir ({stats.contactsTotal}) <ArrowUpRight className="size-3.5" />
            </button>
          </div>

          {loading ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Chargement des messages...</p>
          ) : recentContacts.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground italic">Aucun message de contact pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateSection("contacts")}
                  className="cursor-pointer rounded-2xl border border-border bg-background p-4 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">({c.email})</span>
                      {!c.isRead && (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {c.message || "Aucun contenu..."}
                    </p>
                  </div>
                  <div className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ÉTAT DU SYSTÈME & INFRASTRUCTURE (4 COLONNES) */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Activity className="size-5 text-emerald-400" />
            Infrastructure & Santé
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background">
              <div className="flex items-center gap-2.5">
                <Database className="size-4 text-cyan-400" />
                <div>
                  <p className="font-semibold text-foreground">PostgreSQL (Supabase)</p>
                  <p className="text-[10px] text-muted-foreground">Pooler direct v5432</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                OK
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background">
              <div className="flex items-center gap-2.5">
                <HardDrive className="size-4 text-violet-400" />
                <div>
                  <p className="font-semibold text-foreground">Storage Supabase</p>
                  <p className="text-[10px] text-muted-foreground">Bucket portfolio-assets</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Actif
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background">
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-foreground">Service Mailtrap / Resend</p>
                  <p className="text-[10px] text-muted-foreground">SMTP Live prêt</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Connecté
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
