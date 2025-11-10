-- =====================================================
-- AJOUT / MISE À JOUR DES CHAMPS DE PERSONNALISATION (CHARMS)
-- =====================================================

-- Suppression des anciens champs de gravure s'ils existent
ALTER TABLE public.products
  DROP COLUMN IF EXISTS allows_personalization,
  DROP COLUMN IF EXISTS personalization_note;

ALTER TABLE public.order_items
  DROP COLUMN IF EXISTS personalization_text,
  DROP COLUMN IF EXISTS charm_option;

-- Ajout / mise à jour des champs pour les charms
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS charms_options jsonb;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS charms jsonb;
