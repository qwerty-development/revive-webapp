'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Bell, User } from 'lucide-react'
import { useState } from 'react'

type Profile = {
  first_name: string
  last_name: string
  role: string
}

export default function DashboardHeader({ 
  userRole, 
  userProfile 
}: { 
  userRole: string
  userProfile: Profile
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white dark:bg-gray-800 h-16 border-b dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold lg:ml-64 transition-all duration-200 dark:text-white">
          Revive
        </h1>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium hidden sm:block dark:text-white">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                <p className="px-4 py-2 text-sm text-gray-500 border-b dark:border-gray-600 dark:text-gray-300">
                  Role: {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                </p>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-300"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}