import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { client_id, client_secret, mode } = await request.json()

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Client ID et Secret requis' },
        { status: 400 }
      )
    }

    // URL de l'API PayPal selon le mode
    const baseURL = mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

    // Tester la connexion en récupérant un token d'accès
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
    
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Identifiants PayPal invalides' },
        { status: 401 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Connexion PayPal réussie',
      mode,
      token_type: data.token_type,
    })

  } catch (error) {
    console.error('Erreur test PayPal:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test de connexion' },
      { status: 500 }
    )
  }
}

