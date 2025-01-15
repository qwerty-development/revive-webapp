'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AlertTriangle, Loader2 } from 'lucide-react'

type Venue = {
  id: string
  name: string
  profiles: {
    email: string
  }
}

type Props = {
  isOpen: boolean
  venue: Venue
  onClose: () => void
  onSuccess: (venueId: string) => void
}

export default function DeleteVenueModal({ isOpen, venue, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Delete venue images from storage
      const { data: files } = await supabase.storage
        .from('venue-images')
        .list(venue.id)

      if (files && files.length > 0) {
        await supabase.storage
          .from('venue-images')
          .remove(files.map(file => `${venue.id}/${file.name}`))
      }

      // Delete venue from database
      const { error: deleteError } = await supabase
        .from('venues')
        .delete()
        .eq('id', venue.id)

      if (deleteError) throw deleteError

      onSuccess(venue.id)
    } catch (error: any) {
      console.error('Error deleting venue:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Delete Venue
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Are you sure you want to delete {venue.name}? This action cannot be undone,
              and all associated data will be permanently removed.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/10"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Deleting...' : 'Delete Venue'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}