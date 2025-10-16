-- =====================================================
-- SCRIPT COMPLET SUPABASE POUR ELIATI BOUTIQUE
-- =====================================================

-- 1. TABLE CATEGORIES
-- =====================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- RLS pour les catégories
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select using (true);

-- 2. TABLE PRODUCTS
-- =====================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_cents integer not null,
  compare_at_cents integer,
  category_id uuid references public.categories(id) on delete set null,
  is_new boolean default false,
  is_sale boolean default false,
  is_featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les produits
alter table public.products enable row level security;
create policy "public read products" on public.products for select using (true);

-- 3. TABLE PRODUCT_IMAGES
-- =====================================================
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- RLS pour les images de produits
alter table public.product_images enable row level security;
create policy "public read product_images" on public.product_images for select using (true);

-- 4. TABLE PROMO_CODES
-- =====================================================
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null, -- 'percentage' or 'fixed'
  discount_value integer not null, -- percentage (e.g., 10 for 10%) or fixed amount in cents
  min_amount_cents integer, -- minimum order amount for the code to be valid
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- RLS pour les codes promo
alter table public.promo_codes enable row level security;
create policy "public read promo_codes" on public.promo_codes for select using (true);

-- 5. TABLE SITE_SETTINGS
-- =====================================================
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb, -- Store settings as JSON
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les paramètres du site
alter table public.site_settings enable row level security;
create policy "public read site_settings" on public.site_settings for select using (true);

-- 6. TABLE ORDERS
-- =====================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb not null,
  billing_address jsonb,
  subtotal_cents integer not null,
  tax_cents integer default 0,
  shipping_cents integer default 0,
  discount_cents integer default 0,
  total_cents integer not null,
  promo_code_id uuid references public.promo_codes(id),
  status text default 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  paypal_order_id text,
  paypal_payment_id text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les commandes
alter table public.orders enable row level security;
create policy "public read orders" on public.orders for select using (true);

-- 7. TABLE ORDER_ITEMS
-- =====================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null, -- Store product name at time of order
  product_price_cents integer not null, -- Store price at time of order
  quantity integer not null,
  created_at timestamp with time zone default now()
);

-- RLS pour les articles de commande
alter table public.order_items enable row level security;
create policy "public read order_items" on public.order_items for select using (true);

-- 8. TABLE CAROUSEL_SLIDES
-- =====================================================
create table public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  button_text text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- RLS pour les diapositives du carousel
alter table public.carousel_slides enable row level security;
create policy "public read carousel_slides" on public.carousel_slides for select using (true);

-- 9. TABLE ADMIN_USERS
-- =====================================================
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text default 'admin', -- 'admin', 'super_admin'
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les utilisateurs admin
alter table public.admin_users enable row level security;
create policy "public read admin_users" on public.admin_users for select using (true);

-- 10. TABLE ANALYTICS
-- =====================================================
create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'page_view', 'product_view', 'add_to_cart', 'purchase', etc.
  event_data jsonb,
  user_id text, -- anonymous user ID
  session_id text,
  page_url text,
  referrer text,
  created_at timestamp with time zone default now()
);

-- RLS pour les analytics
alter table public.analytics enable row level security;
create policy "public read analytics" on public.analytics for select using (true);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

-- Indexes pour les produits
create index idx_products_category on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_products_is_new on public.products(is_new);
create index idx_products_is_sale on public.products(is_sale);
create index idx_products_is_featured on public.products(is_featured);

-- Indexes pour les images de produits
create index idx_product_images_product on public.product_images(product_id);
create index idx_product_images_sort on public.product_images(sort_order);

-- Indexes pour les commandes
create index idx_orders_customer_email on public.orders(customer_email);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at);

-- Indexes pour les articles de commande
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id);

-- Indexes pour les codes promo
create index idx_promo_codes_code on public.promo_codes(code);
create index idx_promo_codes_active on public.promo_codes(is_active);

-- Indexes pour les paramètres du site
create index idx_site_settings_key on public.site_settings(setting_key);

-- Indexes pour les diapositives du carousel
create index idx_carousel_slides_active on public.carousel_slides(is_active);
create index idx_carousel_slides_sort on public.carousel_slides(sort_order);

-- Indexes pour les analytics
create index idx_analytics_event_type on public.analytics(event_type);
create index idx_analytics_created_at on public.analytics(created_at);
create index idx_analytics_user_id on public.analytics(user_id);

-- =====================================================
-- DONNÉES DE BASE
-- =====================================================

-- Insérer les catégories de base
insert into public.categories (name, slug, description) values
('Colliers', 'colliers', 'Colliers délicats et élégants'),
('Boucles d''oreilles', 'boucles-oreilles', 'Boucles d''oreilles fines et raffinées'),
('Bagues', 'bagues', 'Bagues intemporelles et sophistiquées'),
('Bracelets', 'bracelets', 'Bracelets délicats et modernes');

-- Insérer des paramètres de site par défaut
insert into public.site_settings (setting_key, setting_value) values
('site_title', '"EliAti – Bijoux"'),
('site_description', '"Bijoux faits main – colliers, boucles, bagues, bracelets."'),
('contact_email', '"Contacteliati@gmail.com"'),
('paypal_client_id', 'null'),
('paypal_client_secret', 'null'),
('paypal_mode', '"sandbox"'),
('currency', '"EUR"'),
('tax_rate', '0.2'),
('shipping_cost', '500'),
('free_shipping_threshold', '5000');

-- Insérer des diapositives de carousel par défaut
insert into public.carousel_slides (title, subtitle, image_url, button_text, link_url, sort_order) values
('Nouveautés', 'Découvrez nos dernières créations', '/hero/hero1.jpg', 'Voir les nouveautés', '/new', 1),
('Promotions', 'Profitez de nos offres spéciales', '/hero/hero2.jpg', 'Voir les promos', '/sale', 2),
('Collection', 'Des bijoux pensés à quatre mains', '/hero/hero3.jpg', 'Découvrir', '/', 3);

-- =====================================================
-- POLITIQUES RLS POUR ADMIN (À AJOUTER APRÈS AUTHENTIFICATION)
-- =====================================================

-- Note: Ces politiques devront être ajoutées après avoir configuré l'authentification
-- et identifié les utilisateurs admin. Pour l'instant, seules les politiques de lecture
-- sont activées pour permettre le fonctionnement du site public.

-- Exemple de politiques admin (à décommenter et adapter) :
/*
-- Politiques pour les produits (admin)
create policy "admin manage products" on public.products for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);

-- Politiques pour les catégories (admin)
create policy "admin manage categories" on public.categories for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);

-- Politiques pour les codes promo (admin)
create policy "admin manage promo_codes" on public.promo_codes for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);

-- Politiques pour les paramètres du site (admin)
create policy "admin manage site_settings" on public.site_settings for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);

-- Politiques pour les commandes (admin)
create policy "admin manage orders" on public.orders for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);

-- Politiques pour les diapositives du carousel (admin)
create policy "admin manage carousel_slides" on public.carousel_slides for all using (
  exists (
    select 1 from public.admin_users 
    where admin_users.email = auth.jwt() ->> 'email' 
    and admin_users.is_active = true
  )
);
*/

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
