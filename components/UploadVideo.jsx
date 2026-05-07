'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UploadVideo({ onUpload, videoAtual }) {
  const [uploading, setUploading] = useState(false)

  const comprimirVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      video.playsInline = true
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Reduz para 480p (economiza espaço)
        const maxWidth = 640
        const maxHeight = 640
        let width = video.videoWidth
        let height = video.videoHeight
        
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
        
        // Configurar compressão
        const stream = canvas.captureStream(30)
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
          videoBitsPerSecond: 800000, // 0.8 Mbps
          audioBitsPerSecond: 64000
        })
        
        const chunks = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' })
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.mp4', {
            type: 'video/mp4'
          })
          resolve(compressedFile)
          URL.revokeObjectURL(url)
        }
        
        let animationId
        const drawFrame = () => {
          if (video.paused || video.ended) {
            cancelAnimationFrame(animationId)
            return
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          animationId = requestAnimationFrame(drawFrame)
        }
        
        video.play()
        drawFrame()
        mediaRecorder.start()
        
        setTimeout(() => {
          video.pause()
          mediaRecorder.stop()
          cancelAnimationFrame(animationId)
        }, video.duration * 1000 + 500)
      }
      
      video.onerror = () => reject(new Error('Erro ao processar vídeo'))
    })
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 200 * 1024 * 1024) {
      alert('Vídeo muito grande! Máximo 200MB. Grave vídeos mais curtos (até 1 minuto).')
      return
    }
    
    setUploading(true)
    
    try {
      alert('⏳ Comprimindo vídeo... Isso pode levar alguns segundos.')
      
      const videoComprimido = await comprimirVideo(file)
      const fileName = `video-${Date.now()}.mp4`
      
      const { error } = await supabase.storage
        .from('produtos')
        .upload(fileName, videoComprimido, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName)
      
      const tamanhoOriginalMB = (file.size / 1024 / 1024).toFixed(1)
      const tamanhoComprimidoMB = (videoComprimido.size / 1024 / 1024).toFixed(1)
      const economia = ((1 - videoComprimido.size / file.size) * 100).toFixed(0)
      
      alert(`✅ Vídeo comprimido!\n\nOriginal: ${tamanhoOriginalMB}MB\nComprimido: ${tamanhoComprimidoMB}MB\nEconomia: ${economia}%`)
      
      onUpload(publicUrl)
    } catch (err) {
      alert('Erro: ' + err.message)
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
          <span className="text-xs text-gray-400 block">Será comprimido automaticamente para economizar espaço</span>
          <input type="file" accept="video/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          {uploading && <span className="ml-2 text-blue-600">⏳ Processando...</span>}
        </label>
      )}
    </div>
  )
}