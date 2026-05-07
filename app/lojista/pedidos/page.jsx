'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [termoBusca, setTermoBusca] = useState('')

  useEffect(() => {
    carregarPedidos()
  }, [])

  const carregarPedidos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .eq('lojista_id', user.id)
        .order('created_at', { ascending: false })
      
      setPedidos(data || [])
    }
    setLoading(false)
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!termoBusca.trim()) return true
    const idCurto = pedido.id.slice(0, 8).toLowerCase()
    return idCurto.includes(termoBusca.toLowerCase())
  })

  const atualizarStatus = async (id, novoStatus) => {
    try {
      // Obter o usuário atual para debug
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Usuário logado:', user?.id)
      console.log('Pedido ID:', id, 'Novo status:', novoStatus)
      
      // Realizar a atualização
      const { data, error } = await supabase
        .from('pedidos')
        .update({ 
          status: novoStatus
        })
        .eq('id', id)
        .select()
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error)
        alert('Erro: ' + error.message)
        return
      }
      
      console.log('Pedido atualizado com sucesso:', data)
      
      // Recarregar a lista
      await carregarPedidos()
      alert(`Status atualizado para: ${getStatusLabel(novoStatus)}`)
      
    } catch (err) {
      console.error('Erro inesperado:', err)
      alert('Erro ao atualizar status')
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      em_rota: 'Em rota de entrega',
      entregue: 'Entregue'
    }
    return labels[status] || status
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { label: '⏳ Pendente', class: 'bg-yellow-100 text-yellow-800' },
      pago: { label: '💰 Pago', class: 'bg-blue-100 text-blue-800' },
      em_rota: { label: '🚚 Em rota', class: 'bg-purple-100 text-purple-800' },
      entregue: { label: '✅ Entregue', class: 'bg-green-100 text-green-800' }
    }
    const config = statusConfig[status] || statusConfig.pendente
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.label}</span>
  }

  const imprimirPedido = (pedido) => {
    const itensTexto = pedido.itens.map(item => {
      const varTexto = item.variacao ? ` [${item.variacao}]` : ''
      const obsTexto = item.observacao ? ` (Obs: ${item.observacao})` : ''
      const precoFormatado = (item.preco * item.quantidade).toFixed(2).replace('.', ',')
      return `${item.quantidade}x ${item.nome}${varTexto}${obsTexto} - R$ ${precoFormatado}`
    }).join('\n')

    let enderecoTexto = pedido.cliente_endereco || ''
    
    const conteudo = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido ${pedido.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e3a5f; text-align: center; }
          .info { margin-bottom: 20px; }
          .itens { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .itens th, .itens td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .itens th { background-color: #1e3a5f; color: white; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>Pedido #${pedido.id.slice(0, 8)}</h1>
        <p>Data: ${new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
        <p>Status: ${getStatusLabel(pedido.status)}</p>
        <div class="info"><h3>Cliente</h3><p>Nome: ${pedido.cliente_nome}</p><p>WhatsApp: ${pedido.cliente_whatsapp || '-'}</p></div>
        <div class="info"><h3>Endereço</h3><p>${enderecoTexto}</p></div>
        <h3>Itens</h3>
        <table class="itens"><thead><tr><th>Qtd</th><th>Produto</th><th>Preço</th></tr></thead><tbody>
          ${pedido.itens.map(item => `<tr><td>${item.quantidade}</td><td>${item.nome}${item.variacao ? ` [${item.variacao}]` : ''}</td><td>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</td></tr>`).join('')}
        </tbody></table>
        <div class="total"><p>Total: R$ ${(pedido.total || 0).toFixed(2).replace('.', ',')}</p></div>
      </body>
      </html>
    `
    
    const janela = window.open('', '_blank')
    janela.document.write(conteudo)
    janela.document.close()
    janela.print()
  }

  const excluirPedido = async (id) => {
    if (confirm('⚠️ ATENÇÃO!\n\nDeseja realmente excluir este pedido?\n\nEsta ação NÃO pode ser desfeita!')) {
      try {
        const { error } = await supabase
          .from('pedidos')
          .delete()
          .eq('id', id)
        
        if (error) {
          console.error('Erro ao excluir:', error)
          alert('Erro ao excluir pedido: ' + error.message)
          return
        }
        
        alert('✅ Pedido excluído com sucesso!')
        carregarPedidos() // Recarregar a lista
        
      } catch (err) {
        console.error('Erro:', err)
        alert('Erro ao excluir pedido')
      }
    }
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1e3a5f] mb-6">Pedidos</h1>

      {/* Campo de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar pedido pelo ID (ex: 0e085046)..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] shadow-sm transition-all font-medium"
          />
          <span className="absolute left-5 top-3.5 text-gray-400">🔍</span>
          {termoBusca && (
            <button
              onClick={() => setTermoBusca('')}
              className="absolute right-5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-bold mt-2 ml-1 uppercase tracking-widest">
          💡 Digite os primeiros caracteres do ID do pedido para filtrar
        </p>
      </div>

      {pedidosFiltrados.length === 0 ? (
        termoBusca ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">Nenhum pedido encontrado com o ID: <strong className="text-[#1e3a5f]">{termoBusca}</strong></p>
            <button onClick={() => setTermoBusca('')} className="mt-4 bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Limpar busca</button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 font-medium">Nenhum pedido recebido ainda.</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidosFiltrados.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 font-bold">{pedido.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{pedido.cliente_nome}</td>
                    <td className="px-4 py-3 text-sm">
                      {pedido.cliente_whatsapp ? (
                        <a href={`https://wa.me/55${pedido.cliente_whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[#25D366] hover:underline font-bold">
                          {pedido.cliente_whatsapp}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-[#1e3a5f]">R$ {(pedido.total || 0).toFixed(2).replace('.', ',')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => atualizarStatus(pedido.id, 'pendente')} className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition ${pedido.status === 'pendente' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-100' : 'bg-gray-100 text-gray-500 hover:bg-yellow-100'}`}>⏳ Pendente</button>
                        <button onClick={() => atualizarStatus(pedido.id, 'pago')} className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition ${pedido.status === 'pago' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-blue-100'}`}>💰 Pago</button>
                        <button onClick={() => atualizarStatus(pedido.id, 'em_rota')} className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition ${pedido.status === 'em_rota' ? 'bg-purple-500 text-white shadow-lg shadow-purple-100' : 'bg-gray-100 text-gray-500 hover:bg-purple-100'}`}>🚚 Rota</button>
                        <button onClick={() => atualizarStatus(pedido.id, 'entregue')} className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition ${pedido.status === 'entregue' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-500 hover:bg-green-100'}`}>✅ Entregue</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-bold">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => setPedidoSelecionado(pedido)} className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1" title="Ver detalhes">🔍 Detalhes</button>
                        <button onClick={() => imprimirPedido(pedido)} className="text-gray-600 hover:text-gray-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1" title="Imprimir">🖨️ Imprimir</button>
                        <button onClick={() => excluirPedido(pedido.id)} className="text-red-600 hover:text-red-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1" title="Excluir pedido">🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPedidoSelecionado(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#1e3a5f] text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pedido #{pedidoSelecionado.id.slice(0, 8)}</h2>
              <button onClick={() => setPedidoSelecionado(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Status Atual</h3>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(pedidoSelecionado.status)}
                </div>
              </div>

              <div className="border-b pb-3">
                <h3 className="font-semibold text-gray-700 mb-2">Cliente</h3>
                <p><strong>Nome:</strong> {pedidoSelecionado.cliente_nome}</p>
                <p><strong>Email:</strong> {pedidoSelecionado.cliente_email || '-'}</p>
                {pedidoSelecionado.cliente_whatsapp && (
                  <p><strong>WhatsApp:</strong> <a href={`https://wa.me/55${pedidoSelecionado.cliente_whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[#25D366]">{pedidoSelecionado.cliente_whatsapp}</a></p>
                )}
              </div>

              <div className="border-b pb-3">
                <h3 className="font-semibold text-gray-700 mb-2">Endereço de Entrega</h3>
                <p className="whitespace-pre-line">{pedidoSelecionado.cliente_endereco}</p>
                {pedidoSelecionado.observacao_entrega && <p className="mt-2"><strong>Obs:</strong> {pedidoSelecionado.observacao_entrega}</p>}
              </div>

              <div className="border-b pb-3">
                <h3 className="font-semibold text-gray-700 mb-2">Itens do Pedido</h3>
                <div className="space-y-2">
                  {pedidoSelecionado.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-1">
                      <div><span className="font-medium">{item.quantidade}x</span> {item.nome}{item.variacao && <span className="text-gray-500 ml-1">[{item.variacao}]</span>}{item.observacao && <span className="text-gray-400 text-xs ml-1">(Obs: {item.observacao})</span>}</div>
                      <span>R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b pb-3">
                <div className="flex justify-between text-sm"><span>Subtotal:</span><span>R$ {(pedidoSelecionado.subtotal || 0).toFixed(2).replace('.', ',')}</span></div>
                <div className="flex justify-between text-sm"><span>Frete:</span><span>R$ {(pedidoSelecionado.frete || 0).toFixed(2).replace('.', ',')}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total:</span><span>R$ {(pedidoSelecionado.total || 0).toFixed(2).replace('.', ',')}</span></div>
                <p className="text-sm mt-2"><strong>Pagamento:</strong> {pedidoSelecionado.forma_pagamento || 'Pix'}</p>
              </div>

              <div className="flex gap-2 pt-3">
                <button onClick={() => { atualizarStatus(pedidoSelecionado.id, 'pendente'); setPedidoSelecionado(null); }} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">⏳ Pendente</button>
                <button onClick={() => { atualizarStatus(pedidoSelecionado.id, 'pago'); setPedidoSelecionado(null); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600">💰 Pago</button>
                <button onClick={() => { atualizarStatus(pedidoSelecionado.id, 'em_rota'); setPedidoSelecionado(null); }} className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-600">🚚 Em rota</button>
                <button onClick={() => { atualizarStatus(pedidoSelecionado.id, 'entregue'); setPedidoSelecionado(null); }} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600">✅ Entregue</button>
              </div>

              <button onClick={() => imprimirPedido(pedidoSelecionado)} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">🖨️ Imprimir Pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}