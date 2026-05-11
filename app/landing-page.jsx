'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase/client'

export default function LandingPage() {
  useEffect(() => {
    const checkAndClearSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.signOut()
        localStorage.clear()
        sessionStorage.clear()
      }
    }
    checkAndClearSession()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏢</span>
              <span className="font-black text-[#1e3a5f] tracking-tight text-xl">SISTEMA VENDAS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-[#2c3e50] hover:text-[#1e3a5f] transition-colors">
                Login
              </Link>
              <Link href="/cadastro-gratis" className="bg-[#1e3a5f] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a5a8e] transition-all shadow-lg shadow-blue-100 active:scale-95">
                Teste Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5a8e] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 border border-white/10">
                <span className="text-sm font-bold tracking-wide">🚀 EXPERIMENTE POR 7 DIAS GRÁTIS</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-white">
                Venda mais com o<br />
                <span className="text-[#e67e22]">Sistema Profissional</span>
              </h1>
              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Crie links de venda personalizados, gerencie produtos e receba pedidos
                diretamente no WhatsApp. Tudo em um só lugar.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/cadastro-gratis" className="bg-[#e67e22] hover:bg-[#d35400] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-orange-900/20 active:scale-95 text-lg">
                  Começar agora
                </Link>
                <Link href="#planos" className="border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all backdrop-blur-sm text-lg">
                  Ver Planos
                </Link>
              </div>
            </div>
            <div className="flex justify-center relative">
              <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-4 border border-white/20 shadow-2xl relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=600&h=500&fit=crop"
                  alt="Vendedor"
                  className="rounded-[2rem] shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#e67e22] rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1e3a5f] mb-4">Funcionalidades</h2>
            <div className="w-20 h-1.5 bg-[#e67e22] mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg">Tudo que você precisa para escalar seu negócio online com profissionalismo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔗', title: 'Links de Venda', desc: 'Crie links personalizados para compartilhar em suas redes sociais e WhatsApp.' },
              { icon: '🛍️', title: 'Gestão de Produtos', desc: 'Cadastre produtos com múltiplas imagens, preços e estoque de forma intuitiva.' },
              { icon: '📊', title: 'Dashboard Completo', desc: 'Acompanhe seus pedidos, faturamento e visualizações em tempo real.' }
            ].map((feat, idx) => (
              <div key={idx} className="group p-8 rounded-[2rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block">{feat.icon}</div>
                <h3 className="text-2xl font-black text-[#1e3a5f] mb-4">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção do Vídeo Explicativo */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1e3a5f] mb-4">
              Como funciona o <span className="text-[#e67e22]">Sistema Vendas</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Veja no vídeo como é fácil criar seu catálogo e começar a vender
            </p>
            <div className="w-20 h-1.5 bg-[#e67e22] mx-auto rounded-full mt-4"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/rhaFH0HVZx4"
                title="Sistema Vendas - Como funciona"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              🎬 Assista ao vídeo e descubra como transformar suas vendas
            </p>
          </div>
        </div>
      </section>

      {/* Planos - Apenas Pro */}
      <section id="planos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1e3a5f] mb-4">Plano Pro</h2>
            <p className="text-gray-500 text-lg">Tudo que você precisa para começar a vender</p>
          </div>
          <div className="grid md:grid-cols-1 gap-10 max-w-md mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 hover:shadow-2xl transition-all duration-300 flex flex-col">
              <h3 className="text-2xl font-black text-[#1e3a5f] mb-2 uppercase tracking-widest">Pro</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-[#1e3a5f]">R$ 49,90</span>
                <span className="text-gray-400 font-bold">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Até 500 produtos', 'Links de venda ilimitados', 'Dashboard de vendas', 'Suporte WhatsApp', 'Upload de imagens e vídeos'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                    <span className="text-green-500 text-xl font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro-gratis" className="block w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-[#1e3a5f] transition-all shadow-xl shadow-gray-200 active:scale-95">
                Começar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">🏢</span>
            <span className="font-black text-white tracking-tight">SISTEMA VENDAS</span>
          </div>
          <p className="text-white/50 text-sm font-medium">
            © 2024 Sistema Vendas Profissional. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}