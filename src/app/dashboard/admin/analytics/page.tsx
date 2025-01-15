// app/dashboard/admin/analytics/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminAnalytics from '@/components/dashboard/admin/Analytics'

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  // Fetch initial data for analytics
  const [
    { data: venues },
    { data: requests },
    { data: users }
  ]:any = await Promise.all([
    supabase.from('venues').select('*'),
    supabase.from('requests').select('*'),
    supabase.from('profiles').select('*')
  ])

  return <AdminAnalytics initialData={{ venues, requests, users }} />
}