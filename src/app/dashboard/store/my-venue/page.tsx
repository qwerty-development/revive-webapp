// app/dashboard/venue/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VenueManagement from '@/components/dashboard/store/venue-management'

export default async function VenuePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const { data: venue } = await supabase
    .from('venues')
    .select('*')
    .eq('store_id', session.user.id)
    .single()

  return <VenueManagement initialVenue={venue} />
}