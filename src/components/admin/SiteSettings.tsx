'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-settings-defaults'

const DEFAULT_CONFIG: SiteConfig = DEFAULT_SITE_CONFIG

type SettingsSection = 'general' | 'contact' | 'social' | 'seo' | 'options'

export default function SiteSettings() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'site_config')
        .single()

      if (data?.setting_value) {
        setConfig({ ...DEFAULT_CONFIG, ...(data.setting_value as Partial<SiteConfig>) })
        if ((data.setting_value as SiteConfig).logo_url) {
          setLogoPreview((data.setting_value as SiteConfig).logo_url)
        }
        if ((data.setting_value as SiteConfig).favicon_url) {
          setFaviconPreview((data.setting_value as SiteConfig).favicon_url)
        }
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let logoUrl = config.logo_url
      let faviconUrl = config.favicon_url

      // Upload du logo si nouveau fichier
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `logo-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, logoFile, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('site-assets')
            .getPublicUrl(fileName)
          logoUrl = urlData.publicUrl
        }
      }

      // Upload du favicon si nouveau fichier
      if (faviconFile) {
        const fileExt = faviconFile.name.split('.').pop()
        const fileName = `favicon-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, faviconFile, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('site-assets')
            .getPublicUrl(fileName)
          faviconUrl = urlData.publicUrl
        }
      }

      const configToSave = { ...config, logo_url: logoUrl, favicon_url: faviconUrl }

      // Vérifier si existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'site_config')
        .single()

      if (existing) {
        await supabase
          .from('site_settings')
          .update({
            setting_value: configToSave,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'site_config')
      } else {
        await supabase
          .from('site_settings')
          .insert({
            setting_key: 'site_config',
            setting_value: configToSave,
            updated_at: new Date().toISOString()
          })
      }

      setConfig(configToSave)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const sections: { id: SettingsSection; label: string; icon: string }[] = [
    { id: 'general', label: 'Général', icon: '🏪' },
    { id: 'contact', label: 'Contact', icon: '📧' },
    { id: 'social', label: 'Réseaux sociaux', icon: '📱' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'options', label: 'Options', icon: '⚙️' },
  ]

  if (loading) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gold/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
        <p className="text-taupe text-sm">Chargement des paramètres...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl text-leather">Paramètres du site</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sauvegardé
            </span>
          )}
          <Button
            onClick={handleSave}
            className="bg-leather text-ivory hover:bg-leather/90"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation des sections */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === section.id
                ? 'bg-leather text-ivory'
                : 'bg-white/80 text-taupe hover:text-leather hover:bg-white border border-gold/20'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Contenu des sections */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-gold/20">
        {/* Section Général */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg text-leather border-b border-gold/20 pb-2">
              Informations générales
            </h3>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Logo du site
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="border-leather/20"
                  >
                    Changer le logo
                  </Button>
                  <p className="text-xs text-taupe mt-1">PNG ou SVG recommandé</p>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Favicon
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-champagne/40 to-champagne/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                  {faviconPreview ? (
                    <Image
                      src={faviconPreview}
                      alt="Favicon"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconChange}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('favicon-upload')?.click()}
                    className="border-leather/20"
                  >
                    Changer le favicon
                  </Button>
                  <p className="text-xs text-taupe mt-1">PNG 64x64 recommandé</p>
                </div>
              </div>
            </div>

            {/* Nom du site */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Nom du site *
              </label>
              <Input
                value={config.site_name}
                onChange={(e) => updateConfig('site_name', e.target.value)}
                placeholder="Ma Boutique"
              />
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Slogan
              </label>
              <Input
                value={config.slogan}
                onChange={(e) => updateConfig('slogan', e.target.value)}
                placeholder="Votre slogan accrocheur"
              />
              <p className="text-xs text-taupe mt-1">Affiché sous le logo ou dans le header</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Description de la boutique
              </label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Présentez votre boutique en quelques lignes..."
                className="w-full p-3 border border-gold/30 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <p className="text-xs text-taupe mt-1">Utilisée dans la page À propos</p>
            </div>
          </div>
        )}

        {/* Section Contact */}
        {activeSection === 'contact' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg text-leather border-b border-gold/20 pb-2">
              Coordonnées
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Email de contact
                </label>
                <Input
                  type="email"
                  value={config.contact_email}
                  onChange={(e) => updateConfig('contact_email', e.target.value)}
                  placeholder="contact@maboutique.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  value={config.contact_phone}
                  onChange={(e) => updateConfig('contact_phone', e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Adresse
              </label>
              <Input
                value={config.address}
                onChange={(e) => updateConfig('address', e.target.value)}
                placeholder="123 Rue du Commerce"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Code postal
                </label>
                <Input
                  value={config.postal_code}
                  onChange={(e) => updateConfig('postal_code', e.target.value)}
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Ville
                </label>
                <Input
                  value={config.city}
                  onChange={(e) => updateConfig('city', e.target.value)}
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-leather mb-2">
                  Pays
                </label>
                <Input
                  value={config.country}
                  onChange={(e) => updateConfig('country', e.target.value)}
                  placeholder="France"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section Réseaux sociaux */}
        {activeSection === 'social' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg text-leather border-b border-gold/20 pb-2">
              Réseaux sociaux
            </h3>
            <p className="text-sm text-taupe">
              Ajoutez les liens vers vos réseaux sociaux. Ils seront affichés dans le footer.
            </p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-leather mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </label>
                <Input
                  value={config.instagram_url}
                  onChange={(e) => updateConfig('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/maboutique"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-leather mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </label>
                <Input
                  value={config.facebook_url}
                  onChange={(e) => updateConfig('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/maboutique"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-leather mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  TikTok
                </label>
                <Input
                  value={config.tiktok_url}
                  onChange={(e) => updateConfig('tiktok_url', e.target.value)}
                  placeholder="https://tiktok.com/@maboutique"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-leather mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 00-3.879 23.365c-.054-.468-.1-1.188.021-1.7.11-.462.71-3.01.71-3.01s-.181-.362-.181-.898c0-.842.488-1.47.488-1.47s-.181-.363-.181-.898c0-.842.488-1.471 1.097-1.471.517 0 .767.389.767.854 0 .52-.331 1.298-.502 2.02-.143.603.303 1.095.898 1.095 1.078 0 1.906-1.137 1.906-2.777 0-1.452-1.043-2.467-2.533-2.467-1.726 0-2.739 1.294-2.739 2.632 0 .522.201 1.081.452 1.385.05.06.057.113.042.174l-.17.694c-.027.11-.088.133-.204.08-.76-.354-1.234-1.464-1.234-2.355 0-1.918 1.394-3.678 4.02-3.678 2.11 0 3.75 1.504 3.75 3.515 0 2.097-1.322 3.785-3.159 3.785-.617 0-1.197-.32-1.395-.699l-.38 1.447c-.137.53-.508 1.194-.758 1.598A12 12 0 1012 0z"/>
                  </svg>
                  Pinterest
                </label>
                <Input
                  value={config.pinterest_url}
                  onChange={(e) => updateConfig('pinterest_url', e.target.value)}
                  placeholder="https://pinterest.com/maboutique"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-leather mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </label>
                <Input
                  value={config.youtube_url}
                  onChange={(e) => updateConfig('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@maboutique"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section SEO */}
        {activeSection === 'seo' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg text-leather border-b border-gold/20 pb-2">
              Référencement (SEO)
            </h3>
            <p className="text-sm text-taupe">
              Optimisez votre visibilité sur les moteurs de recherche.
            </p>

            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Titre de la page d&apos;accueil
              </label>
              <Input
                value={config.meta_title}
                onChange={(e) => updateConfig('meta_title', e.target.value)}
                placeholder="Ma Boutique | Bijoux artisanaux faits main"
              />
              <p className="text-xs text-taupe mt-1">
                {config.meta_title.length}/60 caractères recommandés
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Meta description
              </label>
              <textarea
                value={config.meta_description}
                onChange={(e) => updateConfig('meta_description', e.target.value)}
                placeholder="Découvrez notre collection de bijoux artisanaux uniques, faits main avec amour..."
                className="w-full p-3 border border-gold/30 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <p className="text-xs text-taupe mt-1">
                {config.meta_description.length}/160 caractères recommandés
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-leather mb-2">
                Mots-clés
              </label>
              <Input
                value={config.meta_keywords}
                onChange={(e) => updateConfig('meta_keywords', e.target.value)}
                placeholder="bijoux, artisanal, fait main, colliers, bagues"
              />
              <p className="text-xs text-taupe mt-1">Séparez les mots-clés par des virgules</p>
            </div>

            {/* Aperçu Google */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-taupe mb-2">Aperçu Google</p>
              <div className="font-sans">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {config.meta_title || config.site_name || 'Titre de votre page'}
                </p>
                <p className="text-green-700 text-sm">www.votresite.com</p>
                <p className="text-gray-600 text-sm">
                  {config.meta_description || 'Description de votre page...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Options */}
        {activeSection === 'options' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg text-leather border-b border-gold/20 pb-2">
              Options avancées
            </h3>

            {/* Bandeau promo */}
            <div className="p-4 rounded-lg border border-gold/20 bg-champagne/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-leather">Bandeau promotionnel</h4>
                  <p className="text-xs text-taupe">Affiche un message en haut du site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.show_promo_banner}
                    onChange={(e) => updateConfig('show_promo_banner', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leather"></div>
                </label>
              </div>
              {config.show_promo_banner && (
                <Input
                  value={config.promo_banner_text}
                  onChange={(e) => updateConfig('promo_banner_text', e.target.value)}
                  placeholder="🎉 Livraison offerte dès 50€ d'achat !"
                />
              )}
            </div>

            {/* Mode maintenance */}
            <div className="p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-red-800">Mode maintenance</h4>
                  <p className="text-xs text-red-600">Désactive temporairement le site pour les visiteurs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.maintenance_mode}
                    onChange={(e) => updateConfig('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              {config.maintenance_mode && (
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Message de maintenance
                  </label>
                  <textarea
                    value={config.maintenance_message}
                    onChange={(e) => updateConfig('maintenance_message', e.target.value)}
                    className="w-full p-3 border border-red-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

