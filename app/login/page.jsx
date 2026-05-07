'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabase
      .from('administradores')
      .select('id')
      .eq('id', data.user.id)
      .single()

    // Verificar status do lojista
    const { data: lojista } = await supabase
      .from('lojistas')
      .select('status')
      .eq('id', data.user.id)
      .single()

    // Se conta estiver bloqueada
    if (lojista?.status === 'bloqueado') {
      await supabase.auth.signOut()
      setError('Sua conta está bloqueada. Entre em contato com o administrador.')
      setLoading(false)
      return
    }

    // Redirecionar
    if (isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/lojista/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 inline-block">🏢</span>
          <h2 className="text-3xl font-black text-[#1e3a5f] tracking-tight">
            ACESSAR PAINEL
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-widest">
            Sistema Vendas Profissional
          </p>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 p-6 md:p-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email Corporativo</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Senha de Acesso</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a5f] hover:bg-[#2a5a8e] text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 text-base md:text-lg"
              >
                {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-50 text-center">
              <Link href="/cadastro-gratis" className="text-sm font-bold text-[#1e3a5f] hover:underline">
                Ainda não tem conta? <span className="text-[#e67e22]">Começar teste grátis</span>
              </Link>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Ambiente Seguro & Criptografado
        </p>
      </div>
    </div>
  )
}
