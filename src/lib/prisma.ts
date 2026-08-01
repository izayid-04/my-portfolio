import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
  return client
}

// En développement, réinitialiser si les nouveaux modèles diploma / institution n'existent pas sur le singleton mis en cache
if (
  globalForPrisma.prisma &&
  (!("diploma" in globalForPrisma.prisma) ||
    !("institution" in globalForPrisma.prisma) ||
    !("project" in globalForPrisma.prisma))
) {
  globalForPrisma.prisma = undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
