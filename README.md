# 🛍️ EliAtis - Boutique de bijoux

Boutique e-commerce de bijoux faits main, construite avec Next.js 15, Supabase et Tailwind CSS.

## 🚀 Stack technique

- **Framework** : Next.js 15 (App Router, TypeScript)
- **Base de données** : Supabase (PostgreSQL + Storage)
- **Styling** : Tailwind CSS v4
- **UI Components** : shadcn/ui
- **Carousel** : Embla Carousel
- **Déploiement** : Vercel

## 📦 Installation

1. **Cloner le projet**

```bash
git clone <votre-repo>
cd eliatisshop
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Configurer Supabase**

Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Types
create type product_status as enum ('active','draft');

-- Catégories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Produits
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents >= 0),
  status product_status not null default 'active',
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Images produit
create table public.product_images (
  id bigserial primary key,
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position int default 0
);

-- Index
create index on public.products (category_id);
create index on public.product_images (product_id);

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

create policy "public read categories" on public.categories for select using (true);
create policy "public read products" on public.products for select using (true);
create policy "public read images" on public.product_images for select using (true);
```

5. **Seed de données (optionnel)**

```sql
insert into public.categories (name, slug, description) values
 ('Colliers','colliers','Chaînes fines, pendentifs personnalisés'),
 ('Boucles d''oreilles','boucles','Créoles, puces, pendantes'),
 ('Bagues','bagues','Bagues ajustables, fines, gravées'),
 ('Bracelets','bracelets','Mailles, joncs, perles');

insert into public.products (name, slug, description, price_cents, compare_at_cents, category_id)
select 'Collier Initiale Or Rose','collier-initiale-rose','Personnalisable – acier inoxydable doré rose', 3490, 3990, id 
from categories where slug='colliers';
```

6. **Créer un bucket Storage public**

Dans Supabase Storage, créez un bucket nommé `products` avec l'option "Public bucket" activée.

7. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎨 Design

### Typographies

- **Logo/Script** : Allura
- **Titres** : Cormorant Garamond
- **Corps** : Inter

### Palette de couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| `ivory` | `#F4EFEA` | Fond principal |
| `champagne` | `#EED3BF` | Surfaces douces |
| `rose` | `#E2B1B1` | CTA secondaire |
| `mauve` | `#B87986` | Hover/badges |
| `taupe` | `#A28386` | Textes subtils |
| `leather` | `#5A4744` | Texte principal |
| `gold` | `#C5A572` | Détails luxueux |

## 📁 Structure du projet

```
src/
├── app/
│   ├── category/[slug]/    # Pages par catégorie
│   ├── product/[id]/       # Fiches produit
│   ├── new/                # Nouveautés
│   ├── sale/               # Promotions
│   ├── fonts.ts            # Configuration des polices
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Logo.tsx
│   ├── MainCarousel.tsx
│   ├── CategoryTiles.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── Section.tsx
└── lib/
    ├── supabase.ts         # Client Supabase
    └── utils.ts            # Utilitaires
```

## 🚢 Déploiement sur Vercel

1. **Connecter votre repository GitHub à Vercel**

2. **Configurer les variables d'environnement**

Dans les paramètres du projet Vercel, ajoutez :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Déployer**

Vercel détectera automatiquement Next.js et déploiera votre application.

## 📝 Assets nécessaires

Ajoutez vos images dans le dossier `public/` :

```
public/
├── hero/
│   ├── slide1.jpg
│   ├── slide2.jpg
│   └── slide3.jpg
├── cat/
│   ├── colliers.jpg
│   ├── boucles.jpg
│   ├── bagues.jpg
│   └── bracelets.jpg
├── logo-eliatis.png (optionnel)
└── placeholder.jpg
```

## 🔮 Évolutions futures

- [ ] Page produit avec galerie d'images complète
- [ ] Système de panier avec Stripe
- [ ] Authentification client (Supabase Auth)
- [ ] Back-office admin pour la gestion des produits
- [ ] Filtres et tri sur les pages catégories
- [ ] Recherche de produits
- [ ] Wishlist
- [ ] Avis clients

## 📄 Licence

Projet privé © 2025 EliAtis

---

**Fait avec ❤️ par deux sœurs passionnées de bijoux**
