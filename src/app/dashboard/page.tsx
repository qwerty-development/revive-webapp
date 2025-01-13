import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/dashboard/admin/dashboard'
import StoreDashboard from '@/components/dashboard/store/dashboard'
import UserDashboard from '@/components/dashboard/user/dashboard'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Determine which dashboard to show based on user role
  const getDashboardComponent = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminDashboard profile={profile} />
        
      case 'store':
        return <StoreDashboard profile={profile} />
      default:
        return <UserDashboard profile={profile} />
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {getDashboardComponent(profile.role)}
    </div>
  )
}