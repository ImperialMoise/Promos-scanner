# FastOffres MVP

FastOffres est une page React CDN/Babel qui affiche des offres food à Bordeaux.
Le projet reste volontairement simple côté front, mais il prépare un fonctionnement hybride :

1. sources publiques d'enseignes dans `data/sources.json` ;
2. scanner automatique en `pending` ;
3. validation humaine dans Supabase ;
4. affichage uniquement des offres `published` dans l'app.

## Fichiers à mettre dans GitHub

```txt
index.html
app.js
styles.css
README.md
data/sources.json
scripts/scan-offers.js
scripts/seed-sources.js
supabase/schema.sql
supabase/functions/scan-offers/index.ts
```

## 1. Créer les tables Supabase

Dans Supabase, ouvre le SQL editor et exécute :

```sql
-- contenu de supabase/schema.sql
```

## 2. Configurer le front

Dans `index.html`, remplace les deux chaînes vides :

```js
window.FASTOFFRES_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
```

par les valeurs publiques de ton projet Supabase :

```js
window.FASTOFFRES_CONFIG = {
  supabaseUrl: "https://TON-PROJET.supabase.co",
  supabaseAnonKey: "TA_CLE_ANON_PUBLIC"
};
```

La clé `anon` est faite pour le navigateur. Ne mets jamais la clé `service_role` dans `index.html`.

## 3. Envoyer les sources dans Supabase

```bash
SUPABASE_URL="https://TON-PROJET.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="TA_CLE_SERVICE_ROLE" \
node scripts/seed-sources.js
```

## 4. Scanner les offres en local

Dry-run sans Supabase :

```bash
node scripts/scan-offers.js
```

Insertion dans Supabase en `pending` :

```bash
SUPABASE_URL="https://TON-PROJET.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="TA_CLE_SERVICE_ROLE" \
node scripts/scan-offers.js
```

## 5. Publier une offre

Dans Supabase, passe une offre de :

```txt
pending
```

à :

```txt
published
```

Le front affichera seulement les offres publiées.