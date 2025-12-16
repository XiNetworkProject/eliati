-- =====================================================
-- SYSTÈME DE VARIANTES DE PRODUITS (COLORIS + STOCK)
-- =====================================================
-- Ce script crée un système de variantes permettant de gérer
-- le stock par coloris pour chaque produit.

-- 1. Créer la table des variantes
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  sku text,
  price_cents integer, -- NULL = utilise le prix du produit parent
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Contrainte : un seul coloris par produit
  UNIQUE(product_id, color_name)
);

-- 2. RLS pour les variantes
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read product_variants" ON public.product_variants 
  FOR SELECT USING (true);

CREATE POLICY "allow all for product_variants" ON public.product_variants 
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Index pour les performances
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_color ON public.product_variants(color_name);
CREATE INDEX idx_product_variants_active ON public.product_variants(is_active);

-- 4. Ajouter variant_id aux order_items pour tracer quelle variante a été commandée
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- 5. Ajouter variant_id aux product_images pour lier les images aux variantes
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- 6. Commentaires
COMMENT ON TABLE public.product_variants IS 'Variantes de produits (coloris) avec stock individuel';
COMMENT ON COLUMN public.product_variants.color_name IS 'Nom du coloris (Or, Argent, Or rose, etc.)';
COMMENT ON COLUMN public.product_variants.price_cents IS 'Prix spécifique à cette variante (NULL = prix du produit parent)';
COMMENT ON COLUMN public.product_variants.stock_quantity IS 'Stock disponible pour cette variante';
COMMENT ON COLUMN public.order_items.variant_id IS 'Référence à la variante commandée (pour le suivi du stock)';
COMMENT ON COLUMN public.product_images.variant_id IS 'Lien optionnel vers une variante spécifique';

-- 7. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variants_updated_at();

