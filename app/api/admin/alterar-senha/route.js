import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { lojistaId, userId, novaSenha } = body
    
    // Aceita tanto lojistaId quanto userId
    const id = lojistaId || userId
    
    if (!id || !novaSenha || novaSenha.length < 6) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }
    
    console.log('Alterando senha para ID:', id)
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: novaSenha
    })
    
    if (error) {
      console.error('Erro Auth:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (err) {
    console.error('Erro geral:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}