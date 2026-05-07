import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Rotas públicas (Sempre permitidas)
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                        request.nextUrl.pathname.startsWith('/loja/')
  
  if (isPublicRoute) {
    return response
  }

  // 2. Páginas de Autenticação (login, cadastro)
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                     request.nextUrl.pathname === '/cadastro' ||
                     request.nextUrl.pathname === '/cadastro-gratis'

  if (isAuthPage) {
    if (user) {
      // Já está logado, redirecionar para o dashboard correto
      const { data: isAdmin } = await supabase
        .from('administradores')
        .select('id')
        .eq('id', user.id)
        .single()

      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/lojista/dashboard', request.url))
    }
    return response // Não logado acessando login -> OK
  }

  // 3. Verificar Autenticação para o restante das rotas (Protegidas)
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Verificar se é Admin
  const { data: isAdmin } = await supabase
    .from('administradores')
    .select('id')
    .eq('id', user.id)
    .single()

  // 5. Proteção de Rotas de Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/lojista/dashboard', request.url))
    }
    return response
  }

  // 6. Proteção de Rotas de Lojista
  if (request.nextUrl.pathname.startsWith('/lojista')) {
    const { data: lojista } = await supabase
      .from('lojistas')
      .select('status')
      .eq('id', user.id)
      .single()

    if (lojista?.status === 'bloqueado') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?bloqueado=true', request.url))
    }
    
    return response
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
