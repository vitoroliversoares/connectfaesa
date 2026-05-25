import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user?.email) {
      // Regra Crítica de Negócio: Validar domínio de e-mail da FAESA
      if (user.email.endsWith('@aluno.faesa.br') || user.email.endsWith('@faesa.br')) {
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        // E-mail inválido: forçar logout e redirecionar com erro
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=invalid_domain', request.url))
      }
    }
  }

  // Falha genérica
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
