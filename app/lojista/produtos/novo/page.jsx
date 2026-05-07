'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UploadMultiplasImagens from '@/components/UploadMultiplasImagens'
import UploadVideo from '@/components/UploadVideo'

export default function NovoProduto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tipoMidia, setTipoMidia] = useState('imagens')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    ativo: true,
    imagens: [],
    video_url: null,
    tipo_variacao: 'generico'
  })

  const [videosRestantes, setVideosRestantes] = useState(8)

  useEffect(() => {
    const contarVideos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('produtos')
          .select('video_url')
          .eq('lojista_id', user.id)
        const videosAtivos = data?.filter(p => p.video_url).length || 0
        setVideosRestantes(8 - videosAtivos)
      }
    }
    contarVideos()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Verificar limite de vídeos
    if (formData.video_url && videosRestantes === 0) {
      setError('⚠️ VOCÊ ATINGIU O LIMITE MÁXIMO DE UPLOAD DE VÍDEOS!\n\nVocê já possui 8 vídeos ativos.\n\nExclua um produto com vídeo antes de adicionar outro.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sessão expirada. Faça login novamente.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('produtos').insert({
      lojista_id: user.id,
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      estoque: formData.estoque !== '' ? parseInt(formData.estoque) : null,
      ativo: formData.ativo,
      imagem_url: formData.imagens,
      video_url: formData.video_url,
      tipo_variacao: formData.tipo_variacao
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/lojista/produtos')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lojista/produtos" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Camiseta Azul P"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="descricao"
              rows="4"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o produto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Variação (Tamanhos/Pesos)</label>
            <select 
              name="tipo_variacao" 
              value={formData.tipo_variacao}
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="generico">📦 Genérico (sem variação)</option>
              <option value="roupa">👕 Roupas (PP ao GG)</option>
              <option value="calcado">👟 Calçados (33 ao 44)</option>
              <option value="bolo">🎂 Confeitaria (Peso/Fatia)</option>
            </select>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Tipo de Mídia Principal</label>
            <select 
              value={tipoMidia} 
              onChange={(e) => setTipoMidia(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-[#1e3a5f] mb-6"
            >
              <option value="imagens">🖼️ Imagens (até 4 fotos)</option>
              <option value="video">📹 Vídeo Demonstrativo</option>
            </select>

            {tipoMidia === 'imagens' ? (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upload de Imagens</label>
                <UploadMultiplasImagens 
                  imagensAtuais={formData.imagens}
                  onUpload={(urls) => setFormData({ ...formData, imagens: urls, video_url: null })}
                  maxImagens={4}
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upload de Vídeo</label>
                <UploadVideo 
                  videoAtual={formData.video_url}
                  onUpload={(url) => setFormData({ ...formData, video_url: url, imagens: [] })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="preco"
                step="0.01"
                min="0"
                required
                value={formData.preco}
                onChange={handleChange}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
              <input
                type="number"
                name="estoque"
                min="0"
                value={formData.estoque}
                onChange={handleChange}
                placeholder="Qtd disponível"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="ativo" className="text-sm text-gray-700">
              Produto ativo (visível para clientes)
            </label>
          </div>

          {videosRestantes === 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Limite de 8 vídeos atingido! Exclua um produto com vídeo para adicionar outro.
              </p>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Salvando...' : 'Criar Produto'}
            </button>
            <Link
              href="/lojista/produtos"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
