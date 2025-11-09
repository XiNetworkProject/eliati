-- =====================================================
-- AJOUT DU MODE D'ENVOI (COLISSIMO) DANS LES COMMANDES
-- =====================================================

-- Ajouter la colonne shipping_method si elle n'existe pas déjà
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_method text;

-- Ajouter la colonne shipping_weight_grams pour stocker le poids total expédié
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_weight_grams integer default 0;

-- Mettre à jour les commandes existantes sans mode d'envoi
UPDATE public.orders
SET shipping_method = COALESCE(shipping_method, 'colissimo');

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN public.orders.shipping_method IS 'Identifiant du mode d''expédition (ex: colissimo, mondial-relay, chronopost)';
COMMENT ON COLUMN public.orders.shipping_weight_grams IS 'Poids total expédié (en grammes) pour la commande';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
