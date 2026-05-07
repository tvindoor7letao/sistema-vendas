'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLojistas: 0,
    lojistasAtivos: 0,
    lojistasPendentes: 0
  })

  useEffect(() => {
    carregarStats()
  }, [])

  const carregarStats = async () => {
    const { data: lojistas } = await supabase.from('lojistas').select('status')
    
    if (lojistas) {
      setStats({
        totalLojistas: lojistas.length,
        lojistasAtivos: lojistas.filter(l => l.status === 'ativo').length,
        lojistasPendentes: lojistas.filter(l => l.status === 'pendente').length
      })
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-tight">Controle de Vendas - Admin</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Gestão Global da Plataforma</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base de Dados</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">{stats.totalLojistas}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Total de Lojistas</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operação</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">{stats.lojistasAtivos}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Lojistas Ativos</p>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aguardando</span>
          </div>
          <div className="text-4xl font-black text-[#1e3a5f]">{stats.lojistasPendentes}</div>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Cadastros Pendentes</p>
        </div>
      </div>
      
      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-[#1e3a5f] mb-6 uppercase tracking-tight">Gestão Estratégica</h2>
        <p className="text-gray-500 leading-relaxed max-w-2xl mb-8 font-medium">
          Bem-vindo ao centro de controle da plataforma. Utilize o menu lateral para gerenciar os lojistas, aprovar novos cadastros e configurar os parâmetros globais do sistema.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/lojistas" className="btn-primary flex items-center gap-2 py-4 px-8 rounded-2xl shadow-xl shadow-blue-100">
            <span>👥</span> Gerenciar Lojistas
          </Link>
          <Link href="/admin/lojistas/novo" className="btn-secondary flex items-center gap-2 py-4 px-8 rounded-2xl">
            <span>➕</span> Criar Lojista Manual
          </Link>
        </div>
      </div>
    </div>
  )
}
