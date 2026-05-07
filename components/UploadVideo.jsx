'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UploadVideo({ onUpload, videoAtual }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Aumentado para 200MB (vídeos de celular)
    if (file.size > 200 * 1024 * 1024) {
      alert('Vídeo muito grande! Máximo 200MB. Grave vídeos mais curtos.')
      return
    }
    
    setUploading(true)
    const fileName = `video-${Date.now()}.mp4`
    
    try {
      const { error } = await supabase.storage
        .from('produtos')
        .upload(fileName, file, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName)
      
      const tamanhoMB = (file.size / 1024 / 1024).toFixed(1)
      alert(`✅ Vídeo enviado com sucesso!\nTamanho: ${tamanhoMB}MB`)
      
      onUpload(publicUrl)
    } catch (err) {
      alert('Erro ao enviar vídeo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-4 text-center">
      {videoAtual ? (
        <div>
          <video src={videoAtual} controls className="w-32 h-32 object-cover" />
          <button onClick={() => onUpload(null)} className="text-red-500 text-sm mt-2 block w-full">
            Remover vídeo
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <span className="text-gray-500">🎬 Enviar vídeo (celular/até 1 minuto)</span>
          <span className="text-xs text-gray-400 block">Aceita vídeos do celular até 200MB</span>
          <input type="file" accept="video/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          {uploading && <span className="ml-2 text-blue-600">⏳ Enviando...</span>}
        </label>
      )}
    </div>
  )
}