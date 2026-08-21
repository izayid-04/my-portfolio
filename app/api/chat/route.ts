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

    const apiKey = process.env.MISTRAL_API_KEY
    const apiUrl =
      process.env.MISTRAL_API_URL ?? "https://api.mistral.ai/v1/chat/completions"
    const model = process.env.MISTRAL_MODEL ?? "mistral-small-latest"

    if (!apiKey) {
      return NextResponse.json(
        { error: errors.notConfigured },
        { status: 503 }
      )
    }

    // Récupération dynamique du prompt avec tous les projets réels de la BDD
    const systemPrompt = await getDynamicChatbotSystemPrompt(locale)

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 512,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("[api/chat] Mistral error:", res.status, errText)
      return NextResponse.json(
        { error: ERROR_MESSAGES[locale].unavailable },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const rawReply =
      data?.choices?.[0]?.message?.content?.trim() ||
      ERROR_MESSAGES[locale].noReply

    // Nettoyage des astérisques Markdown pour un rendu propre sans ** ni *
    const reply = rawReply
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim()

    return NextResponse.json({ reply })
  } catch (e) {
    console.error("[api/chat]", e)
    return NextResponse.json(
      { error: ERROR_MESSAGES[locale].generic },
      { status: 500 }
    )
  }
}
