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
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { StatusSelect } from "@/components/admin/status-select"
import { blogPosts } from "@/data/blog"
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
import type { BlogPost } from "@/types"

type DashboardSection = "overview" | "projects" | "blogs" | "contacts"
type ContentStatus = "draft" | "published" | "archived"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  country_code: string | null
  created_at: string
}

interface BlogStatusMap {
  [slug: string]: ContentStatus
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
  { id: "contacts", label: "Contacts", icon: MessageSquareText },
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

function normalizeBlog(raw: unknown): BlogPost | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const title = typeof item.title === "string" ? item.title.trim() : ""
  const excerpt = typeof item.excerpt === "string" ? item.excerpt.trim() : ""
  const content = typeof item.content === "string" ? item.content.trim() : ""
  if (!title || !excerpt || !content) return null

  const slugRaw = typeof item.slug === "string" ? item.slug : toSlug(title)
  const slug = toSlug(slugRaw)
  const image = typeof item.image === "string" ? normalizeUrl(item.image) : null
  const parsedReadingTime = Number(item.readingTime)

  return {
    slug,
    title,
    excerpt,
    content,
    date: typeof item.date === "string" && item.date ? item.date : new Date().toISOString().slice(0, 10),
    readingTime: Number.isFinite(parsedReadingTime) && parsedReadingTime > 0 ? parsedReadingTime : 4,
    tags: asStringList(item.tags),
    image: image ?? undefined,
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
  const [customBlogs, setCustomBlogs] = useState<BlogPost[]>([])

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null)
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
  const [blogSlug, setBlogSlug] = useState("")
  const [blogExcerpt, setBlogExcerpt] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [blogImage, setBlogImage] = useState("")
  const [blogTags, setBlogTags] = useState("")
  const [blogReadingTime, setBlogReadingTime] = useState("5")
  const [blogDate, setBlogDate] = useState(new Date().toISOString().slice(0, 10))
  const [uploadingProjectImage, setUploadingProjectImage] = useState(false)
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false)

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
      const normalizedBlogs = readStorage<unknown[]>(CUSTOM_BLOGS_KEY, [])
        .map(normalizeBlog)
        .filter((item): item is BlogPost => item !== null)

      setProjects(normalizedProjects.length ? normalizedProjects : defaultProjects)
      setCustomBlogs(normalizedBlogs)
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

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(CUSTOM_BLOGS_KEY, JSON.stringify(customBlogs))
  }, [customBlogs, ready])

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

  const allBlogs = useMemo(() => {
    const map = new Map<string, BlogPost>()
    for (const post of blogPosts) map.set(post.slug, post)
    for (const post of customBlogs) map.set(post.slug, post)
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [customBlogs])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId]
  )
  const selectedBlog = useMemo(
    () => allBlogs.find((post) => post.slug === selectedBlogSlug) ?? allBlogs[0] ?? null,
    [allBlogs, selectedBlogSlug]
  )
  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0] ?? null,
    [contacts, selectedContactId]
  )

  const stats = useMemo(() => {
    const publishedProjects = projects.filter((project) => project.status === "published").length
    const publishedBlogs = allBlogs.filter((post) => (blogStatuses[post.slug] ?? "draft") === "published").length
    return {
      projectsTotal: projects.length,
      blogsTotal: allBlogs.length,
      contactsTotal: contacts.length,
      publishedProjects,
      publishedBlogs,
    }
  }, [projects, allBlogs, blogStatuses, contacts.length])

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

  const handleAddBlog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      setFormError("Titre, extrait et contenu sont obligatoires pour un blog.")
      return
    }

    const image = normalizeUrl(blogImage)
    if (blogImage.trim() && !image) return setFormError("Image du blog invalide.")

    const generatedSlug = toSlug(blogSlug || blogTitle)
    if (allBlogs.some((post) => post.slug === generatedSlug)) {
      setFormError("Ce slug existe deja. Choisis-en un autre.")
      return
    }

    const readingTimeNumber = Number(blogReadingTime)
    const newBlog: BlogPost = {
      slug: generatedSlug,
      title: blogTitle.trim(),
      excerpt: blogExcerpt.trim(),
      content: blogContent.trim(),
      date: blogDate || new Date().toISOString().slice(0, 10),
      readingTime: Number.isFinite(readingTimeNumber) && readingTimeNumber > 0 ? readingTimeNumber : 5,
      tags: parseCsv(blogTags),
      image: image ?? undefined,
    }

    setCustomBlogs((prev) => [newBlog, ...prev])
    setBlogStatuses((prev) => ({ ...prev, [newBlog.slug]: "draft" }))
    setSelectedBlogSlug(newBlog.slug)
    addActivity(`Blog ajoute en brouillon: ${newBlog.title}`)

    setBlogTitle("")
    setBlogSlug("")
    setBlogExcerpt("")
    setBlogContent("")
    setBlogImage("")
    setBlogTags("")
    setBlogReadingTime("5")
    setBlogDate(new Date().toISOString().slice(0, 10))
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
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Projets</p>
                    <p className="mt-1 text-2xl font-semibold">{stats.projectsTotal}</p>
                    <p className="text-xs text-muted-foreground">{stats.publishedProjects} publies</p>
                  </article>
                  <article className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Blogs</p>
                    <p className="mt-1 text-2xl font-semibold">{stats.blogsTotal}</p>
                    <p className="text-xs text-muted-foreground">{stats.publishedBlogs} publies</p>
                  </article>
                  <article className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Contacts</p>
                    <p className="mt-1 text-2xl font-semibold">{stats.contactsTotal}</p>
                    <p className="text-xs text-muted-foreground">messages recuperes</p>
                  </article>
                  <article className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Activite</p>
                    <p className="mt-1 text-2xl font-semibold">{activities.length}</p>
                    <p className="text-xs text-muted-foreground">actions recentes</p>
                  </article>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <h2 className="mb-3 text-sm font-semibold">Activite recente</h2>
                  <ul className="space-y-2">
                    {activities.map((item) => (
                      <li key={item.id} className="rounded-lg border border-border px-3 py-2">
                        <p className="text-sm text-foreground">{item.message}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.at)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "projects" && (
              <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                  <form onSubmit={handleAddProject} className="grid gap-3 rounded-2xl border border-border bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <FilePlus2 className="size-4" />
                      Ajouter un projet
                    </p>
                    <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Titre" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <textarea value={projectSummary} onChange={(e) => setProjectSummary(e.target.value)} placeholder="Resume" rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <input value={projectStack} onChange={(e) => setProjectStack(e.target.value)} placeholder="Stack (virgules)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <input value={projectTags} onChange={(e) => setProjectTags(e.target.value)} placeholder="Tags (virgules)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Image couverture (upload)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onProjectFileChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                      />
                      {uploadingProjectImage && (
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          Upload en cours...
                        </p>
                      )}
                      {projectCoverImage && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
                          <img src={projectCoverImage} alt="" className="size-10 rounded-md object-cover" />
                          <p className="truncate text-xs text-muted-foreground">{projectCoverImage}</p>
                        </div>
                      )}
                    </div>
                    <input value={projectLiveUrl} onChange={(e) => setProjectLiveUrl(e.target.value)} placeholder="Lien live" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <input value={projectRepoUrl} onChange={(e) => setProjectRepoUrl(e.target.value)} placeholder="Lien repository" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                      Enregistrer en brouillon
                    </button>
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                  </form>

                  <ul className="space-y-3">
                    {projects.map((project) => (
                      <li key={project.id} className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <button type="button" onClick={() => setSelectedProjectId(project.id)} className="flex min-w-0 items-start gap-3 text-left">
                            {project.coverImage ? (
                              <img src={project.coverImage} alt="" className="size-12 rounded-lg object-cover" />
                            ) : (
                              <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ImageIcon className="size-4" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <p className="font-medium">{project.title}</p>
                              <p className="text-sm text-muted-foreground">{project.summary}</p>
                            </span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusBadge[project.status]}`}>
                              {project.status}
                            </span>
                            <StatusSelect
                              value={project.status}
                              onChange={(next) => {
                                setProjects((prev) =>
                                  prev.map((entry) =>
                                    entry.id === project.id
                                      ? {
                                          ...entry,
                                          status: next,
                                          publishedAt: next === "published" ? new Date().toISOString() : entry.publishedAt,
                                        }
                                      : entry
                                  )
                                )
                                addActivity(`Projet ${project.title} passe en ${next}`)
                              }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <aside className="lg:sticky lg:top-2 self-start rounded-2xl border border-border bg-background p-4 h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] min-h-[420px] overflow-hidden">
                  <h2 className="text-sm font-semibold">Detail projet</h2>
                  <div className="mt-3 h-[calc(100%-1.5rem)] overflow-y-auto pr-1">
                    {selectedProject ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-foreground">{selectedProject.title}</p>
                        <p className="text-muted-foreground">{selectedProject.summary}</p>
                        <p className="text-xs text-muted-foreground">Slug: {selectedProject.slug}</p>
                        <p className="text-xs text-muted-foreground">
                          Stack: {selectedProject.stack.length ? selectedProject.stack.join(", ") : "Non renseignee"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tags: {selectedProject.tags.length ? selectedProject.tags.join(", ") : "Non renseignes"}
                        </p>
                        <p className="text-xs text-muted-foreground">Publie le: {formatDate(selectedProject.publishedAt)}</p>
                        {selectedProject.coverImage && (
                          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground break-all">
                            <ImageIcon className="size-3.5 shrink-0" />
                            {selectedProject.coverImage}
                          </p>
                        )}
                        <div className="space-y-1 pt-2">
                          {selectedProject.links.map((link) => (
                            <p key={link.id} className="inline-flex items-center gap-1 text-xs text-primary break-all">
                              <LinkIcon className="size-3.5 shrink-0" />
                              {link.label}: {link.url}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun projet disponible.</p>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {activeSection === "blogs" && (
              <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                  <form onSubmit={handleAddBlog} className="grid gap-3 rounded-2xl border border-border bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <FilePlus2 className="size-4" />
                      Ajouter un blog
                    </p>
                    <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Titre article" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <input value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)} placeholder="Slug (optionnel)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <textarea value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} placeholder="Extrait" rows={2} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Contenu (Markdown)" rows={6} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Image couverture (upload)</label>
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
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
                          <img src={blogImage} alt="" className="size-10 rounded-md object-cover" />
                          <p className="truncate text-xs text-muted-foreground">{blogImage}</p>
                        </div>
                      )}
                    </div>
                    <input value={blogTags} onChange={(e) => setBlogTags(e.target.value)} placeholder="Tags (virgules)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={blogReadingTime} onChange={(e) => setBlogReadingTime(e.target.value)} placeholder="Temps de lecture (min)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                      <input type="date" value={blogDate} onChange={(e) => setBlogDate(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                      Enregistrer en brouillon
                    </button>
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                  </form>

                  {allBlogs.map((post) => {
                    const status = blogStatuses[post.slug] ?? "draft"
                    return (
                      <article key={post.slug} className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <button type="button" onClick={() => setSelectedBlogSlug(post.slug)} className="flex min-w-0 items-start gap-3 text-left">
                            {post.image ? (
                              <img src={post.image} alt="" className="size-12 rounded-lg object-cover" />
                            ) : (
                              <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ImageIcon className="size-4" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <p className="font-medium text-foreground">{post.title}</p>
                              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                              <p className="text-xs text-muted-foreground">{post.date}</p>
                            </span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusBadge[status]}`}>{status}</span>
                            <StatusSelect
                              value={status}
                              onChange={(next) => {
                                setBlogStatuses((prev) => ({ ...prev, [post.slug]: next }))
                                addActivity(`Blog ${post.slug} passe en ${next}`)
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <aside className="lg:sticky lg:top-2 self-start rounded-2xl border border-border bg-background p-4 h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] min-h-[420px] overflow-hidden">
                  <h2 className="text-sm font-semibold">Detail blog</h2>
                  <div className="mt-3 h-[calc(100%-1.5rem)] overflow-y-auto pr-1">
                    {selectedBlog ? (
                      <div className="space-y-2">
                        {selectedBlog.image && (
                          <img
                            src={selectedBlog.image}
                            alt=""
                            className="h-40 w-full rounded-lg object-cover"
                          />
                        )}
                        <p className="font-medium">{selectedBlog.title}</p>
                        <p className="text-xs text-muted-foreground">Slug: {selectedBlog.slug}</p>
                        <p className="text-sm text-muted-foreground">{selectedBlog.excerpt}</p>
                        <p className="text-xs text-muted-foreground">
                          Tags: {selectedBlog.tags.length ? selectedBlog.tags.join(", ") : "Aucun"}
                        </p>
                        <p className="text-xs text-muted-foreground">Lecture: {selectedBlog.readingTime} min</p>
                        <p className="text-xs text-muted-foreground break-all">
                          Image: {selectedBlog.image || "Pas d'image"}
                        </p>
                        <pre className="rounded-lg bg-muted/40 p-3 text-xs whitespace-pre-wrap">
                          {selectedBlog.content.slice(0, 1600)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun article disponible.</p>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {activeSection === "contacts" && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Messages de contact</h2>
                    <button
                      type="button"
                      onClick={() => setContactsReloadToken((prev) => prev + 1)}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      Rafraichir
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">{contactsInfo}</p>
                  {contactsLoading ? (
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  ) : contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun contact recupere. Si Supabase n'est pas configure, cette vue reste en mode UI.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {contacts.map((contact) => (
                        <li key={contact.id} className="rounded-lg border border-border p-3">
                          <button type="button" onClick={() => setSelectedContactId(contact.id)} className="w-full text-left">
                            <p className="text-sm font-medium text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(contact.created_at)}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <aside className="rounded-2xl border border-border bg-background p-4">
                  <h2 className="text-sm font-semibold">Detail contact</h2>
                  {selectedContact ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="font-medium">{selectedContact.name}</p>
                      <p className="text-muted-foreground">{selectedContact.email}</p>
                      <p className="text-muted-foreground">{selectedContact.phone || "Telephone non fourni"}</p>
                      <p className="text-xs text-muted-foreground">
                        Pays: {selectedContact.country_code || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(selectedContact.created_at)}</p>
                      <p className="rounded-lg bg-muted/40 p-3 text-sm text-foreground">
                        {selectedContact.message || "Aucun message."}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Selectionnez un message.</p>
                  )}
                </aside>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
