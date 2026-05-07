'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarAberta, setSidebarAberta] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data: admin } = await supabase
        .from('administradores')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (!admin) {
        router.push('/lojista/dashboard')
        return
      }
      
      setLoading(false)
    }
    
    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>

  const menuItems = [
    { href: '/admin/dashboard', icon: '📊', label: 'Controle de Vendas' },
    { href: '/admin/lojistas', icon: '👥', label: 'Lojistas' },
    { href: '/admin/configuracoes', icon: '⚙️', label: 'Configurações' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#1e3a5f] shadow-xl transition-all duration-300 z-30 ${sidebarAberta ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className={`flex items-center gap-3 ${!sidebarAberta && 'justify-center w-full'}`}>
            <span className="text-2xl">🏢</span>
            {sidebarAberta && <span className="text-white font-semibold tracking-wide">Admin Painel</span>}
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
      <main className={`transition-all duration-300 ${sidebarAberta ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
