'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LojistaLayout({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarAberta, setSidebarAberta] = useState(false) // Começar fechada para ser mobile-first

  useEffect(() => {
    // Abrir automaticamente no desktop
    if (window.innerWidth > 768) {
      setSidebarAberta(true)
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>

  const menuItems = [
    { href: '/lojista/dashboard', icon: '📊', label: 'Controle de Vendas' },
    { href: '/lojista/produtos', icon: '🛍️', label: 'Produtos' },
    { href: '/lojista/links', icon: '🔗', label: 'Links' },
    { href: '/lojista/pedidos', icon: '📦', label: 'Pedidos' },
    { href: '/lojista/configuracoes', icon: '⚙️', label: 'Configurações' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botão Hambúrguer Mobile */}
      <div className="md:hidden bg-[#1e3a5f] text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="font-bold text-sm tracking-tight uppercase">Minha Loja</span>
        </div>
        <button 
          onClick={() => setSidebarAberta(!sidebarAberta)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="text-2xl">{sidebarAberta ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Overlay para fechar sidebar no mobile */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#1e3a5f] shadow-xl transition-all duration-300 z-50 ${
        sidebarAberta ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className={`flex items-center gap-3 ${!sidebarAberta && 'justify-center w-full'}`}>
            <span className="text-2xl">🏢</span>
            {sidebarAberta && <span className="text-white font-semibold tracking-wide">Minha Loja</span>}
          </div>
          <button onClick={() => setSidebarAberta(!sidebarAberta)} className="text-white/70 hover:text-white transition-colors">
            {sidebarAberta ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#e8f0fe] hover:bg-[#2a5a8e] hover:text-white transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarAberta && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="absolute bottom-0 w-full border-t border-blue-800 bg-[#1e3a5f]">
          <div className="p-4 border-b border-blue-800/50">
            <div className={`flex flex-col gap-1 ${sidebarAberta ? 'items-start' : 'items-center'}`}>
              <Link href="/termos-de-uso" target="_blank" className="text-[9px] font-bold text-blue-300/50 hover:text-white transition-colors uppercase tracking-widest">Termos de Uso</Link>
              <Link href="/responsabilidade" target="_blank" className="text-[9px] font-bold text-blue-300/50 hover:text-white transition-colors uppercase tracking-widest">Responsabilidade</Link>
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[#e8f0fe] hover:bg-red-600/20 hover:text-red-300 transition-colors"
            >
              <span className="text-xl">🚪</span>
              {sidebarAberta && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className={`transition-all duration-300 ${
        sidebarAberta ? 'md:ml-64' : 'md:ml-20'
      }`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
