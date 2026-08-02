export type ContentStatus = "draft" | "published" | "archived"

export type AdminLinkType = "live" | "repo" | "article" | "action" | "other"
export type AdminMediaType = "image" | "video" | "file"

export interface AdminLink {
  id: string
  label: string
  url: string
  type: AdminLinkType
}

export interface AdminMedia {
  id: string
  type: AdminMediaType
  url: string
  alt?: string
}

export interface AdminProject {
  id: string
  slug: string
  title: string
  summary: string
  description?: string
  stack: string[]
  tags: string[]
  coverImage?: string
  links: AdminLink[]
  status: ContentStatus
  publishedAt: string | null
}

export interface AdminBlock {
  id: string
  key: string
  title: string
  content: string
  excerpt?: string
  section: "hero" | "about" | "projects" | "contact" | "custom"
  media: AdminMedia[]
  links: AdminLink[]
  status: ContentStatus
  publishedAt: string | null
}

export interface AdminActivity {
  id: string
  message: string
  at: string
}

export interface AdminSession {
  email: string
  loginAt: string
}

export const ADMIN_KEYS = {
  session: "portfolio_admin_session_v1",
  projects: "portfolio_admin_projects_v1",
  blocks: "portfolio_admin_blocks_v1",
  activities: "portfolio_admin_activities_v1",
} as const

export const DEMO_ADMIN = {
  email: "admin@portfolio.dev",
  password: "admin123",
} as const

export const defaultProjects: AdminProject[] = [
  {
    id: "p-udb",
    slug: "udb",
    title: "Université Dakar-Bourguiba (UDB)",
    summary: "Site et apps université (Laravel, Angular, MySQL).",
    description:
      "Projet réalisé pendant 4 mois de stage, avec un site institutionnel et des modules applicatifs.",
    stack: ["Laravel", "Angular", "MySQL"],
    tags: ["universite", "education", "institutionnel"],
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    links: [
      {
        id: "l-udb-live",
        label: "Site live",
        url: "https://udb.sn/",
        type: "live",
      },
    ],
    status: "published",
    publishedAt: "2026-04-21T09:10:00.000Z",
  },
  {
    id: "p-biacode",
    slug: "biacode",
    title: "BIACode",
    summary: "Plateforme et agence tech pour projets digitaux.",
    description:
      "Plateforme de presentation de l'agence avec suivi des services et projets clients.",
    stack: ["Laravel", "Angular", "MySQL"],
    tags: ["agence", "plateforme", "business"],
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    links: [
      {
        id: "l-biacode-live",
        label: "Site live",
        url: "https://www.biacode.tech/",
        type: "live",
      },
    ],
    status: "published",
    publishedAt: "2026-04-25T16:30:00.000Z",
  },
  {
    id: "p-new",
    slug: "nouveau-projet",
    title: "Nouveau projet (brouillon)",
    summary: "Espace prêt a etre complete puis publie.",
    description: "Brouillon pour preparer un nouveau cas client.",
    stack: ["Next.js", "Tailwind CSS"],
    tags: ["draft"],
    coverImage: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
    links: [],
    status: "draft",
    publishedAt: null,
  },
]

export const defaultBlocks: AdminBlock[] = [
  {
    id: "b-hero",
    key: "hero-main-message",
    title: "Hero principal",
    content: "Construire des applications stables et utiles.",
    excerpt: "Message principal d'accroche",
    section: "hero",
    media: [
      {
        id: "m-hero-main",
        type: "image",
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
        alt: "Ambiance technologie futuriste",
      },
    ],
    links: [
      {
        id: "l-hero-main-cta",
        label: "Voir mes projets",
        url: "/#projects",
        type: "action",
      },
    ],
    status: "published",
    publishedAt: "2026-04-18T11:00:00.000Z",
  },
  {
    id: "b-about",
    key: "about-intro",
    title: "Presentation developpeur",
    content: "Developpeur full-stack oriente backend et DevOps.",
    excerpt: "Texte de presentation de la section a propos",
    section: "about",
    media: [],
    links: [],
    status: "published",
    publishedAt: "2026-04-18T11:12:00.000Z",
  },
  {
    id: "b-next",
    key: "custom-next-announcement",
    title: "Bloc a valider",
    content: "Nouveau bloc de contenu pret pour publication.",
    excerpt: "Bloc marketing a finaliser",
    section: "custom",
    media: [
      {
        id: "m-custom-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
        alt: "Equipe en reunion produit",
      },
    ],
    links: [
      {
        id: "l-custom-1",
        label: "En savoir plus",
        url: "https://www.biacode.tech/",
        type: "other",
      },
    ],
    status: "draft",
    publishedAt: null,
  },
]

export const defaultActivities: AdminActivity[] = [
  {
    id: "a-1",
    message: "Connexion admin initialisee (mode demo UI).",
    at: "2026-05-01T10:20:00.000Z",
  },
  {
    id: "a-2",
    message: "Projet BIACode publie.",
    at: "2026-05-01T10:35:00.000Z",
  },
]

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("/")) return trimmed

  try {
    const parsed = new URL(trimmed)
    return parsed.toString()
  } catch {
    return null
  }
}
