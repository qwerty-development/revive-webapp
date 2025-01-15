// components/dashboard/store/RequestsManager.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Calendar,
  Clock,
  Users,
  DollarSign,
  FileText,
  Search,
  X,
  AlertCircle,
  Filter
} from 'lucide-react'

type Request = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  pax: number
  arrival_time: string
  price_offer: number
  notes: string
  status: string
  created_at: string
}

export default function RequestsManager({ 
  initialRequests, 
  venueId 
}: { 
  initialRequests: Request[]
  venueId: string
}) {
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending'])
  
  const supabase = createClientComponentClient()

  const handleReject = async (requestId: string) => {
    setIsLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone_number.includes(searchTerm)
    
    return matchesSearch && statusFilter.includes(request.status)
  })

  return (
    <div className="space-y-6 mt-20">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
  
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(prev => 
                  prev.includes(status) 
                    ? prev.filter(s => s !== status)
                    : [...prev, status]
                )}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter.includes(status)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
  
      {/* Requests List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white rounded-lg shadow-sm">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {requests.length === 0 
                ? "You haven't received any requests yet."
                : "No requests match your current filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {request.first_name} {request.last_name}
                    </h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {request.email} • {request.phone_number}
                      </p>
                    </div>
                  </div>
  
                  {/* Status Badge */}
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
  
                {/* Request Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(request.arrival_time).toLocaleDateString()}
                    {" • "}
                    <Clock className="w-4 h-4 mx-2" />
                    {new Date(request.arrival_time).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4 mr-2" />
                    {request.pax} people
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${request.price_offer}
                  </div>
                </div>
  
                {/* Notes */}
                {request.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <FileText className="w-4 h-4 mr-2 mt-0.5" />
                      {request.notes}
                    </p>
                  </div>
                )}
  
                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={isLoading}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-lg">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <X className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}