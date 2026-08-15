import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createToken, setAuthCookie } from "@/lib/auth"
import { verifyTurnstile } from "@/lib/turnstile"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, turnstileToken } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez fournir un e-mail et un mot de passe." },
        { status: 400 }
      )
    }

    const secretConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim())
    const siteKeyConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim())

    if (secretConfigured && siteKeyConfigured) {
      if (!turnstileToken?.trim()) {
        return NextResponse.json(
          { error: "Veuillez valider le captcha." },
          { status: 400 }
        )
      }
      const forwarded = request.headers.get("x-forwarded-for")
      const remoteIp = forwarded?.split(",")[0]?.trim()
      const ok = await verifyTurnstile(turnstileToken.trim(), remoteIp)
      if (!ok) {
        return NextResponse.json(
          { error: "Captcha invalide ou expiré. Réessayez." },
          { status: 400 }
        )
      }
    }

    const cleanEmail = email.trim().toLowerCase()

    // Query admin user in PostgreSQL via Prisma
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    // If database has no users yet, check against environment variable default credentials
    // (aucune valeur par défaut codée en dur : si ces variables ne sont pas configurées,
    // le bootstrap est simplement désactivé)
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase()
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD

    if (!user && defaultEmail && defaultPassword && cleanEmail === defaultEmail) {
      if (password === defaultPassword) {
        // Auto-create initial user in database
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)
        user = await prisma.user.create({
          data: {
            email: defaultEmail,
            name: "Ali Izayid (Admin)",
            password: hashedPassword,
            role: "ADMIN",
          },
        })
      } else {
        return NextResponse.json(
          { error: "Identifiants invalides." },
          { status: 401 }
        )
      }
    } else if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 }
      )
    } else {
      // Verify hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Identifiants invalides." },
          { status: 401 }
        )
      }
    }

    // Generate JWT token & set HTTP-only session cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Erreur de connexion admin:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    )
  }
}
