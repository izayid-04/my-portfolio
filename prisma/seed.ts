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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

