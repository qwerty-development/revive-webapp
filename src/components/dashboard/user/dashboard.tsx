'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Star, 
  DollarSign,
  CalendarDays,
  Clock,
  ChevronDown,
  ArrowUpDown,
  Utensils,
  Users,
  Sun,
  Moon,
  Music,
  Warehouse,
  Wind,
  X
} from 'lucide-react'
import Link from 'next/link'

type Venue = {
  id: string
  name: string
  location: string
  image_url: string
  type: string
  status: string
  average_price: number | null
  serves_food: boolean
  indoor: boolean
  outdoor: boolean
  dress_code: string | null
  capacity: number | null
  features: {
    live_music: boolean
    parking: boolean
    smoking_area: boolean
    vip_area: boolean
    dance_floor: boolean
    outdoor_seating: boolean
  }
}

type Request = {
  id: string
  venue_id: string
  status: string
  pax: number
  arrival_time: string
  price_offer: number
  created_at: string
  venue: {
    name: string
    location: string
  }
}

type Filters = {
  type: string
  priceRange: string
  features: {
    serves_food: boolean
    indoor: boolean
    outdoor: boolean
    live_music: boolean
    parking: boolean
    smoking_area: boolean
    vip_area: boolean
    dance_floor: boolean
    outdoor_seating: boolean
  }
  capacity: string
  dress_code: string
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'capacity-asc' | 'capacity-desc'

const initialFilters: Filters = {
  type: 'all',
  priceRange: 'all',
  features: {
    serves_food: false,
    indoor: false,
    outdoor: false,
    live_music: false,
    parking: false,
    smoking_area: false,
    vip_area: false,
    dance_floor: false,
    outdoor_seating: false
  },
  capacity: 'all',
  dress_code: 'all'
}

const priceRanges = {
  'all': { min: 0, max: Infinity },
  'budget': { min: 0, max: 50 },
  'moderate': { min: 51, max: 100 },
  'high-end': { min: 101, max: 200 },
  'luxury': { min: 201, max: Infinity }
}

const capacityRanges = {
  'all': { min: 0, max: Infinity },
  'small': { min: 0, max: 50 },
  'medium': { min: 51, max: 150 },
  'large': { min: 151, max: 300 },
  'xl': { min: 301, max: Infinity }
}

export default function UserDashboard({ profile }: { profile: any }) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  
  const supabase = createClientComponentClient()

  async function fetchData() {
    try {
      // Fetch requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          venue:venues(name, location)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      // Fetch venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (venuesError) throw venuesError

      setRequests(requestsData || [])
      setVenues(venuesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  

  // Fetch data function remains the same...

  const filteredVenues = useMemo(() => {
    return venues.filter(venue => {
      // Search term filter
      const matchesSearch = 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      const matchesType = filters.type === 'all' || venue.type === filters.type

      // Price range filter
      const priceRange = priceRanges[filters.priceRange as keyof typeof priceRanges]
      const matchesPrice = 
        venue.average_price === null ||
        (venue.average_price >= priceRange.min && venue.average_price <= priceRange.max)

      // Capacity range filter
      const capacityRange = capacityRanges[filters.capacity as keyof typeof capacityRanges]
      const matchesCapacity = 
        venue.capacity === null ||
        (venue.capacity >= capacityRange.min && venue.capacity <= capacityRange.max)

      // Features filters
      const matchesFeatures = Object.entries(filters.features).every(([feature, isSelected]) => {
        if (!isSelected) return true
        switch (feature) {
          case 'serves_food':
            return venue.serves_food
          case 'indoor':
            return venue.indoor
          case 'outdoor':
            return venue.outdoor
          default:
            return venue.features?.[feature as keyof typeof venue.features] || false
        }
      })

      // Dress code filter
      const matchesDressCode = filters.dress_code === 'all' || venue.dress_code === filters.dress_code

      return matchesSearch && matchesType && matchesPrice && 
             matchesCapacity && matchesFeatures && matchesDressCode
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.average_price || 0) - (b.average_price || 0)
        case 'price-desc':
          return (b.average_price || 0) - (a.average_price || 0)
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'capacity-asc':
          return (a.capacity || 0) - (b.capacity || 0)
        case 'capacity-desc':
          return (b.capacity || 0) - (a.capacity || 0)
        default:
          return 0
      }
    })
  }, [venues, searchTerm, filters, sortBy])


return (
  <div className="space-y-8 mt-20">
    {/* Analytics Section remains the same */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile.first_name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover and book the perfect venue for your next experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Total Requests</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">{requests.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold">Pending</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Completed</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>

    {/* Search, Sort, and Filters */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Search and Main Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search venues by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Filters
          {Object.values(filters.features).some(Boolean) || 
           filters.type !== 'all' || 
           filters.priceRange !== 'all' || 
           filters.capacity !== 'all' || 
           filters.dress_code !== 'all' && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-full text-xs">
              Active
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 border dark:border-gray-600 rounded-lg appearance-none bg-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="capacity-asc">Capacity: Low to High</option>
          <option value="capacity-desc">Capacity: High to Low</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-6">
          {/* Filter Header with Clear Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium dark:text-white">Filters</h3>
            <button
              onClick={() => setFilters(initialFilters)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="restaurant">Restaurant</option>
                <option value="club">Club</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget ($0-$50)</option>
                <option value="moderate">Moderate ($51-$100)</option>
                <option value="high-end">High-end ($101-$200)</option>
                <option value="luxury">Luxury ($201+)</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacity
              </label>
              <select
                value={filters.capacity}
                onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Any Capacity</option>
                <option value="small">Small (1-50)</option>
                <option value="medium">Medium (51-150)</option>
                <option value="large">Large (151-300)</option>
                <option value="xl">Extra Large (301+)</option>
              </select>
            </div>

            {/* Dress Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dress Code
              </label>
              <select
                value={filters.dress_code}
                onChange={(e) => setFilters({ ...filters, dress_code: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Any Dress Code</option>
                <option value="casual">Casual</option>
                <option value="smart_casual">Smart Casual</option>
                <option value="formal">Formal</option>
                <option value="black_tie">Black Tie</option>
              </select>
            </div>
          </div>

          {/* Features Toggles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Food Service */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.serves_food}
                  onChange={(e) => setFilters({
                    ...filters,
                    features: { ...filters.features, serves_food: e.target.checked }
                  })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  Food Service
                </span>
              </label>

              {/* Indoor Seating */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.indoor}
                  onChange={(e) => setFilters({
                    ...filters,
                    features: { ...filters.features, indoor: e.target.checked }
                  })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <Warehouse className="w-4 h-4 mr-2" />
                  Indoor Seating
                </span>
              </label>

              {/* Outdoor Seating */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.outdoor}
                  onChange={(e) => setFilters({
                    ...filters,
                    features: { ...filters.features, outdoor: e.target.checked }
                  })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  Outdoor Seating
                </span>
              </label>

              {/* Add more feature toggles similarly */}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Active Filters Display */}
    {(Object.values(filters.features).some(Boolean) || 
      filters.type !== 'all' || 
      filters.priceRange !== 'all' || 
      filters.capacity !== 'all' || 
      filters.dress_code !== 'all') && (
      <div className="flex flex-wrap gap-2">
        {/* Display active filters as tags */}
        {Object.entries(filters.features)
          .filter(([_, isActive]) => isActive)
          .map(([feature]) => (
            <span
              key={feature}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
            >
              {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              <button
                onClick={() => setFilters({
                  ...filters,
                  features: { ...filters.features, [feature]: false }
                })}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        {/* Add similar tags for other active filters */}
      </div>
    )}

    {/* Venues Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredVenues.map((venue) => (
          <Link
            key={venue.id}
            href={`/venues/${venue.id}`}
            className="block group"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={venue.image_url || '/placeholder.jpg'}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                {/* Food Available Badge */}
                {venue.serves_food && (
                  <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-800/20 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-green-800 dark:text-green-400">
                      Food Available
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {venue.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {venue.location}
                    </p>
                    {venue.average_price && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Average ${venue.average_price}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
                  </span>
                </div>
                {/* Additional venue info can go here */}
              </div>
            </div>
          </Link>
        ))}
      </div>

    {/* Empty State */}
    {filteredVenues.length === 0 && !loading && (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">
          No venues match your current filters
        </p>
      </div>
    )}
  </div>
  
)


}