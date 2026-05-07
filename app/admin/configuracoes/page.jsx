'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/client'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState({
    taxa_plataforma: 0,
    manutencao: false,
    mensagem_manutencao: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    const { data } = await supabase
      .from('configuracoes_sistema')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (data) {
      setConfig({
        taxa_plataforma: data.taxa_plataforma,
        manutencao: data.manutencao,
        mensagem_manutencao: data.mensagem_manutencao || ''
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('configuracoes_sistema')
      .update({
        taxa_plataforma: config.taxa_plataforma,
        manutencao: config.manutencao,
        mensagem_manutencao: config.mensagem_manutencao,
        updated_at: new Date()
      })
      .eq('id', 1)

    if (error) {
      setMessage('Erro ao salvar: ' + error.message)
    } else {
      setMessage('Configurações salvas com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações do Sistema</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa da Plataforma (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.taxa_plataforma}
              onChange={(e) => setConfig({ ...config, taxa_plataforma: parseFloat(e.target.value) })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Porcentagem cobrada sobre cada venda</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={config.manutencao}
                onChange={(e) => setConfig({ ...config, manutencao: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">
                Modo Manutenção
              </label>
            </div>
            
            {config.manutencao && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem para os usuários
                </label>
                <textarea
                  rows="3"
                  value={config.mensagem_manutencao}
                  onChange={(e) => setConfig({ ...config, mensagem_manutencao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Sistema em manutenção. Voltamos em breve!"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
