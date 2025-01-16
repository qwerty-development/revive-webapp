// app/home-client.tsx (Client Component)

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { Session } from '@supabase/auth-helpers-nextjs' // or your session type

type Profile = {
  id: string
  first_name: string
  role: string
}

type HomeClientProps = {
  profile: Profile | null
  session: Session
}

export default function HomeClient({ profile, session }: HomeClientProps) {
  const router = useRouter()

  // This signOut logic runs on the client side
  const handleSignOut = async () => {
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()

      await supabase.auth.signOut()

      // Use window.location for a complete refresh
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Error signing out:', error)
      router.push('/auth/login')
      router.refresh()
    }
  }

  function getRoleColor(role?: string) {
    // Provide a default if role is not defined
    if (!role) {
      // return a default color or ''
      return 'text-blue-600 dark:text-blue-400'
    }
  
    switch (role) {
      case 'admin':
        return 'text-red-600 dark:text-red-400'
      case 'store':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }
  

  return (
    <div className="flex bg-gray-50 dark:bg-black min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Revive
        </h1>

        <div className="space-y-2">
          <p className="text-2xl text-gray-600 dark:text-gray-300">
            Hello, <span className="font-semibold">{profile?.first_name}</span>!
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            You are signed in as a{' '}
            <span className={`font-medium ${getRoleColor(profile?.role)}`}>
              {profile?.role}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Your one-stop service marketplace
        </p>
      </div>
    </div>
  )
}
