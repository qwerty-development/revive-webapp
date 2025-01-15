// app/dashboard/requests/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RequestsTracker from '@/components/dashboard/user/RequestsTracker'

export default async function RequestsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      *,
      venue:venues (
        name,
        image_url,
        location,
        type
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return <RequestsTracker initialRequests={requests || []} userId={session.user.id} />
}