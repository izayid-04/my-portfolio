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

  console.log("🏢 Seeding companies...")
  const biacodeCompany = await prisma.company.upsert({
    where: { id: "company-biacode" },
    update: {
      name: "BIACode",
      logo: "https://www.biacode.tech/favicon.ico",
      website: "https://www.biacode.tech/",
    },
    create: {
      id: "company-biacode",
      name: "BIACode",
      logo: "https://www.biacode.tech/favicon.ico",
      website: "https://www.biacode.tech/",
    },
  })

  const easytecsCompany = await prisma.company.upsert({
    where: { id: "company-easytecs" },
    update: {
      name: "EASYTECS",
      logo: "https://www.easytecs.tech/favicon.ico",
      website: "https://www.easytecs.tech/",
    },
    create: {
      id: "company-easytecs",
      name: "EASYTECS",
      logo: "https://www.easytecs.tech/favicon.ico",
      website: "https://www.easytecs.tech/",
    },
  })

  const udbCompany = await prisma.company.upsert({
    where: { id: "company-udb" },
    update: {
      name: "Université Dakar-Bourguiba",
      logo: "https://oteutsntabtnhwhsnjzz.supabase.co/storage/v1/object/public/portfolio-assets/institutions/udb-dakar-logo.png",
      website: "https://www.udb.sn/",
    },
    create: {
      id: "company-udb",
      name: "Université Dakar-Bourguiba",
      logo: "https://oteutsntabtnhwhsnjzz.supabase.co/storage/v1/object/public/portfolio-assets/institutions/udb-dakar-logo.png",
      website: "https://www.udb.sn/",
    },
  })

  const uwezoCompany = await prisma.company.upsert({
    where: { id: "company-uwezo" },
    update: {
      name: "Agence UWEZO",
      logo: null,
      website: "https://uwezo.yt/",
    },
    create: {
      id: "company-uwezo",
      name: "Agence UWEZO",
      logo: null,
      website: "https://uwezo.yt/",
    },
  })

  console.log("🚀 Seeding projects...")
  const projectsSeed = [
    {
      id: "project-tmco",
      title: "TMCO – Transport Mobilité Centre-Ouest",
      description:
        "Plateforme web officielle du réseau de transport public collectif de la Communauté de Communes du Centre-Ouest (3CO) à Mayotte, couvrant 5 communes et plus de 50 000 habitants.",
      date: "Octobre 2025",
      slug: "tmco",
      tags: ["Transport", "Mayotte", "Frontend", "DevOps", "3CO"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
      href: "https://tmco.yt/",
      embedSite: true,
      published: true,
      order: 1,
      companyId: uwezoCompany.id,
    },
    {
      id: "project-yeeyo",
      title: "YEE YÔ – SaaS de Gestion Commerciale",
      description:
        "Solution SaaS complète de gestion commerciale et d'ERP/CRM conçue pour optimiser le suivi des ventes, la facturation, la gestion des stocks et la caisse enregistreuse pour les entreprises.",
      date: "Décembre 2025",
      slug: "yeeyo",
      tags: ["SaaS", "ERP / CRM", "Full-Stack", "DevOps", "Facturation"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      href: "https://www.yeeyo.org/",
      embedSite: true,
      published: true,
      order: 2,
      companyId: biacodeCompany.id,
    },
    {
      id: "project-bonjourcitoyen",
      title: "BonjourCitoyen – Préparation à l'Examen Civique",
      description:
        "Plateforme EdTech complète permettant aux usagers de se préparer aux examens civiques officiels en France (titre de séjour pluriannuel, carte de résident de 10 ans et naturalisation française).",
      date: "Novembre 2025",
      slug: "bonjourcitoyen",
      tags: ["EdTech", "Examen Civique", "Frontend", "DevOps", "France"],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      href: "https://bonjourcitoyen.fr/",
      embedSite: true,
      published: true,
      order: 3,
      companyId: uwezoCompany.id,
    },
    {
      id: "project-photonum",
      title: "PhotoNum – Photo d'Identité Numérique e-Photo (ANTS)",
      description:
        "Service web et plateforme liée aux applications mobiles permettant d'obtenir en quelques minutes des photos d'identité numériques avec signature électronique agréées ANTS et Préfecture.",
      date: "Février 2026",
      slug: "photonum",
      tags: ["e-Photo", "ANTS", "Full-Stack", "DevOps", "Préfecture"],
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      href: "https://photonum.xyz/",
      embedSite: true,
      published: true,
      order: 4,
      companyId: uwezoCompany.id,
    },
    {
      id: "project-udb",
      title: "Université Dakar-Bourguiba (UDB)",
      description:
        "Projet réalisé lors d'un stage de 4 mois avec une équipe de 4 étudiants : site et applications pour l'université. Back-end Laravel, front-end Angular, base MySQL, hébergement OVH.",
      date: "Juillet 2025",
      slug: "udb",
      tags: ["Laravel", "Angular", "MySQL", "OVH"],
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
      href: "https://udb.sn/",
      embedSite: true,
      published: true,
      order: 5,
      companyId: udbCompany.id,
    },
    {
      id: "project-biacode",
      title: "BIACode",
      description:
        "Notre plateforme et agence tech, lancée à trois. BIACode est notre structure dédiée au développement et à l'accompagnement des projets numériques.",
      date: "Septembre 2025",
      slug: "biacode",
      tags: ["Agence", "Plateforme", "Laravel", "Angular", "LWS"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      href: "https://www.biacode.tech/",
      embedSite: true,
      published: true,
      order: 6,
      companyId: biacodeCompany.id,
    },
    {
      id: "project-easytecs",
      title: "EASYTECS — EasyGEC",
      description:
        "Premier client de l'agence : plateforme pour EASYTECS, structure sénégalaise spécialisée dans les logiciels métiers. EasyGEC est un système d'enregistrement sécurisé et simple pour gérer les faits d'état civil (naissance au décès), garantissant les droits fondamentaux : carte d'identité, droit de vote, héritage, accès à l'école, permis de conduire, etc.",
      date: "Mars 2026",
      slug: "easytecs",
      tags: ["État civil", "e-Gouvernance", "Sénégal", "Laravel", "Angular"],
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
      href: "https://www.easytecs.tech/",
      embedSite: true,
      published: true,
      order: 7,
      companyId: easytecsCompany.id,
    },
    {
      id: "project-nora",
      title: "Nora — Assistant IA",
      description:
        "Assistant IA conversationnel : interface web minimaliste pour poser des questions et recevoir des réponses naturelles. Front HTML/CSS/JavaScript, backend Python Flask, déployé sur Render.",
      date: "Janvier 2024",
      slug: "nora",
      tags: ["IA", "Chatbot", "Flask", "Python"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      href: "https://noraia.onrender.com/",
      embedSite: true,
      published: true,
      order: 8,
      companyId: null,
    },
  ]

  for (const proj of projectsSeed) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: proj,
      create: proj,
    })
  }
  console.log("✅ Static projects successfully seeded to database!")
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

