'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function LinksVendaPage() {
  const [links, setLinks] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [novoSlug, setNovoSlug] = useState('')
  const [titulo, setTitulo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [buscaTermo, setBuscaTermo] = useState('')
  const [todosSelecionados, setTodosSelecionados] = useState(false)

  useEffect(() => {
    carregarLinks()
    carregarProdutos()
  }, [])

  const carregarLinks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('links_venda')
        .select('*')
        .eq('lojista_id', user.id)
        .order('created_at', { ascending: false })
      setLinks(data || [])
    }
    setLoading(false)
  }

  const carregarProdutos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .eq('lojista_id', user.id)
        .eq('ativo', true)
      setProdutos(data || [])
    }
  }

  const criarLink = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!novoSlug) {
      setError('Digite um identificador para o link')
      return
    }

    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
    const produtosIds = Array.from(checkboxes).map(cb => cb.value)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('links_venda').insert({
      lojista_id: user.id,
      slug: novoSlug.toLowerCase().replace(/\s/g, '-'),
      titulo: titulo || null,
      produtos_ids: produtosIds.length > 0 ? produtosIds : null,
      ativo: true
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess('Link criado com sucesso!')
      setNovoSlug('')
      setTitulo('')
      const checkboxes = document.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach(cb => cb.checked = false)
      carregarLinks()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const copiarLink = (slug) => {
    const url = `${window.location.origin}/loja/${slug}`
    navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }

  const toggleStatus = async (id, ativo) => {
    await supabase.from('links_venda').update({ ativo: !ativo }).eq('id', id)
    carregarLinks()
  }

  const excluirLink = async (id) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('links_venda').delete().eq('id', id)
      carregarLinks()
    }
  }

  const selecionarTodos = () => {
    const checkboxes = document.querySelectorAll('#lista-produtos input[type="checkbox"]')
    const novaSituacao = !todosSelecionados
    checkboxes.forEach(cb => {
      cb.checked = novaSituacao
    })
    setTodosSelecionados(novaSituacao)
    atualizarContador()
  }

  const atualizarContador = () => {
    const checkboxes = document.querySelectorAll('#lista-produtos input[type="checkbox"]')
    const selecionados = Array.from(checkboxes).filter(cb => cb.checked).length
    const contador = document.getElementById('contador-produtos')
    if (contador) contador.textContent = selecionados
  }

  const handleCheckboxChange = () => {
    const checkboxes = document.querySelectorAll('#lista-produtos input[type="checkbox"]')
    const todosChecados = Array.from(checkboxes).every(cb => cb.checked)
    setTodosSelecionados(todosChecados)
    atualizarContador()
  }

  const compartilharLink = (slug, titulo) => {
    const url = `${window.location.origin}/loja/${slug}`
    const mensagemWpp = encodeURIComponent(`Confira minha loja no Sistema Vendas: ${url}`)
    
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4'
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 class="text-xl font-black mb-6 text-[#1e3a5f] uppercase tracking-widest text-center">Compartilhar link</h3>
        <div class="space-y-3">
          <button onclick="window.open('https://api.whatsapp.com/send?text=${mensagemWpp}', '_blank')" class="w-full bg-[#25D366] text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold hover:scale-[1.02] active:scale-95 transition-all">
            <span class="text-xl">📱</span> WhatsApp
          </button>
          <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}', '_blank')" class="w-full bg-[#1877f2] text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold hover:scale-[1.02] active:scale-95 transition-all">
            <span class="text-xl">👤</span> Facebook
          </button>
          <button onclick="window.open('https://www.instagram.com/', '_blank')" class="w-full bg-gradient-to-r from-[#f09433] to-[#bc2a8d] text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold hover:scale-[1.02] active:scale-95 transition-all">
            <span class="text-xl">📸</span> Instagram
          </button>
          <button id="copy-btn-modal" class="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-gray-200 active:scale-95 transition-all">
            <span class="text-xl">📋</span> Copiar Link
          </button>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="w-full mt-6 text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-red-500 transition-colors">Fechar Janela</button>
      </div>
    `
    document.body.appendChild(modal)
    
    document.getElementById('copy-btn-modal').onclick = () => {
      navigator.clipboard.writeText(url)
      alert('✅ Link copiado com sucesso!')
    }
  }

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(buscaTermo.toLowerCase())
  )

  if (loading) return <div className="text-center py-8">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1e3a5f] mb-6">Links de Venda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de criação */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Criar novo link</h2>
            <form onSubmit={criarLink} className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              
              <div>
                <label className="block text-sm font-medium mb-1">Identificador (slug)</label>
                <input
                  type="text"
                  value={novoSlug}
                  onChange={(e) => setNovoSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                  placeholder="minha-loja"
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔗 URL final: /loja/{novoSlug || 'minha-loja'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Use apenas letras, números e hífen. Sem espaços.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Título (opcional)</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Minha Loja Oficial"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 uppercase text-[10px] font-black tracking-widest">Selecionar produtos (opcional)</label>
                  <button 
                    type="button"
                    onClick={selecionarTodos}
                    className="text-[10px] font-black uppercase text-[#1e3a5f] hover:text-blue-800 transition-colors"
                  >
                    {todosSelecionados ? '❌ Desmarcar todos' : '✅ Selecionar todos'}
                  </button>
                </div>
                
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Buscar produto por nome..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all font-medium"
                    onChange={(e) => setBuscaTermo(e.target.value)}
                  />
                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Digite o nome do produto para filtrar a lista</p>
                </div>

                <div id="lista-produtos" className="border border-gray-100 rounded-2xl max-h-64 overflow-y-auto p-3 bg-gray-50/30">
                  <div className="space-y-1.5">
                    {produtosFiltrados.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6 font-medium italic">Nenhum produto encontrado</p>
                    ) : (
                      produtosFiltrados.map(produto => (
                        <label key={produto.id} className="flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm transition-all rounded-xl cursor-pointer group">
                          <input
                            type="checkbox"
                            value={produto.id}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 text-[#1e3a5f] border-gray-300 rounded-lg focus:ring-[#1e3a5f]/20 transition-all cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 font-medium group-hover:text-[#1e3a5f] transition-colors">
                            {produto.nome} - <span className="font-black text-[#1e3a5f]">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 font-black mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ <span id="contador-produtos">0</span> selecionados</span>
                  <span>Marque os produtos que deseja incluir neste link</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a5f] text-white py-2 rounded-lg font-medium hover:bg-[#2a5a8e] transition"
              >
                Gerar Link de Venda
              </button>
            </form>
          </div>
        </div>

        {/* Card informativo */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8e] text-white rounded-xl shadow-lg p-5 sticky top-4">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold mb-2 text-white">Alcance mais clientes</h3>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Crie links específicos para campanhas, influenciadores ou redes sociais diferentes e acompanhe o desempenho de cada um.
            </p>
            <div className="border-t border-white/20 pt-3 mt-2">
              <p className="text-xs text-white/60">
                💡 Dica: Use slugs curtos e fáceis de lembrar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de links criados - COM ROLAGEM HORIZONTAL PARA CELULAR */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Meus Links</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum link criado ainda.</div>
          ) : (
            <table className="min-w-[650px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm whitespace-nowrap">Link</th>
                  <th className="p-3 text-left text-sm whitespace-nowrap">Título</th>
                  <th className="p-3 text-left text-sm whitespace-nowrap">Status</th>
                  <th className="p-3 text-left text-sm whitespace-nowrap">Visualizações</th>
                  <th className="p-3 text-left text-sm whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} className="border-t">
                    <td className="p-3 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 p-1 rounded">/loja/{link.slug}</code>
                    </td>
                    <td className="p-3 whitespace-nowrap">{link.titulo || '-'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${link.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {link.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">{link.visualizacoes || 0}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => copiarLink(link.slug)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold uppercase tracking-tighter transition-colors whitespace-nowrap">
                          📋 Copiar
                        </button>
                        <button onClick={() => compartilharLink(link.slug, link.titulo)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs font-bold uppercase tracking-tighter transition-colors whitespace-nowrap">
                          🔗 Compartilhar
                        </button>
                        <button onClick={() => toggleStatus(link.id, link.ativo)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 text-xs font-bold uppercase tracking-tighter transition-colors whitespace-nowrap">
                          {link.ativo ? '🔒 Desativar' : '🔓 Ativar'}
                        </button>
                        <button onClick={() => excluirLink(link.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-bold uppercase tracking-tighter transition-colors whitespace-nowrap">
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}