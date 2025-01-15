// components/settings/UserSettings.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react'

type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  notifications_enabled?: boolean
  email_notifications?: boolean
  push_notifications?: boolean
  profile_image_url?: string | null
}

type SuccessMessage = {
  message: string
  timestamp: number
}

export default function UserSettings({ 
  initialProfile,
  user 
}: { 
  initialProfile: Profile
  user: any
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessMessage | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess({
        message: 'Profile updated successfully',
        timestamp: Date.now()
      })
      
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess({
        message: 'Password updated successfully',
        timestamp: Date.now()
      })
      
      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notifications_enabled: profile.notifications_enabled,
          email_notifications: profile.email_notifications,
          push_notifications: profile.push_notifications
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess({
        message: 'Notification preferences updated',
        timestamp: Date.now()
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mt-20  mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notifications
            </button>
          </nav>
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <form onSubmit={handleProfileUpdate} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="pl-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Settings */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <form onSubmit={handlePasswordChange} className="space-y-6 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <form onSubmit={handleNotificationUpdate} className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notification Preferences
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notifications"
                        type="checkbox"
                        checked={profile.notifications_enabled}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          notifications_enabled: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="notifications" className="font-medium text-gray-700 dark:text-gray-300">
                        Enable All Notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications about your requests and updates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={profile.email_notifications}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          email_notifications: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications via email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="push-notifications"
                        type="checkbox"
                        checked={profile.push_notifications}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          push_notifications: e.target.checked 
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="push-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                        Push Notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive push notifications in your browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div 
          className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 p-4 rounded shadow-lg"
          key={success.timestamp}
        >
          <div className="flex">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">{success.message}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto pl-3"
            >
              <X className="h-5 w-5 text-green-400" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded shadow-lg">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <X className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}