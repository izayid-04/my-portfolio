import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Le français (langue par défaut) garde ses URLs actuelles sans préfixe
  // (/, /blog, /contact...) pour ne rien casser côté SEO déjà en place.
  // Seul l'anglais ajoute un préfixe : /en, /en/blog, /en/contact...
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]
