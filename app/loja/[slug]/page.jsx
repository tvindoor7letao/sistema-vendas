'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { useParams } from 'next/navigation'
import VariacoesProduto from '../../../components/VariacoesProduto'
import ZoomImagem from '../../../components/ZoomImagem'
import Link from 'next/link'

export default function LojaPublica() {
  const { slug } = useParams()
  const [lojista, setLojista] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [carrinho, setCarrinho] = useState([])
  const [loading, setLoading] = useState(true)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [checkoutAberto, setCheckoutAberto] = useState(false)
  const [frete, setFrete] = useState(0)
  const [checkoutData, setCheckoutData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    endereco: '',
    bairro: '',
    cidade: '',
    cep: '',
    pagamento: 'Pix',
    observacao_entrega: ''
  })

  useEffect(() => {
    carregarLoja()
  }, [slug])

  const carregarLoja = async () => {
    const { data: link } = await supabase
      .from('links_venda')
      .select('*, lojistas(*)')
      .eq('slug', slug)
      .eq('ativo', true)
      .single()

    if (link) {
      setLojista(link.lojistas)
      
      await supabase
        .from('links_venda')
        .update({ visualizacoes: (link.visualizacoes || 0) + 1 })
        .eq('id', link.id)

      let query = supabase
        .from('produtos')
        .select('*')
        .eq('lojista_id', link.lojistas.id)
        .eq('ativo', true)
      
      if (link.produtos_ids && link.produtos_ids.length > 0) {
        query = query.in('id', link.produtos_ids)
      }

      const { data: produtosData } = await query
      
      setProdutos(produtosData || [])
    }
    setLoading(false)
  }

  const adicionarAoCarrinho = (produto, variacao = '', observacao = '') => {
    const uniqueId = `${produto.id}-${variacao}-${Date.now()}-${Math.random()}`
    setCarrinho([...carrinho, { 
      ...produto, 
      uniqueId, 
      quantidade: 1, 
      variacao: variacao || 'Único', 
      observacao 
    }])
  }

  const removerDoCarrinho = (uniqueId) => {
    setCarrinho(carrinho.filter(item => item.uniqueId !== uniqueId))
  }

  const atualizarQuantidade = (uniqueId, quantidade) => {
    if (quantidade < 1) {
      removerDoCarrinho(uniqueId)
    } else {
      setCarrinho(carrinho.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantidade } : item
      ))
    }
  }

  const atualizarObservacao = (uniqueId, observacao) => {
    setCarrinho(carrinho.map(item =>
      item.uniqueId === uniqueId ? { ...item, observacao } : item
    ))
  }

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const calcularFrete = async () => {
    const cepInput = document.getElementById('cep_calculo').value.replace(/\D/g, '')
    if (cepInput.length !== 8) {
      alert('CEP inválido')
      return
    }
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepInput}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        alert('CEP não encontrado')
        return
      }
      
      const { data: lojistaConfig } = await supabase
        .from('lojistas')
        .select('valor_frete, frete_gratis_acima, frete_por_item, frete_item_valor')
        .eq('id', lojista.id)
        .single()
      
      const total = calcularTotal()
      let valorFrete = 0
      
      if (lojistaConfig?.frete_por_item) {
        const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0)
        valorFrete = totalItens * (lojistaConfig.frete_item_valor || 2.00)
      } else {
        valorFrete = lojistaConfig?.valor_frete || 15.00
      }
      
      if (lojistaConfig?.frete_gratis_acima > 0 && total >= lojistaConfig.frete_gratis_acima) {
        valorFrete = 0
      }
      
      setFrete(valorFrete)
      setCheckoutData({ ...checkoutData, cep: data.cep, cidade: data.localidade, bairro: data.bairro, endereco: data.logradouro })
      document.getElementById('resultado-frete').innerHTML = `Frete: R$ ${valorFrete.toFixed(2)}`
      
    } catch (err) {
      alert('Erro ao calcular frete')
    }
  }

  const formatarMensagemWhatsApp = () => {
    const totalItens = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
    const totalGeral = totalItens + frete
    
    const itensTexto = carrinho.map(item => {
      const idCurto = item.id.slice(0, 8)
      const varTexto = (item.variacao && item.variacao !== 'Único') ? ` [${item.variacao}]` : ''
      const obsTexto = item.observacao ? ` (Obs: ${item.observacao})` : ''
      const precoFormatado = (item.preco * item.quantidade).toFixed(2).replace('.', ',')
      return `${item.quantidade}x ${item.nome} (ID-${idCurto})${varTexto}${obsTexto} - R$ ${precoFormatado}`
    }).join('\n')

    let mensagem = '🛒 *NOVO PEDIDO* 🛒\n\n'
    mensagem += `Cliente: ${checkoutData.nome}\n`
    mensagem += '━━━━━━━━━━━━━━━━━━━━━━\n'
    mensagem += '*ITENS DO PEDIDO:*\n'
    mensagem += itensTexto
    mensagem += '\n━━━━━━━━━━━━━━━━━━━━━━\n'
    mensagem += `*Total Itens:* R$ ${totalItens.toFixed(2).replace('.', ',')}\n`
    mensagem += `*Frete:* R$ ${frete.toFixed(2).replace('.', ',')}\n`
    mensagem += `*Total Geral:* R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`
    mensagem += `*Pagamento:* ${checkoutData.pagamento}\n`
    mensagem += '━━━━━━━━━━━━━━━━━━━━━━\n'
    mensagem += '*ENDEREÇO DE ENTREGA:*\n'
    mensagem += `${checkoutData.endereco}\n`
    if (checkoutData.bairro) mensagem += `${checkoutData.bairro} - `
    mensagem += `${checkoutData.cidade}\n`
    mensagem += `CEP: ${checkoutData.cep}\n`
    if (checkoutData.observacao_entrega) {
      mensagem += `\n*Obs:* ${checkoutData.observacao_entrega}\n`
    }
    mensagem += `\n🔗 *Link para confirmar:*\n`
    mensagem += `${window.location.origin}/lojista/pedidos`

    return encodeURIComponent(mensagem)
  }

  const enviarPedido = async () => {
    if (!checkoutData.nome || !checkoutData.endereco || !checkoutData.cidade) {
      alert('Preencha nome, endereço e cidade')
      return
    }
    
    if (carrinho.length === 0) {
      alert('Carrinho vazio')
      return
    }

    const subtotal = calcularTotal()
    const totalGeral = subtotal + frete
    
    const itensParaSalvar = carrinho.map(item => ({
      id: item.id,
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
      variacao: item.variacao || '',
      observacao: item.observacao || ''
    }))

    const { error: saveError } = await supabase
      .from('pedidos')
      .insert({
        lojista_id: lojista.id,
        cliente_nome: checkoutData.nome,
        cliente_email: checkoutData.email || 'nao_informado@email.com',
        cliente_whatsapp: checkoutData.whatsapp || '',
        cliente_endereco: `${checkoutData.endereco}${checkoutData.bairro ? `, ${checkoutData.bairro}` : ''}, ${checkoutData.cidade} - CEP: ${checkoutData.cep || ''}`,
        itens: itensParaSalvar,
        subtotal: subtotal,
        frete: frete,
        total: totalGeral,
        forma_pagamento: checkoutData.pagamento,
        status: 'pendente',
        observacao_entrega: checkoutData.observacao_entrega || ''
      })

    if (saveError) {
      console.error('Erro detalhado ao salvar:', saveError)
      alert('Erro ao registrar pedido: ' + saveError.message)
    } else {
      console.log('Pedido salvo com sucesso!')
    }

    const mensagem = formatarMensagemWhatsApp()
    const whatsappUrl = `https://wa.me/55${lojista?.whatsapp?.replace(/\D/g, '')}?text=${mensagem}`
    window.open(whatsappUrl, '_blank')
    
    setCarrinho([])
    setFrete(0)
    setCheckoutAberto(false)
    setCarrinhoAberto(false)
    setCheckoutData({
      nome: '',
      email: '',
      whatsapp: '',
      endereco: '',
      bairro: '',
      cidade: '',
      cep: '',
      pagamento: 'Pix',
      observacao_entrega: ''
    })
  }

  const handleCheckoutChange = (e) => {
    setCheckoutData({ ...checkoutData, [e.target.name]: e.target.value })
  }

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>
  if (!lojista) return <div className="text-center p-8">Loja não encontrada</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-3 py-2 md:px-4 md:py-3 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-xl font-bold text-[#1e3a5f] truncate">{lojista.nome_fantasia}</h1>
            {lojista.whatsapp && (
              <a href={`https://wa.me/55${lojista.whatsapp.replace(/\D/g, '')}`} className="text-[10px] md:text-xs text-[#27ae60]">
                📱 WhatsApp
              </a>
            )}
          </div>
          <button 
            onClick={() => setCarrinhoAberto(true)}
            className="relative bg-[#1e3a5f] text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0"
          >
            🛒 Carrinho
            {carrinho.length > 0 && (
              <span className="bg-[#e67e22] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {carrinho.reduce((sum, item) => sum + item.quantidade, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Produtos */}
      <main className="max-w-7xl mx-auto px-2 py-4">
        {produtos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum produto disponível</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
            {produtos.map(produto => (
              <div key={produto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <ZoomImagem imagens={produto.imagem_url} videoUrl={produto.video_url} />
                <div className="p-2 md:p-3">
                  <h3 className="font-semibold text-xs md:text-sm text-gray-800 line-clamp-2">{produto.nome}</h3>
                  {produto.descricao && (
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 line-clamp-2">{produto.descricao}</p>
                  )}
                  <p className="text-[#1e3a5f] font-bold text-sm md:text-base mt-2">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </p>
                  <div className="mt-2">
                    <VariacoesProduto tipo={produto.tipo_variacao || 'generico'} onChange={(valor) => {
                      const input = document.getElementById(`variacao-${produto.id}`)
                      if (input) input.value = valor
                    }} />
                    <input type="hidden" id={`variacao-${produto.id}`} />
                    <input type="text" placeholder="Obs..." className="w-full text-xs p-1.5 border rounded mb-2" id={`obs-${produto.id}`} />
                    <button
                      onClick={() => {
                        const variacao = document.getElementById(`variacao-${produto.id}`).value
                        const obs = document.getElementById(`obs-${produto.id}`).value
                        if (!variacao) {
                          alert('Selecione uma variação')
                          return
                        }
                        adicionarAoCarrinho(produto, variacao, obs)
                        document.getElementById(`variacao-${produto.id}`).value = ''
                        document.getElementById(`obs-${produto.id}`).value = ''
                      }}
                      className="w-full bg-[#1e3a5f] text-white py-1.5 rounded-lg text-xs font-medium"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CARRINHO MODAL - COMPLETO (igual em desktop e celular) */}
      {carrinhoAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-[95%] max-w-md h-full flex flex-col shadow-2xl rounded-l-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-[#1e3a5f] text-white">
              <h2 className="text-lg font-bold">Seu Carrinho</h2>
              <button
                onClick={() => setCarrinhoAberto(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Lista de itens */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {carrinho.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
              ) : (
                carrinho.map((item) => (
                  <div key={item.uniqueId} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.nome}</span>
                        {item.variacao && item.variacao !== 'Único' && (
                          <span className="text-xs font-bold text-[#e67e22]">
                            Variação: {item.variacao}
                          </span>
                        )}
                        {item.observacao && (
                          <p className="text-xs text-gray-500 mt-1">Obs: {item.observacao}</p>
                        )}
                      </div>
                      <span className="font-semibold">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => atualizarQuantidade(item.uniqueId, item.quantidade - 1)}
                        className="px-2 bg-gray-100 rounded text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm">{item.quantidade}</span>
                      <button
                        onClick={() => atualizarQuantidade(item.uniqueId, item.quantidade + 1)}
                        className="px-2 bg-gray-100 rounded text-sm"
                      >
                        +
                      </button>
                      <input
                        type="text"
                        placeholder="Obs..."
                        value={item.observacao || ''}
                        onChange={(e) => atualizarObservacao(item.uniqueId, e.target.value)}
                        className="flex-1 text-xs p-1 border rounded"
                      />
                      <button
                        onClick={() => removerDoCarrinho(item.uniqueId)}
                        className="text-red-500 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer com total */}
            <div className="border-t p-4 bg-white">
              <div className="flex justify-between text-base font-bold mb-3">
                <span>Total:</span>
                <span>R$ {calcularTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setCarrinhoAberto(false)
                  setCheckoutAberto(true)
                }}
                disabled={carrinho.length === 0}
                className="w-full bg-[#27ae60] text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout */}
      {checkoutAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-auto shadow-2xl">
            <div className="p-3 md:p-4 border-b bg-[#1e3a5f] text-white sticky top-0 z-10 flex justify-between items-center">
              <h2 className="text-base md:text-lg font-bold">Finalizar Pedido</h2>
              <button onClick={() => setCheckoutAberto(false)} className="text-white/80 p-2">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <input
                type="text"
                name="nome"
                placeholder="Seu Nome *"
                value={checkoutData.nome}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Seu Email *"
                value={checkoutData.email}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                name="whatsapp"
                placeholder="WhatsApp *"
                value={checkoutData.whatsapp}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                name="endereco"
                placeholder="Endereço (Rua, Número) *"
                value={checkoutData.endereco}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                name="bairro"
                placeholder="Bairro"
                value={checkoutData.bairro}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                name="cidade"
                placeholder="Cidade *"
                value={checkoutData.cidade}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                name="cep"
                placeholder="CEP"
                value={checkoutData.cep}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
              />

              <select
                name="pagamento"
                value={checkoutData.pagamento}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option>Pix</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>Boleto</option>
              </select>

              <div>
                <label className="block text-sm font-medium mb-1">CEP para cálculo do frete</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="cep_calculo"
                    placeholder="00000-000"
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={calcularFrete}
                    className="bg-gray-100 px-3 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Calcular
                  </button>
                </div>
                <div id="resultado-frete" className="text-sm text-[#27ae60] mt-1 font-medium"></div>
              </div>

              <textarea
                name="observacao_entrega"
                rows="2"
                placeholder="Observação para entrega"
                value={checkoutData.observacao_entrega}
                onChange={handleCheckoutChange}
                className="w-full p-2 border rounded-lg text-sm"
              />

              <div className="pt-4 border-t">
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frete:</span>
                    <span>R$ {frete.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-[#e67e22]">R$ {(calcularTotal() + frete).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={enviarPedido} className="w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  📱 Enviar Pedido via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé com WhatsApp */}
      <div className="text-center py-2 mt-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">Crie sua conta</p>
        <div className="flex flex-col items-center gap-1 mt-0.5">
          <a
            href="/cadastro-gratis?src=loja_footer&t=1700000000000"
            className="text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
          >
            Criar conta grátis
          </a>
          <a
            href="https://wa.me/5531986221445"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-400 hover:text-[#25D366] transition-colors"
          >
            31 98622-1445
          </a>
        </div>
      </div>
    </div>
  )
}