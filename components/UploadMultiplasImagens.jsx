'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UploadMultiplasImagens({ imagensAtuais = [], onUpload, maxImagens = 4 }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [imagens, setImagens] = useState(imagensAtuais)

  const comprimirImagem = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxWidth = 800
          const maxHeight = 800
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/jpeg', 0.8)
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    setError('')
    
    if (imagens.length + files.length > maxImagens) {
      setError('Maximo de ' + maxImagens + ' imagens por produto')
      return
    }

    setUploading(true)
    const novasImagens = [...imagens]

    for (const file of files) {
      try {
        const blobComprimido = await comprimirImagem(file)
        const fileName = Date.now() + '-' + Math.random().toString(36).slice(-8) + '.jpg'
        
        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, blobComprimido, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          })
        
        if (uploadError) {
          setError('Erro ao enviar imagem: ' + uploadError.message)
          continue
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName)
        
        novasImagens.push(publicUrl)
        
      } catch (err) {
        setError('Erro ao processar imagem')
      }
    }

    setImagens(novasImagens)
    onUpload(novasImagens)
    setUploading(false)
    e.target.value = ''
  }

  const removerImagem = async (index) => {
    const url = imagens[index]
    const novasImagens = imagens.filter((_, i) => i !== index)
    setImagens(novasImagens)
    onUpload(novasImagens)
    
    const partes = url.split('/')
    const nomeArquivo = partes[partes.length - 1]
    if (nomeArquivo) {
      await supabase.storage.from('produtos').remove([nomeArquivo])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {imagens.map((img, index) => (
          <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
            <img src={img} alt={'Produto ' + (index + 1)} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removerImagem(index)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        
        {imagens.length < maxImagens && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
            <span className="text-2xl">+</span>
            <span className="text-xs text-gray-500">Adicionar</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      {uploading && <p className="text-sm text-blue-600">Enviando imagens...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        Maximo de {maxImagens} imagens. Formatos: JPG, PNG, GIF.
      </p>
    </div>
  )
}
