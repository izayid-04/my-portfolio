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

export async function GET(req: Request) {
  try {
    const db = getPrisma()
    const resume = await db.resume.findUnique({
      where: { id: "active" },
    })

    const { searchParams } = new URL(req.url)
    const locale = searchParams.get("locale") === "en" ? "en" : "fr"
    const useEn = locale === "en" && resume?.pdfUrlEn

    return NextResponse.json({
      // Version localisée (retombe sur le FR si l'EN n'existe pas) — utilisée par la page /cv publique.
      pdfUrl: (useEn ? resume?.pdfUrlEn : resume?.pdfUrl) || null,
      fileName: (useEn ? resume?.fileNameEn : resume?.fileName) || null,
      // Champs bruts FR/EN séparés — utilisés par l'admin pour éditer les deux versions.
      pdfUrlFr: resume?.pdfUrl || null,
      fileNameFr: resume?.fileName || null,
      pdfUrlEn: resume?.pdfUrlEn || null,
      fileNameEn: resume?.fileNameEn || null,
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
    const { pdfUrl, fileName, pdfUrlEn, fileNameEn } = body

    if (!pdfUrl || typeof pdfUrl !== "string") {
      return NextResponse.json({ error: "L'URL du fichier PDF est requise" }, { status: 400 })
    }

    const resume = await db.resume.upsert({
      where: { id: "active" },
      update: {
        pdfUrl,
        fileName: fileName || "CV_Izayid_Ali.pdf",
        pdfUrlEn: pdfUrlEn || null,
        fileNameEn: pdfUrlEn ? fileNameEn || "CV_Izayid_Ali_EN.pdf" : null,
      },
      create: {
        id: "active",
        pdfUrl,
        fileName: fileName || "CV_Izayid_Ali.pdf",
        pdfUrlEn: pdfUrlEn || null,
        fileNameEn: pdfUrlEn ? fileNameEn || "CV_Izayid_Ali_EN.pdf" : null,
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
