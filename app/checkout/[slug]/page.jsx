'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [carrinho, setCarrinho] = useState([])
  const [lojista, setLojista] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [frete, setFrete] = useState(0)
  const [total, setTotal] = useState(0)
  const [cep, setCep] = useState('')
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho_temp')
    if (carrinhoSalvo) {
      const itens = JSON.parse(carrinhoSalvo)
      setCarrinho(itens)
      const soma = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
      setSubtotal(soma)
      setTotal(soma)
    } else {
       router.push(`/loja/${slug}`)
    }
    carregarLojista()
  }, [slug])

  const carregarLojista = async () => {
    const { data: link } = await supabase
      .from('links_venda')
      .select('lojistas(*)')
      .eq('slug', slug)
      .single()
    
    if (link) {
      setLojista(link.lojistas)
    }
    setLoading(false)
  }

  const calcularFrete = async () => {
    if (cep.length !== 8) {
      setError('CEP inválido')
      return
    }

    setCalculandoFrete(true)
    setError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setError('CEP não encontrado')
        setCalculandoFrete(false)
        return
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        cep: data.cep
      }))

      const { data: lojistaConfig } = await supabase
        .from('lojistas')
        .select('valor_frete, frete_gratis_acima, frete_por_item, frete_item_valor')
        .eq('id', lojista.id)
        .single()

      let freteCalculado = 0
      const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0)

      if (lojistaConfig?.frete_por_item) {
        freteCalculado = totalItens * (lojistaConfig.frete_item_valor || 2.00)
      } else {
        freteCalculado = lojistaConfig?.valor_frete || 15.00
      }

      if (lojistaConfig?.frete_gratis_acima > 0 && subtotal >= lojistaConfig.frete_gratis_acima) {
        freteCalculado = 0
      }

      setFrete(freteCalculado)
      setTotal(subtotal + freteCalculado)

    } catch (err) {
      setError('Erro ao calcular frete')
    }
    setCalculandoFrete(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (frete === 0 && !formData.endereco) {
      setError('Por favor, informe seu CEP para calcular o frete.')
      return
    }
    setEnviando(true)
    setError('')

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        lojista_id: lojista.id,
        cliente_nome: formData.nome,
        cliente_email: formData.email,
        cliente_telefone: formData.telefone,
        cliente_endereco: {
          endereco: formData.endereco,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          cep: formData.cep
        },
        itens: carrinho,
        subtotal: subtotal,
        frete: frete,
        total: total,
        status: 'aguardando_pagamento'
      })
      .select()
      .single()

    if (pedidoError) {
      setError(pedidoError.message)
      setEnviando(false)
      return
    }

    localStorage.removeItem('carrinho_temp')
    router.push(`/pagamento/${pedido.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#1e3a5f]/10 border-t-[#1e3a5f] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center md:text-left">
           <Link href={`/loja/${slug}`} className="inline-flex items-center gap-2 text-xs font-black text-[#1e3a5f] uppercase tracking-widest hover:underline mb-6">
            ← Voltar para a vitrine
          </Link>
          <h1 className="text-4xl font-black text-[#1e3a5f] uppercase tracking-tighter">Finalizar Pedido</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Checkout Seguro & Profissional</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Coluna de Dados */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center font-black">1</div>
                <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Informações de Contato</h2>
              </div>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo *</label>
                    <input type="text" name="nome" required onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-medium" placeholder="Ex: João da Silva" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefone / WhatsApp *</label>
                    <input type="tel" name="telefone" required onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-medium" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email para Acompanhamento *</label>
                  <input type="email" name="email" required onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-medium" placeholder="seu@email.com" />
                </div>

                <div className="pt-10 mt-10 border-t border-gray-50">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center font-black">2</div>
                    <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Endereço de Entrega</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CEP *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="00000-000"
                            value={cep}
                            onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                            maxLength="8"
                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all font-bold"
                          />
                          <button 
                            type="button" 
                            onClick={calcularFrete} 
                            disabled={calculandoFrete || cep.length !== 8}
                            className="bg-gray-900 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1e3a5f] transition-all disabled:opacity-50 active:scale-95"
                          >
                            {calculandoFrete ? '...' : 'BUSCAR'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {formData.endereco && (
                      <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Logradouro *</label>
                            <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Número *</label>
                            <input type="text" name="numero" onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bairro *</label>
                            <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cidade / UF *</label>
                            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Resumo Lateral */}
          <div className="space-y-8">
            <div className="bg-[#1e3a5f] rounded-[2.5rem] shadow-2xl p-8 md:p-10 text-white sticky top-24">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">Resumo do Pedido</h2>
              
              <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {carrinho.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate opacity-90">{item.quantidade}x {item.nome}</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Unit: R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <span className="font-black text-sm whitespace-nowrap">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold text-white/60">
                  <span>SUBTOTAL</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white/60">
                  <span>FRETE</span>
                  <span className={frete > 0 ? 'text-[#e67e22]' : ''}>
                    {frete > 0 ? `R$ ${frete.toFixed(2)}` : 'A CALCULAR'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-6">
                  <span className="text-sm font-black uppercase tracking-widest opacity-60">TOTAL</span>
                  <span className="text-4xl font-black tracking-tighter">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-8 bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-2xl text-xs font-bold animate-shake">
                  ⚠️ {error}
                </div>
              )}
              
              <button 
                type="submit" 
                form="checkout-form"
                disabled={enviando || (frete === 0 && !formData.endereco)} 
                className="w-full mt-10 bg-[#e67e22] hover:bg-[#d35400] text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-orange-900/20 disabled:opacity-40 transition-all active:scale-95 uppercase tracking-wide"
              >
                {enviando ? 'PROCESSANDO...' : 'FINALIZAR COMPRA'}
              </button>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                 <div className="flex items-center justify-center gap-3 opacity-30 grayscale invert">
                    <span className="text-[10px] font-black uppercase tracking-widest">Tecnologia Segura & Criptografada</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}
