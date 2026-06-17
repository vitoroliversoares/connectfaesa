import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar o perfil do usuário logado para usarmos na lógica de Match
  const { data: currentUserProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.full_name) {
    // Se o nome está vazio, significa que não terminou o onboarding
    redirect('/onboarding')
  }

  // Buscar conexões do usuário logado para verificar matches
  const { data: userConnections } = await supabase
    .from('connections')
    .select('id, sender_id, receiver_id, status')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  const acceptedMatchIds = new Set<string>()
  const connectionStates: Record<string, { id: string, status: string, isSender: boolean }> = {}

  if (userConnections) {
    userConnections.forEach(conn => {
      const isSender = conn.sender_id === user.id
      const otherId = isSender ? conn.receiver_id : conn.sender_id
      connectionStates[otherId] = {
        id: conn.id,
        status: conn.status,
        isSender
      }
      if (conn.status === 'accepted') {
        acceptedMatchIds.add(otherId)
      }
    })
  }

  // Buscar todos os perfis cadastrados
  const { data: allProfiles } = await supabase
    .from('student_profiles')
    .select('*')
    .neq('id', user.id)
    .not('full_name', 'is', null)

  // Filtrar perfis válidos (onboarding completo) e aplicar mascaramento de dados da LGPD
  const activeProfiles = (allProfiles || [])
    .filter(p => p.full_name && p.full_name.trim() !== '' && p.course)
    .map(p => {
      const hasMatch = acceptedMatchIds.has(p.id)
      return {
        ...p,
        whatsapp: hasMatch ? p.whatsapp : null,
        institutional_email: hasMatch ? p.institutional_email : null,
        connectionState: connectionStates[p.id] || null
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <DashboardClient 
        currentUser={currentUserProfile} 
        initialProfiles={activeProfiles} 
        initialConnections={userConnections || []}
      />
    </div>
  )
}
