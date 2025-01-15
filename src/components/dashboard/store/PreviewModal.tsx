// components/dashboard/store/PreviewModal.tsx
import { useState } from 'react'
import { DollarSign, MapPin, X } from 'lucide-react'
import VenuePreview from './venue-preview'
type PreviewModalProps = {
  venue: any
  isOpen: boolean
  onClose: () => void
}

function CardPreview({ venue }: { venue: any }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-sm">
        {/* Image */}
        <div className="relative h-48">
          {venue.image_url ? (
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No image</span>
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              venue.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
            }`}>
              {venue.status === 'active' ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
  
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {venue.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {venue.location}
          </p>
          {venue.average_price && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Average ${venue.average_price}
            </p>
          )}
  
          {/* Quick Features */}
          <div className="mt-4 flex flex-wrap gap-2">
            {venue.indoor && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400 rounded">
                Indoor
              </span>
            )}
            {venue.outdoor && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 rounded">
                Outdoor
              </span>
            )}
            {venue.serves_food && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400 rounded">
                Food Available
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

export default function PreviewModal({ venue, isOpen, onClose }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'detail'>('card')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'card'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'detail'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Detailed View
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'card' ? (
            <div className="flex justify-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <CardPreview venue={venue} />
            </div>
          ) : (
            <VenuePreview venue={venue} />
          )}
        </div>
      </div>
    </div>
  )
}