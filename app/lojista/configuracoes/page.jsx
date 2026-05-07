'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [config, setConfig] = useState({
    valor_frete: 15.00,
    frete_gratis_acima: 0,
    frete_por_item: true,
    frete_item_valor: 2.00
  })

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('lojistas')
        .select('valor_frete, frete_gratis_acima, frete_por_item, frete_item_valor')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setConfig({
          valor_frete: data.valor_frete || 15.00,
          frete_gratis_acima: data.frete_gratis_acima || 0,
          frete_por_item: data.frete_por_item ?? true,
          frete_item_valor: data.frete_item_valor || 2.00
        })
      }
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from('lojistas')
      .update({
        valor_frete: config.valor_frete,
        frete_gratis_acima: config.frete_gratis_acima,
        frete_por_item: config.frete_por_item,
        frete_item_valor: config.frete_item_valor
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-tight">Configurações</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Parâmetros de Operação</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-50 p-2.5 rounded-2xl text-[#1e3a5f]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Regras de Logística</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {error && <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-xs font-bold animate-shake">⚠️ {error}</div>}
            {success && <div className="bg-green-50 border border-green-100 text-green-700 px-5 py-4 rounded-2xl text-xs font-bold animate-fade-in">✅ {success}</div>}

            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-black text-[#1e3a5f] uppercase tracking-tight mb-1">Cálculo por Volume de Itens</label>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cobrar frete unitário por produto</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="frete_por_item"
                    checked={config.frete_por_item}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                </label>
              </div>
            </div>

            <div className="grid gap-8">
              {config.frete_por_item ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Taxa por Item (R$)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1e3a5f] font-black">R$</span>
                    <input
                      type="number"
                      name="frete_item_valor"
                      value={config.frete_item_valor}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-black text-[#1e3a5f]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Taxa Fixa Global (R$)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1e3a5f] font-black">R$</span>
                    <input
                      type="number"
                      name="valor_frete"
                      value={config.valor_frete}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-black text-[#1e3a5f]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Frete Grátis Bonificado (Acima de R$)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1e3a5f] font-black">R$</span>
                  <input
                    type="number"
                    name="frete_gratis_acima"
                    value={config.frete_gratis_acima}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-black text-[#1e3a5f]"
                  />
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3 ml-1 italic">Dica: Use 0 para cobrar frete em todos os pedidos.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#1e3a5f] hover:bg-[#2a5a8e] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {saving ? 'PROCESSANDO...' : 'ATUALIZAR CONFIGURAÇÕES'}
            </button>
          </form>
        </div>

        <div className="space-y-8">
           <div className="bg-[#1e3a5f] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-6 uppercase tracking-tighter flex items-center gap-3">
                <span className="text-2xl">⚡</span> Resumo Operacional
              </h3>
              <div className="space-y-6">
                {config.frete_por_item ? (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Modelo Logístico</p>
                    <p className="text-lg font-bold">Cobrança de <span className="text-[#e67e22]">R$ {config.frete_item_valor.toFixed(2)}</span> por unidade vendida.</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Modelo Logístico</p>
                    <p className="text-lg font-bold">Taxa fixa de <span className="text-[#e67e22]">R$ {config.valor_frete.toFixed(2)}</span> independente do volume.</p>
                  </div>
                )}
                
                {config.frete_gratis_acima > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[1.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-2">Política de Fidelidade</p>
                    <p className="text-lg font-bold text-green-50">ENTREGA GRATUITA para pedidos que superarem <span className="text-green-400">R$ {config.frete_gratis_acima.toFixed(2)}</span>.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 p-8 text-[12rem] opacity-[0.03] font-black pointer-events-none select-none italic">LOG</div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex items-center gap-6">
             <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl">💡</div>
             <div>
                <h4 className="font-black text-[#1e3a5f] uppercase tracking-tighter text-sm mb-1">Estratégia de Vendas</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Configurar o frete grátis para um valor 20% acima do seu ticket médio aumenta a conversão em até 35%.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
