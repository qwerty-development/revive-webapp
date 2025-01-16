// components/ui/notifications.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
}

interface NotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export const Notifications = ({ notifications, onDismiss }: NotificationsProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-center gap-3 rounded-lg p-4 shadow-lg transition-all',
            {
              'bg-green-50 text-green-800': notification.type === 'success',
              'bg-red-50 text-red-800': notification.type === 'error',
              'bg-blue-50 text-blue-800': notification.type === 'info',
            }
          )}
        >
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5" />}
          {notification.type === 'info' && <AlertCircle className="h-5 w-5" />}
          <p className="text-sm">{notification.message}</p>
          <button
            onClick={() => onDismiss(notification.id)}
            className="ml-4 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setNotifications((prev) => [...prev, { id, type, message }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id)
    }, 5000)
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    dismissNotification
  }
}