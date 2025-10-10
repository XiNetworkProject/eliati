# 📁 Structure du projet EliAtis

## Arborescence complète

```
eliatisshop/
│
├── 📄 Configuration
│   ├── package.json              # Dépendances npm
│   ├── tsconfig.json             # Configuration TypeScript
│   ├── next.config.ts            # Configuration Next.js
│   ├── components.json           # Configuration shadcn/ui
│   ├── eslint.config.mjs         # Configuration ESLint
│   ├── postcss.config.mjs        # Configuration PostCSS
│   ├── env.example               # Template variables d'environnement
│   └── .gitignore                # Fichiers ignorés par Git
│
├── 📚 Documentation
│   ├── README.md                 # Vue d'ensemble
│   ├── GETTING_STARTED.md        # Démarrage rapide
│   ├── SUPABASE_SETUP.md         # Configuration Supabase
│   ├── DEPLOYMENT.md             # Déploiement Vercel
│   ├── PROJECT_SUMMARY.md        # Résumé du projet
│   └── STRUCTURE.md              # Ce fichier
│
├── 🎨 Public (Assets statiques)
│   ├── hero/
│   │   ├── slide1.jpg            # Image carousel 1
│   │   ├── slide2.jpg            # Image carousel 2
│   │   └── slide3.jpg            # Image carousel 3
│   ├── cat/
│   │   ├── colliers.jpg          # Image catégorie colliers
│   │   ├── boucles.jpg           # Image catégorie boucles
│   │   ├── bagues.jpg            # Image catégorie bagues
│   │   └── bracelets.jpg         # Image catégorie bracelets
│   └── placeholder.jpg           # Image placeholder produits
│
└── 💻 Source (src/)
    │
    ├── 📱 app/                   # Pages Next.js (App Router)
    │   │
    │   ├── 🏠 Page d'accueil
    │   │   ├── page.tsx          # / - Homepage
    │   │   ├── layout.tsx        # Layout racine
    │   │   ├── globals.css       # Styles globaux + Tailwind
    │   │   └── fonts.ts          # Configuration Google Fonts
    │   │
    │   ├── 📂 category/
    │   │   └── [slug]/
    │   │       └── page.tsx      # /category/{slug} - Pages catégories
    │   │
    │   ├── 🛍️ product/
    │   │   └── [id]/
    │   │       └── page.tsx      # /product/{id} - Fiche produit
    │   │
    │   ├── ✨ new/
    │   │   └── page.tsx          # /new - Nouveautés
    │   │
    │   └── 🏷️ sale/
    │       └── page.tsx          # /sale - Promotions
    │
    ├── 🧩 components/            # Composants React
    │   │
    │   ├── 🎯 Composants métier
    │   │   ├── Header.tsx        # En-tête + navigation
    │   │   ├── Footer.tsx        # Pied de page
    │   │   ├── Logo.tsx          # Logo EliAtis
    │   │   ├── MainCarousel.tsx  # Carousel héro
    │   │   ├── CategoryTiles.tsx # Grille catégories
    │   │   ├── ProductCard.tsx   # Carte produit
    │   │   ├── ProductGrid.tsx   # Grille de produits
    │   │   └── Section.tsx       # Wrapper section
    │   │
    │   └── 🎨 ui/ (shadcn/ui)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── badge.tsx
    │       ├── separator.tsx
    │       ├── skeleton.tsx
    │       └── avatar.tsx
    │
    ├── 📚 lib/                   # Utilitaires
    │   ├── utils.ts              # Fonctions utilitaires (cn, etc.)
    │   └── supabase.ts           # Client Supabase
    │
    └── 🏷️ types/                 # Types TypeScript
        └── database.ts           # Types Supabase
```

## 🗂️ Organisation par fonctionnalité

### Pages publiques (visiteurs)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `app/page.tsx` | Homepage avec carousel + catégories |
| `/category/colliers` | `app/category/[slug]/page.tsx` | Page catégorie Colliers |
| `/category/boucles` | `app/category/[slug]/page.tsx` | Page catégorie Boucles d'oreille |
| `/category/bagues` | `app/category/[slug]/page.tsx` | Page catégorie Bagues |
| `/category/bracelets` | `app/category/[slug]/page.tsx` | Page catégorie Bracelets |
| `/product/{id}` | `app/product/[id]/page.tsx` | Fiche produit détaillée |
| `/new` | `app/new/page.tsx` | Nouveautés (triées par date) |
| `/sale` | `app/sale/page.tsx` | Promotions (produits en promo) |

### Composants réutilisables

| Composant | Usage | Où utilisé |
|-----------|-------|------------|
| `Header` | Navigation principale | Toutes les pages |
| `Footer` | Pied de page | Toutes les pages |
| `MainCarousel` | Carousel auto 3 slides | Homepage |
| `CategoryTiles` | Grille 4 catégories | Homepage |
| `ProductCard` | Carte produit individuelle | ProductGrid |
| `ProductGrid` | Grille de produits | Category, New, Sale |
| `Section` | Wrapper avec titre | Homepage, Category |

## 🎨 Styles & Design System

### Fichiers de style

```
src/app/globals.css
├── @import tailwindcss         # Import Tailwind v4
├── @theme inline               # Configuration couleurs & fonts
├── :root                       # Variables CSS (light mode)
├── .dark                       # Variables CSS (dark mode)
└── @layer base                 # Styles de base
```

### Couleurs personnalisées

```css
--color-ivory: #F4EFEA;         /* Fond principal */
--color-champagne: #EED3BF;     /* Surfaces douces */
--color-rose: #E2B1B1;          /* CTA secondaire */
--color-mauve: #B87986;         /* Hover/badges */
--color-taupe: #A28386;         /* Textes subtils */
--color-leather: #5A4744;       /* Texte principal */
--color-gold: #C5A572;          /* Détails luxueux */
```

Usage dans les composants :
```tsx
className="bg-ivory text-leather border-gold/30"
```

### Typographies

```typescript
// src/app/fonts.ts
Allura          → var(--font-allura)   → font-script
Cormorant       → var(--font-cormorant) → font-display
Inter           → var(--font-inter)     → font-body (défaut)
```

Usage :
```tsx
<h1 className="font-display">Titre</h1>
<p className="font-body">Texte</p>
<span className="font-script">Logo</span>
```

## 🗄️ Base de données Supabase

### Tables

```
categories
├── id (uuid, PK)
├── name (text)
├── slug (text, unique)
├── description (text, nullable)
└── created_at (timestamp)

products
├── id (uuid, PK)
├── name (text)
├── slug (text, unique)
├── description (text, nullable)
├── price_cents (integer)
├── compare_at_cents (integer, nullable)
├── status (enum: 'active', 'draft')
├── category_id (uuid, FK → categories)
├── created_at (timestamp)
└── updated_at (timestamp)

product_images
├── id (bigserial, PK)
├── product_id (uuid, FK → products)
├── url (text)
├── alt (text, nullable)
└── position (integer)
```

### Requêtes types

**Homepage - Derniers produits**
```typescript
supabase
  .from('products')
  .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(8)
```

**Catégorie - Produits d'une catégorie**
```typescript
supabase
  .from('products')
  .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
  .eq('category_id', categoryId)
  .eq('status', 'active')
```

**Promotions - Produits en solde**
```typescript
supabase
  .from('products')
  .select('id,name,slug,price_cents,compare_at_cents,product_images(url)')
  .eq('status', 'active')
  .not('compare_at_cents', 'is', null)
  .gt('compare_at_cents', 'price_cents')
```

## 📦 Dépendances principales

### Production
```json
{
  "next": "15.5.4",                          // Framework
  "react": "19.x",                           // UI library
  "@supabase/supabase-js": "^2.x",          // Client Supabase
  "embla-carousel-react": "^8.x",            // Carousel
  "lucide-react": "^0.x",                    // Icônes
  "clsx": "^2.x",                            // Utilitaire classes
  "tailwindcss": "^4.x"                      // Styling
}
```

### Développement
```json
{
  "typescript": "^5.x",                      // Typage
  "eslint": "^9.x",                          // Linter
  "@types/node": "^22.x",                    // Types Node
  "@types/react": "^19.x"                    // Types React
}
```

## 🔄 Flux de données

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ HTTP Request
       │
┌──────▼──────┐
│   Next.js   │ ← pages/api/route handlers
│   Server    │ ← Server Components
└──────┬──────┘
       │
       │ PostgreSQL queries
       │
┌──────▼──────┐
│  Supabase   │
│  (Database) │ ← RLS policies
│  + Storage  │ ← Bucket: products
└─────────────┘
```

## 🚀 Commandes utiles

```bash
# Développement
npm run dev              # Lance le serveur dev (http://localhost:3000)
npm run build            # Build de production
npm start                # Lance le serveur de prod
npm run lint             # Vérifie le code

# Supabase (si CLI installé)
supabase init            # Initialise Supabase local
supabase start           # Lance Supabase local
supabase db reset        # Reset la DB locale
```

## 📝 Conventions de code

### Nommage
- **Composants** : PascalCase (`ProductCard.tsx`)
- **Fichiers utils** : camelCase (`supabase.ts`)
- **Types** : PascalCase (`Product`, `Category`)
- **Variables** : camelCase (`productList`, `categoryId`)
- **CSS classes** : kebab-case via Tailwind

### Structure des composants
```typescript
// 1. Imports
import { ... }

// 2. Types (si nécessaire)
type Props = { ... }

// 3. Composant
export default function ComponentName({ props }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Fonctions
  const handleClick = () => { ... }
  
  // 6. Render
  return (...)
}
```

---

**📌 Note** : Cette structure est modulaire et peut être étendue au fur et à mesure de l'évolution du projet.

