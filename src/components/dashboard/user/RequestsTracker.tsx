// components/dashboard/user/RequestsTracker.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  FileText,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Request = {
  id: string
  venue_id: string
  status: string
  pax: number
  arrival_time: string
  price_offer: number
  notes: string
  created_at: string
  venue: {
    name: string
    image_url: string | null
    location: string
    type: string
  }
}

type FilterOptions = {
  status: string[]
  timeRange: 'all' | 'today' | 'week' | 'month'
  sortBy: 'newest' | 'oldest' | 'price-high' | 'price-low' | 'date-near' | 'date-far'
}

// Add to your state declarations


interface RequestsTrackerProps {
  initialRequests: Request[]
  userId: string
}

export default function RequestsTracker({ initialRequests, userId }: RequestsTrackerProps) {
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState<{[key: string]: string}>({})
  const [searchTerm, setSearchTerm] = useState('')

  const [filters, setFilters] = useState<FilterOptions>({
    status: ['pending', 'approved', 'canceled'],
    timeRange: 'all',
    sortBy: 'newest'
  })
  
  const supabase = createClientComponentClient()

  // Update elapsed time every minute
  useEffect(() => {
    const updateElapsedTime = () => {
      const newTimeElapsed: {[key: string]: string} = {}
      requests.forEach(request => {
        newTimeElapsed[request.id] = formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
      })
      setTimeElapsed(newTimeElapsed)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [requests])

  // Subscribe to request updates
  useEffect(() => {
    const channel = supabase
      .channel('requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `user_id=eq.${userId}`
      }, payload => {
        if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(req => 
            req.id === payload.new.id ? { ...req, ...payload.new } : req
          ))
        } else if (payload.eventType === 'DELETE') {
          setRequests(prev => prev.filter(req => req.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])



  // components/dashboard/user/RequestFilters.tsx
function RequestFilters({ 
    filters, 
    setFilters, 
    searchTerm, 
    setSearchTerm 
  }: {
    filters: FilterOptions
    setFilters: (filters: FilterOptions) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
  }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
  
        <div className="flex flex-wrap gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'canceled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilters({
                    ...filters,
                    status: filters.status.includes(status)
                      ? filters.status.filter(s => s !== status)
                      : [...filters.status, status]
                  })
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.status.includes(status)
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
  
          {/* Time Range Filter */}
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as FilterOptions['timeRange'] })}
            className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
  
          {/* Sort Options */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
            className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Highest Price</option>
            <option value="price-low">Lowest Price</option>
            <option value="date-near">Nearest Date</option>
            <option value="date-far">Furthest Date</option>
          </select>
        </div>
      </div>
    )
  }
  
  // components/dashboard/user/modals/DeleteRequestModal.tsx
  function DeleteRequestModal({ 
    isOpen, 
    onClose, 
    request, 
    onDelete,
    isLoading 
  }: {
    isOpen: boolean
    onClose: () => void
    request: Request
    onDelete: () => void
    isLoading: boolean
  }) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Delete Request
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete your request for {request.venue.name}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // components/dashboard/user/modals/EditRequestModal.tsx
  function EditRequestModal({
    isOpen,
    onClose,
    request,
    onSave,
    isLoading
  }: {
    isOpen: boolean
    onClose: () => void
    request: Request
    onSave: (updatedRequest: Partial<Request>) => void
    isLoading: boolean
  }) {
    const [formData, setFormData] = useState({
      pax: request.pax,
      arrival_time: new Date(request.arrival_time).toISOString().slice(0, 16),
      price_offer: request.price_offer,
      notes: request.notes || ''
    })
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave(formData)
    }
  
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
          <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Edit Request
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of People
              </label>
              <input
                type="number"
                min="1"
                value={formData.pax}
                onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Offer
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_offer}
                onChange={(e) => setFormData({ ...formData, price_offer: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
  
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
  
      if (error) throw error
  
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ))
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEdit = async (updatedData: Partial<Request>) => {
    if (!selectedRequest) return
  
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)
  
      if (error) throw error
  
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id ? { ...req, ...updatedData } : req
      ))
      setIsEditModalOpen(false)
      setSelectedRequest(null)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!selectedRequest) return
  
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', selectedRequest.id)
  
      if (error) throw error
  
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id))
      setIsDeleteModalOpen(false)
      setSelectedRequest(null)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Add filtering logic
  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter(request => {
        // Status filter
        if (!filters.status.includes(request.status)) return false
  
        // Time range filter
        const requestDate = new Date(request.created_at)
        const now = new Date()
        switch (filters.timeRange) {
          case 'today':
            return requestDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7))
            return requestDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
            return requestDate >= monthAgo
          default:
            return true
        }
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case 'price-high':
            return b.price_offer - a.price_offer
          case 'price-low':
            return a.price_offer - b.price_offer
          case 'date-near':
            return new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime()
          case 'date-far':
            return new Date(b.arrival_time).getTime() - new Date(a.arrival_time).getTime()
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
  }, [requests, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6 mt-20">
      {/* Filters */}
      <RequestFilters 
        filters={filters}
        setFilters={setFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          My Requests
        </h1>

        {filteredAndSortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {requests.length === 0 
                ? "You haven't made any requests yet."
                : "No requests match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedRequests.map((request) => (
              <div 
                key={request.id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Venue Image */}
                  <div className="w-full md:w-48 h-48 md:h-auto relative">
                    <img
                      src={request.venue.image_url || '/placeholder.jpg'}
                      alt={request.venue.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 md:hidden">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.venue.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {request.venue.location}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(request.arrival_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
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

                    {request.notes && (
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {request.notes}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted {timeElapsed[request.id]}
                      </span>

                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsEditModalOpen(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsDeleteModalOpen(true)
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'canceled')}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <EditRequestModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
            onSave={handleEdit}
            isLoading={isLoading}
          />

          <DeleteRequestModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

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