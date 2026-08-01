import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
