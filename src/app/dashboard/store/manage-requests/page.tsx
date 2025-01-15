// app/dashboard/store/manage-requests/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RequestsManager from '@/components/dashboard/store/RequestsManager'

export default async function ManageRequestsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // Get venue ID for this store owner
  const { data: venue } = await supabase
    .from('venues')
    .select('id')
    .eq('store_id', session.user.id)
    .single()

  if (!venue) {
    redirect('/dashboard')
  }

  // Get requests for this venue
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('venue_id', venue.id)
    .order('created_at', { ascending: false })

  return <RequestsManager initialRequests={requests || []} venueId={venue.id} />
}