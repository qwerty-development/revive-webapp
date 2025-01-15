// app/dashboard/store/analytics/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StoreAnalytics from '@/components/dashboard/store/analytics/StoreAnalytics'

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // Get venue for this store
  const { data: venue } = await supabase
    .from('venues')
    .select('*')
    .eq('store_id', session.user.id)
    .single()

  if (!venue) {
    redirect('/dashboard')
  }

  // Get all requests for this venue
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('venue_id', venue.id)
    .order('created_at', { ascending: false })

  return (
    <StoreAnalytics 
      initialRequests={requests || []} 
      venue={venue}
    />
  )
}