import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Buscar usuário pelo email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) throw listError
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    
    // Confirmar email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })
    
    if (updateError) throw updateError
    
    return NextResponse.json({ success: true, message: 'Email confirmado com sucesso' })
    
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
