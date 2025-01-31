'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp,
  Check,
  X 
} from 'lucide-react'

type Request = {
  id: string
  first_name: string
  last_name: string
  pax: number
  arrival_time: string
  price_offer: number
  status: string
  created_at: string
}

export default function StoreDashboard({ profile }: { profile: any }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRequests: 0,
    completedRequests: 0,
    averageOffer: 0
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Get venue ID for this store owner
      const { data: venueData } = await supabase
        .from('venues')
        .select('id')
        .eq('store_id', profile.id)
        .single()

      if (venueData) {
        // Fetch requests for this venue
        const { data: requestsData } = await supabase
          .from('requests')
          .select('*')
          .eq('venue_id', venueData.id)
          .order('created_at', { ascending: false })

        if (requestsData) {
          setRequests(requestsData)
          
          // Calculate stats
          const completed = requestsData.filter(r => r.status === 'completed')
          setStats({
            totalRevenue: completed.reduce((sum, r) => sum + r.price_offer, 0),
            totalRequests: requestsData.length,
            completedRequests: completed.length,
            averageOffer: requestsData.reduce((sum, r) => sum + r.price_offer, 0) / requestsData.length
          })
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestAction(requestId: string, action: 'approve' | 'reject') {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', requestId)

      if (error) throw error
      
      // Refresh requests
      fetchData()
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

    return (
    <div className="space-y-6 mt-20  dark:text-white">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">
          Welcome back, {profile.first_name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Here's an overview of your venue's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid  grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-green-500 dark:text-green-400" />
            <h3 className="text-lg font-semibold dark:text-white">Total Revenue</h3>
          </div>
          <p className="mt-2 text-3xl font-bold dark:text-gray-100">${stats.totalRevenue}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <h3 className="text-lg font-semibold dark:text-white">Total Requests</h3>
          </div>
          <p className="mt-2 text-3xl font-bold dark:text-gray-100">{stats.totalRequests}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <CalendarCheck className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            <h3 className="text-lg font-semibold dark:text-white">Completed</h3>
          </div>
          <p className="mt-2 text-3xl font-bold dark:text-gray-100">{stats.completedRequests}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            <h3 className="text-lg font-semibold dark:text-white">Average Offer</h3>
          </div>
          <p className="mt-2 text-3xl font-bold dark:text-gray-100">
            ${stats.averageOffer.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">Pending Requests</h3>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No pending requests at the moment.
            </div>
          ) : (
            requests
              .filter(request => request.status === 'pending')
              .map((request) => (
                <div key={request.id} className="p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h4 className="font-semibold dark:text-white">
                      {request.first_name} {request.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(request.arrival_time).toLocaleDateString()} • 
                      {request.pax} people • ${request.price_offer}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, 'approve')}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}