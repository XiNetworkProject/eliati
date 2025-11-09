-- =====================================================
-- MISE À JOUR TABLE PROMO_CODES (STRUCTURE NOUVELLE UI)
-- =====================================================

-- Ajouter les nouvelles colonnes si elles n'existent pas déjà
ALTER TABLE public.promo_codes
ADD COLUMN IF NOT EXISTS discount_percent integer,
ADD COLUMN IF NOT EXISTS discount_amount_cents integer,
ADD COLUMN IF NOT EXISTS min_order_cents integer,
ADD COLUMN IF NOT EXISTS max_uses integer,
ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Initialiser les colonnes à des valeurs sûres
UPDATE public.promo_codes
SET used_count = COALESCE(used_count, 0),
    max_uses = CASE
      WHEN max_uses IS NULL OR max_uses <= 0 THEN NULL
      ELSE max_uses
    END,
    min_order_cents = COALESCE(min_order_cents, min_amount_cents);

-- Conversion depuis l'ancien schéma (discount_type / discount_value)
UPDATE public.promo_codes
SET discount_percent = CASE
      WHEN discount_type = 'percentage' THEN discount_value
      ELSE discount_percent
    END,
    discount_amount_cents = CASE
      WHEN discount_type = 'fixed' THEN discount_value
      ELSE discount_amount_cents
    END;

-- Contraintes de validation (ajoutées si absentes)
ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_percent_check
    CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100))
    NOT VALID;
ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_amount_check
    CHECK (discount_amount_cents IS NULL OR discount_amount_cents >= 0)
    NOT VALID;
ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_min_order_check
    CHECK (min_order_cents IS NULL OR min_order_cents >= 0)
    NOT VALID;
ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_discount_mutual_exclusion
    CHECK (
      (discount_percent IS NOT NULL AND discount_amount_cents IS NULL) OR
      (discount_percent IS NULL AND discount_amount_cents IS NOT NULL)
    )
    NOT VALID;

-- Supprimer les anciennes colonnes si elles existent
ALTER TABLE public.promo_codes
  DROP COLUMN IF EXISTS discount_type,
  DROP COLUMN IF EXISTS discount_value,
  DROP COLUMN IF EXISTS min_amount_cents;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
