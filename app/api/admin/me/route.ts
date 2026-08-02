import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    console.error("Erreur de verification de session:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
