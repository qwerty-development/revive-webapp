// app/page.tsx (Server Component)

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import HomeClient from './home-client'  // <-- We'll create this next

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is no session, redirect immediately
  if (!session) {
    redirect('/auth/login')
  }

  // Fetch user profile to get role and name
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Provide profile and session data to the client component
  return (
    <HomeClient
      profile={profile}
      session={session}
    />
  )
}
