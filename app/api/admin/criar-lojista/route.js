import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente com service_role — NUNCA expor no browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { nome_fantasia, email, whatsapp, cnpj, responsavel, plano, tipo } = body

    // Validação básica
    if (!nome_fantasia || !email || !whatsapp || !responsavel) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios.' },
        { status: 400 }
      )
    }

    const planosValidos = ['pro', 'enterprise']
    if (plano && !planosValidos.includes(plano)) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
    }

    // Gerar senha temporária forte
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    const senha = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    // 1. Criar usuário no Supabase Auth (server-side)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirma email automaticamente, sem necessidade de clique
      user_metadata: {
        nome_fantasia,
        whatsapp,
        responsavel,
        role: 'lojista',
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. Criar registro na tabela lojistas
    const { error: dbError } = await supabaseAdmin
      .from('lojistas')
      .insert({
        id: authData.user.id,
        nome_fantasia,
        email,
        whatsapp,
        cnpj: cnpj || null,
        responsavel,
        plano: plano || 'hobby',
        tipo: tipo || 'generico',
        status: 'ativo',
      })

    if (dbError) {
      // Rollback: remover usuário do Auth se o insert na tabela falhar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    // Retorna senha para o admin copiar e enviar ao lojista
    return NextResponse.json({
      success: true,
      senha,
      userId: authData.user.id,
    })
  } catch (err) {
    console.error('Erro ao criar lojista:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
