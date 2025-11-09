-- =====================================================
-- AJOUT DU POIDS PRODUIT ET DU POIDS D'EXPÉDITION
-- =====================================================

-- Ajoute la colonne weight_grams aux produits (grammes)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight_grams integer default 0;

-- Ajoute la colonne shipping_weight_grams aux commandes
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_weight_grams integer default 0;

-- Initialise les colonnes à zéro pour les enregistrements existants
UPDATE public.products SET weight_grams = COALESCE(weight_grams, 0);
UPDATE public.orders SET shipping_weight_grams = COALESCE(shipping_weight_grams, 0);

-- Documentation
COMMENT ON COLUMN public.products.weight_grams IS 'Poids du produit en grammes';
COMMENT ON COLUMN public.orders.shipping_weight_grams IS 'Poids total expédié en grammes';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
