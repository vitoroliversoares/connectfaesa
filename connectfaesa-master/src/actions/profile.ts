'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { onboardingSchema } from '@/lib/validations/onboarding'

export async function updateProfileAction(profileData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Validar e sanitizar dados no Backend para mitigar Mass Assignment
  const validationResult = onboardingSchema.partial().safeParse(profileData)
  
  if (!validationResult.success) {
    return { error: 'Formato de dados do perfil inválido.' }
  }

  const validatedData = validationResult.data

  const { error } = await supabase
    .from('profiles')
    .update(validatedData)
    .eq('id', user.id)

  if (error) {
    return { error: 'Erro ao salvar no banco de dados. Tente novamente mais tarde.' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  return { success: true }
}
