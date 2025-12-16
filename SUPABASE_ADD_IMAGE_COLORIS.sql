-- =====================================================
-- AJOUTER LE CHAMP "COLORIS" AUX IMAGES DE PRODUITS
-- =====================================================
-- Ce script permet d'associer un nom de coloris à chaque image produit.
-- Ainsi, les clients peuvent choisir un coloris en cliquant sur la miniature correspondante.

-- Ajouter la colonne color_name à product_images
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS color_name text;

-- Commentaire explicatif
COMMENT ON COLUMN public.product_images.color_name IS 
  'Nom du coloris associé à cette image (ex: Or, Argent, Or rose). NULL si pas de variante de couleur.';

-- Index pour filtrer rapidement par coloris
CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(color_name);

