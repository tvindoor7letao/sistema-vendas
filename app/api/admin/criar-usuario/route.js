import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password, metadata } = await request.json()
    
    // Criar cliente admin com service role key
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
    
    // Criar usuário (NÃO envia email)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    })
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, user: userData.user })
    
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}