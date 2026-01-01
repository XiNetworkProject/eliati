-- =====================================================
-- Script SQL pour les paramètres du site
-- À exécuter dans Supabase > SQL Editor
-- =====================================================

-- Table site_settings (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "allow all for site_settings" ON public.site_settings;

-- Politique de lecture publique
CREATE POLICY "public read site_settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Politique d'écriture (tous autorisés pour simplifier - à restreindre en production)
CREATE POLICY "allow all for site_settings" 
ON public.site_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Index sur setting_key
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- =====================================================
-- Créer le bucket pour les assets du site (logo, etc.)
-- =====================================================
-- Note: Exécutez ces commandes dans Supabase Storage settings
-- ou via l'API Storage:
-- 
-- 1. Créer le bucket "site-assets" en mode public
-- 2. Configurer les politiques:
--    - Lecture publique
--    - Upload autorisé (ou restreint aux admins)

-- =====================================================
-- Valeurs par défaut (optionnel)
-- =====================================================
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES 
  ('site_config', '{
    "site_name": "EliAti",
    "slogan": "Bijoux artisanaux faits main",
    "contact_email": "",
    "contact_phone": "",
    "instagram_url": "",
    "facebook_url": "",
    "show_promo_banner": false,
    "maintenance_mode": false
  }'::jsonb),
  ('shipping_config', '{
    "free_shipping_threshold": 50,
    "colissimo_base_price": 6.90,
    "mondial_relay_point_price": 4.90,
    "mondial_relay_locker_price": 5.50,
    "mondial_relay_home_price": 6.50,
    "processing_time": "1-2",
    "show_delivery_estimate": true
  }'::jsonb),
  ('legal_texts', '{
    "mentions_legales": "",
    "cgv": "",
    "politique_confidentialite": "",
    "politique_retour": "",
    "faq": ""
  }'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

