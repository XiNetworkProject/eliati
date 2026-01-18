'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-settings-defaults'

type SiteSettingsContextValue = {
  config: SiteConfig
  loading: boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  config: DEFAULT_SITE_CONFIG,
  loading: true,
})

function MaintenanceScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-ivory text-leather flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-4">
        <div className="text-5xl">🛠️</div>
        <h1 className="font-display text-3xl">Site en maintenance</h1>
        <p className="text-taupe whitespace-pre-line">{message}</p>
      </div>
    </div>
  )
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'site_config')
          .single()

        if (isMounted) {
          if (data?.setting_value) {
            setConfig({ ...DEFAULT_SITE_CONFIG, ...(data.setting_value as Partial<SiteConfig>) })
          } else {
            setConfig(DEFAULT_SITE_CONFIG)
          }
        }
      } catch (error) {
        console.error('Erreur chargement site_config:', error)
        if (isMounted) {
          setConfig(DEFAULT_SITE_CONFIG)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadConfig()
    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(() => ({ config, loading }), [config, loading])
  const isAdminRoute = pathname?.startsWith('/admin')
  const showMaintenance = config.maintenance_mode && !isAdminRoute

  return (
    <SiteSettingsContext.Provider value={value}>
      {showMaintenance ? (
        <MaintenanceScreen message={config.maintenance_message} />
      ) : (
        children
      )}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
