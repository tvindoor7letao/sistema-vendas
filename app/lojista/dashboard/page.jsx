'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [bloqueado, setBloqueado] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState(null)
  const [loja, setLoja] = useState(null)
  const [stats, setStats] = useState({ produtos: 0, pedidos: 0, faturamento: 0 })

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Carregar dados da loja
      const { data: lojaData } = await supabase
        .from('lojistas')
        .select('id, status, tipo_teste, data_expiracao, nome_fantasia')
        .eq('id', user.id)
        .single()

      if (lojaData) {
        setLoja(lojaData)
        
        // Verificar expiração (bloqueio automático se expirado e ativo)
        if (lojaData.data_expiracao) {
          const expiracao = new Date(lojaData.data_expiracao)
          const agora = new Date()
          
          if (agora > expiracao && lojaData.status === 'ativo') {
            console.log('Conta expirada. Bloqueando...')
            await supabase.from('lojistas').update({ status: 'bloqueado' }).eq('id', user.id)
            setBloqueado(true)
            return
          }
          
          if (lojaData.status === 'bloqueado') {
            setBloqueado(true)
            return
          }

          if (lojaData.tipo_teste) {
            const diff = Math.ceil((expiracao - agora) / (1000 * 60 * 60 * 24))
            setDiasRestantes(diff)
          }
        }
      }

      // Carregar estatísticas
      const { count: prodCount } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('lojista_id', user.id)
      const { data: pedidosData } = await supabase.from('pedidos').select('total').eq('lojista_id', user.id)
      
      const faturamento = pedidosData?.reduce((acc, p) => acc + Number(p.total), 0) || 0
      setStats({
        produtos: prodCount || 0,
        pedidos: pedidosData?.length || 0,
        faturamento: faturamento
      })
    }
    carregarDados()
  }, [])

  if (bloqueado) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] shadow-xl shadow-red-900/5 border border-red-100 max-w-2xl mx-auto">
        <div className="text-8xl mb-8 animate-pulse">⏰</div>
        <h2 className="text-3xl font-black text-[#1e3a5f] mb-4 uppercase">Licença Expirada</h2>
        <p className="text-gray-500 mb-10 max-w-sm font-medium leading-relaxed">
          Seu período de teste grátis chegou ao fim. Para continuar transformando suas vendas, ative seu plano agora.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
        >
          LOGOUT DO SISTEMA
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase tracking-tight">Controle de Vendas</h1>
          <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Bem-vindo, {loja?.nome_fantasia || 'Lojista'}</p>
        </div>
        
        {diasRestantes !== null && (
          <div className={`px-5 py-3 rounded-2xl border-2 flex items-center gap-3 shadow-lg ${
            diasRestantes <= 2
              ? 'bg-red-50 border-red-100 text-red-700 shadow-red-900/5'
              : 'bg-orange-50 border-orange-100 text-orange-700 shadow-orange-900/5'
          }`}>
            <span className="text-2xl">{diasRestantes <= 2 ? '⚠️' : '⚡'}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter leading-none mb-1">Status do Período de Teste</p>
              <p className="text-sm font-bold">
                {diasRestantes <= 0 ? 'Expira hoje!' : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card Produtos */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">{stats.produtos}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Produtos Ativos</p>
        </div>

        {/* Card Pedidos */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendas</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">{stats.pedidos}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Pedidos Realizados</p>
        </div>

        {/* Card Faturamento */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faturamento</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">R$ {stats.faturamento.toFixed(2)}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Total Acumulado</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-black text-[#1e3a5f] mb-6 uppercase tracking-tight">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link href="/lojista/produtos/novo" className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
            <span className="text-2xl md:text-3xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">➕</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-tighter text-center leading-tight">Novo Produto</span>
          </Link>
          <Link href="/lojista/links" className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
            <span className="text-2xl md:text-3xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">🔗</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-tighter text-center leading-tight">Gerar Link</span>
          </Link>
          <Link href="/lojista/pedidos" className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
            <span className="text-2xl md:text-3xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">📦</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-tighter text-center leading-tight">Ver Pedidos</span>
          </Link>
          <Link href="/lojista/configuracoes" className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
            <span className="text-2xl md:text-3xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">⚙️</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-tighter text-center leading-tight">Ajustes</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
