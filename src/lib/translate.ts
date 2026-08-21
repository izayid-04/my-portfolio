/**
 * Traduction FR → EN via l'API Mistral, réutilisée pour pré-remplir les champs
 * `*En` des contenus gérés en base (projets, diplômes, articles de blog) depuis l'admin.
 * L'IA ne fait que proposer un brouillon : l'admin relit et corrige avant d'enregistrer.
 */

export type TranslatableFieldKind = "title" | "description" | "excerpt" | "content"

const FIELD_INSTRUCTIONS: Record<TranslatableFieldKind, string> = {
  title: "This is a short title. Keep it concise and natural, matching the tone of a professional portfolio.",
  description: "This is a short project or diploma description. Keep the meaning and tone, natural professional English.",
  excerpt: "This is a short blog post excerpt/summary. Keep it concise.",
  content: "This is the full body of a blog post, written in Markdown with ## headings and possibly code blocks. Preserve the Markdown structure, headings, code blocks and formatting exactly — only translate the natural-language text.",
}

export async function translateFrenchToEnglish(
  text: string,
  kind: TranslatableFieldKind = "description"
): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ""

  const apiKey = process.env.MISTRAL_API_KEY
  const apiUrl = process.env.MISTRAL_API_URL ?? "https://api.mistral.ai/v1/chat/completions"
  const model = process.env.MISTRAL_MODEL ?? "mistral-small-latest"

  if (!apiKey) {
    throw new Error("Traduction indisponible (MISTRAL_API_KEY manquante).")
  }

  const systemPrompt = `You are a professional French-to-English translator working on a software developer's portfolio website. Translate the given French text to natural, professional English. ${FIELD_INSTRUCTIONS[kind]} Respond with ONLY the translated text, no explanations, no quotes around it, no markdown formatting characters like ** or # unless they were already present in the source for structure.`

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
        { role: "user", content: trimmed },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("[translate] Mistral error:", res.status, errText)
    throw new Error("Le service de traduction est temporairement indisponible.")
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const translation = data?.choices?.[0]?.message?.content?.trim()

  if (!translation) {
    throw new Error("La traduction n'a renvoyé aucun contenu.")
  }

  return translation
}
