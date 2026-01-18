import { supabase } from '@/lib/supabase'
import {
  DEFAULT_LEGAL_TEXTS,
  DEFAULT_SITE_CONFIG,
  LegalTexts,
  SiteConfig,
} from '@/lib/site-settings-defaults'

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'site_config')
      .single()

    if (!data?.setting_value) {
      return DEFAULT_SITE_CONFIG
    }

    return {
      ...DEFAULT_SITE_CONFIG,
      ...(data.setting_value as Partial<SiteConfig>),
    }
  } catch (error) {
    console.error('Erreur chargement site_config:', error)
    return DEFAULT_SITE_CONFIG
  }
}

export async function getLegalTexts(): Promise<LegalTexts> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'legal_texts')
      .single()

    if (!data?.setting_value) {
      return DEFAULT_LEGAL_TEXTS
    }

    return {
      ...DEFAULT_LEGAL_TEXTS,
      ...(data.setting_value as Partial<LegalTexts>),
    }
  } catch (error) {
    console.error('Erreur chargement legal_texts:', error)
    return DEFAULT_LEGAL_TEXTS
  }
}
