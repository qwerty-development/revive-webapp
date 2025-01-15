// app/venues/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import VenueDetails from '@/components/dashboard/user/venues/VenueDetails'

export default async function VenuePage({ params }: any) {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch venue details
  const { data: venue } = await supabase
    .from('venues')
    .select(`
      *,
      profiles:store_id (
        first_name,
        last_name,
        email,
        phone_number
      )
    `)
    .eq('id', params.id)
    .single()

  if (!venue) {
    notFound()
  }

  return <VenueDetails venue={venue} user={userProfile} />
}