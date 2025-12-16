-- Table des avis clients
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour récupérer les avis par produit
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Lecture publique des avis approuvés
CREATE POLICY "Public can read approved reviews" 
  ON public.reviews FOR SELECT 
  USING (is_approved = true);

-- Tout le monde peut créer un avis
CREATE POLICY "Anyone can create reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (true);

-- Admin peut tout faire
CREATE POLICY "Admin can manage reviews" 
  ON public.reviews FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Commentaire
COMMENT ON TABLE public.reviews IS 'Avis clients sur les produits';
COMMENT ON COLUMN public.reviews.rating IS 'Note de 1 à 5 étoiles';
COMMENT ON COLUMN public.reviews.is_verified_purchase IS 'Vrai si le client a acheté le produit';
COMMENT ON COLUMN public.reviews.is_approved IS 'Vrai si l''avis a été approuvé par l''admin';

