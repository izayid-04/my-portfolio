# Portfolio — Izayid Ali

Portfolio personnel construit avec Next.js 16 (App Router) et React 19 : un site public dynamique (piloté par une base de données via un dashboard admin) et un assistant IA conversationnel intégré au hero, avec streaming des réponses en temps réel.

**Démo en ligne :** _à compléter_

## Aperçu

<!--
  Ajoute tes captures d'écran dans `public/screenshots/` puis décommente les lignes
  correspondantes ci-dessous (retire les balises <!-- --> autour de chaque bloc).

  Suggestions de captures à prendre :
  - home.png            → hero + assistant IA intégré
  - chat.png             → panneau de chat ouvert avec une réponse en streaming
  - projects.png          → section projets avec les filtres
  - cv.png               → viewer PDF du CV (zoom / pan)
  - admin-dashboard.png  → dashboard admin (vue d'ensemble)
  - admin-projects.png   → gestion des projets côté admin
-->

<!--
| Accueil | Chat IA |
|---|---|
| ![Accueil](./public/screenshots/home.png) | ![Chat](./public/screenshots/chat.png) |

| Projets | CV |
|---|---|
| ![Projets](./public/screenshots/projects.png) | ![CV](./public/screenshots/cv.png) |

| Dashboard admin |
|---|
| ![Admin](./public/screenshots/admin-dashboard.png) |
-->

## Fonctionnalités

### Site public
- Hero avec assistant IA conversationnel (**Nova**) intégré directement dans la landing page
- Réponses de l'assistant en streaming, affichées caractère par caractère
- Section projets filtrable par entreprise, technologie et mot-clé
- Fiches projets détaillées avec aperçu du site en direct (iframe) ou vidéo
- Page CV : rendu HD d'un PDF (Canvas + PDF.js), zoom molette/pincer-zoomer, déplacement à la souris ou au doigt
- Blog, page contact (formulaire avec reCAPTCHA + envoi d'email via Resend)
- Thème clair / sombre, Google Analytics 4
- Contenu (projets, diplômes, entreprises, établissements, CV) entièrement piloté par la base de données

### Dashboard admin
- Authentification par session JWT (cookie `httpOnly`), toutes les routes `/api/admin/*` protégées par un proxy Next.js dédié
- Gestion CRUD : projets, entreprises, diplômes, établissements, articles de blog, messages de contact
- Upload de fichiers (images, logos, CV en PDF) vers Supabase Storage
- Notifications toast (Sonner) sur chaque action de sauvegarde/suppression
- Gestion du profil admin (email, mot de passe) avec hachage bcrypt

## Stack technique

| Domaine | Technologies |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons |
| Base de données | PostgreSQL (Supabase) via Prisma ORM |
| Authentification | JWT (`jose`), cookies `httpOnly`, hachage `bcryptjs` |
| IA | API Mistral (chat conversationnel, streaming) |
| Email | Resend |
| Stockage fichiers | Supabase Storage |
| Autres | reCAPTCHA v2, Google Analytics 4, PDF.js |

## Démarrage local

```bash
# 1. Cloner puis installer les dépendances
pnpm install

# 2. Copier le template d'environnement et remplir les valeurs
cp .env.example .env.local

# 3. Synchroniser le schéma Prisma avec la base
pnpm db:push

# 4. (Optionnel) Peupler la base avec les données initiales
#    Nécessite ADMIN_DEFAULT_EMAIL et ADMIN_DEFAULT_PASSWORD dans .env.local
pnpm db:seed

# 5. Lancer le serveur de développement
pnpm dev
```

Le site est servi sur [http://localhost:3005](http://localhost:3005).

## Sécurité

- Toutes les routes admin (`/api/admin/*`, hors `login`/`logout`) sont protégées par un proxy Next.js (`proxy.ts`) qui vérifie un token JWT signé avant de laisser passer la requête.
- Aucun secret n'est codé en dur : `JWT_SECRET`, les identifiants admin par défaut et les clés d'API tierces sont exclusivement lus depuis les variables d'environnement — l'application refuse de démarrer si `JWT_SECRET` est absent.
- Mots de passe hachés avec `bcrypt`, jamais stockés ni journalisés en clair.
- `.env*` est exclu du dépôt (`.gitignore`) ; seul `.env.example` (valeurs factices) est versionné.

## Licence

Projet personnel — tous droits réservés.
