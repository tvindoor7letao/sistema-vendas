'use client'

import { useState, useEffect, useRef } from 'react'

export default function ZoomImagem({ imagens, videoUrl }) {
  const [idxAtual, setIdxAtual] = useState(0)
  const [modalAberto, setModalAberto] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [posicao, setPosicao] = useState({ x: 0, y: 0 })
  const [arrastando, setArrastando] = useState(false)
  const [inicioArraste, setInicioArraste] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const imagensArray = imagens || []
  const temImagens = imagensArray.length > 0
  const imagemSelecionada = imagensArray[idxAtual]

  // Resetar zoom ao fechar modal ou mudar imagem
  useEffect(() => {
    setZoom(1)
    setPosicao({ x: 0, y: 0 })
  }, [modalAberto, idxAtual])

  const navegar = (direcao) => {
    if (direcao === 'prox') {
      setIdxAtual((prev) => (prev + 1) % imagensArray.length)
    } else {
      setIdxAtual((prev) => (prev - 1 + imagensArray.length) % imagensArray.length)
    }
  }

  const handleWheel = (e) => {
    if (!modalAberto) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3))
  }

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setArrastando(true)
      setInicioArraste({ x: e.clientX - posicao.x, y: e.clientY - posicao.y })
    }
  }

  const handleMouseMove = (e) => {
    if (arrastando && zoom > 1) {
      setPosicao({
        x: e.clientX - inicioArraste.x,
        y: e.clientY - inicioArraste.y
      })
    }
  }

  const handleMouseUp = () => {
    setArrastando(false)
  }

  const toggleZoomClique = () => {
    setZoom((prev) => (prev > 1 ? 1 : 2))
    setPosicao({ x: 0, y: 0 })
  }

  if (videoUrl) {
    return (
      <div className="space-y-2">
        <div 
          className="relative w-full h-64 bg-black rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setModalAberto(true)}
        >
          <video 
            src={videoUrl} 
            className="w-full h-full object-contain"
            poster={imagensArray[0]}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <span className="text-white text-5xl">▶️</span>
          </div>
        </div>

        {modalAberto && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <button 
              onClick={() => setModalAberto(false)}
              className="absolute top-6 right-6 text-white text-3xl z-[110] hover:scale-110 transition"
            >✕</button>
            <video 
              src={videoUrl} 
              controls 
              autoPlay
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        )}
      </div>
    )
  }

  if (!temImagens) {
    return <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold uppercase text-xs">Sem imagem</div>
  }

  return (
    <div className="space-y-2">
      {/* Imagem Principal */}
      <div 
        className="relative w-full h-64 bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in group"
        onClick={() => setModalAberto(true)}
      >
        <img 
          src={imagemSelecionada} 
          alt="Produto"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          🔍 Clique para ampliar
        </div>
      </div>

      {/* Miniaturas */}
      {imagensArray.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {imagensArray.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setIdxAtual(idx)}
              className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idxAtual === idx ? 'border-[#1e3a5f] scale-95 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <img src={img} alt={`Mini ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Modal Fullscreen */}
      {modalAberto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm select-none"
          onWheel={handleWheel}
        >
          {/* Botão Fechar */}
          <button 
            onClick={() => setModalAberto(false)}
            className="absolute top-6 right-6 text-white text-3xl z-[110] hover:rotate-90 transition-all duration-300"
          >✕</button>

          {/* Navegação */}
          {imagensArray.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); navegar('prev'); }}
                className="absolute left-6 text-white text-5xl z-[110] hover:scale-125 transition-all p-4"
              >‹</button>
              <button 
                onClick={(e) => { e.stopPropagation(); navegar('prox'); }}
                className="absolute right-6 text-white text-5xl z-[110] hover:scale-125 transition-all p-4"
              >›</button>
            </>
          )}

          {/* Indicador de Página */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 font-black text-sm tracking-widest uppercase">
            {idxAtual + 1} / {imagensArray.length}
          </div>

          {/* Container da Imagem com Zoom/Arraste */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={imagemSelecionada} 
              alt="Zoom Produto"
              onClick={(e) => { e.stopPropagation(); toggleZoomClique(); }}
              className={`max-w-full max-h-full transition-transform duration-200 ease-out cursor-move select-none`}
              style={{
                transform: `scale(${zoom}) translate(${posicao.x / zoom}px, ${posicao.y / zoom}px)`,
                pointerEvents: arrastando ? 'none' : 'auto'
              }}
              draggable="false"
            />
          </div>

          {/* Instruções */}
          <div className="absolute bottom-6 right-6 text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 pointer-events-none">
            🖱️ Scroll = Zoom | Clique = Zoom | ← → = Navegar
          </div>
        </div>
      )}
    </div>
  )
}
