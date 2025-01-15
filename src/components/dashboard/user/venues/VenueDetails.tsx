// components/venues/VenueDetails.tsx
'use client'

import { useState } from 'react'
import {
    MapPin,
    DollarSign,
    Clock,
    Phone,
    Globe,
    Mail,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Menu as MenuIcon,
    ExternalLink
} from 'lucide-react'
import BookingModal from './BookingModal'

type Venue = {
    id: string
    name: string
    type: string
    description: string
    image_url: string | null
    location: string
    status: string
    indoor: boolean
    outdoor: boolean
    serves_food: boolean
    menu_url: string | null
    google_maps_url: string
    average_price: number | null
    opening_hours: Record<string, { open: string; close: string; closed: boolean }>
    amenities: string[]
    dress_code: string | null
    contact_number: string | null
    website: string | null
    capacity: number | null
    features: {
        live_music: boolean
        parking: boolean
        smoking_area: boolean
        vip_area: boolean
        dance_floor: boolean
        outdoor_seating: boolean
    }
    profiles: {
        first_name: string
        last_name: string
        email: string
        phone_number: string
    }
}

interface VenueDetailsProps {
    venue: Venue
    user: {
        id: string
        first_name: string
        last_name: string
        email: string
        phone_number: string
    }
}


export default function VenueDetails({ venue, user }: VenueDetailsProps) {
    const [showBooking, setShowBooking] = useState(false)

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return (
        <div className="relative pb-24">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px]">
                <img
                    src={venue?.image_url || '/placeholder.jpg'}
                    alt={venue?.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-2">{venue?.name}</h1>
                        <div className="flex flex-wrap gap-4 items-center text-lg">
                            <span className="flex items-center">
                                <MapPin className="w-5 h-5 mr-1" />
                                {venue?.location}
                            </span>
                            <span className="flex items-center">
                                <Users className="w-5 h-5 mr-1" />
                                {venue?.capacity} guests
                            </span>
                            {venue?.average_price && (
                                <span className="flex items-center">
                                    <DollarSign className="w-5 h-5 mr-1" />
                                    Average ${venue?.average_price}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">About {venue?.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{venue?.description}</p>
                        </div>

                        {/* Features */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
                            {venue?.features && Object.keys(venue.features).length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(venue.features).map(([feature, available]) => (
                                        <div key={feature} className="flex items-center space-x-2">
                                            {available ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {feature
                                                    .split("_")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No features or amenities available for this venue.</p>
                            )}
                        </div>

                        {/* Opening Hours */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {days.map(day => {
                                    const hours = venue?.opening_hours?.[day.toLowerCase()]
                                    return (
                                        <div key={day} className="flex justify-between py-2">
                                            <span className="font-medium">{day}</span>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {hours?.closed ? 'Closed' : `${hours?.open} - ${hours?.close}`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Contact & Quick Info */}
                    <div className="space-y-6">
                        {/* Quick Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                {venue?.contact_number && (
                                    <a
                                        href={`tel:${venue?.contact_number}`}
                                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600"
                                    >
                                        <Phone className="w-5 h-5 mr-3" />
                                        {venue?.contact_number}
                                    </a>
                                )}
                                {venue?.website && (
                                    <a
                                        href={venue?.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600"
                                    >
                                        <Globe className="w-5 h-5 mr-3" />
                                        Website
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                )}
                                {venue?.menu_url && (
                                    <a
                                        href={venue?.menu_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600"
                                    >
                                        <MenuIcon className="w-5 h-5 mr-3" />
                                        View Menu
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Additional Info Cards */}
                        {venue?.dress_code && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-2">Dress Code</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {venue?.dress_code}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
                    <button
                        onClick={() => window.open(venue.google_maps_url, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <MapPin className="w-5 h-5" />
                        <span>Take me there</span>
                    </button>
                    <button
                        onClick={() => setShowBooking(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Book Now</span>
                    </button>
                </div>
            </div>
            {showBooking && (
                <BookingModal
                    isOpen={showBooking}
                    onClose={() => setShowBooking(false)}
                    venue={venue}
                    user={user}
                />
            )}
        </div>
    )
}