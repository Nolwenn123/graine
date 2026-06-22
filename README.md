# graine

Monorepo : front **React Native (Expo, TypeScript)** + back **Node.js / Express (TypeScript)** + base de données **Supabase**.

```
graine/
├── backend/    API Express (TypeScript) — parle à Supabase via la clé service_role
├── frontend/   App Expo (TypeScript)    — consomme l'API Express
└── .nvmrc      Node 20 (requis par les outils Expo)
```

## Prérequis

- Node 20 — `nvm use` (le projet utilise Node 20, voir `.nvmrc`)
- L'app Expo Go sur ton téléphone, ou un émulateur Android / simulateur iOS

## Backend

```bash
cd backend
cp .env.example .env      # puis renseigne SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev               # http://localhost:4000  — test : /api/health
```

## Frontend

```bash
cd frontend
cp .env.example .env      # ajuste EXPO_PUBLIC_API_URL selon ta cible
npm install
npm start                 # puis 'w' (web), 'a' (Android), ou scanne le QR code
```

> ⚠️ Sur émulateur Android, `localhost` du téléphone ≠ ton PC.
> Utilise `http://10.0.2.2:4000` (émulateur) ou l'IP locale de ton PC (téléphone réel).

## Supabase

1. Crée un projet sur https://supabase.com
2. **Project Settings → API** : copie l'`URL` et la clé `service_role`
3. Colle-les dans `backend/.env` (la clé `service_role` reste **uniquement côté back**)
