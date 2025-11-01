-- =====================================================
-- SYSTÈME DE GESTION DE STOCK ET PRÉCOMMANDES
-- =====================================================

-- 1. Ajouter les colonnes de stock dans la table PRODUCTS
-- =====================================================

-- Colonne stock_quantity (quantité en stock)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE public.products ADD COLUMN stock_quantity integer DEFAULT NULL;
        RAISE NOTICE 'Colonne "stock_quantity" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "stock_quantity" existe déjà dans products';
    END IF;
END $$;

-- Colonne stock_status (statut du stock)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'stock_status'
    ) THEN
        ALTER TABLE public.products ADD COLUMN stock_status text DEFAULT 'in_stock';
        -- Valeurs possibles: 'in_stock', 'low_stock', 'out_of_stock', 'preorder'
        RAISE NOTICE 'Colonne "stock_status" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "stock_status" existe déjà dans products';
    END IF;
END $$;

-- Colonne low_stock_threshold (seuil de stock bas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'low_stock_threshold'
    ) THEN
        ALTER TABLE public.products ADD COLUMN low_stock_threshold integer DEFAULT 5;
        RAISE NOTICE 'Colonne "low_stock_threshold" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "low_stock_threshold" existe déjà dans products';
    END IF;
END $$;

-- Colonne preorder_limit (nombre maximum de précommandes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'preorder_limit'
    ) THEN
        ALTER TABLE public.products ADD COLUMN preorder_limit integer DEFAULT NULL;
        RAISE NOTICE 'Colonne "preorder_limit" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "preorder_limit" existe déjà dans products';
    END IF;
END $$;

-- Colonne preorder_count (nombre de précommandes actuelles)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'preorder_count'
    ) THEN
        ALTER TABLE public.products ADD COLUMN preorder_count integer DEFAULT 0;
        RAISE NOTICE 'Colonne "preorder_count" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "preorder_count" existe déjà dans products';
    END IF;
END $$;

-- Colonne preorder_available_date (date de disponibilité pour précommande)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'preorder_available_date'
    ) THEN
        ALTER TABLE public.products ADD COLUMN preorder_available_date timestamp with time zone DEFAULT NULL;
        RAISE NOTICE 'Colonne "preorder_available_date" ajoutée à la table products';
    ELSE
        RAISE NOTICE 'Colonne "preorder_available_date" existe déjà dans products';
    END IF;
END $$;

-- 2. Créer une fonction pour mettre à jour automatiquement le stock_status
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le produit est en précommande
    IF NEW.stock_status = 'preorder' THEN
        -- Ne rien changer
        RETURN NEW;
    END IF;

    -- Si stock_quantity est NULL, on ne gère pas le stock
    IF NEW.stock_quantity IS NULL THEN
        NEW.stock_status := 'in_stock';
    -- Si stock = 0
    ELSIF NEW.stock_quantity = 0 THEN
        NEW.stock_status := 'out_of_stock';
    -- Si stock <= seuil bas
    ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
        NEW.stock_status := 'low_stock';
    -- Sinon stock normal
    ELSE
        NEW.stock_status := 'in_stock';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_stock_status ON public.products;
CREATE TRIGGER trigger_update_stock_status
    BEFORE INSERT OR UPDATE OF stock_quantity, low_stock_threshold
    ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_status();

-- 3. Créer une fonction pour décrémenter le stock lors d'une commande
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
BEGIN
    -- Récupérer les infos du produit
    SELECT stock_quantity, stock_status, preorder_count, preorder_limit
    INTO product_record
    FROM public.products
    WHERE id = NEW.product_id;

    -- Si le produit est en précommande
    IF product_record.stock_status = 'preorder' THEN
        -- Incrémenter le compteur de précommandes
        UPDATE public.products
        SET preorder_count = COALESCE(preorder_count, 0) + NEW.quantity
        WHERE id = NEW.product_id;
    -- Sinon, décrémenter le stock normal
    ELSIF product_record.stock_quantity IS NOT NULL THEN
        UPDATE public.products
        SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
        WHERE id = NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur order_items
DROP TRIGGER IF EXISTS trigger_decrement_stock ON public.order_items;
CREATE TRIGGER trigger_decrement_stock
    AFTER INSERT
    ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION decrement_product_stock();

-- 4. Créer des indexes pour les nouvelles colonnes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_stock_status ON public.products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);

-- 5. Mettre à jour les produits existants (donner un stock par défaut)
-- =====================================================

-- Mettre stock illimité pour tous les produits existants (NULL = pas de gestion de stock)
UPDATE public.products 
SET stock_quantity = NULL, 
    stock_status = 'in_stock',
    low_stock_threshold = 5,
    preorder_count = 0
WHERE stock_quantity IS NULL;

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Système de gestion de stock installé avec succès !';
  RAISE NOTICE '✅ Les colonnes suivantes ont été ajoutées : stock_quantity, stock_status, low_stock_threshold, preorder_limit, preorder_count, preorder_available_date';
  RAISE NOTICE '✅ Le stock sera automatiquement décrémenté lors des commandes';
  RAISE NOTICE '✅ Le statut du stock sera mis à jour automatiquement';
  RAISE NOTICE '⚠️  Par défaut, les produits existants ont un stock illimité (NULL)';
END $$;

