'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UploadImagem({ onUpload, imagemAtual }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(imagemAtual || null)
  const [erro, setErro] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      setErro('Somente arquivos de imagem são permitidos.')
      return
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5MB.')
      return
    }

    setErro('')
    setUploading(true)

    const extensao = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extensao}`

    const { error: uploadError } = await supabase.storage
      .from('produtos')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setErro('Erro ao enviar imagem. Tente novamente.')
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('produtos')
      .getPublicUrl(fileName)

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  const handleRemover = () => {
    setPreview(null)
    onUpload(null)
  }

  return (
    <div>
      <div className={`border-2 border-dashed rounded-lg transition-colors ${
        uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}>
        {preview ? (
          <div className="p-4 flex items-center gap-4">
            <img
              src={preview}
              alt="Preview do produto"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium mb-2">Imagem selecionada</p>
              <div className="flex gap-2">
                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Trocar imagem
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleRemover}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center py-8 px-4 cursor-pointer ${uploading ? 'cursor-not-allowed' : ''}`}>
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                <span className="text-sm text-blue-600 font-medium">Enviando imagem...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-3xl">🖼️</div>
                <p className="text-sm font-medium text-gray-700">Clique para adicionar imagem</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP • Máximo 5MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {erro && (
        <p className="mt-1.5 text-xs text-red-600">{erro}</p>
      )}
    </div>
  )
}
