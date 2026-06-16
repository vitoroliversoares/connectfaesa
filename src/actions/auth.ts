'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function loginAction(email: string, password: string) {
  // Validação estrita de domínio no Backend
  const emailLower = email.toLowerCase().trim()
  if (!emailLower.endsWith('@aluno.faesa.br') && !emailLower.endsWith('@faesa.br')) {
    return { error: 'Domínio de e-mail não autorizado. Use seu e-mail institucional da FAESA.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailLower, password })

  if (error) {
    return { error: error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message }
  }

  // Check if profile exists
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.user.id)
      .single()

    return { success: true, hasProfile: !!profile?.full_name }
  }

  return { success: true, hasProfile: false }
}

export async function registerAction(email: string, password: string) {
  // Validação estrita de domínio no Backend
  const emailLower = email.toLowerCase().trim()
  if (!emailLower.endsWith('@aluno.faesa.br') && !emailLower.endsWith('@faesa.br')) {
    return { error: 'Domínio de e-mail não autorizado. Use seu e-mail institucional da FAESA.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email: emailLower, password })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updatePasswordAction(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getUserNameAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  return data?.full_name ? data.full_name.split(' ')[0] : null
}

export async function getUserAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { id: user.id, email: user.email }
}
