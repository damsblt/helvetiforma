### HelvetiForma v3 — Récapitulatif technique pour estimation

**Objectif**: permettre à un·e dev full‑stack de comprendre rapidement la portée du projet pour proposer un prix de vente réaliste de la web app (code + intégrations + docs).

---

### Contexte et positionnement
- **Produit**: plateforme hybride de formation/webinaires.
- **État**: prêt production côté app; configuration WordPress/TutorLMS en attente/déployable.
- **Architecture**: frontend Next.js + CMS headless Sanity + intégrations Microsoft Graph (Teams) et WordPress/TutorLMS; automations de paiement/inscription prévues.

---

### Stack principale
- **Frontend**: Next.js 15, React 19, TypeScript, App Router
- **UI**: Tailwind CSS v4, Framer Motion
- **CMS**: Sanity (Portable Text, CDN, preview)
- **Auth**: NextAuth v5 (Microsoft Entra ID/OAuth)
- **Intégrations**: Microsoft Graph (webinaires Teams), WordPress/TutorLMS (cours, achats), Supabase (min. data/analytics)
- **Déploiement**: Vercel (app), Sanity Cloud (CMS), WordPress géré séparément

---

### Fonctionnalités livrées (principales)
- **Calendrier webinaires (Teams)**: liste/inscription/désinscription, routes protégées, middleware, endpoints API dédiés.
- **CMS Sanity**: schémas pages/sections, rendu Portable Text, preview en temps réel, images optimisées.
- **Pages marketing**: accueil, concept, contact (+ composants UI réutilisables).
- **Admin léger**: sections d’administration pour contenu et utilisateurs (base).
- **Intégration WordPress/TutorLMS (préparée)**: API client, types, endpoints Next.js, fallback de données mock si WP indisponible.
- **Automations paiement/commande (préparées)**: endpoints et scripts pour flux WooCommerce/TutorLMS, vérifications doublons, webhooks.

---

### Endpoints / modules notables
- `src/app/api/webinars/*`: intégration Microsoft Graph (liste/CRUD webinaires)
- `src/lib/microsoft.ts`: utilitaires Microsoft Graph
- `src/app/api/wordpress/*` et `src/lib/wordpress.ts`: intégration WP/TutorLMS
- `src/app/api/payment/*`: création session / intents / webhooks / enregistrement achats
- `src/app/api/cron/*`: synchronisations (ex: articles)
- `src/middleware.ts` et `src/auth.ts`: auth/protection routes

---

### Sécurité & qualité
- **Auth**: NextAuth v5, Microsoft Entra ID, routes protégées, JWT si WP.
- **Types**: TS strict, types dédiés (WordPress/TutorLMS, contenu, etc.).
- **Qualité**: ESLint/Prettier, structure modulaire, docs nombreuses pour exploitation.

---

### Déploiement & env
- **Vercel** pour Next.js; **Sanity Cloud** pour Studio + CDN; **WP** sur domaine séparé.
- Fichiers d’exemple: `env.example`, guides de configuration Azure AD, Sanity, WordPress, Paiements, etc.

---

### Ce qui reste à configurer (opérationnel)
- **WordPress/TutorLMS**: installation/plugin, application password, contenu cours, passerelles de paiement.
- **Azure AD (prod)**: finaliser les IDs/secret + consentements.
- **DNS & domaines**: routage `app.*`, `cms.*`, variables d’env homogènes.
- **Tests finaux**: scénarios achat/inscription bout‑en‑bout (scripts fournis).

---

### Ampleur du travail réalisé
- Migration depuis systèmes instables → architecture moderne maintenable.
- Intégrations multiples prêtes (Microsoft Graph, Sanity, WP/TutorLMS), code et endpoints.
- Nombreux guides opérationnels: déploiement, configuration, tests, dépannage.
- UI propre, composants réutilisables, rendu contenu dynamique.

---

### Complexité/risques (pour chiffrage)
- Multi‑fournisseurs (Vercel, Sanity, WP/TutorLMS, Microsoft) et leurs modèles d’auth.
- Webhooks et synchronisations (paiements, inscriptions) avec prévention de doublons.
- Protection des routes et gestion d’état auth multi‑sources (Microsoft/WordPress).
- Maintenance de schémas CMS + rendu (Portable Text) et performances (ISR/CDN).

---

### Coûts récurrents (indicatifs)
- **Vercel**: selon plan (traffic/builds).
- **Sanity**: plan usage (requêtes/CDN, collaborateurs).
- **WordPress**: hébergement + licences éventuelles (TutorLMS/paiement).
- **Microsoft Entra**: gratuit/selon tenant; Microsoft 365 si Teams/Exchange.

---

### Fourchette de valorisation (code + intégrations + docs)
Hypothèse: projet clef‑en‑main prêt à opérer, restant ≈ 1–2 semaines de config/QA finale côté WordPress/paiement selon besoins.

- **Basse** (marché frugal, code only, faible accompagnement): 7 000 – 10 000 €
- **Médiane** (SME, livrable exploitable + transfert + 1 mois support correctif): 12 000 – 18 000 €
- **Haute** (pack pro: mise en prod complète WP/paiement, ateliers, QA, garanties): 20 000 – 28 000 €

Notes:
- Ajouts sur mesure (catalogue avancé, SSO WordPress↔Next unifié, analytics profond, design system complet, e2e tests CI) → +2–8 k€.
- TMA (forfait mensuel correctif/évolutif) typiquement 8–15% du prix de vente/an.

---

### Livrables inclus
- Code source complet Next.js/TypeScript, schémas Sanity, clients API Microsoft/WordPress.
- Scripts/tests de vérification flux d’achat et synchronisation.
- Guides de configuration/déploiement (Azure AD, Sanity, WordPress, paiement, email).
- Setup Vercel prêt, variables d’environnement d’exemple.

---

### Liens internes utiles (repo)
- `PROJECT_OVERVIEW.md` — synthèse projet et stack
- `README.md` — architecture et plan de dev
- `AZURE_AD_SETUP_VISUAL_GUIDE.md` — configuration Microsoft
- `WORDPRESS_CONFIGURATION_GUIDE.md` — intégration TutorLMS
- `PUBLIC_CALENDAR_IMPLEMENTATION.md` / `PUBLIC_CALENDAR_COMPLETE.md` — calendrier Teams
- `PAYMENT_DEPLOYMENT_GUIDE.md`, `COURSE_CHECKOUT_STATUS.md` — paiement/commandes

---

### Recommandation pour devis
Proposer un prix dans la **fourchette médiane** si prise en charge de la mise en prod WordPress/TutorLMS et d’un lot de QA/formation. Sinon, option « code‑only » à la baisse et TMA en option.





