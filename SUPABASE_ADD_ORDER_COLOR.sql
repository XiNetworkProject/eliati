-- =====================================================
-- AJOUTER LE CHAMP "COLOR" AUX ARTICLES DE COMMANDE
-- =====================================================
-- Ce script permet d'enregistrer le coloris choisi par le client
-- pour chaque article de sa commande.

-- Ajouter la colonne color à order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS color text;

-- Commentaire explicatif
COMMENT ON COLUMN public.order_items.color IS 
  'Coloris choisi par le client pour cet article (ex: Or, Argent, Or rose). NULL si pas de variante.';

