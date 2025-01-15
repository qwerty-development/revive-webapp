// components/dashboard/store/venue-preview.tsx
'use client'

import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Globe,
  Phone,
  Menu,
  ExternalLink,
  Shirt,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'

type VenuePreviewProps = {
  venue: any // Using the same Venue type from before
}

export default function VenuePreview({ venue }: VenuePreviewProps) {
  // Function to format opening hours
  const formatOpeningHours = (hours: any) => {
    if (!hours) return 'Not specified'
    return hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Hero Section with Image */}
      <div className="relative h-64 md:h-96">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No image available</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            venue.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
          }`}>
            {venue.status === 'active' ? 'Open for Bookings' : 'Currently Closed'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {venue.name}
          </h1>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-2" />
              {venue.location}
            </span>
            {venue.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {venue.description}
          </p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Capacity */}
          {venue.capacity && (
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Capacity</h3>
                <p className="text-gray-600 dark:text-gray-300">{venue.capacity} people</p>
              </div>
            </div>
          )}

          {/* Average Price */}
          {venue.average_price && (
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Average Price</h3>
                <p className="text-gray-600 dark:text-gray-300">${venue.average_price}</p>
              </div>
            </div>
          )}

          {/* Dress Code */}
          {venue.dress_code && (
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Shirt className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dress Code</h3>
                <p className="text-gray-600 dark:text-gray-300">{venue.dress_code}</p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {venue.indoor ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-600 dark:text-gray-300">Indoor Seating</span>
            </div>
            <div className="flex items-center space-x-2">
              {venue.outdoor ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-600 dark:text-gray-300">Outdoor Seating</span>
            </div>
            <div className="flex items-center space-x-2">
              {venue.serves_food ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-600 dark:text-gray-300">Food Service</span>
            </div>
          </div>
        </div>

        {/* Contact and Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              More Information
            </h2>
            <div className="space-y-3">
              {venue.contact_number && (
                <a 
                  href={`tel:${venue.contact_number}`}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {venue.contact_number}
                </a>
              )}
              {venue.website && (
                <a 
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Website
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
              {venue.menu_url && (
                <a 
                  href={venue.menu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Menu className="w-5 h-5 mr-2" />
                  View Menu
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Opening Hours
            </h2>
            <div className="space-y-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{day}</span>
                  <span>{formatOpeningHours(venue.opening_hours?.[day.toLowerCase()])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="max-w-2xl mx-auto flex gap-4">
        <button
          onClick={() => window.open(venue.google_maps_url, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span>Take me there</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          onClick={() => {
            // Booking functionality will be added later
            console.log('Book clicked')
          }}
        >
          <Calendar className="w-5 h-5" />
          <span>Book Now</span>
        </button>
      </div>
    </div>
  </div>
        
    </div>
  )
}