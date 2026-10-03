'use client'

import ProfileEditor from './ProfileEditor'
import type { OnboardingData } from '@/lib/validations/onboarding'

export default function EditProfileModal({ profile, onClose, onSave }: { profile: Partial<OnboardingData>; onClose: () => void; onSave: (profile: OnboardingData) => void }) {
  return <ProfileEditor mode="edit" email={profile.institutional_email ?? ''} profile={profile} onClose={onClose} onDone={(updated) => { onSave(updated); onClose() }} />
}
