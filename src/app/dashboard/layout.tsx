import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <DashboardHeader userRole={profile?.role} userProfile={profile} />
      <div className="flex h-[calc(100vh-4rem)]">
        <DashboardSidebar userRole={profile?.role || 'user'} />
        <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-800 dark:text-white">
          {children}
        </main>
      </div>
    </div>
  )
}