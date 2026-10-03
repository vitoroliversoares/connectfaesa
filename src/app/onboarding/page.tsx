import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/profile/ProfileEditor'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  if (profile?.full_name) redirect('/dashboard')
  return <ProfileEditor mode="onboarding" email={user.email ?? ''} />
}
