'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type LegalTexts = {
  mentions_legales: string
  cgv: string
  politique_confidentialite: string
  politique_retour: string
  faq: string
}

const DEFAULT_TEXTS: LegalTexts = {
  mentions_legales: '',
  cgv: '',
  politique_confidentialite: '',
  politique_retour: '',
  faq: '',
}

type TextSection = keyof LegalTexts

const SECTIONS: { id: TextSection; label: string; description: string }[] = [
  { 
    id: 'mentions_legales', 
    label: 'Mentions légales', 
    description: 'Informations légales obligatoires (raison sociale, SIRET, etc.)' 
  },
  { 
    id: 'cgv', 
    label: 'CGV', 
    description: 'Conditions Générales de Vente' 
  },
  { 
    id: 'politique_confidentialite', 
    label: 'Politique de confidentialité', 
    description: 'RGPD, utilisation des données personnelles' 
  },
  { 
    id: 'politique_retour', 
    label: 'Politique de retour', 
    description: 'Conditions de retour et remboursement' 
  },
  { 
    id: 'faq', 
    label: 'FAQ', 
    description: 'Questions fréquemment posées' 
  },
]

export default function LegalTextsManager() {
  const [texts, setTexts] = useState<LegalTexts>(DEFAULT_TEXTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<TextSection>('mentions_legales')

  useEffect(() => {
    loadTexts()
  }, [])

  const loadTexts = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'legal_texts')
        .single()

      if (data?.setting_value) {
        setTexts({ ...DEFAULT_TEXTS, ...(data.setting_value as Partial<LegalTexts>) })
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'legal_texts')
        .single()

      if (existing) {
        await supabase
          .from('site_settings')
          .update({
            setting_value: texts,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'legal_texts')
      } else {
        await supabase
          .from('site_settings')
          .insert({
            setting_key: 'legal_texts',
            setting_value: texts,
            updated_at: new Date().toISOString()
          })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateText = (section: TextSection, value: string) => {
    setTexts(prev => ({ ...prev, [section]: value }))
    setSaved(false)
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection)

  if (loading) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gold/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
        <p className="text-taupe text-sm">Chargement des textes...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl text-leather">Textes légaux</h2>
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
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des sections */}
        <div className="lg:col-span-1 space-y-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-leather text-ivory'
                  : 'bg-white/80 text-taupe hover:text-leather hover:bg-white border border-gold/20'
              }`}
            >
              <p className="font-medium text-sm">{section.label}</p>
              {texts[section.id] ? (
                <p className={`text-xs mt-1 ${activeSection === section.id ? 'text-ivory/70' : 'text-green-600'}`}>
                  ✓ Configuré
                </p>
              ) : (
                <p className={`text-xs mt-1 ${activeSection === section.id ? 'text-ivory/70' : 'text-taupe/60'}`}>
                  Non configuré
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Éditeur */}
        <div className="lg:col-span-3">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gold/20">
            <div className="mb-4">
              <h3 className="font-display text-lg text-leather">{currentSection?.label}</h3>
              <p className="text-sm text-taupe">{currentSection?.description}</p>
            </div>

            <textarea
              value={texts[activeSection]}
              onChange={(e) => updateText(activeSection, e.target.value)}
              placeholder={`Rédigez votre ${currentSection?.label.toLowerCase()} ici...

Vous pouvez utiliser des sauts de ligne pour structurer votre texte.`}
              className="w-full p-4 border border-gold/30 rounded-lg resize-none h-96 focus:outline-none focus:ring-2 focus:ring-gold/30 font-mono text-sm"
            />

            <div className="mt-3 flex items-center justify-between text-xs text-taupe">
              <span>{texts[activeSection].length} caractères</span>
              <span>Les sauts de ligne seront conservés</span>
            </div>
          </Card>

          {/* Aide */}
          <Card className="p-4 mt-4 bg-champagne/20 border-gold/20">
            <h4 className="font-medium text-leather mb-2">💡 Conseils</h4>
            <ul className="text-sm text-taupe space-y-1">
              {activeSection === 'mentions_legales' && (
                <>
                  <li>• Nom de l&apos;entreprise ou de l&apos;auto-entrepreneur</li>
                  <li>• Adresse du siège social</li>
                  <li>• Numéro SIRET / SIREN</li>
                  <li>• Numéro de TVA (si applicable)</li>
                  <li>• Email et téléphone de contact</li>
                  <li>• Hébergeur du site web</li>
                </>
              )}
              {activeSection === 'cgv' && (
                <>
                  <li>• Conditions de commande et paiement</li>
                  <li>• Délais et modalités de livraison</li>
                  <li>• Droit de rétractation (14 jours)</li>
                  <li>• Garanties et responsabilité</li>
                  <li>• Règlement des litiges</li>
                </>
              )}
              {activeSection === 'politique_confidentialite' && (
                <>
                  <li>• Types de données collectées</li>
                  <li>• Finalités du traitement</li>
                  <li>• Durée de conservation</li>
                  <li>• Droits des utilisateurs (accès, rectification, suppression)</li>
                  <li>• Cookies utilisés</li>
                </>
              )}
              {activeSection === 'politique_retour' && (
                <>
                  <li>• Délai de rétractation</li>
                  <li>• Produits exclus (bijoux personnalisés)</li>
                  <li>• Procédure de retour</li>
                  <li>• Remboursement ou échange</li>
                </>
              )}
              {activeSection === 'faq' && (
                <>
                  <li>• Questions sur la livraison</li>
                  <li>• Questions sur les paiements</li>
                  <li>• Questions sur les retours</li>
                  <li>• Questions sur les produits</li>
                </>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

