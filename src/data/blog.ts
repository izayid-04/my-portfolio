import type { BlogPost } from "@/types"

export const blogPosts: BlogPost[] = [
  // Articles techniques d'origine
  {
    slug: "nextjs-15-server-actions",
    title: "Next.js 15 : Server Actions et mutations en douceur",
    excerpt:
      "Comment les Server Actions de Next.js 15 simplifient les mutations côté serveur sans multiplier les routes API.",
    content: `
## Introduction

Next.js 15 apporte une maturité accrue aux **Server Actions**. On peut désormais gérer des mutations directement depuis des composants serveur ou des formulaires, avec une DX soignée.

## Pourquoi les Server Actions ?

- **Moins de boilerplate** : plus besoin d’exposer une route API pour chaque mutation.
- **Typage de bout en bout** : les arguments et le retour sont typés.
- **Progressive enhancement** : les formulaires fonctionnent même sans JavaScript.

## Exemple minimal

\`\`\`tsx
// app/actions.ts
"use server"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  if (!title) return

  await db.posts.create({ title })
  revalidatePath("/blog")
}
\`\`\`

Et côté interface (App Router) :

\`\`\`tsx
// app/blog/new-post/page.tsx
import { createPost } from "../actions"

export default function NewPostPage() {
  return (
    <form action={createPost} className="space-y-4">
      <label className="block text-sm font-medium">
        Titre
        <input
          name="title"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
      >
        Créer l’article
      </button>
    </form>
  )
}
\`\`\`

## Bonnes pratiques

1. **Toujours valider les données** (Zod, valibot, etc.) avant d’écrire en base.
2. **Isoler la logique métier** dans des fonctions réutilisables pour éviter que les Server Actions grossissent trop.
3. Utiliser \`revalidatePath\` ou \`revalidateTag\` juste après une mutation pour garder l’UI synchronisée.

## Conclusion

Les Server Actions sont un outil central pour des applications Next.js modernes. Bien utilisées, elles remplacent une partie des routes API classiques et simplifient la gestion des formulaires et des mutations.
    `.trim(),
    date: "2025-02-15",
    readingTime: 5,
    tags: ["Next.js", "React", "Server Actions"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    slug: "accessibilite-web-pour-tous",
    title: "Accessibilité web : des bases à la conformité",
    excerpt:
      "Rappel des principes WCAG et des bonnes pratiques pour rendre vos interfaces utilisables par tous.",
    content: `
## L’accessibilité, c’est quoi ?

L’accessibilité web (a11y) vise à ce que les sites et applications soient **utilisables par le plus grand nombre**, y compris les personnes en situation de handicap.

## Principes WCAG

- **Perceptible** : texte alternatif, contraste, sous-titres.
- **Utilisable** : navigation au clavier, pas de piège au focus.
- **Compréhensible** : langage clair, formulaires prévisibles.
- **Robuste** : contenu interprétable par les technologies d’assistance.

## Checklist rapide en React / Next.js

- Utiliser une **sémantique HTML correcte** : \`<main>\`, \`<nav>\`, \`<header>\`, \`<footer>\`.
- S’assurer que tous les boutons interactifs sont de vrais \`<button>\` (et pas des \`<div onClick>\`).
- Ajouter des **labels explicites** aux champs de formulaires :

\`\`\`tsx
<label htmlFor="email" className="text-sm font-medium">
  Adresse e-mail
</label>
<input
  id="email"
  name="email"
  type="email"
  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
/>
\`\`\`

- Tester la navigation **au clavier uniquement** (Tab, Shift+Tab, Entrée, Espace).
- Vérifier les contrastes avec Lighthouse ou axe DevTools.

## Conclusion

Intégrer l’accessibilité dès le début du projet est moins coûteux que de corriger après coup.
    `.trim(),
    date: "2025-02-08",
    readingTime: 6,
    tags: ["Accessibilité", "WCAG", "UX"],
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
  },
  {
    slug: "typescript-strict-mode",
    title: "TypeScript en mode strict : pourquoi et comment",
    excerpt:
      "Passer un projet TypeScript en strict mode améliore la fiabilité du code. Retour d’expérience et étapes pratiques.",
    content: `
## Qu’est-ce que le mode strict ?

Dans \`tsconfig.json\`, \`"strict": true\` active un ensemble d’options qui rendent le typage plus exigeant.

## Pourquoi l’activer ?

- **Moins de bugs en production**.
- **Meilleure autocomplétion**.
- **Refactoring plus sûr**.

## Exemple de configuration

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

## Migration progressive

Sur un gros projet existant, on peut :

1. Activer d’abord \`strictNullChecks\` puis corriger les cas d’\`undefined\`.
2. Remplacer progressivement les \`any\` par des types concrets.
3. Ajouter des **types utilitaires** (par ex. \`NonNullable<T>\`, \`Partial<T>\`, etc.) pour éviter de dupliquer la logique.

## Conclusion

Le mode strict demande un peu d’effort au début, mais il améliore nettement la qualité du code et la confiance lors des refactorings.
    `.trim(),
    date: "2025-01-28",
    readingTime: 4,
    tags: ["TypeScript", "Qualité"],
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
  },
  {
    slug: "react-server-components-vs-client",
    title: "React Server Components vs Client Components",
    excerpt:
      "Comprendre la différence entre RSC et Client Components dans l’écosystème React et Next.js.",
    content: `
## Deux modèles de composants

- **Server Components** : rendus sur le serveur, pas de \`useState\` ni d’effets.
- **Client Components** : hydratés côté navigateur, peuvent utiliser hooks et événements.

## Exemple avec App Router

Un composant serveur par défaut :

\`\`\`tsx
// app/page.tsx
import Posts from "./posts"

export default async function Home() {
  const posts = await getPosts()
  return <Posts posts={posts} />
}
\`\`\`

Et un composant client pour l’interactivité :

\`\`\`tsx
\"use client\"
import { useState } from "react"

export function Posts({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("")
  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 rounded-md border border-border px-3 py-2 text-sm"
        placeholder="Rechercher un article…"
      />
      <ul className="space-y-2">
        {filtered.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </>
  )
}
\`\`\`

## Conclusion

Bien séparer Server et Client permet de réduire le JavaScript envoyé et d’améliorer les performances.
    `.trim(),
    date: "2025-01-15",
    readingTime: 5,
    tags: ["React", "Next.js", "RSC"],
    image: "https://images.unsplash.com/photo-1555066931-4365d18bab8c?w=800&q=80",
  },
  {
    slug: "tailwind-design-tokens",
    title: "Design tokens avec Tailwind CSS v4",
    excerpt:
      "Centraliser les couleurs et espacements avec les design tokens dans Tailwind v4.",
    content: `
## Design tokens : définition

Les design tokens sont des variables (couleurs, espacements, rayons, etc.) qui définissent le design system.

## Tailwind v4 et \`@theme\`

On déclare les tokens dans le CSS avec \`@theme inline { ... }\` et on les réutilise partout.

## Exemple de configuration

\`\`\`css
@theme inline {
  --color-primary: oklch(0.45 0.2 250);
  --color-primary-foreground: oklch(0.98 0 0);
  --radius-md: 0.5rem;
}
\`\`\`

Puis côté composants :

\`\`\`tsx
export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
    />
  )
}
\`\`\`

## Conclusion

Les design tokens dans Tailwind v4 permettent un design system cohérent et simple à maintenir, tout en facilitant le passage au dark mode et aux variantes de thème.
    `.trim(),
    date: "2025-01-05",
    readingTime: 4,
    tags: ["Tailwind", "Design system", "CSS"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  },

  // Nouveaux billets liés à tes projets
  {
    slug: "nora",
    title: "Nora — Assistant IA",
    excerpt:
      "Assistant IA conversationnel conçu pour vous aider et répondre à vos questions de manière naturelle et intuitive. Réalisé avec HTML, CSS, JavaScript et Python Flask.",
    content: `
## Contexte du projet

Nora est un **assistant IA conversationnel** que j’ai conçu pour offrir une expérience simple, rapide et accessible à tous. L’idée était d’avoir une interface minimaliste où l’utilisateur peut poser ses questions et recevoir des réponses naturelles, sans interface compliquée ni surcharge visuelle.

## Objectifs

- Proposer une **interface web légère** et responsive.
- Pouvoir **déployer rapidement** une démo accessible en ligne.
- Expérimenter une **architecture simple** mêlant HTML/CSS/JS côté front et **Flask** côté backend.

## Stack technique

- **Frontend :** HTML, CSS, JavaScript (vanilla)
- **Backend :** Python, Flask
- **Déploiement :** Render

Le frontend interagit avec l’API Flask via des requêtes HTTP, ce qui permet de séparer clairement l’interface de la logique de génération de réponses.

## Fonctionnalités principales

- Zone de texte pour poser une question.
- Affichage des réponses de Nora dans un historique de conversation.
- Gestion des états de chargement pour montrer que Nora « réfléchit ».

## Ce que j’ai appris

- Structurer un petit projet IA de bout en bout : **UI + backend + déploiement**.
- Gérer les temps de réponse et les erreurs réseau pour garder une bonne UX.

---

[Visiter le projet →](https://noraia.onrender.com/)
    `.trim(),
    date: "2024-01-01",
    readingTime: 1,
    tags: ["IA", "Chatbot", "Flask", "Python"],
    image: "https://images.unsplash.com/photo-1762330467475-a565d04e1808?fm=jpg&q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "udb",
    title: "Université Dakar-Bourguiba (UDB)",
    excerpt:
      "Projet réalisé lors d'un stage de 4 mois avec une équipe de 4 étudiants : site et applications pour l'université. Back-end Laravel, front-end Angular, base MySQL, hébergement OVH.",
    content: `
## Contexte et mission

Ce projet a été réalisé lors d’un **stage de 4 mois** au sein de l’Université Dakar-Bourguiba, avec une **équipe de 4 étudiants**. L’objectif était de moderniser la présence en ligne de l’université et de poser les bases d’un écosystème numérique plus solide.

## Besoins de l’université

- Un **site vitrine** clair pour présenter les formations, services et actualités.
- Une base technique prête pour accueillir, à terme, des services internes (gestion d’étudiants, inscriptions, etc.).

## Stack technique

- **Backend :** Laravel (PHP)
- **Frontend :** Angular
- **Base de données :** MySQL
- **Versioning :** Git, GitHub
- **Hébergement :** OVH

## Mon rôle

- Participation à la **conception de l’architecture** (séparation front/back).
- Développement de plusieurs **pages et composants Angular** (présentation des filières, actualités, etc.).
- Intégration avec les **endpoints Laravel** pour récupérer les données dynamiques.
- Mise en place et tests de la **base MySQL** (schémas de base, migrations).

## Résultats

- Un site institutionnel plus moderne, aligné avec l’image de l’université.
- Une stack technique robuste (Laravel + Angular + MySQL) sur laquelle il est possible de continuer à bâtir de futurs services.

---

[Visiter le site →](https://udb.sn/)
    `.trim(),
    date: "2025-07-01",
    readingTime: 1,
    tags: ["Laravel", "Angular", "MySQL", "OVH"],
    image: "https://images.unsplash.com/photo-1618255630366-f402c45736f6?fm=jpg&q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "biacode",
    title: "BIACode",
    excerpt:
      "Notre plateforme et agence tech, lancée à trois. BIACode est notre structure dédiée au développement et à l'accompagnement des projets numériques.",
    content: `
## Naissance de l’agence

Après nos premières expériences (dont le projet UDB), nous avons lancé **BIACode**, une agence tech créée à trois, avec l’envie de :

- Accompagner des entreprises et institutions dans leur **transition numérique**.
- Construire des **produits web** solides (plateformes, sites vitrines, back-offices, etc.).

## Positionnement

BIACode, c’est :

- Une **plateforme** pour présenter nos services et nos réalisations.
- Une **agence** qui intervient sur : développement web, intégration, conseil technique.

## Stack technique

- **Backend :** principalement Laravel et Node.js selon les besoins.
- **Frontend :** Angular, React / Next.js.
- **Base de données :** MySQL, PostgreSQL.
- **Outils :** Git, GitHub, hébergement LWS et autres providers.

## Ce que nous faisons concrètement

- Création de **sites vitrine** et **plateformes métier**.
- Intégration de solutions tiers (paiement, authentification, etc.).
- Maintenance et évolution de projets existants.

## Impact

BIACode est devenu le **point de départ** de plusieurs collaborations, dont le projet EASYTECS — EasyGEC. C’est aussi la vitrine de notre façon de travailler : stack moderne, bonne pratique et accompagnement sur le long terme.

---

[Visiter le site →](https://www.biacode.tech/)
    `.trim(),
    date: "2025-09-01",
    readingTime: 1,
    tags: ["Agence", "Plateforme"],
    image: "https://images.unsplash.com/photo-1702047149248-a6049168d2a8?fm=jpg&q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "easytecs",
    title: "EASYTECS — EasyGEC",
    excerpt:
      "Premier client de l'agence : plateforme pour EASYTECS, structure sénégalaise spécialisée dans les logiciels métiers. EasyGEC gère les faits d'état civil et garantit les droits fondamentaux.",
    content: `
## Contexte

EASYTECS est une **structure sénégalaise spécialisée dans les logiciels métiers**. Pour répondre aux enjeux d’état civil, ils ont conçu **EasyGEC**, un système complet de gestion des actes de la naissance au décès.

BIACode est intervenue pour concevoir et développer la **plateforme web** qui présente la solution et sert de point d’entrée pour les clients.

## Objectifs du projet

- Présenter clairement **EasyGEC** et ses bénéfices pour les communes et administrations.
- Mettre en avant la **sécurité** et la **fiabilité** du système.
- Donner un accès simple aux **informations commerciales** et au contact.

## Droits fondamentaux couverts

EasyGEC contribue à garantir des droits essentiels :

- Délivrance de la **carte nationale d’identité**.
- **Droit de vote**.
- **Qualité d’héritier**.
- **Accès à l’école**.
- **Permis de conduire**, etc.

## Stack technique

- **Backend :** Laravel
- **Frontend :** Angular
- **Base de données :** MySQL
- **Versioning :** Git, GitHub
- **Hébergement :** LWS

## Ma contribution

- Mise en place de la **structure du projet** (organisation des modules et composants).
- Intégration du **design** et des contenus marketing.
- Collaboration avec EASYTECS pour affiner le message métier et l’UX.

## Résultat

Une **plateforme claire et professionnelle** qui renforce l’image d’EASYTECS et d’EasyGEC, et qui sert de support commercial pour présenter la solution aux collectivités et institutions.

---

[Visiter le site →](https://www.easytecs.tech/)
    `.trim(),
    date: "2026-03-01",
    readingTime: 2,
    tags: ["État civil", "e-Gouvernance", "Sénégal"],
    image: "https://images.unsplash.com/photo-1581553672347-95d9444c0d2c?fm=jpg&q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "tmco",
    title: "TMCO — Transport Mobilité Centre-Ouest",
    excerpt:
      "Plateforme officielle du réseau de transport public de la 3CO à Mayotte, avec un calcul d’itinéraire basé sur l’algorithme de Dijkstra.",
    content: `
## Contexte

TMCO est la plateforme officielle du réseau de transport public de la Communauté de Communes du Centre-Ouest (3CO) à Mayotte — un territoire de 5 communes et plus de 50 000 habitants. Le projet a été réalisé pour l’agence UWEZO, avec un backend Django et un frontend Next.js.

## Mon rôle

J’étais principalement côté frontend, en charge de l’interface Next.js consultée par les usagers du réseau.

## Le vrai défi : calculer les itinéraires

La partie la plus difficile du projet n’avait rien à voir avec l’interface : c’est le calcul d’itinéraires sur la carte. J’ai implémenté l’algorithme de **Dijkstra** pour trouver le plus court chemin entre deux arrêts, en tenant compte du réseau réel de lignes et des correspondances entre les 5 communes. Une fois cette brique posée, le reste de l’intégration (recherche, affichage des horaires, responsive) s’est déroulé sans embûche particulière.

## Stack technique

- **Backend :** Django
- **Frontend :** Next.js
- **Zone couverte :** 5 communes, Mayotte

## Résultat

Une plateforme grand public qui permet à plus de 50 000 habitants de préparer leurs trajets en transport en commun, avec un calcul d’itinéraire fiable même sur un réseau à plusieurs correspondances.

---

[Visiter le site →](https://tmco.yt/)
    `.trim(),
    date: "2026-04-01",
    readingTime: 2,
    tags: ["Django", "Next.js", "Transport", "Mayotte"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
  },
  {
    slug: "yeeyo",
    title: "YEE YÔ — SaaS de Gestion Commerciale",
    excerpt:
      "SaaS complet de gestion commerciale (ERP/CRM) développé à trois, feature par feature, avec CI/CD et Docker.",
    content: `
## Contexte

YeeYo est une solution SaaS complète de gestion commerciale (ERP/CRM) : suivi des ventes, facturation, gestion des stocks et caisse enregistreuse. Développée chez BIACode, avec Next.js côté frontend et Nest.js côté backend.

## Mon rôle

On a avancé à trois, **feature par feature**, plutôt que par couche technique : sur chaque fonctionnalité, je touchais aussi bien le backend Nest.js que le frontend Next.js selon le besoin. J’ai aussi mis en place la partie **CI/CD** et la conteneurisation **Docker** du projet.

## Stack technique

- **Frontend :** Next.js
- **Backend :** Nest.js
- **Conteneurisation :** Docker
- **CI/CD :** pipeline de déploiement automatisé

## Résultat

Une plateforme SaaS opérationnelle qui couvre tout le cycle commercial — vente, facturation, stock, caisse — avec un pipeline de déploiement automatisé qui a permis à l’équipe de livrer des itérations rapides tout au long du projet.

---

[Visiter le site →](https://www.yeeyo.org/)
    `.trim(),
    date: "2026-06-01",
    readingTime: 2,
    tags: ["Next.js", "Nest.js", "Docker", "CI/CD", "SaaS"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    slug: "bonjourcitoyen",
    title: "BonjourCitoyen — Préparation à l’Examen Civique",
    excerpt:
      "Plateforme EdTech de préparation aux examens civiques en France, avec un moteur de quiz conçu de A à Z.",
    content: `
## Contexte

BonjourCitoyen est une plateforme EdTech qui aide les usagers à se préparer aux examens civiques officiels en France : titre de séjour pluriannuel, carte de résident de 10 ans et naturalisation. Backend Django, frontend Next.js, réalisé pour l’agence UWEZO.

## Mon rôle

J’ai travaillé principalement côté frontend, avec la mise en place du **moteur de quiz** — la pièce centrale du produit — et de tout ce qui gravite autour : progression, correction, affichage des résultats.

## Ce qui m’a posé le plus de problèmes

J’ai rencontré pas mal d’erreurs pendant le développement du moteur de quiz, notamment sur la synchronisation entre les réponses de l’utilisateur et les retours de l’API. M’appuyer réellement sur les **codes de statut HTTP** plutôt que sur des réponses génériques m’a énormément aidé à fiabiliser le tout et à comprendre rapidement d’où venaient les problèmes.

## Stack technique

- **Backend :** Django
- **Frontend :** Next.js

## Résultat

Une plateforme de préparation aux examens civiques avec un moteur de quiz fiable, utilisée par des usagers qui préparent des démarches administratives réelles — un contexte où la fiabilité compte particulièrement.

---

[Visiter le site →](https://bonjourcitoyen.fr/)
    `.trim(),
    date: "2026-07-01",
    readingTime: 2,
    tags: ["Django", "Next.js", "EdTech", "Examen Civique"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    slug: "photonum",
    title: "PhotoNum — Photo d’Identité Numérique e-Photo (ANTS)",
    excerpt:
      "Service web et application mobile pour générer des photos d’identité conformes ANTS, avec une PWA packagée via Capacitor.",
    content: `
## Contexte

PhotoNum (e-Photo) permet d’obtenir en quelques minutes des photos d’identité numériques avec signature électronique, conformes aux normes ANTS et Préfecture. Le projet combine un site vitrine WordPress, un serveur applicatif et une application mobile.

## Mon rôle

J’ai travaillé sur la partie applicative : un **serveur Node** et le **frontend web**, ainsi que l’**application mobile**, développée en PWA packagée directement avec **Capacitor**. Je n’ai pas touché au site vitrine WordPress, géré séparément.

## Stack technique

- **Backend :** Node.js
- **Frontend web :** Next.js
- **Mobile :** PWA packagée avec Capacitor

## Résultat

Une expérience complète, du site vitrine jusqu’à l’application mobile, qui permet aux usagers de générer une photo d’identité conforme aux exigences ANTS directement depuis leur téléphone.

---

[Visiter le site →](https://photonum.xyz/)
    `.trim(),
    date: "2026-08-01",
    readingTime: 2,
    tags: ["Next.js", "App Mobile", "e-Photo", "ANTS"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug)
}
