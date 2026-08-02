import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { prisma as defaultPrisma } from "@/lib/prisma"

// Instancier le client si le singleton en mémoire est sur un vieux modèle
const getPrisma = () => {
  if (defaultPrisma && "resume" in defaultPrisma && typeof (defaultPrisma as any).resume?.findUnique === "function") {
    return defaultPrisma
  }
  return new PrismaClient()
}

export async function GET() {
  try {
    const db = getPrisma()
    const resume = await db.resume.findUnique({
      where: { id: "active" },
    })

    return NextResponse.json({
      pdfUrl: resume?.pdfUrl || null,
      fileName: resume?.fileName || null,
      updatedAt: resume?.updatedAt || null,
    })
  } catch (error: any) {
    console.error("[RESUME GET ERROR]", error)
    return NextResponse.json({ error: error?.message || "Erreur lors de la récupération du CV", pdfUrl: null })
  }
}

export async function POST(req: Request) {
  try {
    const db = getPrisma()
    const body = await req.json()
    const { pdfUrl, fileName } = body

    if (!pdfUrl || typeof pdfUrl !== "string") {
      return NextResponse.json({ error: "L'URL du fichier PDF est requise" }, { status: 400 })
    }

    const resume = await db.resume.upsert({
      where: { id: "active" },
      update: {
        pdfUrl,
        fileName: fileName || "CV_Izayid_Ali.pdf",
      },
      create: {
        id: "active",
        pdfUrl,
        fileName: fileName || "CV_Izayid_Ali.pdf",
      },
    })

    return NextResponse.json({ success: true, resume })
  } catch (error: any) {
    console.error("[RESUME POST ERROR]", error)
    return NextResponse.json({ error: error?.message || "Erreur lors de l'enregistrement du CV" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const db = getPrisma()
    await db.resume.deleteMany({
      where: { id: "active" },
    })

    return NextResponse.json({ success: true, message: "CV supprimé avec succès" })
  } catch (error: any) {
    console.error("[RESUME DELETE ERROR]", error)
    return NextResponse.json({ error: error?.message || "Erreur lors de la suppression du CV" }, { status: 500 })
  }
}
