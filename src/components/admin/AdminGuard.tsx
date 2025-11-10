'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const AUTH_STORAGE_KEY = 'eliati-admin-auth'

type StoredAuth = {
  credentialId: string
  email: string
  secretVerifiedAt: string
}

type Props = {
  children: ReactNode
}

export default function AdminGuard({ children }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking')

  useEffect(() => {
    const verifyAccess = async () => {
      if (typeof window === 'undefined') {
        return
      }

      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)

      if (!raw) {
        router.replace('/admin/login')
        setStatus('unauthorized')
        return
      }

      try {
        const parsed: StoredAuth = JSON.parse(raw)

        if (!parsed?.credentialId || !parsed?.email || !parsed?.secretVerifiedAt) {
          throw new Error('Session invalide')
        }

        const { data, error } = await supabase
          .from('admin_credentials')
          .select('id, email, secret_code_hash')
          .eq('id', parsed.credentialId)
          .maybeSingle()

        if (error || !data || data.email !== parsed.email || !data.secret_code_hash) {
          throw new Error('Session invalide')
        }

        setStatus('authorized')
      } catch (error) {
        console.error('Vérification admin invalide:', error)
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
        router.replace('/admin/login')
        setStatus('unauthorized')
      }
    }

    verifyAccess()
  }, [router])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather mx-auto mb-4" />
          <p className="text-taupe">Vérification de l&apos;accès…</p>
        </div>
      </div>
    )
  }

  if (status === 'authorized') {
    return <>{children}</>
  }

  return null
}
