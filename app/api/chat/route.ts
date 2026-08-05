import { NextResponse } from "next/server"
import { getDynamicChatbotSystemPrompt } from "@/lib/chatbot-prompt"

/**
 * POST /api/chat
 * Reçoit le message utilisateur et renvoie une réponse via l'API Mistral.
 * Body: { message: string }
 * Réponse: { reply: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = (body?.message as string)?.trim()

    if (!message) {
      return NextResponse.json(
        { error: "Le message est requis." },
        { status: 400 }
      )
    }

    const apiKey = process.env.MISTRAL_API_KEY
    const apiUrl =
      process.env.MISTRAL_API_URL ?? "https://api.mistral.ai/v1/chat/completions"
    const model = process.env.MISTRAL_MODEL ?? "mistral-small-latest"

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chatbot non configuré (MISTRAL_API_KEY manquante)." },
        { status: 503 }
      )
    }

    // Récupération dynamique du prompt avec tous les projets réels de la BDD
    const systemPrompt = await getDynamicChatbotSystemPrompt()

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
        { error: "Le service de chat est temporairement indisponible." },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const rawReply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Désolé, je n’ai pas pu générer une réponse. Tu peux me contacter via la page Contact du site."

    // Nettoyage des astérisques Markdown pour un rendu propre sans ** ni *
    const reply = rawReply
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim()

    return NextResponse.json({ reply })
  } catch (e) {
    console.error("[api/chat]", e)
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    )
  }
}
