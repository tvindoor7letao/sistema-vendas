'use client'

export default function WhatsAppLink({ numero, texto }) {
  const numeroLimpo = numero?.replace(/\D/g, '') || ''

  const formatarNumero = (num) => {
    if (!num || num.length < 10) return num || '-'
    const ddd = num.slice(0, 2)
    // Celular (9 dígitos) ou fixo (8 dígitos)
    if (num.length === 11) {
      return `(${ddd}) ${num.slice(2, 7)}-${num.slice(7)}`
    }
    return `(${ddd}) ${num.slice(2, 6)}-${num.slice(6)}`
  }

  if (!numeroLimpo) return <span className="text-gray-400">—</span>

  return (
    <a
      href={`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(texto || 'Olá! Vim pelo Sistema Loja.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors text-sm"
    >
      💬 {formatarNumero(numeroLimpo)}
    </a>
  )
}
