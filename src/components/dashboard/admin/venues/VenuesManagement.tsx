'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Edit2, Eye, EyeOff, MapPin, Store, Trash2, User } from 'lucide-react'
import EditVenueModal from './edit-venue-modal'
import DeleteVenueModal from './delete-venue-modal'

type Venue = {
  id: string
  name: string
  type: string
  location: string
  description: string
  status: string
  image_url: string | null
  profiles: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    profile_image_url: string | null
  }
}

type Props = {
  initialVenues: Venue[]
}

export default function VenuesManagement({ initialVenues }: Props) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClientComponentClient()

  const handleStatusToggle = async (venue: Venue) => {
    try {
      setIsLoading(true)
      const newStatus = venue.status === 'active' ? 'hidden' : 'active'
      
      const { error } = await supabase
        .from('venues')
        .update({ status: newStatus })
        .eq('id', venue.id)

      if (error) throw error

      setVenues(venues.map(v => 
        v.id === venue.id ? { ...v, status: newStatus } : v
      ))
    } catch (error) {
      console.error('Error updating venue status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSuccess = (updatedVenue: Venue) => {
    setVenues(venues.map(v => 
      v.id === updatedVenue.id ? updatedVenue : v
    ))
    setIsEditModalOpen(false)
  }

  const handleDeleteSuccess = (deletedVenueId: string) => {
    setVenues(venues.filter(v => v.id !== deletedVenueId))
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="sm:p-6 mt-20 dark:text-white">
    <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Venues</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage all venues in the system</p>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            {/* Image Container with consistent aspect ratio */}
            <div className="relative w-full pt-[66.67%]"> {/* 2:3 aspect ratio */}
              {venue.image_url ? (
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Store className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              
              {/* Action buttons with better positioning and hover states */}
                <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                        onClick={() => {
                            setSelectedVenue(venue)
                            setIsEditModalOpen(true)
                        }}
                        className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/10 transition-colors duration-200 group"
                    >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </button>
                    <button
                        onClick={() => handleStatusToggle(venue)}
                        disabled={isLoading}
                           className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/10 transition-colors duration-200 group"
                    >
                        {venue.status === 'active' ? (
                            <Eye className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setSelectedVenue(venue)
                            setIsDeleteModalOpen(true)
                        }}
                           className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/10 transition-colors duration-200 group"
                    >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    </button>
                </div>

                {/* Status badge */}
                <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        venue.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                        {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Venue Information */}
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{venue.name}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {venue.location}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{venue.description}</p>
              </div>

              {/* Manager Information */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    {venue.profiles.profile_image_url ? (
                        <img
                            src={venue.profiles.profile_image_url}
                            alt={`${venue.profiles.first_name} ${venue.profiles.last_name}`}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {venue.profiles?.first_name} {venue.profiles?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{venue.profiles?.email}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {venues.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No venues found</h3>
          <p className="text-gray-500 dark:text-gray-400">Get started by adding a new venue.</p>
        </div>
      )}


      {selectedVenue && (
        <>
          <EditVenueModal
            isOpen={isEditModalOpen}
            venue={selectedVenue}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedVenue(null)
            }}
            onSuccess={handleEditSuccess}
          />
          <DeleteVenueModal
            isOpen={isDeleteModalOpen}
            venue={selectedVenue}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedVenue(null)
            }}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  )
}