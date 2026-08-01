import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des projets", details: error.message }, { status: 500 })
  }
}
