'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState(null)
  const [termoBusca, setTermoBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [idsDestacados, setIdsDestacados] = useState([])

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('lojista_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setProdutos(data || [])
    setLoading(false)
  }

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este produto?')) return
    setDeletando(id)
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (!error) setProdutos(produtos.filter(p => p.id !== id))
    setDeletando(null)
  }

  // Função para verificar se o termo parece ser um UUID
  const pareceUUID = (termo) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(termo)
  }

  // Função de busca (Filtragem Local para 100% de compatibilidade com UUID)
  const buscarProdutos = async () => {
    const termo = termoBusca.trim().toLowerCase()
    
    if (!termo) {
      carregarProdutos()
      setIdsDestacados([])
      return
    }
    
    setBuscando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Buscar todos os produtos do lojista para filtrar localmente
    // Isso evita problemas de conversão de UUID para texto no banco
    const { data: todosProdutos, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('lojista_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar:', error)
      alert('Erro ao buscar produtos')
      setBuscando(false)
      return
    }
    
    // Lógica de filtragem
    const isIdCurto = /^[a-f0-9]{8}$/i.test(termo)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termo)
    
    let produtosFiltrados = []
    
    if (isUUID) {
      produtosFiltrados = todosProdutos.filter(p => p.id.toLowerCase() === termo)
    } else if (isIdCurto) {
      // Filtrar por ID que começa com o termo (prefixo do UUID)
      produtosFiltrados = todosProdutos.filter(p => p.id.toLowerCase().startsWith(termo))
    } else {
      // Filtrar por nome que contém o termo
      produtosFiltrados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo))
    }
    
    if (produtosFiltrados.length > 0) {
      setProdutos(produtosFiltrados)
      setIdsDestacados(produtosFiltrados.map(p => p.id))
    } else {
      setProdutos([])
      setIdsDestacados([])
      alert(`Nenhum produto encontrado com o termo: "${termoBusca}"`)
    }
    
    setBuscando(false)
  }

  // Limpar busca
  const limparBusca = () => {
    setTermoBusca('')
    carregarProdutos()
    setIdsDestacados([])
  }

  const formatPreco = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-tight">Produtos</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Gestão de Inventário</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-96 relative">
            <input
              type="text"
              placeholder="Buscar por ID (ex: 0a55f314) ou nome..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarProdutos()}
              className="w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={buscarProdutos}
              disabled={buscando}
              className="bg-[#1e3a5f] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2a5a8e] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {buscando ? '⏳' : '🔍 BUSCAR'}
            </button>
            <button
              onClick={limparBusca}
              className="bg-gray-100 text-gray-700 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-2"
            >
              ✕ LIMPAR
            </button>
            <Link
              href="/lojista/produtos/novo"
              className="bg-[#27ae60] text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-[#219150] transition-all shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95"
            >
              + NOVO
            </Link>
          </div>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-20 text-center">
          <div className="text-7xl mb-6">🛍️</div>
          <h3 className="text-2xl font-black text-[#1e3a5f] mb-2 uppercase">Catálogo Vazio</h3>
          <p className="text-gray-500 mb-8 font-medium">Você ainda não possui produtos cadastrados em sua vitrine.</p>
          <Link
            href="/lojista/produtos/novo"
            className="btn-primary py-4 px-10 rounded-2xl"
          >
            Cadastrar Primeiro Produto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {produtos.map((produto) => (
                  <tr 
                    key={produto.id} 
                    className={`transition-colors border-l-4 ${
                      idsDestacados.includes(produto.id) 
                        ? 'bg-yellow-50 border-blue-500' 
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        {produto.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {produto.imagem_url && produto.imagem_url.length > 0 ? (
                            <img
                              src={produto.imagem_url[0]}
                              alt={produto.nome}
                              className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">📷</div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-[#1e3a5f] uppercase tracking-tight text-sm mb-0.5">{produto.nome}</div>
                          <div className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">Referência Interna</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-700">{formatPreco(produto.preco)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${produto.estoque <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                        {produto.estoque ?? '—'} <span className="text-[10px] font-black uppercase text-gray-300 ml-1">unid</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black border ${
                        produto.ativo
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {produto.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/lojista/produtos/editar/${produto.id}`}
                          className="p-2.5 bg-gray-50 hover:bg-blue-50 text-[#1e3a5f] rounded-xl transition-all"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleExcluir(produto.id)}
                          disabled={deletando === produto.id}
                          className="p-2.5 bg-gray-50 hover:bg-red-50 text-red-600 rounded-xl transition-all disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletando === produto.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
