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
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentUserProfile?.full_name) {
    // Se o nome está vazio, significa que não terminou o onboarding
    redirect('/onboarding')
  }

  // Fetch all profiles for the feed
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .not('full_name', 'is', null)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardClient currentUser={currentUserProfile} initialProfiles={allProfiles || []} />
    </div>
  )
}
