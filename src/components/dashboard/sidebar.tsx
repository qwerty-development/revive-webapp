'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  Users,
  Store,
  Calendar,
  Settings,
  BarChart2,
  ClipboardList,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: <HomeIcon className="w-5 h-5" />,
    roles: ['user', 'admin', 'store']
  },
  {
    title: 'My Requests',
    href: '/dashboard/user/requests',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['user']
  },
  {
    title: 'Manage Requests',
    href: '/dashboard/store/manage-requests',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['store']
  },
  {
    title: 'My Venue',
    href: '/dashboard/store/my-venue',
    icon: <Store className="w-5 h-5" />,
    roles: ['store']
  },
  {
    title: 'Manage Venues',
    href: '/dashboard/admin/manage-venues',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: <BarChart2 className="w-5 h-5" />,
    roles: ['admin']
  },
  {
    title: 'Analytics',
    href: '/dashboard/store/analytics',
    icon: <BarChart2 className="w-5 h-5" />,
    roles: [ 'store']
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['user', 'admin', 'store']
  }
]

export default function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  

  return (
    <>
      {/* Mobile Menu Button */}
       <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden  fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg dark:bg-blue-700"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
       <div
        className={cn(
          "fixed lg:static border-r border-gray-900 inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 h-screen transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen
          }
        )}
      >
        <div className="h-full overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              if (!item.roles.includes(userRole)) return null

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors dark:text-gray-300",
                    pathname === item.href 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-400" 
                      : "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}