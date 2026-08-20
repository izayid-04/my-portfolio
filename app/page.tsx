import { prisma } from "@/lib/prisma"
import {
  HeroSection,
  AboutSection,
  CertificationsSection,
  ProjectsSection,
} from "@/components/sections"
import { GithubContributions } from "@/components/sections/github-contributions"
import { projectStackIcons } from "@/data/tech-icons"

export const metadata = {
  title: "Accueil | Mon portfolio",
  description:
    "Portfolio professionnel — Développement web, React, Next.js et expériences utilisateur.",
}

export const revalidate = 60

export default async function HomePage() {
  let certifications = undefined
  let projects = undefined

  try {
    // Vérification sécurisée du modèle Prisma
    if (prisma && "diploma" in prisma && typeof (prisma as any).diploma?.findMany === "function") {
      const dbDiplomas = await (prisma as any).diploma.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: { institution: true },
      })

      if (dbDiplomas && dbDiplomas.length > 0) {
        certifications = dbDiplomas.map((d: any) => ({
          name: d.title,
          issuer: d.institution?.name || "Formation / Indépendant",
          date: d.date || undefined,
          url: d.url || d.institution?.website || undefined,
          logo: d.institution?.logo || undefined,
          description: d.description || undefined,
          image: d.image || undefined,
        }))
      }
    }
  } catch (error) {
    console.error("Erreur de récupération des diplômes sur la page d'accueil:", error)
  }

  try {
    // Récupération serveur des projets — évite un re-fetch client qui redimensionne
    // la section après le premier rendu (cause du saut de scroll signalé).
    const dbProjects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { company: true },
    })

    if (dbProjects.length > 0) {
      projects = dbProjects.map((p) => {
        const techIcons = (p.tags || [])
          .map((tag) => {
            const matchedEntry = Object.entries(projectStackIcons).find(
              ([key]) => key.toLowerCase() === tag.toLowerCase()
            )
            return matchedEntry ? { name: tag, url: matchedEntry[1] } : null
          })
          .filter((icon): icon is NonNullable<typeof icon> => icon !== null)

        return {
          title: p.title,
          description: p.description,
          date: p.date || undefined,
          slug: p.slug || undefined,
          tags: p.tags || [],
          image: p.image || undefined,
          video: p.video || undefined,
          href: p.href || undefined,
          githubUrl: p.githubUrl || undefined,
          embedSite: Boolean(p.embedSite),
          techIcons: techIcons.length > 0 ? techIcons : undefined,
          company: p.company || null,
        }
      })
    }
  } catch (error) {
    console.error("Erreur de récupération des projets sur la page d'accueil:", error)
  }

  return (
    <main className="min-h-screen pb-24">
      <HeroSection />
      <AboutSection>
        <GithubContributions username="izayid-04" />
      </AboutSection>
      <CertificationsSection certifications={certifications} />
      <ProjectsSection projects={projects} />
    </main>
  )
}
