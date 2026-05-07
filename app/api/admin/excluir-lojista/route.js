import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function DELETE(request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID não informado.' }, { status: 400 })
    }

    // 1. Deletar da tabela lojistas (e dados relacionados via cascade se configurado)
    const { error: dbError } = await supabaseAdmin
      .from('lojistas')
      .delete()
      .eq('id', id)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    // 2. Deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      // Auth deletion failed but DB already deleted — log but don't block
      console.error('Aviso: falha ao deletar usuário do Auth:', authError.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao excluir lojista:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
