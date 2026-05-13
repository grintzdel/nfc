# QA Notes — Stratégie de tests PULSE Event Pass

Document de stratégie qualité pour le projet. Couvre les types de tests, les risques identifiés et les choix techniques effectués.

## 1. Types de tests utilisés

| Type                             | Définition                                                                                                       | Présent dans le projet ?                                                                                 | Outil                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Tests unitaires**              | Vérifient une unité isolée (fonction, classe, composant) sans dépendance externe. Mocks/stubs pour les bordures. | ✅ Backend (use-cases, entités) · ✅ Frontend (composants, hooks, adapters)                              | Jest · Vitest                |
| **Tests d'intégration backend**  | Vérifient l'interaction entre couches (route HTTP → controller → service → use-case → repository → DB).          | ✅ 15 tests via Supertest + mongodb-memory-server                                                        | Jest + Supertest             |
| **Tests d'intégration frontend** | Vérifient un composant connecté à ses dépendances (queries TanStack, mutations, dialogs Teleport).               | ✅ Inclus dans la suite Vitest (composants montés avec providers)                                        | Vitest + Vue Testing Library |
| **Tests fonctionnels**           | Vérifient un comportement métier complet du point de vue utilisateur.                                            | ⚠️ Couverts partiellement par les E2E ciblés sur chaque page critique                                    | Playwright                   |
| **Tests E2E**                    | Simulent un vrai utilisateur sur l'app complète, en parlant à la vraie API.                                      | ✅ Parcours nominal (inscription → connexion → SaaS → panier → commande → vérif) + 4 pages individuelles | Playwright                   |

### Pourquoi cette stratégie

- **Unitaires denses** côté domain/use-cases : le domain est framework-agnostic, donc les tests sont rapides et stables. C'est là que vit la logique métier — une régression unitaire est plus facile à diagnostiquer qu'une régression E2E.
- **Intégration backend via Supertest** : permet de valider la chaîne complète (validation des DTOs → middleware auth → controller → service → use-case → Mongoose → MongoDB) sans déployer. La DB en mémoire (`mongodb-memory-server`) garantit isolation et rapidité.
- **Frontend pragma : Vitest sur composants + hooks** : on monte les composants avec un `QueryClient` factice ou un adapter `InMemory`, on inspecte le rendu et les émissions. Pas de Cypress côté unitaire — réservé à Playwright pour la couche E2E.
- **E2E ciblé** : les E2E coûtent cher à maintenir. On garde un parcours complet « happy path » et quelques tests pages clés (nfc-profile, event-public, participant-edit, event-detail admin).

## 2. Risques identifiés

| Catégorie                  | Risque                                                                                         | Mitigation                                                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                   | Token expiré, mal signé, refusé. Compte partagé entre SaaS et e-commerce qui se désynchronise. | Tests intégration : login OK, mauvais MDP, user inconnu, route protégée sans/avec token. Tests unitaires use-cases auth (`register.use-case.spec`, `login.use-case.spec`).                                                   |
| **Auth**                   | Échelle de droits (customer vs admin vs organizer) mal appliquée.                              | Test intégration produit : un customer reçoit 403 sur POST `/api/products`, admin reçoit 201.                                                                                                                                |
| **Validation DTOs**        | Données mal formées acceptées (email invalide, prix négatif, name manquant).                   | Tests intégration : POST register avec email invalide → 400. POST product avec name vide ou price < 0 → 400.                                                                                                                 |
| **MongoDB**                | Schéma désynchronisé, ID malformés, duplicate key (email, slug).                               | mongodb-memory-server pour isoler. Tests unitaires d'entité valident les invariants.                                                                                                                                         |
| **Panier non synchronisé** | Le panier en localStorage diverge de la session ou est perdu après login.                      | Module cart côté serveur. À tester en E2E (parcours complet) lors d'un futur run.                                                                                                                                            |
| **Capacité événement**     | Inscriptions au-delà de la capacité max.                                                       | Test unitaire `register-participant.use-case.spec` + check `EventFullError`. Garde-fou côté front (`event-public.page.vue`) qui masque le formulaire.                                                                        |
| **Dedup check-in**         | Un participant scanné deux fois à l'entrée.                                                    | Test unitaire `record-check-in.use-case.spec` qui rejette les doublons `CHECK_IN` (mais laisse passer `NETWORKING`, `VOTE`, `CASHLESS`).                                                                                     |
| **Cross-module deps**      | Bracelets dépendent de Participants, Participants dépendent de Bracelets (cycle).              | Pattern `attachDeps` testé manuellement via le bootstrap. Faille potentielle : aucun test n'attrape un oubli d'`attachDeps`. **Acceptée comme risque connu** (le serveur crash au démarrage, donc on le voit immédiatement). |
| **API échoués côté front** | TanStack Query retry indéfini ou affiche un état cassé.                                        | Tests unitaires composants : `isLoading`, `isError`, `data` rendus correctement. Toasts pour les mutations en échec.                                                                                                         |
| **État Vue divergent**     | Reactivité perdue après un dialog/modal, ou data stale.                                        | Tests Vitest sur les composants utilisant `ref` + watch. Refetch automatique via `useQuery` après invalidation.                                                                                                              |

## 3. Stratégie de tests

### Ce qui est testé

- **Logique métier pure** (entités + use-cases) → unitaire.
- **Endpoints HTTP** auth (register, login, route protégée) + un CRUD complet (produits) avec tous les codes d'erreur attendus.
- **Composants UI critiques** : table avec pagination, dialog avec form, profile-edit, nfc-profile-hero.
- **Adapters HTTP / In-Memory** : les deux implémentent la même interface, donc les tests sur l'In-Memory valident le contrat.
- **Parcours E2E complet** : nouvel utilisateur → catalogue → ajout panier → commande → résultat affiché.

### Ce qui n'est PAS testé

- **Rendu visuel exact** (CSS, animations) → repose sur revue visuelle manuelle.
- **Cross-browser** → Playwright en Chromium uniquement. Pas de Safari/Firefox.
- **Performance** → pas de test de charge ni de mesure de temps de réponse.
- **Sécurité** (XSS, CSRF, injection) → pas d'audit dédié, repose sur les bonnes pratiques (CORS strict, sanitization JSON via Express, JWT signé).
- **Resilience réseau** → pas de simulation de coupure réseau ou de latence haute en E2E.
- **Migrations DB** → pas de versionning des schémas Mongoose en mode prod.

### Priorités de test

1. **P0** — Auth (compte unique, JWT, routes protégées) : tout est cassé sans ça.
2. **P0** — Inscription événement + capacity guard.
3. **P0** — Commande validée (parcours panier → order).
4. **P1** — Check-in (déduplication, transition de statut bracelet PRE_ACTIVATED → ACTIVE).
5. **P1** — Édition profil participant + propagation NFC.
6. **P2** — Stats dashboard (KPIs cohérents avec les données réelles).
7. **P2** — Gestion équipe (invitations).

### Choix techniques effectués

| Choix                                                | Raison                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Jest + Supertest** côté serveur (vs Vitest)        | Jest est le standard Express/Node et la doc Supertest est centrée Jest. ts-jest compile bien le TS strict du projet.           |
| **mongodb-memory-server** (vs base de test dédiée)   | Tests isolés par fichier, pas de pollution entre runs, pas de setup CI complexe. Coût mémoire acceptable (~80MB par instance). |
| **Vitest côté client** (vs Jest)                     | Plus rapide avec Vite, support natif ESM + TS, JSDOM intégré.                                                                  |
| **Playwright** (vs Cypress)                          | Multi-onglet, auto-waiting plus robuste, support natif WebKit pour validation iOS si besoin.                                   |
| **Pattern factory pour les data tests**              | Centralise la création d'objets, IDs incrémentés via un compteur. Override par paramètre.                                      |
| **Adapters HTTP + InMemory partagés** côté client    | Permet de tester les composants/hooks avec un adapter en mémoire (rapide) tout en validant le contrat sur l'adapter HTTP.      |
| **`mongodb-memory-server` 60s timeout au beforeAll** | Première initialisation peut prendre 30s (download du binaire). Timeout généreux pour éviter les faux négatifs en CI.          |

## 4. Conventions de tests

- Colocation des `.spec.ts` (backend) et `.test.ts` (frontend) avec le code testé
- Suffixe `.integration.spec.ts` pour les tests Supertest (filtrables via `--testPathPattern=integration`)
- Suffixe `.test.e2e.ts` pour les tests Playwright
- Factories sous `__tests__/factories/` ou `__tests__/*.factory.ts`
- Mocks manuels (pas de `jest.mock` sauf nécessité)
- Structure AAA : Arrange (setup) → Act (call) → Assert (expect)

## 5. CI/CD

Voir `.github/workflows/ci.yml`. À chaque push/PR sur `main` :

1. Install + build client + server
2. Lint client (oxlint)
3. Run tests client (Vitest)
4. Run tests server (Jest + intégration)

Un échec sur n'importe lequel bloque le merge. Pas de déploiement automatique pour l'instant.
