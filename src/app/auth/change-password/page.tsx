import ChangePasswordPrompt from '@/components/auth/change-password-prompt'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ChangePasswordPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Check if user has already changed password
  const { data: profile } = await supabase
    .from('profiles')
    .select('password_changed')
    .eq('id', session.user.id)
    .single()

  if (profile?.password_changed) {
    redirect('/dashboard')
  }

  return <ChangePasswordPrompt />
}