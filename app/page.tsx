import { prisma } from "@/lib/prisma"
import {
  HeroSection,
  AboutSection,
  CertificationsSection,
  ProjectsSection,
} from "@/components/sections"

export const metadata = {
  title: "Accueil | Mon portfolio",
  description:
    "Portfolio professionnel — Développement web, React, Next.js et expériences utilisateur.",
}

export const revalidate = 60

export default async function HomePage() {
  let certifications = undefined

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

  return (
    <main className="min-h-screen pb-24">
      <HeroSection />
      <AboutSection />
      <CertificationsSection certifications={certifications} />
      <ProjectsSection />
    </main>
  )
}
