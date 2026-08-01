import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { blogPosts } from "../src/data/blog"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@portfolio.dev"
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin_Portfolio_2026!SecureKey"

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: "Ali Izayid (Admin)",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log(`✅ Admin user ready: ${admin.email}`)

  console.log("🌱 Seeding blog posts into database...")
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: new Date(post.date),
        readingTime: post.readingTime,
        tags: post.tags,
        image: post.image || null,
        published: true,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: new Date(post.date),
        readingTime: post.readingTime,
        tags: post.tags,
        image: post.image || null,
        published: true,
      },
    })
  }
  console.log("✅ Static blog posts successfully seeded to database!")

  console.log("🏫 Seeding institutions and diplomas...")
  const udb = await prisma.institution.upsert({
    where: { id: "udb-dakar" },
    update: {
      name: "Université Dakar-Bourguiba",
      logo: "https://oteutsntabtnhwhsnjzz.supabase.co/storage/v1/object/public/portfolio-assets/institutions/udb-dakar-logo.png",
      website: "https://www.udb.sn/",
      city: "Dakar",
      country: "Sénégal",
    },
    create: {
      id: "udb-dakar",
      name: "Université Dakar-Bourguiba",
      logo: "https://oteutsntabtnhwhsnjzz.supabase.co/storage/v1/object/public/portfolio-assets/institutions/udb-dakar-logo.png",
      website: "https://www.udb.sn/",
      city: "Dakar",
      country: "Sénégal",
    },
  })

  await prisma.diploma.upsert({
    where: { id: "diploma-licence-gl" },
    update: {
      title: "Licence 3 en Génie Logiciel",
      degreeType: "LICENCE",
      fieldOfStudy: "Génie Logiciel (GL)",
      date: "2025",
      url: "https://www.udb.sn/",
      description:
        "Licence 3 en Génie Logiciel (GL) obtenue à l'Université Dakar-Bourguiba. Formation en développement logiciel, bases de données, architectures et projets en équipe.",
      institutionId: udb.id,
      published: true,
      order: 1,
    },
    create: {
      id: "diploma-licence-gl",
      title: "Licence 3 en Génie Logiciel",
      degreeType: "LICENCE",
      fieldOfStudy: "Génie Logiciel (GL)",
      date: "2025",
      url: "https://www.udb.sn/",
      description:
        "Licence 3 en Génie Logiciel (GL) obtenue à l'Université Dakar-Bourguiba. Formation en développement logiciel, bases de données, architectures et projets en équipe.",
      institutionId: udb.id,
      published: true,
      order: 1,
    },
  })

  await prisma.diploma.upsert({
    where: { id: "diploma-certificat-stage" },
    update: {
      title: "Certificat de stage",
      degreeType: "CERTIFICAT",
      fieldOfStudy: "Développement Web (Laravel & Angular)",
      date: "2025",
      url: "https://www.udb.sn/",
      description:
        "Stage réalisé dans le cadre du projet de plateforme web de l'Université Dakar-Bourguiba (udb.sn), développée en équipe de 4 avec Laravel, Angular et MySQL, hébergée sur OVH.",
      institutionId: udb.id,
      published: true,
      order: 2,
    },
    create: {
      id: "diploma-certificat-stage",
      title: "Certificat de stage",
      degreeType: "CERTIFICAT",
      fieldOfStudy: "Développement Web (Laravel & Angular)",
      date: "2025",
      url: "https://www.udb.sn/",
      description:
        "Stage réalisé dans le cadre du projet de plateforme web de l'Université Dakar-Bourguiba (udb.sn), développée en équipe de 4 avec Laravel, Angular et MySQL, hébergée sur OVH.",
      institutionId: udb.id,
      published: true,
      order: 2,
    },
  })

  console.log("✅ Établissement UDB & Diplômes créés avec succès !")
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

