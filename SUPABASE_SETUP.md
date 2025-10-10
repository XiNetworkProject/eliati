# 🗄️ Configuration Supabase pour EliAtis

Ce document détaille la configuration complète de Supabase pour la boutique EliAtis.

## 📊 Schéma de base de données

### 1. Créer les types et tables

Connectez-vous à votre projet Supabase et allez dans **SQL Editor**. Exécutez le script suivant :

```sql
-- Types énumérés
create type product_status as enum ('active','draft');

-- Table des catégories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Table des produits
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

-- Table des images produit
create table public.product_images (
  id bigserial primary key,
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position int default 0
);

-- Index pour optimiser les requêtes
create index on public.products (category_id);
create index on public.products (status);
create index on public.product_images (product_id);
```

### 2. Activer Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Politiques de lecture publique
create policy "public read categories" 
  on public.categories for select 
  using (true);

create policy "public read products" 
  on public.products for select 
  using (true);

create policy "public read images" 
  on public.product_images for select 
  using (true);
```

### 3. Données de test (seed)

```sql
-- Insertion des catégories
insert into public.categories (name, slug, description) values
  ('Colliers', 'colliers', 'Chaînes fines, pendentifs personnalisés'),
  ('Boucles d''oreilles', 'boucles', 'Créoles, puces, pendantes'),
  ('Bagues', 'bagues', 'Bagues ajustables, fines, gravées'),
  ('Bracelets', 'bracelets', 'Mailles, joncs, perles');

-- Produits d'exemple
insert into public.products (name, slug, description, price_cents, compare_at_cents, category_id)
select 
  'Collier Initiale Or Rose',
  'collier-initiale-rose',
  'Personnalisable – acier inoxydable doré rose avec initiale gravée. Chaîne fine 45cm.',
  3490,
  3990,
  id 
from public.categories where slug='colliers';

insert into public.products (name, slug, description, price_cents, category_id)
select 
  'Créoles Fines Argent',
  'creoles-fines-argent',
  'Boucles d''oreilles créoles en argent 925, diamètre 20mm. Fermoir clipsable.',
  2490,
  id 
from public.categories where slug='boucles';

insert into public.products (name, slug, description, price_cents, compare_at_cents, category_id)
select 
  'Bague Ajustable Perle',
  'bague-ajustable-perle',
  'Bague ajustable avec perle d''eau douce. Or fin 18K.',
  4990,
  5490,
  id 
from public.categories where slug='bagues';

insert into public.products (name, slug, description, price_cents, category_id)
select 
  'Bracelet Chaîne Fine',
  'bracelet-chaine-fine',
  'Bracelet chaîne fine en or 14K, longueur ajustable 16-18cm.',
  3990,
  id 
from public.categories where slug='bracelets';
```

## 🖼️ Configuration du Storage

### 1. Créer un bucket public

1. Allez dans **Storage** dans le menu Supabase
2. Cliquez sur **New bucket**
3. Nom : `products`
4. **Cochez** "Public bucket"
5. Cliquez sur **Create bucket**

### 2. Configurer les politiques du bucket

```sql
-- Permettre la lecture publique des images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- Permettre l'upload (pour les admins uniquement, à adapter selon vos besoins)
create policy "Admin Upload"
on storage.objects for insert
with check ( bucket_id = 'products' );
```

### 3. Upload d'images d'exemple

Uploadez quelques images dans le bucket `products` pour tester :

1. Allez dans Storage > products
2. Cliquez sur **Upload file**
3. Sélectionnez vos images de produits

### 4. Lier les images aux produits

```sql
-- Exemple : ajouter une image au collier
insert into public.product_images (product_id, url, alt, position)
select 
  id,
  'https://VOTRE_URL.supabase.co/storage/v1/object/public/products/collier-initiale.jpg',
  'Collier Initiale Or Rose',
  0
from public.products 
where slug = 'collier-initiale-rose';
```

## 🔑 Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ajoutez-les dans votre fichier `.env.local`

## 📈 Requêtes utiles

### Voir tous les produits avec leurs images

```sql
select 
  p.*,
  pi.url as image_url,
  c.name as category_name
from products p
left join product_images pi on pi.product_id = p.id and pi.position = 0
left join categories c on c.id = p.category_id
where p.status = 'active'
order by p.created_at desc;
```

### Produits en promotion

```sql
select *
from products
where status = 'active'
  and compare_at_cents is not null
  and compare_at_cents > price_cents;
```

### Compter les produits par catégorie

```sql
select 
  c.name,
  count(p.id) as product_count
from categories c
left join products p on p.category_id = c.id and p.status = 'active'
group by c.id, c.name
order by c.name;
```

## 🛡️ Sécurité

### Pour un back-office admin (à venir)

Vous devrez :

1. Créer une table `admin_users`
2. Configurer Supabase Auth
3. Ajouter des politiques RLS pour les admins :

```sql
-- Exemple de politique pour les admins
create policy "Admin can manage products"
on public.products
for all
using (
  auth.uid() in (
    select user_id from admin_users
  )
);
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) ou la communauté Discord.

