'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DEFAULT_EMAIL = 'contacteliati@gmail.com'
const DEFAULT_PASSWORD = 'Charles07122018*'
const AUTH_STORAGE_KEY = 'eliati-admin-auth'

type AdminCredential = {
  id: string
  email: string
  password_hash: string
  secret_code_hash: string | null
}

type Step = 'credentials' | 'setup-secret' | 'verify-secret'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [secretCodeConfirm, setSecretCodeConfirm] = useState('')
  const [credential, setCredential] = useState<AdminCredential | null>(null)
  const [isNewCredential, setIsNewCredential] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      router.replace('/admin')
    }
  }, [router])

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('id, email, password_hash, secret_code_hash')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        if (normalizedEmail !== DEFAULT_EMAIL.toLowerCase() || password !== DEFAULT_PASSWORD) {
          setError('Identifiants incorrects')
          return
        }

        setIsNewCredential(true)
        setCredential(null)
        setInfo('Bienvenue ! Définissez maintenant votre code confidentiel pour sécuriser l’accès.')
        setStep('setup-secret')
        return
      }

      const passwordValid = bcrypt.compareSync(password, data.password_hash)
      if (!passwordValid) {
        setError('Mot de passe incorrect')
        return
      }

      setCredential(data)
      setIsNewCredential(false)

      if (!data.secret_code_hash) {
        setInfo('Définissez votre code confidentiel pour finaliser la sécurisation de votre compte.')
        setStep('setup-secret')
        return
      }

      setInfo('Saisissez votre code confidentiel pour accéder au tableau de bord.')
      setStep('verify-secret')
    } catch (err) {
      console.error('Connexion admin impossible:', err)
      setError('Impossible de vérifier les identifiants pour le moment')
    } finally {
      setLoading(false)
      setSecretCode('')
      setSecretCodeConfirm('')
    }
  }

  const handleSecretSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (secretCode.trim().length < 4) {
      setError('Le code confidentiel doit contenir au moins 4 caractères')
      return
    }

    if (secretCode !== secretCodeConfirm) {
      setError('Les codes saisis ne correspondent pas')
      return
    }

    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const secretHash = bcrypt.hashSync(secretCode, 10)

      if (isNewCredential) {
        const passwordHash = bcrypt.hashSync(password, 10)

        const { data, error } = await supabase
          .from('admin_credentials')
          .insert({
            email: normalizedEmail,
            password_hash: passwordHash,
            secret_code_hash: secretHash,
            secret_code_set_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error || !data) {
          throw error || new Error('Insertion impossible')
        }

        finalizeLogin(data)
        return
      }

      if (credential) {
        const { data, error } = await supabase
          .from('admin_credentials')
          .update({
            secret_code_hash: secretHash,
            secret_code_set_at: new Date().toISOString(),
          })
          .eq('id', credential.id)
          .select()
          .single()

        if (error || !data) {
          throw error || new Error('Mise à jour impossible')
        }

        finalizeLogin(data)
        return
      }

      throw new Error('Données admin introuvables')
    } catch (err) {
      console.error('Enregistrement du code confidentiel impossible:', err)
      setError('Impossible d’enregistrer le code confidentiel')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySecret = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!credential?.secret_code_hash) {
      setError('Aucun code confidentiel n’est défini pour ce compte')
      return
    }

    const isValid = bcrypt.compareSync(secretCode, credential.secret_code_hash)

    if (!isValid) {
      setError('Code confidentiel incorrect')
      return
    }

    finalizeLogin(credential)
  }

  const finalizeLogin = (record: AdminCredential) => {
    if (typeof window !== 'undefined') {
      const payload = {
        credentialId: record.id,
        email: record.email,
        secretVerifiedAt: new Date().toISOString(),
      }
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    }

    setPassword('')
    setSecretCode('')
    setSecretCodeConfirm('')
    setError(null)
    setInfo('Connexion réussie, redirection en cours…')
    setCredential(record)

    router.replace('/admin')
  }

  const resetToCredentials = () => {
    setStep('credentials')
    setSecretCode('')
    setSecretCodeConfirm('')
    setError(null)
    setInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/10 to-rose/10 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-gold/20 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image src="/logoeliatitransparent.png" alt="EliAti" width={140} height={50} priority />
          </div>
          <h1 className="font-display text-2xl text-leather">Accès administration</h1>
          <p className="text-sm text-taupe">Zone réservée aux gérantes EliAti.</p>
        </div>

        {info && (
          <div className="bg-gold/10 border border-gold/30 text-leather text-sm px-4 py-3 rounded-lg">
            {info}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-leather">Adresse e-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-leather">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-leather text-ivory hover:bg-leather/90" disabled={loading}>
              {loading ? 'Vérification…' : 'Se connecter'}
            </Button>
          </form>
        )}

        {step === 'setup-secret' && (
          <form onSubmit={handleSecretSetup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-leather">Code confidentiel</label>
              <Input
                type="password"
                value={secretCode}
                onChange={(event) => setSecretCode(event.target.value)}
                placeholder="Ex : 2498"
                required
                minLength={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-leather">Confirmer le code</label>
              <Input
                type="password"
                value={secretCodeConfirm}
                onChange={(event) => setSecretCodeConfirm(event.target.value)}
                required
                minLength={4}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={resetToCredentials}>
                Retour
              </Button>
              <Button type="submit" className="w-full bg-leather text-ivory hover:bg-leather/90" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Valider' }
              </Button>
            </div>
          </form>
        )}

        {step === 'verify-secret' && (
          <form onSubmit={handleVerifySecret} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-leather">Code confidentiel</label>
              <Input
                type="password"
                value={secretCode}
                onChange={(event) => setSecretCode(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={resetToCredentials}>
                Changer d&apos;identifiants
              </Button>
              <Button type="submit" className="w-full bg-leather text-ivory hover:bg-leather/90" disabled={loading}>
                {loading ? 'Vérification…' : 'Continuer'}
              </Button>
            </div>
          </form>
        )}

        <p className="text-xs text-center text-taupe/80">
          Pour toute assistance, contactez <span className="font-medium">Contacteliati@gmail.com</span>
        </p>
      </Card>
    </div>
  )
}
