/**
 * Retourne le champ EN s'il existe et que la locale est "en", sinon retombe sur le champ FR.
 * Garantit qu'un contenu pas encore traduit reste visible (en français) plutôt que vide.
 */
export function localize(
  fr: string,
  en: string | null | undefined,
  locale: string
): string {
  if (locale === "en" && en && en.trim()) return en
  return fr
}
