// components/dashboard/store/venue-management.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
    Building,
    MapPin,
    Clock,
    DollarSign,
    Users,
    Globe,
    Phone,
    Image as ImageIcon,
    Utensils,
    CheckSquare,
    Upload,
    Save,
    Loader2,
    Eye
} from 'lucide-react'
import VenuePreview from './venue-preview'
import PreviewModal from './PreviewModal'

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
    google_maps_url: string | null
    average_price: number | null
    opening_hours: any
    amenities: string[]
    dress_code: string | null
    contact_number: string | null
    website: string | null
    capacity: number | null
    features: any
}

export default function VenueManagement({ initialVenue }: { initialVenue: Venue }) {
    const [venue, setVenue] = useState<Venue>(initialVenue)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(venue.image_url)
    const [previewMode, setPreviewMode] = useState<'card' | 'detail'>('card')
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

    const supabase = createClientComponentClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async () => {
        if (!imageFile) return venue.image_url

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${venue.id}.${fileExt}`
        const filePath = `${venue.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('venue-images')
            .upload(filePath, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('venue-images')
            .getPublicUrl(filePath)

        return publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Upload new image if exists
            let imageUrl = venue.image_url
            if (imageFile) {
                imageUrl = await uploadImage()
            }

            const { error } = await supabase
                .from('venues')
                .update({
                    ...venue,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', venue.id)

            if (error) throw error

            setVenue({ ...venue, image_url: imageUrl })
        } catch (error: any) {
            console.error('Error updating venue:', error)
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    function CardPreview({ venue }: { venue: any }) {
        return (
            <div className="bg-white  dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-sm">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${venue.status === 'active'
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


    return (
        <div className="space-y-6 mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Venue Management
                    </h2>
                    <button
                        onClick={() => setIsPreviewModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                        Preview
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Venue Image
                        </label>
                        <div className="relative">
                            <div className="relative border-2 border-dashed rounded-lg overflow-hidden aspect-video">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Venue preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8">
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Click or drag to upload an image
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Venue Name
                            </label>
                            <input
                                type="text"
                                value={venue.name}
                                onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                value={venue.type}
                                onChange={(e) => setVenue({ ...venue, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            >
                                <option value="restaurant">Restaurant</option>
                                <option value="club">Club</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={venue.description}
                            onChange={(e) => setVenue({ ...venue, description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Location and Maps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                value={venue.location}
                                onChange={(e) => setVenue({ ...venue, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Google Maps Link
                            </label>
                            <input
                                type="url"
                                value={venue.google_maps_url || ''}
                                onChange={(e) => setVenue({ ...venue, google_maps_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>

                    {/* Features and Amenities */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Features & Amenities
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={venue.indoor}
                                    onChange={(e) => setVenue({ ...venue, indoor: e.target.checked })}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Indoor Seating</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={venue.outdoor}
                                    onChange={(e) => setVenue({ ...venue, outdoor: e.target.checked })}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Outdoor Seating</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={venue.serves_food}
                                    onChange={(e) => setVenue({ ...venue, serves_food: e.target.checked })}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Serves Food</span>
                            </label>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Average Price
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    value={venue.average_price || ''}
                                    onChange={(e) => setVenue({ ...venue, average_price: parseFloat(e.target.value) })}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Capacity
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    value={venue.capacity || ''}
                                    onChange={(e) => setVenue({ ...venue, capacity: parseInt(e.target.value) })}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Maximum capacity"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Dress Code
                            </label>
                            <input
                                type="text"
                                value={venue.dress_code || ''}
                                onChange={(e) => setVenue({ ...venue, dress_code: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                placeholder="e.g., Smart Casual"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Menu URL
                            </label>
                            <input
                                type="url"
                                value={venue.menu_url || ''}
                                onChange={(e) => setVenue({ ...venue, menu_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    value={venue.contact_number || ''}
                                    onChange={(e) => setVenue({ ...venue, contact_number: e.target.value })}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="+1 (123) 456-7890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Website
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={venue.website || ''}
                                    onChange={(e) => setVenue({ ...venue, website: e.target.value })}
                                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Opening Hours
                        </h3>

                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="time"
                                        value={venue.opening_hours?.[day.toLowerCase()]?.open || ''}
                                        onChange={(e) => setVenue({
                                            ...venue,
                                            opening_hours: {
                                                ...venue.opening_hours,
                                                [day.toLowerCase()]: {
                                                    ...venue.opening_hours?.[day.toLowerCase()],
                                                    open: e.target.value
                                                }
                                            }
                                        })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    />
                                    <input
                                        type="time"
                                        value={venue.opening_hours?.[day.toLowerCase()]?.close || ''}
                                        onChange={(e) => setVenue({
                                            ...venue,
                                            opening_hours: {
                                                ...venue.opening_hours,
                                                [day.toLowerCase()]: {
                                                    ...venue.opening_hours?.[day.toLowerCase()],
                                                    close: e.target.value
                                                }
                                            }
                                        })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={venue.opening_hours?.[day.toLowerCase()]?.closed || false}
                                        onChange={(e) => setVenue({
                                            ...venue,
                                            opening_hours: {
                                                ...venue.opening_hours,
                                                [day.toLowerCase()]: {
                                                    ...venue.opening_hours?.[day.toLowerCase()],
                                                    closed: e.target.checked
                                                }
                                            }
                                        })}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Closed</span>
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4">
                            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview Card */}
           
            <PreviewModal
                venue={venue}
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
            />
        </div >
    )
}