'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function AdminLojistas() {
  const [lojistas, setLojistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState(null)
  const [senhaModal, setSenhaModal] = useState({ aberto: false, lojistaId: null, email: '' })
  const [whatsappModal, setWhatsappModal] = useState({ aberto: false, lojistaId: null, whatsappAtual: '' })

  useEffect(() => {
    carregarLojistas()
  }, [])

  const carregarLojistas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('lojistas')
      .select('*')
      .order('created_at', { ascending: false })
    
    setLojistas(data || [])
    setLoading(false)
  }

  const alterarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('lojistas')
      .update({ status: novoStatus })
      .eq('id', id)
    
    if (!error) {
      carregarLojistas()
    } else {
      alert('Erro ao alterar status: ' + error.message)
    }
  }

  const ativarContaTeste = async (id) => {
    if (confirm('Ativar esta conta permanentemente e remover as restrições de teste?')) {
      const { error } = await supabase
        .from('lojistas')
        .update({ status: 'ativo', tipo_teste: false, data_expiracao: null })
        .eq('id', id)
      
      if (!error) {
        carregarLojistas()
        alert('✅ Conta ativada permanentemente!')
      } else {
        alert('Erro: ' + error.message)
      }
    }
  }

  const excluirLojista = async (id, email) => {
    if (confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente excluir o lojista "${email}"?\n\nEsta ação NÃO pode ser desfeita!`)) {
      setExcluindo(id)
      try {
        const { error } = await supabase.from('lojistas').delete().eq('id', id)
        if (error) throw new Error(error.message)
        await carregarLojistas()
        alert('✅ Lojista excluído com sucesso!')
      } catch (err) {
        alert('Erro ao excluir: ' + err.message)
      } finally {
        setExcluindo(null)
      }
    }
  }

  const alterarSenha = async () => {
    const novaSenha = document.getElementById('nova-senha').value
    if (!novaSenha || novaSenha.length < 6) {
      alert('Senha deve ter no mínimo 6 caracteres')
      return
    }
    
    if (!senhaModal.lojistaId) {
      alert('ID do lojista não encontrado')
      return
    }
    
    try {
      const response = await fetch('/api/admin/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: senhaModal.lojistaId,
          novaSenha: novaSenha
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert('Erro: ' + (data.error || 'Erro desconhecido'))
      } else {
        alert('✅ Senha alterada com sucesso!')
        setSenhaModal({ aberto: false, lojistaId: null, email: '' })
      }
    } catch (err) {
      alert('Erro de conexão: ' + err.message)
    }
  }

  const salvarWhatsApp = async () => {
    const novoWhatsapp = document.getElementById('novo-whatsapp').value
    if (!novoWhatsapp) {
      alert('Digite um número de WhatsApp')
      return
    }
    
    const { error } = await supabase
      .from('lojistas')
      .update({ whatsapp: novoWhatsapp })
      .eq('id', whatsappModal.lojistaId)
    
    if (error) {
      alert('Erro ao alterar WhatsApp: ' + error.message)
    } else {
      alert('✅ WhatsApp alterado com sucesso!')
      setWhatsappModal({ aberto: false, lojistaId: null, whatsappAtual: '' })
      carregarLojistas()
    }
  }

  const formatarWhatsApp = (numero) => {
    if (!numero) return null
    const limpo = numero.replace(/\D/g, '')
    if (limpo.length === 11) {
      return `(${limpo.slice(0,2)}) ${limpo.slice(2,7)}-${limpo.slice(7,11)}`
    }
    return numero
  }

  const verificarExpiracao = (dataExpiracao) => {
    if (!dataExpiracao) return null
    const hoje = new Date()
    const expira = new Date(dataExpiracao)
    if (expira < hoje) {
      return <span className="text-red-600 text-xs font-bold">⚠️ Expirado</span>
    }
    const diasRestantes = Math.ceil((expira - hoje) / (1000 * 60 * 60 * 24))
    return <span className="text-xs text-gray-500">{diasRestantes} dias restantes</span>
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando lojistas...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lojistas</h1>
        <Link href="/admin/lojistas/novo" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2a5a8e] transition">
          + Novo Lojista
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loja</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expira em</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lojistas.map(loja => {
              const whatsappFormatado = formatarWhatsApp(loja.whatsapp)
              const whatsappLink = loja.whatsapp ? `https://wa.me/55${loja.whatsapp.replace(/\D/g, '')}` : null
              
              return (
                <tr key={loja.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{loja.nome_fantasia}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{loja.email}</td>
                  <td className="px-4 py-3">
                    {whatsappLink ? (
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
                        💬 {whatsappFormatado}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{loja.responsavel || '-'}</td>
                  <td className="px-4 py-3">
                    {loja.tipo_teste ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">🧪 Teste</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">✓ Pago</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {loja.tipo_teste && loja.data_expiracao ? verificarExpiracao(loja.data_expiracao) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {loja.tipo_teste && loja.status === 'ativo' ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">⏳ Em teste</span>
                    ) : loja.status === 'ativo' ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Ativo</span>
                    ) : loja.status === 'bloqueado' ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">🔒 Bloqueado</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">⏳ Pendente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSenhaModal({ aberto: true, lojistaId: loja.id, email: loja.email })} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Alterar senha"
                      >
                        🔑 Senha
                      </button>

                      <button 
                        onClick={() => setWhatsappModal({ 
                          aberto: true, 
                          lojistaId: loja.id, 
                          whatsappAtual: loja.whatsapp || '' 
                        })} 
                        className="text-green-600 hover:text-green-800 text-sm"
                        title="Alterar WhatsApp"
                      >
                        📱 WhatsApp
                      </button>
                      
                      {loja.tipo_teste && loja.status === 'ativo' && (
                        <button onClick={() => ativarContaTeste(loja.id)} className="text-green-600 hover:text-green-800 text-sm" title="Ativar conta permanentemente">
                          ✅ Ativar
                        </button>
                      )}
                      
                      {loja.status === 'ativo' && !loja.tipo_teste && (
                        <button onClick={() => alterarStatus(loja.id, 'bloqueado')} className="text-red-600 hover:text-red-800 text-sm" title="Bloquear">
                          🔒 Bloquear
                        </button>
                      )}
                      
                      {loja.status === 'bloqueado' && (
                        <button onClick={() => alterarStatus(loja.id, 'ativo')} className="text-green-600 hover:text-green-800 text-sm" title="Desbloquear">
                          🔓 Desbloquear
                        </button>
                      )}
                      
                      <button onClick={() => excluirLojista(loja.id, loja.email)} className="text-red-600 hover:text-red-800 text-sm" title="Excluir">
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Alterar Senha */}
      {senhaModal.aberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
            <p className="text-sm text-gray-600 mb-4">Lojista: <strong>{senhaModal.email}</strong></p>
            <input 
              type="password" 
              id="nova-senha" 
              placeholder="Nova senha (mínimo 6 caracteres)" 
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button onClick={alterarSenha} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Salvar
              </button>
              <button 
                onClick={() => setSenhaModal({ aberto: false, lojistaId: null, email: '' })} 
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar WhatsApp */}
      {whatsappModal.aberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Alterar WhatsApp</h2>
            <p className="text-sm text-gray-600 mb-4">
              Loja: <strong>{lojistas.find(l => l.id === whatsappModal.lojistaId)?.nome_fantasia}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-2">WhatsApp atual: <strong>{whatsappModal.whatsappAtual || 'não informado'}</strong></p>
            <input 
              type="tel" 
              id="novo-whatsapp" 
              defaultValue={whatsappModal.whatsappAtual}
              placeholder="(31) 99999-9999" 
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button onClick={salvarWhatsApp} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Salvar
              </button>
              <button 
                onClick={() => setWhatsappModal({ aberto: false, lojistaId: null, whatsappAtual: '' })} 
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}