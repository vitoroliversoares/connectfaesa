'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendConnectionRequestAction(receiverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Verificar se já existe conexão entre os dois
  const { data: existingConnection, error: checkError } = await supabase
    .from('connections')
    .select('id, status, sender_id')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .maybeSingle()

  if (checkError) {
    return { error: checkError.message }
  }

  if (existingConnection) {
    return { error: 'Já existe uma solicitação ou conexão ativa.' }
  }

  // Criar nova conexão com status 'pending'
  const { error } = await supabase
    .from('connections')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function acceptConnectionRequestAction(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Atualizar para 'accepted' (o RLS já garante que apenas o receiver_id pode fazer update)
  const { error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .eq('receiver_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function declineConnectionRequestAction(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Atualizar para 'declined'
  const { error } = await supabase
    .from('connections')
    .update({ status: 'declined' })
    .eq('id', connectionId)
    .eq('receiver_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelConnectionRequestAction(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Excluir a linha da conexão (remetente cancela ou destinatário exclui)
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getConnectionsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Buscar todas as conexões do usuário logado
  const { data, error } = await supabase
    .from('connections')
    .select(`
      id,
      sender_id,
      receiver_id,
      status,
      created_at,
      sender:profiles!connections_sender_id_fkey(id, full_name, course, shift, main_goal, top_skills),
      receiver:profiles!connections_receiver_id_fkey(id, full_name, course, shift, main_goal, top_skills)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  if (error) {
    console.error('Erro ao buscar conexões:', error)
    return []
  }

  return data || []
}
