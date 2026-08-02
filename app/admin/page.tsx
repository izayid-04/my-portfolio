"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  BookText,
  FilePlus2,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  MessageSquareText,
  PanelLeft,
  Rocket,
  User,
  GraduationCap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { StatusSelect } from "@/components/admin/status-select"
import { DatePicker } from "@/components/ui/date-picker"
import { ProfileTab } from "@/components/admin/profile-tab"
import { DiplomasTab } from "@/components/admin/diplomas-tab"
import { ProjectsTab } from "@/components/admin/projects-tab"
import { OverviewTab } from "@/components/admin/overview-tab"
import {
  ADMIN_KEYS,
  type AdminActivity,
  type AdminProject,
  type AdminSession,
  createId,
  defaultActivities,
  defaultProjects,
  normalizeUrl,
  parseCsv,
  toSlug,
} from "@/data/admin-demo"

type DashboardSection = "overview" | "projects" | "blogs" | "diplomas" | "contacts" | "profile"
type ContentStatus = "draft" | "published" | "archived"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  country_code: string | null
  isRead?: boolean
  repliedAt?: string | null
  created_at: string
}

interface BlogStatusMap {
  [slug: string]: ContentStatus
}

interface DbBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readingTime: number
  tags: string[]
  image?: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

const BLOG_STATUS_KEY = "portfolio_admin_blog_statuses_v1"
const CUSTOM_BLOGS_KEY = "portfolio_admin_custom_blogs_v1"

const statusBadge: Record<ContentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  archived: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
}

const dashboardSections: Array<{ id: DashboardSection; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Vue globale", icon: Activity },
  { id: "projects", label: "Projets", icon: Rocket },
  { id: "blogs", label: "Blogs", icon: BookText },
  { id: "diplomas", label: "Diplômes & Établissements", icon: GraduationCap },
  { id: "contacts", label: "Contacts", icon: MessageSquareText },
  { id: "profile", label: "Profil", icon: User },
]

function formatDate(value: string | null): string {
  if (!value) return "Jamais"
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const value = localStorage.getItem(key)
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeStatus(value: unknown): ContentStatus {
  return value === "published" || value === "archived" || value === "draft" ? value : "draft"
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === "string") return parseCsv(value)
  return []
}

function normalizeProject(raw: unknown): AdminProject | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const title = typeof item.title === "string" ? item.title.trim() : ""
  const summary = typeof item.summary === "string" ? item.summary.trim() : ""
  if (!title || !summary) return null

  const links = Array.isArray(item.links)
    ? item.links
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null
          const link = entry as Record<string, unknown>
          const label = typeof link.label === "string" ? link.label.trim() : ""
          const url = typeof link.url === "string" ? normalizeUrl(link.url) : null
          const type = link.type
          const normalizedType =
            type === "live" || type === "repo" || type === "article" || type === "action" || type === "other"
              ? type
              : "other"
          if (!label || !url) return null
          return { id: createId("l"), label, url, type: normalizedType }
        })
        .filter((value): value is AdminProject["links"][number] => value !== null)
    : []

  const legacyHref = typeof item.href === "string" ? normalizeUrl(item.href) : null
  if (legacyHref && !links.some((link) => link.url === legacyHref)) {
    links.push({ id: createId("l"), label: "Site live", url: legacyHref, type: "live" })
  }

  return {
    id: typeof item.id === "string" && item.id ? item.id : createId("p"),
    slug: typeof item.slug === "string" && item.slug ? item.slug : toSlug(title),
    title,
    summary,
    description: typeof item.description === "string" ? item.description : undefined,
    stack: asStringList(item.stack),
    tags: asStringList(item.tags),
    coverImage:
      (typeof item.coverImage === "string" ? normalizeUrl(item.coverImage) : null) ??
      (typeof item.image === "string" ? normalizeUrl(item.image) : null) ??
      undefined,
    links,
    status: normalizeStatus(item.status),
    publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : null,
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview")
  const [formError, setFormError] = useState("")

  const [projects, setProjects] = useState<AdminProject[]>([])
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [blogStatuses, setBlogStatuses] = useState<BlogStatusMap>({})

  // Blogs now managed from DB
  const [dbBlogs, setDbBlogs] = useState<DbBlogPost[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [blogsReloadToken, setBlogsReloadToken] = useState(0)
  const [blogSaving, setBlogSaving] = useState(false)
  const [blogSaveStatus, setBlogSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)

  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsInfo, setContactsInfo] = useState("")
  const [contactsReloadToken, setContactsReloadToken] = useState(0)

  const [projectTitle, setProjectTitle] = useState("")
  const [projectSummary, setProjectSummary] = useState("")
  const [projectStack, setProjectStack] = useState("")
  const [projectTags, setProjectTags] = useState("")
  const [projectCoverImage, setProjectCoverImage] = useState("")
  const [projectLiveUrl, setProjectLiveUrl] = useState("")
  const [projectRepoUrl, setProjectRepoUrl] = useState("")

  const [blogTitle, setBlogTitle] = useState("")
  const [blogExcerpt, setBlogExcerpt] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [blogImage, setBlogImage] = useState("")
  const [blogTags, setBlogTags] = useState("")
  const [blogReadingTime, setBlogReadingTime] = useState("5")
  const [blogDate, setBlogDate] = useState(new Date().toISOString().slice(0, 10))
  const [blogPublished, setBlogPublished] = useState(false)
  const [uploadingProjectImage, setUploadingProjectImage] = useState(false)
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false)

  const [replyText, setReplyText] = useState("")
  const [replySubject, setReplySubject] = useState("")
  const [replySending, setReplySending] = useState(false)
  const [replyStatus, setReplyStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [contactFilter, setContactFilter] = useState<"all" | "unread" | "replied">("all")
  const [contactSearch, setContactSearch] = useState("")

  const toggleReadStatus = async (contactId: string, currentReadStatus: boolean) => {
    const nextReadState = !currentReadStatus
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isRead: nextReadState } : c))
    )
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: nextReadState }),
      })
      if (!response.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, isRead: currentReadStatus } : c))
        )
      }
    } catch (e) {
      console.error("Erreur toggle status read:", e)
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, isRead: currentReadStatus } : c))
      )
    }
  }

  const handleSendReply = async (e: React.FormEvent, contactId: string) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setReplySending(true)
    setReplyStatus(null)

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replyMessage: replyText,
          subject: replySubject || `Re: Votre message sur le Portfolio — Ali Izayid`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReplyStatus({ type: "error", text: data.error || "Erreur lors de l'envoi de la réponse." })
      } else {
        setReplyStatus({ type: "success", text: "Réponse envoyée avec succès par email !" })
        setReplyText("")
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? { ...c, isRead: true, repliedAt: new Date().toISOString() }
              : c
          )
        )
      }
    } catch {
      setReplyStatus({ type: "error", text: "Erreur réseau lors de l'envoi." })
    } finally {
      setReplySending(false)
    }
  }

  useEffect(() => {
    const rawSession = localStorage.getItem(ADMIN_KEYS.session)
    if (!rawSession) {
      router.replace("/admin/login")
      return
    }

    try {
      setSession(JSON.parse(rawSession) as AdminSession)
      const normalizedProjects = readStorage<unknown[]>(ADMIN_KEYS.projects, defaultProjects)
        .map(normalizeProject)
        .filter((item): item is AdminProject => item !== null)

      setProjects(normalizedProjects.length ? normalizedProjects : defaultProjects)
      setActivities(readStorage(ADMIN_KEYS.activities, defaultActivities))
      setBlogStatuses(readStorage<BlogStatusMap>(BLOG_STATUS_KEY, {}))
      setReady(true)
    } catch {
      localStorage.removeItem(ADMIN_KEYS.session)
      router.replace("/admin/login")
    }
  }, [router])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(ADMIN_KEYS.projects, JSON.stringify(projects))
  }, [projects, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(ADMIN_KEYS.activities, JSON.stringify(activities))
  }, [activities, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(BLOG_STATUS_KEY, JSON.stringify(blogStatuses))
  }, [blogStatuses, ready])

  // Load blogs from DB
  useEffect(() => {
    if (!ready) return
    const loadBlogs = async () => {
      setBlogsLoading(true)
      try {
        const res = await fetch("/api/admin/blogs")
        const data = (await res.json()) as { posts?: DbBlogPost[] }
        setDbBlogs(data.posts ?? [])
      } catch {
        setDbBlogs([])
      } finally {
        setBlogsLoading(false)
      }
    }
    void loadBlogs()
  }, [ready, blogsReloadToken])

  useEffect(() => {
    if (!ready || activeSection !== "contacts") return
    const loadContacts = async () => {
      setContactsLoading(true)
      setContactsInfo("")
      try {
        const response = await fetch("/api/admin/contacts", { method: "GET" })
        const payload = (await response.json()) as {
          items?: ContactMessage[]
          source?: string
          warning?: string
        }
        setContacts(payload.items ?? [])
        setContactsInfo(payload.source === "supabase" ? "Source: Supabase" : payload.warning ?? "Mode UI uniquement")
      } catch {
        setContacts([])
        setContactsInfo("Impossible de charger les contacts pour le moment.")
      } finally {
        setContactsLoading(false)
      }
    }
    void loadContacts()
  }, [activeSection, contactsReloadToken, ready])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId]
  )

  const selectedBlog = useMemo(
    () => dbBlogs.find((post) => post.id === selectedBlogId) ?? dbBlogs[0] ?? null,
    [dbBlogs, selectedBlogId]
  )
  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0] ?? null,
    [contacts, selectedContactId]
  )

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const query = contactSearch.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.message && c.message.toLowerCase().includes(query))
      if (!matchesSearch) return false

      if (contactFilter === "unread") return !c.isRead
      if (contactFilter === "replied") return Boolean(c.repliedAt)
      return true
    })
  }, [contacts, contactSearch, contactFilter])

  const unreadContactsCount = useMemo(() => contacts.filter((c) => !c.isRead).length, [contacts])

  const stats = useMemo(() => {
    const publishedProjects = projects.filter((project) => project.status === "published").length
    const publishedBlogs = dbBlogs.filter((p) => p.published).length
    return {
      projectsTotal: projects.length,
      blogsTotal: dbBlogs.length,
      contactsTotal: contacts.length,
      publishedProjects,
      publishedBlogs,
    }
  }, [projects, dbBlogs, contacts.length])

  const addActivity = (message: string) => {
    setActivities((prev) => [{ id: createId("a"), message, at: new Date().toISOString() }, ...prev.slice(0, 19)])
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch {}
    localStorage.removeItem(ADMIN_KEYS.session)
    router.replace("/admin/login")
  }

  const handleAddProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!projectTitle.trim() || !projectSummary.trim()) {
      setFormError("Le titre et le resume sont obligatoires.")
      return
    }

    const coverImage = normalizeUrl(projectCoverImage)
    const liveUrl = normalizeUrl(projectLiveUrl)
    const repoUrl = normalizeUrl(projectRepoUrl)
    if (projectCoverImage.trim() && !coverImage) return setFormError("Image de couverture invalide.")
    if (projectLiveUrl.trim() && !liveUrl) return setFormError("Lien live invalide.")
    if (projectRepoUrl.trim() && !repoUrl) return setFormError("Lien repository invalide.")

    const newProject: AdminProject = {
      id: createId("p"),
      slug: toSlug(projectTitle),
      title: projectTitle.trim(),
      summary: projectSummary.trim(),
      stack: parseCsv(projectStack),
      tags: parseCsv(projectTags),
      coverImage: coverImage ?? undefined,
      links: [
        ...(liveUrl ? [{ id: createId("l"), label: "Site live", url: liveUrl, type: "live" as const }] : []),
        ...(repoUrl ? [{ id: createId("l"), label: "Repository", url: repoUrl, type: "repo" as const }] : []),
      ],
      status: "draft",
      publishedAt: null,
    }

    setProjects((prev) => [newProject, ...prev])
    setSelectedProjectId(newProject.id)
    addActivity(`Projet ajoute en brouillon: ${newProject.title}`)
    setProjectTitle("")
    setProjectSummary("")
    setProjectStack("")
    setProjectTags("")
    setProjectCoverImage("")
    setProjectLiveUrl("")
    setProjectRepoUrl("")
  }

  const handleAddBlog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setBlogSaveStatus(null)

    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      setFormError("Titre, extrait et contenu sont obligatoires.")
      return
    }

    const image = normalizeUrl(blogImage)
    if (blogImage.trim() && !image) return setFormError("Image du blog invalide.")

    const readingTimeNumber = Number(blogReadingTime)
    setBlogSaving(true)
    try {
      const url = editingBlogId ? `/api/admin/blogs/${editingBlogId}` : "/api/admin/blogs"
      const method = editingBlogId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle.trim(),
          excerpt: blogExcerpt.trim(),
          content: blogContent.trim(),
          date: blogDate || new Date().toISOString().slice(0, 10),
          readingTime: Number.isFinite(readingTimeNumber) && readingTimeNumber > 0 ? readingTimeNumber : 5,
          tags: parseCsv(blogTags),
          image: image || null,
          published: blogPublished,
        }),
      })
      const data = (await res.json()) as { post?: DbBlogPost; error?: string }
      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la sauvegarde.")
      } else {
        setBlogSaveStatus({
          type: "success",
          text: editingBlogId ? "Article mis à jour avec succès !" : "Article créé et enregistré en base de données !",
        })
        addActivity(editingBlogId ? `Blog modifié : ${blogTitle}` : `Blog créé : ${blogTitle}`)
        setBlogsReloadToken((p) => p + 1)
        if (!editingBlogId) {
          setBlogTitle("")
          setBlogExcerpt("")
          setBlogContent("")
          setBlogImage("")
          setBlogTags("")
          setBlogReadingTime("5")
          setBlogDate(new Date().toISOString().slice(0, 10))
          setBlogPublished(false)
        } else {
          setEditingBlogId(null)
        }
        if (data.post) setSelectedBlogId(data.post.id)
      }
    } catch {
      setFormError("Erreur réseau lors de la sauvegarde.")
    } finally {
      setBlogSaving(false)
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Supprimer définitivement cet article de la base de données ?")) return
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
      addActivity("Article supprimé de la base de données.")
      setBlogsReloadToken((p) => p + 1)
      setSelectedBlogId(null)
    } catch {
      alert("Erreur lors de la suppression.")
    }
  }

  const handleEditBlog = (blog: DbBlogPost) => {
    setEditingBlogId(blog.id)
    setBlogTitle(blog.title)
    setBlogExcerpt(blog.excerpt)
    setBlogContent(blog.content)
    setBlogImage(blog.image ?? "")
    setBlogTags(blog.tags.join(", "))
    setBlogReadingTime(String(blog.readingTime))
    setBlogDate(blog.date.slice(0, 10))
    setBlogPublished(blog.published)
    setBlogSaveStatus(null)
    setFormError("")
  }

  const handleToggleBlogPublished = async (blog: DbBlogPost) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !blog.published }),
      })
      if (res.ok) {
        setDbBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, published: !blog.published } : b)))
        addActivity(`Article ${!blog.published ? "publié" : "dépublié"} : ${blog.title}`)
      }
    } catch {
      alert("Erreur lors de la mise à jour du statut.")
    }
  }

  const handleUpload = async (file: File, folder: "projects" | "blogs"): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    })

    const payload = (await response.json()) as { url?: string; error?: string }
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Echec upload image.")
    }

    return payload.url
  }

  const onProjectFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFormError("")
    setUploadingProjectImage(true)
    try {
      const uploadedUrl = await handleUpload(file, "projects")
      if (uploadedUrl) {
        setProjectCoverImage(uploadedUrl)
      }
    } catch {
      setFormError("Upload image projet impossible pour le moment.")
    } finally {
      setUploadingProjectImage(false)
      event.target.value = ""
    }
  }

  const onBlogFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFormError("")
    setUploadingBlogImage(true)
    try {
      const uploadedUrl = await handleUpload(file, "blogs")
      if (uploadedUrl) {
        setBlogImage(uploadedUrl)
      }
    } catch {
      setFormError("Upload image blog impossible pour le moment.")
    } finally {
      setUploadingBlogImage(false)
      event.target.value = ""
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-muted/20 p-6">
        <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Chargement du dashboard...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="p-2 lg:p-1">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PanelLeft className="size-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
              <p className="text-sm font-semibold text-foreground">Portfolio Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {dashboardSections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveSection(id)
                  setFormError("")
                }}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  activeSection === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 text-xs text-muted-foreground">
            Connecte: <span className="font-medium text-foreground">{session?.email}</span>
          </div>
        </aside>

        <section className="min-h-[84vh]">
          <header className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Dashboard administrateur</h1>
              <p className="text-sm text-muted-foreground">Interface pro de publication</p>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler
                aria-label="Changer le theme"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted [&_svg]:size-4"
              />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <LogOut className="size-4" />
                Deconnexion
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {activeSection === "overview" && (
              <OverviewTab onNavigateSection={(section) => setActiveSection(section)} />
            )}

            {activeSection === "projects" && <ProjectsTab />}

            {activeSection === "blogs" && (
              <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr] min-w-0">
                {/* LEFT: FORM + LIST */}
                <div className="space-y-4 min-w-0">

                  {/* FORM CREATE / EDIT */}
                  <form onSubmit={handleAddBlog} className="grid gap-3 rounded-2xl border border-border bg-background p-4 min-w-0">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground truncate">
                        <FilePlus2 className="size-4 shrink-0" />
                        {editingBlogId ? "Modifier l'article" : "Créer un nouvel article"}
                      </p>
                      {editingBlogId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlogId(null)
                            setBlogTitle(""); setBlogExcerpt(""); setBlogContent("")
                            setBlogImage(""); setBlogTags(""); setBlogReadingTime("5")
                            setBlogDate(new Date().toISOString().slice(0, 10))
                            setBlogPublished(false); setBlogSaveStatus(null); setFormError("")
                          }}
                          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                          ← Annuler
                        </button>
                      )}
                    </div>

                    <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Titre de l'article *" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <textarea value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} placeholder="Extrait / résumé *" rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Contenu en Markdown *" rows={6} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" />

                    <div className="space-y-2 min-w-0">
                      <label className="text-xs font-medium text-muted-foreground">Image de couverture (upload)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onBlogFileChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                      />
                      {uploadingBlogImage && (
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          Upload en cours...
                        </p>
                      )}
                      {blogImage && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2 min-w-0 overflow-hidden">
                          <img src={blogImage} alt="" className="size-10 rounded-md object-cover shrink-0" />
                          <p className="truncate text-xs text-muted-foreground min-w-0 flex-1 font-mono">{blogImage}</p>
                          <button type="button" onClick={() => setBlogImage("")} className="cursor-pointer shrink-0 text-xs text-destructive hover:underline ml-1">Retirer</button>
                        </div>
                      )}
                    </div>

                    <input value={blogTags} onChange={(e) => setBlogTags(e.target.value)} placeholder="Tags séparés par des virgules" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={blogReadingTime} onChange={(e) => setBlogReadingTime(e.target.value)} placeholder="Temps de lecture (min)" type="number" min="1" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                      <DatePicker value={blogDate} onChange={setBlogDate} placeholder="Date de publication" />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={blogPublished}
                        onChange={(e) => setBlogPublished(e.target.checked)}
                        className="size-4 rounded border border-input accent-primary"
                      />
                      <span className="text-foreground">Publier immédiatement (visible sur le site)</span>
                    </label>

                    {formError && <p className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">{formError}</p>}

                    {blogSaveStatus && (
                      <p className={`rounded-lg px-3 py-2 text-sm border ${
                        blogSaveStatus.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}>
                        {blogSaveStatus.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={blogSaving}
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {blogSaving ? <><Loader2 className="size-3.5 animate-spin" /> Sauvegarde...</> : editingBlogId ? "Mettre à jour l'article" : "Créer l'article en DB"}
                    </button>
                  </form>

                  {/* LIST OF DB BLOGS - COMPACT 2-COLUMN GRID */}
                  <div className="rounded-2xl border border-border bg-background p-4 min-w-0">
                    <div className="mb-3 flex items-center justify-between min-w-0">
                      <h2 className="text-sm font-semibold text-foreground truncate">
                        Articles en base de données
                        <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{dbBlogs.length}</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => setBlogsReloadToken((p) => p + 1)}
                        className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted font-medium transition-colors shrink-0"
                      >
                        Rafraîchir
                      </button>
                    </div>

                    {blogsLoading ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">Chargement des articles...</p>
                    ) : dbBlogs.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">Aucun article en base de données. Créez-en un ci-dessus.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                        {dbBlogs.map((post) => (
                          <article
                            key={post.id}
                            onClick={() => setSelectedBlogId(post.id)}
                            className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all min-w-0 ${
                              selectedBlog?.id === post.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border bg-background hover:bg-muted/40"
                            }`}
                          >
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                                  post.published
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}>
                                  {post.published ? "Publié" : "Brouillon"}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(post.date)}</span>
                              </div>

                              <div className="flex items-start gap-2.5 min-w-0">
                                {post.image ? (
                                  <img src={post.image} alt="" className="size-10 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                                    <ImageIcon className="size-4" />
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-xs text-foreground truncate">{post.title}</p>
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{post.excerpt}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-1 text-[11px] shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] text-muted-foreground">{post.readingTime} min</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlogPublished(post)}
                                  className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                    post.published
                                      ? "border border-border bg-background text-foreground hover:bg-muted"
                                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                                  }`}
                                >
                                  {post.published ? "Dépublier" : "Publier"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditBlog(post)}
                                  className="cursor-pointer rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium hover:bg-muted"
                                >
                                  Éditer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlog(post.id)}
                                  className="cursor-pointer rounded bg-destructive/10 border border-destructive/30 px-1.5 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/20"
                                >
                                  Suppr.
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: DETAIL PANEL */}
                <aside className="lg:sticky lg:top-2 self-start rounded-2xl border border-border bg-background p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <h2 className="text-sm font-semibold mb-3">Aperçu de l'article</h2>
                  {selectedBlog ? (
                    <div className="space-y-3 text-sm">
                      {selectedBlog.image && (
                        <img src={selectedBlog.image} alt="" className="h-40 w-full rounded-xl object-cover" />
                      )}
                      <div>
                        <p className="font-bold text-base text-foreground">{selectedBlog.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">/{selectedBlog.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selectedBlog.published
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {selectedBlog.published ? "Publié" : "Brouillon"}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(selectedBlog.date)}</span>
                        <span className="text-xs text-muted-foreground">{selectedBlog.readingTime} min de lecture</span>
                      </div>
                      <p className="text-muted-foreground italic">{selectedBlog.excerpt}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedBlog.tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">Contenu (Markdown preview) :</p>
                        <pre className="text-xs whitespace-pre-wrap text-foreground leading-relaxed max-h-64 overflow-y-auto">
                          {selectedBlog.content.slice(0, 2000)}{selectedBlog.content.length > 2000 ? "..." : ""}
                        </pre>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Modifié le : {formatDate(selectedBlog.updatedAt)}</p>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-xs text-muted-foreground">Sélectionnez un article dans la liste pour voir les détails.</p>
                  )}
                </aside>
              </div>
            )}



            {activeSection === "contacts" && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
                {/* LISTE DES MESSAGES ET FILTRES */}
                <div className="flex flex-col rounded-2xl border border-border bg-background p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        Messages de contact
                        {unreadContactsCount > 0 && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                            {unreadContactsCount} non lu{unreadContactsCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-muted-foreground">{contactsInfo}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContactsReloadToken((prev) => prev + 1)}
                      className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted font-medium text-foreground transition-colors"
                    >
                      Rafraîchir
                    </button>
                  </div>

                  {/* RECHERCHE ET FILTRES */}
                  <div className="mb-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email ou mot clé..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />

                    <div className="flex gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setContactFilter("all")}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 transition-colors ${
                          contactFilter === "all"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Tous ({contacts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactFilter("unread")}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 transition-colors ${
                          contactFilter === "unread"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Non lus ({unreadContactsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactFilter("replied")}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 transition-colors ${
                          contactFilter === "replied"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Répondus ({contacts.filter((c) => c.repliedAt).length})
                      </button>
                    </div>
                  </div>

                  {contactsLoading ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Chargement des messages...</p>
                  ) : filteredContacts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Aucun message ne correspond à vos critères.
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedContact?.id === contact.id
                        const isUnread = !contact.isRead
                        return (
                          <div
                            key={contact.id}
                            onClick={() => setSelectedContactId(contact.id)}
                            className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : isUnread
                                ? "border-violet-500/40 bg-violet-500/5 hover:border-violet-500/60"
                                : "border-border bg-background hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {contact.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  title={contact.isRead ? "Marquer comme non lu" : "Marquer comme lu"}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    void toggleReadStatus(contact.id, Boolean(contact.isRead))
                                  }}
                                  className={`cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                                    contact.isRead
                                      ? "bg-muted/80 text-muted-foreground hover:bg-muted"
                                      : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                                  }`}
                                >
                                  {contact.isRead ? "Lu" : "Non lu"}
                                </button>
                                {contact.repliedAt && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    Répondu
                                  </span>
                                )}
                                <span className="text-[11px] text-muted-foreground">{formatDate(contact.created_at)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{contact.email}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-foreground/80">
                              {contact.message || "Aucun texte..."}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* DETAIL DU MESSAGE ET REPONSE EN DIRECT */}
                <aside className="flex flex-col rounded-2xl border border-border bg-background p-4">
                  <h2 className="text-sm font-semibold text-foreground mb-3">Détail & Réponse directe</h2>

                  {selectedContact ? (
                    <div className="flex flex-col gap-4">
                      {/* INFORMATIONS SENDER */}
                      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-foreground">{selectedContact.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleReadStatus(selectedContact.id, Boolean(selectedContact.isRead))}
                              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                selectedContact.isRead
                                  ? "border border-border bg-background text-foreground hover:bg-muted"
                                  : "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                              }`}
                            >
                              {selectedContact.isRead ? "✉️ Marquer comme non lu" : "✓ Marquer comme lu"}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-muted-foreground">
                          <p>Email: <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline font-mono">{selectedContact.email}</a></p>
                          <p>Téléphone: <span className="text-foreground">{selectedContact.phone || "Non fourni"}</span></p>
                          <p>Pays: <span className="text-foreground">{selectedContact.country_code || "N/A"}</span></p>
                          <p>Reçu le: <span className="text-foreground">{formatDate(selectedContact.created_at)}</span></p>
                        </div>
                      </div>

                      {/* CONTENU DU MESSAGE */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message reçu :</p>
                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedContact.message || "Aucun contenu de message."}
                        </div>
                      </div>

                      {/* STATUT DE REPONSE */}
                      {selectedContact.repliedAt && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                          ✓ Réponse envoyée le {formatDate(selectedContact.repliedAt)}
                        </div>
                      )}

                      {/* FORMULAIRE DE REPONSE DIRECTE PAR EMAIL */}
                      <form
                        onSubmit={(e) => handleSendReply(e, selectedContact.id)}
                        className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
                      >
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          ✉️ Répondre directement à {selectedContact.name} via Resend
                        </h4>

                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Sujet de l'email :
                          </label>
                          <input
                            type="text"
                            value={replySubject || `Re: Votre message sur le Portfolio — Ali Izayid`}
                            onChange={(e) => setReplySubject(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                            Votre message de réponse :
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Rédigez votre réponse ici..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        {replyStatus && (
                          <div
                            className={`rounded-lg p-2.5 text-xs ${
                              replyStatus.type === "success"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-destructive/10 border border-destructive/30 text-destructive"
                            }`}
                          >
                            {replyStatus.text}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={replySending || !replyText.trim()}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {replySending ? "Envoi en cours..." : "Envoyer la réponse par email"}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      Sélectionnez un message dans la liste à gauche pour lire et répondre.
                    </div>
                  )}
                </aside>
              </div>
            )}

            {activeSection === "diplomas" && <DiplomasTab />}

            {activeSection === "profile" && (
              <ProfileTab
                onProfileUpdated={(updatedUser) => {
                  setSession((prev) => (prev ? { ...prev, email: updatedUser.email } : null))
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
