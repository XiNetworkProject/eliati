-- =====================================================
-- SCRIPT D'AJOUT DES COLONNES MANQUANTES
-- Ajoute les colonnes qui manquent dans les tables existantes
-- =====================================================

-- 1. Ajouter les colonnes manquantes dans la table PRODUCTS
-- =====================================================

-- Colonne status (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.products ADD COLUMN status text DEFAULT 'active';
        RAISE NOTICE 'Colonne "status" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "status" existe déjà dans products';
    END IF;
END $$;

-- Colonne is_new (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_new'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_new boolean DEFAULT false;
        RAISE NOTICE 'Colonne "is_new" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "is_new" existe déjà dans products';
    END IF;
END $$;

-- Colonne is_sale (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_sale'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_sale boolean DEFAULT false;
        RAISE NOTICE 'Colonne "is_sale" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "is_sale" existe déjà dans products';
    END IF;
END $$;

-- Colonne is_featured (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_featured boolean DEFAULT false;
        RAISE NOTICE 'Colonne "is_featured" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "is_featured" existe déjà dans products';
    END IF;
END $$;

-- Colonne updated_at (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Colonne "updated_at" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "updated_at" existe déjà dans products';
    END IF;
END $$;

-- 2. Ajouter les colonnes manquantes dans la table PRODUCT_IMAGES
-- =====================================================

-- Colonne sort_order (si elle n'existe pas et que position existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_images' 
        AND column_name = 'sort_order'
    ) THEN
        -- Si la colonne position existe, la renommer en sort_order
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'product_images' 
            AND column_name = 'position'
        ) THEN
            ALTER TABLE public.product_images RENAME COLUMN position TO sort_order;
            RAISE NOTICE 'Colonne "position" renommée en "sort_order" dans product_images';
        ELSE
            -- Sinon créer la colonne sort_order
            ALTER TABLE public.product_images ADD COLUMN sort_order integer DEFAULT 0;
            RAISE NOTICE 'Colonne "sort_order" ajoutée à la table product_images';
        END IF;
    ELSE
        RAISE NOTICE 'Colonne "sort_order" existe déjà dans product_images';
    END IF;
END $$;

-- 3. Ajouter les colonnes manquantes dans la table CATEGORIES
-- =====================================================

-- Colonne image_url (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN image_url text;
        RAISE NOTICE 'Colonne "image_url" ajoutée à la table categories';
    ELSE
        RAISE NOTICE 'Colonne "image_url" existe déjà dans categories';
    END IF;
END $$;

-- 4. Créer les indexes manquants
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_sale ON public.products(is_sale);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at);

-- 5. Rafraîchir le cache du schéma
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colonnes manquantes ajoutées avec succès !';
  RAISE NOTICE '✅ Vous pouvez maintenant créer des produits.';
  RAISE NOTICE '⚠️  Si l''erreur persiste, actualisez la page de l''interface admin (F5).';
END $$;

