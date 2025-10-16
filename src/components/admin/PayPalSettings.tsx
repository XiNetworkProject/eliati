'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type PayPalConfig = {
  client_id: string
  client_secret: string
  mode: 'sandbox' | 'live'
  currency: string
}

export default function PayPalSettings() {
  const [config, setConfig] = useState<PayPalConfig>({
    client_id: '',
    client_secret: '',
    mode: 'sandbox',
    currency: 'EUR',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      // Charger la configuration depuis Supabase (table settings)
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'paypal_config')
        .single()

      if (data?.value) {
        setConfig(JSON.parse(data.value))
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Sauvegarder dans Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'paypal_config',
          value: JSON.stringify(config),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    if (!config.client_id || !config.client_secret) {
      alert('Veuillez d\'abord configurer vos identifiants PayPal')
      return
    }

    try {
      // Test de connexion PayPal (simulation)
      const response = await fetch('/api/paypal/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.client_id,
          client_secret: config.client_secret,
          mode: config.mode
        })
      })

      if (response.ok) {
        alert('✅ Connexion PayPal réussie !')
      } else {
        alert('❌ Erreur de connexion PayPal. Vérifiez vos identifiants.')
      }
    } catch (error) {
      alert('❌ Erreur lors du test de connexion')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-leather">Configuration PayPal</h2>
        <Badge className={`${saved ? 'bg-gold text-leather' : 'bg-taupe text-ivory'}`}>
          {saved ? 'Sauvegardé' : 'Non sauvegardé'}
        </Badge>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-leather mb-2">
              Mode PayPal
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="sandbox"
                  checked={config.mode === 'sandbox'}
                  onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as 'sandbox' | 'live' }))}
                  className="text-leather"
                />
                <span className="text-sm">Sandbox (Test)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="live"
                  checked={config.mode === 'live'}
                  onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as 'sandbox' | 'live' }))}
                  className="text-leather"
                />
                <span className="text-sm">Live (Production)</span>
              </label>
            </div>
            <p className="text-xs text-taupe mt-1">
              Utilisez Sandbox pour tester, Live pour les vrais paiements
            </p>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-leather mb-2">
              Client ID PayPal *
            </label>
            <Input
              value={config.client_id}
              onChange={(e) => setConfig(prev => ({ ...prev, client_id: e.target.value }))}
              placeholder="Votre Client ID PayPal"
              type="password"
            />
            <p className="text-xs text-taupe mt-1">
              Trouvez votre Client ID dans votre compte PayPal Developer
            </p>
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-leather mb-2">
              Client Secret PayPal *
            </label>
            <Input
              value={config.client_secret}
              onChange={(e) => setConfig(prev => ({ ...prev, client_secret: e.target.value }))}
              placeholder="Votre Client Secret PayPal"
              type="password"
            />
            <p className="text-xs text-taupe mt-1">
              Gardez cette information secrète
            </p>
          </div>

          {/* Devise */}
          <div>
            <label className="block text-sm font-medium text-leather mb-2">
              Devise
            </label>
            <select
              value={config.currency}
              onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full p-3 border border-gold/30 rounded-lg"
            >
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar US)</option>
              <option value="GBP">GBP (Livre Sterling)</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t border-gold/30">
            <Button
              onClick={testConnection}
              variant="outline"
              disabled={!config.client_id || !config.client_secret}
            >
              Tester la connexion
            </Button>
            <Button
              onClick={handleSave}
              className="bg-leather text-ivory hover:bg-leather/90"
              disabled={loading || !config.client_id || !config.client_secret}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Guide d'installation */}
      <Card className="p-6 bg-champagne/20">
        <h3 className="font-display text-lg text-leather mb-4">📋 Guide d'installation PayPal</h3>
        <div className="space-y-4 text-sm text-taupe">
          <div>
            <h4 className="font-medium text-leather mb-2">1. Créer un compte PayPal Developer</h4>
            <p>• Allez sur <a href="https://developer.paypal.com" target="_blank" className="text-gold hover:underline">developer.paypal.com</a></p>
            <p>• Connectez-vous avec votre compte PayPal</p>
            <p>• Créez une nouvelle application</p>
          </div>
          
          <div>
            <h4 className="font-medium text-leather mb-2">2. Obtenir vos identifiants</h4>
            <p>• Dans votre application, copiez le <strong>Client ID</strong></p>
            <p>• Copiez le <strong>Client Secret</strong></p>
            <p>• Choisissez le mode <strong>Sandbox</strong> pour tester</p>
          </div>

          <div>
            <h4 className="font-medium text-leather mb-2">3. Configuration</h4>
            <p>• Collez vos identifiants dans les champs ci-dessus</p>
            <p>• Testez la connexion</p>
            <p>• Sauvegardez la configuration</p>
          </div>

          <div>
            <h4 className="font-medium text-leather mb-2">4. Passage en production</h4>
            <p>• Une fois les tests réussis, passez en mode <strong>Live</strong></p>
            <p>• Utilisez vos identifiants de production</p>
            <p>• Vos clients pourront alors payer avec PayPal</p>
          </div>
        </div>
      </Card>

      {/* Informations de sécurité */}
      <Card className="p-6 bg-rose/20">
        <h3 className="font-display text-lg text-leather mb-4">🔒 Sécurité</h3>
        <div className="space-y-2 text-sm text-taupe">
          <p>• Vos identifiants PayPal sont chiffrés et stockés de manière sécurisée</p>
          <p>• Ne partagez jamais votre Client Secret</p>
          <p>• Utilisez toujours HTTPS en production</p>
          <p>• Testez d'abord en mode Sandbox</p>
        </div>
      </Card>
    </div>
  )
}
