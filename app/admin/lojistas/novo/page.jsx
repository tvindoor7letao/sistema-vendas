'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabaseIsolado = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export default function NovoLojista() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [senhaTemp, setSenhaTemp] = useState('')
  const [formData, setFormData] = useState({
    nome_fantasia: '',
    email: '',
    senha: '',
    whatsapp: '',
    cnpj: '',
    responsavel: '',
    plano: 'pro'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const gerarSenhaAleatoria = () => {
    const senha = 'Temp@' + Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    setFormData({ ...formData, senha: senha })
  }

  const enviarWhatsApp = (numero, mensagem) => {
    const numeroLimpo = numero.replace(/\D/g, '')
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  const formatarMensagemBoasVindas = (nomeLoja, email, senha, responsavel) => {
    return `BEM-VINDO AO SISTEMA DE VENDAS PARA LOJAS!

Olá ${responsavel}!

Sua conta foi criada com sucesso no Sistema de Vendas.

DADOS DE ACESSO:
Loja: ${nomeLoja}
Email: ${email}
Senha: ${senha}
Site: http://localhost:5173/login

PROXIMOS PASSOS:
1. Acesse o link acima
2. Faça login com seu email e senha
3. Comece a cadastrar seus produtos
4. Crie links de venda personalizados

DICAS IMPORTANTES:
• Recomendamos alterar sua senha após o primeiro acesso
• Sua loja terá um link público para compartilhar com clientes

Atenciosamente,
Equipe Sistema de Vendas para Lojas`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setSenhaTemp('')

    if (!formData.nome_fantasia || !formData.email || !formData.whatsapp || !formData.responsavel) {
      setError('Preencha todos os campos obrigatórios (*)')
      setLoading(false)
      return
    }

    if (!formData.senha) {
      setError('Digite ou gere uma senha para o lojista')
      setLoading(false)
      return
    }

    try {
      const senha = formData.senha
      setSenhaTemp(senha)

      const { data: authData, error: authError } = await supabaseIsolado.auth.signUp({
        email: formData.email,
        password: senha,
        options: {
          email_confirm: true,
          data: {
            nome_fantasia: formData.nome_fantasia,
            whatsapp: formData.whatsapp,
            responsavel: formData.responsavel
          }
        }
      })

      if (authError) {
        console.error('Erro Auth:', authError)
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Erro: Usuário não foi criado')
        setLoading(false)
        return
      }

      const { error: dbError } = await supabase.from('lojistas').insert({
        id: authData.user.id,
        nome_fantasia: formData.nome_fantasia,
        email: formData.email,
        whatsapp: formData.whatsapp,
        cnpj: formData.cnpj || null,
        responsavel: formData.responsavel,
        plano: formData.plano,
        status: 'ativo'
      })

      if (dbError) {
        console.error('Erro DB:', dbError)
        setError('Erro ao salvar dados: ' + dbError.message)
        setLoading(false)
        return
      }

      setSuccess('Lojista criado com sucesso!')

      if (formData.whatsapp) {
        const mensagem = formatarMensagemBoasVindas(
          formData.nome_fantasia,
          formData.email,
          senha,
          formData.responsavel
        )
        enviarWhatsApp(formData.whatsapp, mensagem)
      }

      setFormData({
        nome_fantasia: '',
        email: '',
        senha: '',
        whatsapp: '',
        cnpj: '',
        responsavel: '',
        plano: 'pro'
      })

    } catch (err) {
      console.error('Erro geral:', err)
      setError('Erro inesperado: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/lojistas" className="text-blue-600 hover:text-blue-800">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Lojista</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Erro:</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-bold">✓ {success}</p>
              {senhaTemp && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-bold">📋 Senha do lojista:</p>
                  <p className="text-lg font-mono font-bold">{senhaTemp}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Copie esta senha agora! Ela será mostrada apenas uma vez.
                  </p>
                  <p className="text-xs text-gray-500">
                    📧 O lojista receberá um email de confirmação para ativar o acesso.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Loja *
              </label>
              <input
                type="text"
                name="nome_fantasia"
                required
                value={formData.nome_fantasia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Minha Loja Oficial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="loja@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha de Acesso *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="senha"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Digite uma senha ou gere automaticamente"
                />
                <button
                  type="button"
                  onClick={gerarSenhaAleatoria}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
                >
                  🔄 Gerar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                O lojista usará esta senha para acessar o sistema
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp *
              </label>
              <input
                type="tel"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ (opcional)
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Responsável *
              </label>
              <input
                type="text"
                name="responsavel"
                required
                value={formData.responsavel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nome completo do responsável"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plano
              </label>
              <select
                name="plano"
                value={formData.plano}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pro">💎 Pro - R$ 49,90/mês (500 produtos)</option>
                <option value="enterprise">🏢 Ultra - R$ 299,90/mês (Produtos ilimitados)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '🔄 Criando conta...' : '💰 Criar Conta do Lojista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}