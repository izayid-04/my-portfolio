import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const slotwise = {
  title: "SlotWise – API de Gestion de Réservations",
  titleEn: "SlotWise – Resource Booking API",
  description:
    "API REST de gestion de réservations de ressources (salles, bureaux, matériel) sur des créneaux horaires, avec authentification JWT, permissions par rôle (ADMIN/USER) et détection automatique de conflits de créneaux. Backend Spring Boot 4 (Java 21), Spring Data JPA, PostgreSQL, Spring Security, tests JUnit 5 / Mockito, documentation Swagger/OpenAPI, conteneurisé avec Docker.",
  descriptionEn:
    "REST API for managing resource bookings (rooms, desks, equipment) across time slots, with JWT authentication, role-based permissions (ADMIN/USER), and automatic slot-conflict detection. Spring Boot 4 (Java 21) backend, Spring Data JPA, PostgreSQL, Spring Security, JUnit 5 / Mockito tests, Swagger/OpenAPI docs, Dockerized.",
  date: "Octobre 2026",
  slug: "slotwise",
  tags: ["Spring Boot", "Java", "Spring Security", "JWT", "PostgreSQL", "Docker", "Swagger"],
  image: null,
  video: null,
  href: null,
  githubUrl: "https://github.com/izayid-04/SlotWise",
  embedSite: false,
  published: true,
  order: 13,
  companyId: null,
  projectType: "BACKEND",
}

async function main() {
  const existing = await prisma.project.findFirst({ where: { slug: slotwise.slug } })

  if (existing) {
    console.log(`⚠️  Un projet avec le slug "${slotwise.slug}" existe déjà (id: ${existing.id}). Rien n'a été créé.`)
    return
  }

  const created = await prisma.project.create({ data: slotwise })
  console.log(`✅ Projet "${created.title}" créé avec succès (id: ${created.id}).`)
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de la création du projet :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
