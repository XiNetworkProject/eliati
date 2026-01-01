'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type SiteConfig = {
  site_name: string
  slogan: string
  description: string
  logo_url: string | null
  favicon_url: string | null
  contact_email: string
  contact_phone: string
  address: string
  city: string
  postal_code: string
  country: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  pinterest_url: string
  youtube_url: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  show_promo_banner: boolean
  promo_banner_text: string
  maintenance_mode: boolean
  maintenance_message: string
}

export type LegalTexts = {
  mentions_legales: string
  cgv: string
  politique_confidentialite: string
  politique_retour: string
  faq: string
}

export type ShippingConfig = {
  free_shipping_threshold: number
  colissimo_base_price: number
  mondial_relay_point_price: number
  mondial_relay_locker_price: number
  mondial_relay_home_price: number
  processing_time: string
  show_delivery_estimate: boolean
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  site_name: 'EliAti',
  slogan: 'Bijoux artisanaux faits main',
  description: '',
  logo_url: null,
  favicon_url: null,
  contact_email: 'contact@eliati.fr',
  contact_phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'France',
  instagram_url: 'https://instagram.com/eliati.music',
  facebook_url: '',
  tiktok_url: '',
  pinterest_url: '',
  youtube_url: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  show_promo_banner: false,
  promo_banner_text: '',
  maintenance_mode: false,
  maintenance_message: 'Le site est en maintenance. Revenez bientôt !',
}

const DEFAULT_LEGAL_TEXTS: LegalTexts = {
  mentions_legales: '',
  cgv: '',
  politique_confidentialite: '',
  politique_retour: '',
  faq: '',
}

const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  free_shipping_threshold: 50,
  colissimo_base_price: 6.90,
  mondial_relay_point_price: 4.90,
  mondial_relay_locker_price: 5.50,
  mondial_relay_home_price: 6.50,
  processing_time: '1-2',
  show_delivery_estimate: true,
}

// Cache global pour éviter de refetch à chaque composant
let cachedSiteConfig: SiteConfig | null = null
let cachedLegalTexts: LegalTexts | null = null
let cachedShippingConfig: ShippingConfig | null = null
let lastFetchTime = 0
const CACHE_DURATION = 60000 // 1 minute

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(cachedSiteConfig || DEFAULT_SITE_CONFIG)
  const [loading, setLoading] = useState(!cachedSiteConfig)

  useEffect(() => {
    const now = Date.now()
    if (cachedSiteConfig && now - lastFetchTime < CACHE_DURATION) {
      setConfig(cachedSiteConfig)
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'site_config')
          .single()

        if (data?.setting_value) {
          const merged = { ...DEFAULT_SITE_CONFIG, ...(data.setting_value as Partial<SiteConfig>) }
          cachedSiteConfig = merged
          lastFetchTime = Date.now()
          setConfig(merged)
        }
      } catch (error) {
        console.error('Erreur chargement config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading }
}

export function useLegalTexts() {
  const [texts, setTexts] = useState<LegalTexts>(cachedLegalTexts || DEFAULT_LEGAL_TEXTS)
  const [loading, setLoading] = useState(!cachedLegalTexts)

  useEffect(() => {
    if (cachedLegalTexts) {
      setTexts(cachedLegalTexts)
      setLoading(false)
      return
    }

    const fetchTexts = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'legal_texts')
          .single()

        if (data?.setting_value) {
          const merged = { ...DEFAULT_LEGAL_TEXTS, ...(data.setting_value as Partial<LegalTexts>) }
          cachedLegalTexts = merged
          setTexts(merged)
        }
      } catch (error) {
        console.error('Erreur chargement textes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTexts()
  }, [])

  return { texts, loading }
}

export function useShippingConfig() {
  const [config, setConfig] = useState<ShippingConfig>(cachedShippingConfig || DEFAULT_SHIPPING_CONFIG)
  const [loading, setLoading] = useState(!cachedShippingConfig)

  useEffect(() => {
    if (cachedShippingConfig) {
      setConfig(cachedShippingConfig)
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'shipping_config')
          .single()

        if (data?.setting_value) {
          const merged = { ...DEFAULT_SHIPPING_CONFIG, ...(data.setting_value as Partial<ShippingConfig>) }
          cachedShippingConfig = merged
          setConfig(merged)
        }
      } catch (error) {
        console.error('Erreur chargement shipping:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading }
}

// Fonction pour invalider le cache (utile après modification dans l'admin)
export function invalidateSiteSettingsCache() {
  cachedSiteConfig = null
  cachedLegalTexts = null
  cachedShippingConfig = null
  lastFetchTime = 0
}

