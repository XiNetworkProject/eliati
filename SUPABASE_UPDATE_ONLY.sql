-- =====================================================
-- SCRIPT DE MISE À JOUR SUPABASE POUR ELIATI
-- N'ajoute QUE les nouvelles tables manquantes
-- =====================================================

-- 1. TABLE PROMO_CODES (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null, -- 'percentage' or 'fixed'
  discount_value integer not null,
  min_amount_cents integer,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- RLS pour les codes promo
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read promo_codes" ON public.promo_codes;
CREATE POLICY "public read promo_codes" ON public.promo_codes FOR SELECT USING (true);

-- 2. TABLE SITE_SETTINGS (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les paramètres du site
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read site_settings" ON public.site_settings;
CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT USING (true);

-- 3. TABLE ORDERS (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
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
  status text default 'pending',
  paypal_order_id text,
  paypal_payment_id text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les commandes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read orders" ON public.orders;
CREATE POLICY "public read orders" ON public.orders FOR SELECT USING (true);

-- 4. TABLE ORDER_ITEMS (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_price_cents integer not null,
  quantity integer not null,
  created_at timestamp with time zone default now()
);

-- RLS pour les articles de commande
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read order_items" ON public.order_items;
CREATE POLICY "public read order_items" ON public.order_items FOR SELECT USING (true);

-- 5. TABLE CAROUSEL_SLIDES (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.carousel_slides (
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
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read carousel_slides" ON public.carousel_slides;
CREATE POLICY "public read carousel_slides" ON public.carousel_slides FOR SELECT USING (true);

-- 6. TABLE ADMIN_USERS (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text default 'admin',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS pour les utilisateurs admin
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read admin_users" ON public.admin_users;
CREATE POLICY "public read admin_users" ON public.admin_users FOR SELECT USING (true);

-- 7. TABLE ANALYTICS (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_data jsonb,
  user_id text,
  session_id text,
  page_url text,
  referrer text,
  created_at timestamp with time zone default now()
);

-- RLS pour les analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read analytics" ON public.analytics;
CREATE POLICY "public read analytics" ON public.analytics FOR SELECT USING (true);

-- =====================================================
-- INDEXES POUR PERFORMANCE (création sécurisée)
-- =====================================================

-- Indexes pour les commandes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Indexes pour les articles de commande
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- Indexes pour les codes promo
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);

-- Indexes pour les paramètres du site
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- Indexes pour les diapositives du carousel
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON public.carousel_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_sort ON public.carousel_slides(sort_order);

-- Indexes pour les analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);

-- =====================================================
-- DONNÉES DE BASE (insertion sécurisée)
-- =====================================================

-- Insérer des paramètres de site par défaut (si pas déjà présents)
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
  ('site_title', '"EliAti – Bijoux"'),
  ('site_description', '"Bijoux faits main – colliers, boucles, bagues, bracelets."'),
  ('contact_email', '"Contacteliati@gmail.com"'),
  ('paypal_client_id', 'null'),
  ('paypal_client_secret', 'null'),
  ('paypal_mode', '"sandbox"'),
  ('currency', '"EUR"'),
  ('tax_rate', '0.2'),
  ('shipping_cost', '500'),
  ('free_shipping_threshold', '5000')
ON CONFLICT (setting_key) DO NOTHING;

-- Insérer des diapositives de carousel par défaut (si pas déjà présentes)
INSERT INTO public.carousel_slides (title, subtitle, image_url, button_text, link_url, sort_order, is_active)
VALUES
  ('Nouveautés', 'Découvrez nos dernières créations', '/hero/hero1.jpg', 'Voir les nouveautés', '/new', 0, true),
  ('Promotions', 'Profitez de nos offres spéciales', '/hero/hero2.jpg', 'Voir les promos', '/sale', 1, true),
  ('Collection', 'Des bijoux pensés à quatre mains', '/hero/hero3.jpg', 'Découvrir', '/', 2, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIN DU SCRIPT DE MISE À JOUR
-- =====================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Mise à jour de la base de données terminée avec succès !';
  RAISE NOTICE 'Les nouvelles tables ont été créées.';
  RAISE NOTICE 'Vous pouvez maintenant utiliser l''interface d''administration.';
END $$;

