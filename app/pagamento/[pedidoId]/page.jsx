'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PagamentoPage() {
  const { pedidoId } = useParams()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="text-7xl mb-6 animate-bounce">💰</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Recebido!</h1>
        <p className="text-sm font-mono text-gray-500 bg-gray-50 py-2 rounded-lg mb-6">
          # {pedidoId.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Seu pedido foi registrado com sucesso. <br/>
          <strong>Aguardando confirmação de pagamento.</strong>
        </p>
        
        <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">
            Integração com Asaas em andamento. <br/>
            Em breve você poderá pagar via <span className="font-bold">PIX, Cartão ou Boleto</span>.
          </p>
        </div>
        
        <Link href="/" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95">
          Voltar para Home
        </Link>
      </div>
    </div>
  )
}
