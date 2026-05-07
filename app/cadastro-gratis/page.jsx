'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CadastroGratis() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [senhaGerada, setSenhaGerada] = useState('')
  const [formData, setFormData] = useState({
    nome_fantasia: '',
    email: '',
    senha: '',
    whatsapp: '',
    responsavel: '',
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const gerarSenha = () => {
    const nova = Math.random().toString(36).slice(-8)
    setFormData({ ...formData, senha: nova })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.nome_fantasia || !formData.email || !formData.whatsapp || !formData.responsavel) {
      setError('Preencha todos os campos.')
      setLoading(false)
      return
    }
    if (!formData.senha || formData.senha.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const senha = formData.senha
      const dataExpiracao = new Date()
      dataExpiracao.setDate(dataExpiracao.getDate() + 7)

      console.log('Criando usuário com senha:', senha)

      // Criar usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: senha,
        options: {
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

      console.log('Usuário criado com sucesso:', authData.user.id)

      // Salvar na tabela lojistas
      const { error: dbError } = await supabase
        .from('lojistas')
        .insert({
          id: authData.user.id,
          nome_fantasia: formData.nome_fantasia,
          email: formData.email,
          whatsapp: formData.whatsapp,
          responsavel: formData.responsavel,
          plano: 'pro',
          status: 'ativo',
          tipo_teste: true,
          data_expiracao: dataExpiracao.toISOString()
        })

      if (dbError) {
        console.error('Erro DB:', dbError)
        setError('Erro ao salvar dados: ' + dbError.message)
        setLoading(false)
        return
      }

      setSenhaGerada(senha)
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      console.error('Erro geral:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada!</h2>
          <p className="text-gray-600 mb-6">Você tem <strong>7 dias de teste grátis</strong>.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-yellow-800 mb-2">📋 Sua senha de acesso:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono font-bold text-gray-900 bg-white border border-yellow-300 rounded px-3 py-2">
                {senhaGerada}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(senhaGerada)}
                className="text-xs bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 font-medium"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Salve esta senha agora!</p>
          </div>
          <Link href="/login" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Ir para o login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 text-sm hover:text-blue-800">← Voltar para home</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-1">Teste Grátis por 7 dias</h1>
          <p className="text-gray-500">Sem cartão de crédito. Sem compromisso.</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm">
          <span className="text-4xl">🧪</span>
          <div>
            <p className="font-black text-green-800 uppercase text-xs tracking-tight">7 dias grátis no plano Pro</p>
            <p className="text-xs text-green-600 font-medium">500 produtos · Link de venda · Dashboard completo</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-6 md:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold animate-shake">⚠️ {error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome da Loja *</label>
                <input type="text" name="nome_fantasia" required value={formData.nome_fantasia} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp *</label>
                <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium" placeholder="(11) 99999-9999" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Responsável *</label>
                <input type="text" name="responsavel" required value={formData.responsavel} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha *</label>
                <div className="flex gap-2">
                  <input type="text" name="senha" required value={formData.senha} onChange={handleChange} className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-base md:text-sm font-medium" placeholder="Crie sua senha" />
                  <button type="button" onClick={gerarSenha} className="bg-gray-200 text-[#1e3a5f] px-4 rounded-2xl hover:bg-gray-300 text-xs font-black uppercase transition-colors">🔄 Gerar</button>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1 ml-1 leading-tight">⚠️ Você usará esta senha para acessar seu painel</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <input type="checkbox" id="aceito-termos" required className="mt-1 w-5 h-5 text-[#1e3a5f] rounded-lg border-gray-300 focus:ring-[#1e3a5f]/20 transition-all cursor-pointer" />
              <label htmlFor="aceito-termos" className="text-[10px] text-gray-600 font-medium leading-relaxed">
                Li e aceito os <Link href="/termos-de-uso" target="_blank" className="text-[#1e3a5f] font-bold hover:underline">Termos de Uso</Link> e o{' '}
                <Link href="/responsabilidade" target="_blank" className="text-[#1e3a5f] font-bold hover:underline">Termo de Responsabilidade</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] hover:bg-[#2a5a8e] text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 text-base uppercase tracking-widest">
              {loading ? '⏳ CRIANDO CONTA...' : '🚀 INICIAR TESTE GRÁTIS'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Fazer login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}