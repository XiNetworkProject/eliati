-- =====================================================
-- SCRIPT DE CORRECTION DES PERMISSIONS RLS
-- Permet l'écriture sur les tables de l'admin
-- =====================================================

-- ⚠️ IMPORTANT : Ce script désactive temporairement le RLS pour permettre
-- l'écriture depuis l'interface admin. Pour la production, vous devriez
-- implémenter une vraie authentification admin.

-- 1. SITE_SETTINGS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for site_settings" ON public.site_settings;
CREATE POLICY "Enable all for site_settings" 
ON public.site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. PROMO_CODES - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for promo_codes" ON public.promo_codes;
CREATE POLICY "Enable all for promo_codes" 
ON public.promo_codes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. PRODUCTS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for products" ON public.products;
CREATE POLICY "Enable all for products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. PRODUCT_IMAGES - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for product_images" ON public.product_images;
CREATE POLICY "Enable all for product_images" 
ON public.product_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. CATEGORIES - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for categories" ON public.categories;
CREATE POLICY "Enable all for categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. CAROUSEL_SLIDES - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for carousel_slides" ON public.carousel_slides;
CREATE POLICY "Enable all for carousel_slides" 
ON public.carousel_slides 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 7. ORDERS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for orders" ON public.orders;
CREATE POLICY "Enable all for orders" 
ON public.orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 8. ORDER_ITEMS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for order_items" ON public.order_items;
CREATE POLICY "Enable all for order_items" 
ON public.order_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 9. ADMIN_USERS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for admin_users" ON public.admin_users;
CREATE POLICY "Enable all for admin_users" 
ON public.admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 10. ANALYTICS - Permettre toutes les opérations
-- =====================================================
DROP POLICY IF EXISTS "Enable all for analytics" ON public.analytics;
CREATE POLICY "Enable all for analytics" 
ON public.analytics 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- =====================================================
-- CONFIGURATION STORAGE (pour les uploads d'images)
-- =====================================================

-- Créer le bucket 'products' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permettre l'upload et la lecture publique
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR ALL
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Permissions RLS mises à jour avec succès !';
  RAISE NOTICE '✅ Vous pouvez maintenant utiliser l''interface admin sans restrictions.';
  RAISE NOTICE '⚠️  ATTENTION : En production, implémentez une vraie authentification admin !';
END $$;

