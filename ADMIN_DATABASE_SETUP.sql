-- Tables supplémentaires pour l'administration EliAti

-- Table des codes promotionnels
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent integer check (discount_percent >= 0 and discount_percent <= 100),
  discount_amount_cents integer check (discount_amount_cents >= 0),
  min_order_cents integer check (min_order_cents >= 0),
  max_uses integer check (max_uses > 0),
  used_count integer default 0 check (used_count >= 0),
  is_active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Contraintes
  constraint promo_codes_discount_check check (
    (discount_percent is not null and discount_amount_cents is null) or
    (discount_percent is null and discount_amount_cents is not null)
  )
);

-- Table des paramètres du site
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table des commandes (pour l'avenir)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_email text not null,
  customer_name text,
  total_cents integer not null check (total_cents >= 0),
  discount_cents integer default 0 check (discount_cents >= 0),
  promo_code_id uuid references public.promo_codes(id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  paypal_order_id text,
  shipping_address jsonb,
  billing_address jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table des articles de commande
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_price_cents integer not null check (product_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default now()
);

-- Table des slides du carousel
create table public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  image_url text not null,
  link_url text,
  position integer not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index pour optimiser les requêtes
create index on public.promo_codes (code);
create index on public.promo_codes (is_active);
create index on public.orders (order_number);
create index on public.orders (customer_email);
create index on public.orders (status);
create index on public.order_items (order_id);
create index on public.carousel_slides (position);
create index on public.carousel_slides (is_active);

-- RLS (Row Level Security)
alter table public.promo_codes enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.carousel_slides enable row level security;

-- Politiques de lecture publique pour les éléments visibles
create policy "public read promo_codes" on public.promo_codes for select using (is_active = true);
create policy "public read carousel_slides" on public.carousel_slides for select using (is_active = true);

-- Politiques pour les admins (à adapter selon votre système d'auth)
-- Pour l'instant, on permet tout (à sécuriser plus tard)
create policy "admin manage promo_codes" on public.promo_codes for all using (true);
create policy "admin manage settings" on public.settings for all using (true);
create policy "admin manage orders" on public.orders for all using (true);
create policy "admin manage order_items" on public.order_items for all using (true);
create policy "admin manage carousel_slides" on public.carousel_slides for all using (true);

-- Données de test pour les slides du carousel
insert into public.carousel_slides (title, caption, image_url, position, is_active) values
  ('Nouvelle collection', 'Or rose & perles', '/hero/slide1.jpg', 1, true),
  ('Gravure offerte', 'Sur une sélection', '/hero/slide2.jpg', 2, true),
  ('-20% cette semaine', 'Code ELIGOLD', '/hero/slide3.jpg', 3, true);

-- Paramètres par défaut
insert into public.settings (key, value, description) values
  ('site_title', 'EliAti - Bijoux', 'Titre du site'),
  ('site_description', 'Bijoux faits main par deux sœurs', 'Description du site'),
  ('contact_email', 'Contacteliati@gmail.com', 'Email de contact'),
  ('paypal_config', '{}', 'Configuration PayPal (JSON)');

-- Fonction pour générer un numéro de commande unique
create or replace function generate_order_number()
returns text as $$
declare
  new_number text;
begin
  loop
    new_number := 'ELI-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    if not exists (select 1 from public.orders where order_number = new_number) then
      return new_number;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Trigger pour mettre à jour updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_promo_codes_updated_at before update on public.promo_codes for each row execute function update_updated_at_column();
create trigger update_settings_updated_at before update on public.settings for each row execute function update_updated_at_column();
create trigger update_orders_updated_at before update on public.orders for each row execute function update_updated_at_column();
create trigger update_carousel_slides_updated_at before update on public.carousel_slides for each row execute function update_updated_at_column();
