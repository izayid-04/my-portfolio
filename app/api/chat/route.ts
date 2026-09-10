import { NextResponse } from "next/server"
import { getDynamicChatbotSystemPrompt } from "@/lib/chatbot-prompt"

const ERROR_MESSAGES = {
  fr: {
    messageRequired: "Le message est requis.",
    notConfigured: "Chatbot non configuré (MISTRAL_API_KEY manquante).",
    unavailable: "Le service de chat est temporairement indisponible.",
    noReply: "Désolé, je n’ai pas pu générer une réponse. Tu peux me contacter via la page Contact du site.",
    generic: "Une erreur est survenue.",
  },
  en: {
    messageRequired: "The message is required.",
    notConfigured: "Chatbot not configured (missing MISTRAL_API_KEY).",
    unavailable: "The chat service is temporarily unavailable.",
    noReply: "Sorry, I couldn't generate a reply. You can reach me through the Contact page of the site.",
    generic: "Something went wrong.",
  },
} as const

function getPortfolioFallbackReply(message: string, locale: "fr" | "en") {
  const text = message.toLowerCase()
  const projectNames = [
    "TMCO",
    "YEE YÔ",
    "BonjourCitoyen",
    "PhotoNum",
    "UDB",
    "BIACode",
    "EASYTECS",
    "Nora",
  ]

  const isFrench = locale === "fr"
  const asksAboutProjects = /(combien|nombre|projet|projects?|réalis)/i.test(text)
  const asksWho = /(qui est|présente|profil|développeur|skill|skills|stack|technolog|what is|who is)/i.test(text)
  const asksContact = /(contact|collab|devis|quote|whatsapp|email|recrut|travailler)/i.test(text)

  if (asksAboutProjects) {
    return isFrench
      ? `Iza a réalisé ${projectNames.length} projets, notamment : ${projectNames.join(", ")}. Tu peux les voir dans la section Projets du portfolio.`
      : `Iza has completed ${projectNames.length} projects, including: ${projectNames.join(", ")}. You can see them in the Projects section of the portfolio.`
  }

  if (asksWho) {
    return isFrench
      ? "Iza est un développeur full-stack orienté backend et DevOps, avec une stack autour de Laravel, Angular, Next.js, Nest.js, Spring Boot, Docker et Linux."
      : "Iza is a full-stack developer focused on backend and DevOps, with experience in Laravel, Angular, Next.js, Nest.js, Spring Boot, Docker, and Linux."
  }

  if (asksContact) {
    return isFrench
      ? "Tu peux contacter Iza via la page Contact du site, où tu trouveras le formulaire, l’email et le WhatsApp."
      : "You can contact Iza through the Contact page of the site, where you will find the contact form, email, and WhatsApp."
  }

  return isFrench
    ? "Je peux t’aider sur le portfolio d’Iza, ses projets, ses compétences et son contact."
    : "I can help with Iza's portfolio, projects, skills, and contact details."
}

/**
 * POST /api/chat
 * Reçoit le message utilisateur et renvoie une réponse via l'API Mistral.
 * Body: { message: string, locale?: "fr" | "en" }
 * Réponse: { reply: string }
 */
export async function POST(request: Request) {
  let locale: "fr" | "en" = "fr"
  try {
    const body = await request.json()
    const message = (body?.message as string)?.trim()
    locale = body?.locale === "en" ? "en" : "fr"
    const errors = ERROR_MESSAGES[locale]

    if (!message) {
      return NextResponse.json(
        { error: errors.messageRequired },
        { status: 400 }
      )
    }

    // Essayer OpenRouter en priorité (Qwen), fallback sur Mistral
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const mistralKey = process.env.MISTRAL_API_KEY

    if (!openrouterKey && !mistralKey) {
      return NextResponse.json({
        reply: getPortfolioFallbackReply(message, locale),
      }, { status: 200 })
    }

    // Récupération dynamique du prompt avec tous les projets réels de la BDD
    const systemPrompt = await getDynamicChatbotSystemPrompt(locale)

    // Essayer OpenRouter d'abord
    if (openrouterKey) {
      const openrouterUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1"
      const res = await fetch(`${openrouterUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3005",
          "X-Title": "Portfolio Chat",
        },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-7b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 512,
          temperature: 0.3,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>
        }
        const rawReply =
          data?.choices?.[0]?.message?.content?.trim() ||
          ERROR_MESSAGES[locale].noReply

        const reply = rawReply
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .trim()

        return NextResponse.json({ reply })
      } else {
        const errText = await res.text()
        console.error("[api/chat] OpenRouter error:", res.status, errText)
      }
    }

    // Fallback sur Mistral si OpenRouter échoue
    if (mistralKey) {
      const mistralUrl =
        process.env.MISTRAL_API_URL ?? "https://api.mistral.ai/v1/chat/completions"
      const res = await fetch(mistralUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mistralKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 512,
          temperature: 0.4,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>
        }
        const rawReply =
          data?.choices?.[0]?.message?.content?.trim() ||
          ERROR_MESSAGES[locale].noReply

        const reply = rawReply
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .trim()

        return NextResponse.json({ reply })
      } else {
        const errText = await res.text()
        console.error("[api/chat] Mistral error:", res.status, errText)
      }
    }

    // Si les deux APIs échouent, retourner un fallback statique
    return NextResponse.json({
      reply: getPortfolioFallbackReply(message, locale),
    }, { status: 200 })
  } catch (e) {
    console.error("[api/chat]", e)
    const locale = (await request.json().catch(() => ({}))).locale === "en" ? "en" : "fr"
    return NextResponse.json({
      reply: getPortfolioFallbackReply("", locale),
    }, { status: 200 })
  }
}
