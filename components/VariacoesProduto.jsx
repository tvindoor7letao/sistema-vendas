'use client'

import { useState } from 'react'

export default function VariacoesProduto({ tipo, onChange }) {
  const [valor, setValor] = useState('')

  const tiposVariacao = {
    roupa: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'],
    calcado: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
    bolo: ['Fatia', '1kg', '2kg', '3kg', '5kg'],
    generico: ['Único']
  }

  const opcoes = tiposVariacao[tipo] || tiposVariacao.generico

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">Variação</label>
      <select 
        value={valor} 
        onChange={(e) => {
          setValor(e.target.value)
          onChange(e.target.value)
        }}
        className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
      >
        <option value="">Selecione...</option>
        {opcoes.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
