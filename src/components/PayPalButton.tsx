'use client'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type PayPalButtonProps = {
  amount: number
  orderId: string
  onSuccess: (paypalOrderId: string) => void
  onError: (error: any) => void
}

export default function PayPalButton({ amount, orderId, onSuccess, onError }: PayPalButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPayPalConfig = async () => {
      try {
        // Charger la config PayPal complète (même clé que dans PayPalSettings)
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'paypal_config')
          .single()

        if (data?.setting_value) {
          // Le setting_value contient l'objet config avec client_id, client_secret, mode, currency
          const config = data.setting_value as { client_id: string; client_secret: string; mode: string; currency: string }
          setClientId(config.client_id || null)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la config PayPal:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPayPalConfig()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather mx-auto mb-3"></div>
        <p className="text-taupe text-sm">Chargement du paiement...</p>
      </div>
    )
  }

  if (!clientId || clientId === 'null') {
    return (
      <div className="p-6 bg-rose/10 border border-rose/30 rounded-xl">
        <p className="text-sm text-leather mb-3">
          ⚠️ PayPal n&apos;est pas encore configuré
        </p>
        <p className="text-xs text-taupe">
          L&apos;administrateur doit configurer les clés PayPal dans l&apos;interface d&apos;administration.
        </p>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'EUR',
        intent: 'capture',
        components: 'buttons', // Seulement les boutons PayPal, pas les champs de carte
      }}
    >
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 55,
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'EUR',
                  value: amount.toFixed(2),
                },
                description: `Commande EliAti`,
                custom_id: orderId.slice(0, 8),
              },
            ],
          })
        }}
        onApprove={async (data, actions) => {
          if (!actions.order) return

          const order = await actions.order.capture()
          
          // Mettre à jour la commande dans Supabase
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              paypal_order_id: order.id,
              paypal_payment_id: order.purchase_units?.[0]?.payments?.captures?.[0]?.id || null,
            })
            .eq('id', orderId)

          onSuccess(order.id || '')
        }}
        onError={(err) => {
          console.error('Erreur PayPal:', err)
          onError(err)
        }}
      />
    </PayPalScriptProvider>
  )
}

