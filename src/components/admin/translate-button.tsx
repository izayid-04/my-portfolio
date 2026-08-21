"use client"

import { useState } from "react"
import { Languages, Loader2 } from "lucide-react"
import type { TranslatableFieldKind } from "@/lib/translate"

interface TranslateButtonProps {
  /** Texte français source à traduire */
  sourceText: string
  kind: TranslatableFieldKind
  onTranslated: (translation: string) => void
  className?: string
}

/** Bouton "Traduire avec l'IA" : pré-remplit un champ EN en brouillon depuis le texte FR (à relire avant d'enregistrer). */
export function TranslateButton({ sourceText, kind, onTranslated, className }: TranslateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (!sourceText.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, kind }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || typeof data?.translation !== "string") {
        throw new Error(data?.error || "Échec de la traduction.")
      }
      onTranslated(data.translation)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la traduction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!sourceText.trim() || loading}
        className={
          className ??
          "cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        }
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Languages className="size-3.5" />}
        Traduire avec l&apos;IA
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
