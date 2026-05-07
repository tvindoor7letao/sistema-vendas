'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_fantasia: '',
    telefone: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nome_fantasia: formData.nome_fantasia,
          telefone: formData.telefone
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from('lojistas').insert({
        id: authData.user.id,
        nome_fantasia: formData.nome_fantasia,
        telefone: formData.telefone,
        email: formData.email,
        status: 'pendente'
      })
    }

    setSuccess('Enviamos um email de confirmação para ' + formData.email + '. Verifique sua caixa de entrada e confirme seu cadastro para ter acesso ao sistema.')
    setLoading(false)
    
    // Limpar formulário
    setFormData({
      email: '',
      password: '',
      nome_fantasia: '',
      telefone: ''
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastre sua loja
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Comece a vender em minutos
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleCadastro}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                id="nome_fantasia"
                name="nome_fantasia"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome da Loja"
                value={formData.nome_fantasia}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha (mínimo 6 caracteres)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Já tem conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
