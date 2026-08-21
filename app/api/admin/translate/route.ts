import { NextResponse } from "next/server"
import { translateFrenchToEnglish, type TranslatableFieldKind } from "@/lib/translate"

const VALID_KINDS = new Set<TranslatableFieldKind>(["title", "description", "excerpt", "content"])

// POST /api/admin/translate — traduit un texte FR vers EN via Mistral (brouillon à relire).
// Body: { text: string, kind?: "title" | "description" | "excerpt" | "content" }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = (body?.text as string) ?? ""
    const kind: TranslatableFieldKind = VALID_KINDS.has(body?.kind) ? body.kind : "description"

    if (!text.trim()) {
      return NextResponse.json({ error: "Texte requis." }, { status: 400 })
    }

    const translation = await translateFrenchToEnglish(text, kind)
    return NextResponse.json({ translation })
  } catch (error) {
    console.error("[api/admin/translate]", error)
    const message = error instanceof Error ? error.message : "Erreur lors de la traduction."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
