# PULSE Event Pass

Application fullstack autour d'un bracelet NFC pour événements (festivals, concerts, conférences). Trois surfaces orchestrées par une API unique :

- **Site marketing** — pages publiques pour présenter le concept (`/`, `/about`, `/contact`, `/features`)
- **E-commerce** — catalogue de pass NFC, panier, commandes (`/shop`, `/cart`, `/orders`)
- **SaaS** — espace organisateur (admin) + profil participant (`/admin/*`, `/me/*`)

Concept retenu : **Event Pass** (option 2 des consignes). Un bracelet = un passeport intelligent (check-in, profil public partagé, networking, achats simulés).

> ⚠️ Application fictive. Pas de hardware NFC réel : toutes les interactions « scan » sont simulables (saisie manuelle, sélection dans liste, lecture QR Code via webcam ou téléphone).

---

## Stack technique

| Couche | Outils |
|---|---|
| Frontend | Vue 3 · Vue Router · TanStack Query · shadcn-vue · Tailwind CSS · Vite |
| Backend | Node.js · Express · Mongoose · MongoDB · JWT · bcryptjs |
| Tests | Vitest + Vue Testing Library (front) · Jest + Supertest (back) · Playwright (E2E) · mongodb-memory-server |

---

## Installation

### Prérequis

- Node.js ≥ 20
- pnpm ≥ 10
- MongoDB local (ou Atlas/Neon connection string)

### Setup

```bash
pnpm install   # depuis la racine — installe client + server via workspaces
```

### Variables d'environnement

**`server/.env`** :

```bash
MONGODB_URI=mongodb://localhost:27017/pulse
JWT_SECRET=replace-me-with-a-long-random-string
JWT_EXPIRES_IN=24h
PORT=3001
```

**`client/.env`** :

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

### Lancement

```bash
pnpm dev          # lance backend (3001) + frontend (5173) en parallèle
pnpm seed         # peuple la DB avec un jeu de données démo
pnpm build        # builds production (client + server)
```

### Lancer un seul côté

```bash
pnpm --filter pulse-server dev
pnpm --filter pulse-client dev
```

---

## Architecture

### Backend — hexagonale

Chaque domaine est un module autonome organisé en couches :

```
server/src/modules/<module>/
├── application/   use-cases, services, security
├── domain/        entity, repository (interface), model, errors, constants
├── infrastructure/ schema Mongoose, repository implémentation
└── presentation/  controllers, DTOs (request/response)
```

Le fichier `<module>.module.ts` assemble manuellement les dépendances et expose un Router Express. Les modules sont câblés ensemble dans `src/create-app.ts`. Le wiring inter-modules utilise `attachDeps()` pour résoudre les dépendances circulaires sans framework DI.

**Inventaire** : `auth`, `user`, `product`, `cart`, `order`, `event`, `bracelet`, `participant`, `check-in`, `team`, `supply-order`, `analytics`.

### Frontend — feature-based + modules métier

```
client/src/
├── modules/<module>/
│   ├── core/      domain-model, ports, adapters (HTTP / in-memory)
│   └── ui/        components, hooks (queries / mutations)
├── features/      pages composées (mirror du routing)
│   ├── public/    home, shop, contact, about, features, nfc-profile, etc.
│   ├── private/   my-events, profile-edit
│   └── admin/     dashboard, events, bracelets, participants, products, orders, scanner
├── ui/            design system (shadcn-vue + skeleton + empty-state + layouts)
├── components/    composants partagés (nav, footer, fade-in)
└── routes/        coquilles vides pointant vers features/
```

### Rôle de l'API

API REST unique sous `/api/*` qui sert les trois surfaces :

- Auth JWT partagé entre SaaS et e-commerce (un seul compte, deux usages)
- Données SaaS : événements, participants, bracelets, check-ins, équipes
- Données e-commerce : produits, paniers, commandes
- Analytics : KPIs cross-modules (`/api/admin-stats`)
- Endpoint public NFC : `/api/nfc/:nfcId` → profil du porteur

Toutes les réponses suivent l'enveloppe `{ success: boolean, data | error }`. Les erreurs métier remontent via `AppError` interceptée par un middleware centralisé.

---

## Fonctionnalités

### Marketing (public)

- Hero animé + sections (concept, fonctionnalités, stats, dashboard preview, CTA)
- Pages dédiées : à propos, contact (formulaire fictif), features (3 sub-pages)
- Page produit + détail e-commerce
- Page publique d'un bracelet NFC scanné : `/p/:nfcId`
- Page publique d'un événement : `/events/:slug` (avec garde-fou capacité)

### E-commerce

- Catalogue produits (`/shop`) + page détail
- Panier persistant (drawer) + add/remove
- Validation de commande (simulation, pas de vrai paiement)
- Connexion requise pour finaliser une commande
- Page commandes utilisateur (`/orders`)

### SaaS — Participant

- Inscription / connexion (JWT, partagé avec e-commerce)
- Page « mes événements » (`/me/events`) avec carte par participation
- Édition de profil (`/me/events/:id`) : nom affiché, rôle, bio, liens éditables
- QR code généré pour bracelet attaché (entrée scannée par l'organisateur)

### SaaS — Admin (rôle organizer/admin)

- Dashboard avec KPIs cross-modules + charts (activations / interactions / stock)
- Gestion événements : liste paginée, création, édition, transitions d'état (draft → upcoming → in_progress → completed)
- Centre de contrôle d'un événement : participants, bracelets, check-ins, équipe (4 onglets)
- Gestion bracelets globale (inventaire, statuts, désactivation)
- Gestion participants globale (vue cross-events avec filtres)
- Scanner check-in : 3 modes (saisie manuelle / sélection participant / lecture QR)
- Admin produits (catalogue) + admin commandes (statuts)

### Authentification

- Un seul système (`/api/auth/register` + `/api/auth/login`) basé sur JWT
- Compte partagé : un user créé via le e-commerce peut s'inscrire à un événement et inversement
- Rôles : `customer` (défaut) / `admin` (accès aux endpoints `/api/admin-stats` et CRUD sensibles)
- Middleware `createAuthMiddleware` + `createAdminMiddleware` pour gérer les routes protégées

---

## Tests

### Frontend (Vitest)

```bash
pnpm --filter pulse-client test         # 31 tests unitaires + intégration composants
```

### Backend (Jest)

```bash
pnpm --filter pulse-server test         # 188 tests unitaires (use-cases, entités) + 15 d'intégration HTTP
```

Les tests d'intégration utilisent **Supertest** + **mongodb-memory-server** (DB isolée par test).

### E2E (Playwright)

```bash
pnpm --filter pulse-client test:e2e     # parcours complet user
pnpm --filter pulse-client test:e2e:ui  # mode UI
```

---

## Conventions

- TypeScript strict partout
- Pas d'enums (objets `as const`)
- Pas de commentaires WHAT, uniquement WHY
- Fichiers en kebab-case avec suffixe métier (`.use-case.ts`, `.adapter.http.ts`, etc.)
- Pas de filtrage côté frontend pour les KPIs : toujours côté backend

Voir [`QA_NOTES.md`](./QA_NOTES.md) pour la stratégie de tests.
