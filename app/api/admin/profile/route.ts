import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Récupère les données du profil administrateur connecté
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[PROFILE GET ERROR]", error)
    return NextResponse.json({ error: "Erreur serveur lors de la récupération du profil" }, { status: 500 })
  }
}

// PUT: Mettre à jour le profil (Nom, Email, Mot de passe)
export async function PUT(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, currentPassword, newPassword } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérification unicité de l'email si modifié
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "Cet email est déjà utilisé par un autre compte" }, { status: 400 })
      }
    }

    const updateData: { name?: string; email?: string; password?: string } = {
      name: name || user.name || "",
      email: email,
    }

    // Changement de mot de passe si renseigné
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Le mot de passe actuel est requis pour changer votre mot de passe" }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    })
  } catch (error) {
    console.error("[PROFILE PUT ERROR]", error)
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour du profil" }, { status: 500 })
  }
}
