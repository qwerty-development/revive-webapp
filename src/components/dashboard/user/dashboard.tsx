'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalendarDays, Clock, DollarSign, Search, MapPin } from 'lucide-react'
import Link from 'next/link'

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

type Venue = {
  id: string
  name: string
  location: string
  image_url: string
  type: string
}

export default function UserDashboard({ profile }: { profile: any }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

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

      // Fetch featured/recommended venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .limit(4)
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {profile.first_name}!
        </h2>
        <p className="text-gray-600">
          Explore venues or check your request status
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Total Requests</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">{requests.length}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold">Pending</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
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

      {/* Explore Venues Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Featured Venues</h3>
          <Link 
            href="/venues" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all venues
          </Link>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search venues..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {venues.map((venue) => (
            <Link 
              key={venue.id} 
              href={`/venues/${venue.id}`}
              className="block group"
            >
              <div className="bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative h-48">
                  <img
                    src={venue.image_url || '/placeholder.jpg'}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold group-hover:text-blue-600">
                    {venue.name}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {venue.location}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}


      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Requests</h3>
          <Link 
            href="/dashboard/requests" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all requests
          </Link>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No requests found. Why not explore some venues?
            </div>
          ) : (
            requests.slice(0, 5).map((request) => (
              <div key={request.id} className="p-6 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{request.venue?.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(request.arrival_time).toLocaleDateString()} • {request.pax} people
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}