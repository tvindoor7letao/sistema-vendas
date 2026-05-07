'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UploadVideo({ onUpload, videoAtual }) {
  const [uploading, setUploading] = useState(false)

  // Extrair o primeiro frame do vídeo como thumbnail
  const extrairThumbnail = async (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = videoUrl
      video.muted = true
      video.crossOrigin = 'anonymous'
      
      video.onloadedmetadata = () => {
        video.currentTime = 0.1 // Pega o frame no início
      }
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.7)
        URL.revokeObjectURL(videoUrl)
      }
      
      video.onerror = reject
    })
  }

  const comprimirVideoComAudio = async (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.src = url
      video.crossOrigin = 'anonymous'
      video.playsInline = true
      
      video.onloadedmetadata = () => {
        // Configurar canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
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
        
        // Stream de vídeo do canvas
        const videoStream = canvas.captureStream(30)
        
        // Capturar áudio do vídeo original
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaElementSource(video)
        const destination = audioContext.createMediaStreamDestination()
        source.connect(destination)
        source.connect(audioContext.destination)
        
        // Combinar streams
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...destination.stream.getAudioTracks()
        ])
        
        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm',
          videoBitsPerSecond: 1000000,
          audioBitsPerSecond: 128000
        })
        
        const chunks = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' })
          resolve(blob)
          URL.revokeObjectURL(url)
          audioContext.close()
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
      
      video.onerror = reject
    })
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 200 * 1024 * 1024) {
      alert('Vídeo muito grande! Máximo 200MB.')
      return
    }
    
    setUploading(true)
    
    try {
      alert('⏳ Processando vídeo (mantendo áudio e gerando thumbnail)...')
      
      // Comprimir vídeo
      const videoComprimido = await comprimirVideoComAudio(file)
      const videoFileName = `video-${Date.now()}.mp4`
      
      // Upload do vídeo comprimido
      const { error: videoError } = await supabase.storage
        .from('produtos')
        .upload(videoFileName, videoComprimido, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        })
      
      if (videoError) throw videoError
      
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(videoFileName)
      
      // Extrair e fazer upload da thumbnail
      const videoTempUrl = URL.createObjectURL(videoComprimido)
      const thumbnailBlob = await extrairThumbnail(videoTempUrl)
      const thumbFileName = `thumb-${Date.now()}.jpg`
      
      const { error: thumbError } = await supabase.storage
        .from('produtos')
        .upload(thumbFileName, thumbnailBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })
      
      if (thumbError) throw thumbError
      
      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(thumbFileName)
      
      const tamanhoOriginalMB = (file.size / 1024 / 1024).toFixed(1)
      const tamanhoComprimidoMB = (videoComprimido.size / 1024 / 1024).toFixed(1)
      const economia = ((1 - videoComprimido.size / file.size) * 100).toFixed(0)
      
      alert(`✅ Vídeo enviado!\n\nOriginal: ${tamanhoOriginalMB}MB\nComprimido: ${tamanhoComprimidoMB}MB\nEconomia: ${economia}%`)
      
      // Retornar a URL do vídeo (thumbnail será usada pelo componente ZoomImagem)
      onUpload(videoUrl)
      
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
          <span className="text-xs text-gray-400 block">Comprimido com áudio e thumbnail</span>
          <input type="file" accept="video/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          {uploading && <span className="ml-2 text-blue-600">⏳ Processando...</span>}
        </label>
      )}
    </div>
  )
}