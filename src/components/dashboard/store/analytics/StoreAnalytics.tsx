// components/dashboard/store/analytics/StoreAnalytics.tsx
'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  Filter
} from 'lucide-react'

type Request = {
  id: string
  status: string
  pax: number
  price_offer: number
  arrival_time: string
  created_at: string
}

type Venue = {
  id: string
  name: string
  capacity: number
}

type TimeRange = 'week' | 'month' | 'year'

export default function StoreAnalytics({
  initialRequests,
  venue
}: {
  initialRequests: Request[]
  venue: Venue
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [requests] = useState<Request[]>(initialRequests)

  // Calculate key metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const timeRanges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    const filteredRequests = requests.filter(request => 
      new Date(request.created_at) > timeRanges[timeRange]
    )

    const completedRequests = filteredRequests.filter(r => r.status === 'completed')
    
    return {
      totalRequests: filteredRequests.length,
      completedRequests: completedRequests.length,
      totalRevenue: completedRequests.reduce((sum, r) => sum + r.price_offer, 0),
      averageOccupancy: completedRequests.reduce((sum, r) => sum + r.pax, 0) / 
        (completedRequests.length || 1) / venue.capacity * 100,
      conversionRate: (completedRequests.length / filteredRequests.length) * 100 || 0
    }
  }, [requests, timeRange, venue.capacity])

  // Prepare chart data
  const revenueData = useMemo(() => {
    const groupedData = requests.reduce((acc: any, request) => {
      const date = new Date(request.created_at)
      const key = timeRange === 'week' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : timeRange === 'month'
        ? date.toLocaleDateString('en-US', { day: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short' })

      if (!acc[key]) {
        acc[key] = {
          date: key,
          revenue: 0,
          requests: 0,
          occupancy: 0
        }
      }

      if (request.status === 'completed') {
        acc[key].revenue += request.price_offer
        acc[key].occupancy += (request.pax / venue.capacity * 100)
      }
      acc[key].requests += 1

      return acc
    }, {})

    return Object.values(groupedData)
  }, [requests, timeRange, venue.capacity])

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Overview
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                ${metrics.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Requests
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {metrics.totalRequests}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Average Occupancy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Occupancy
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {metrics.averageOccupancy.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {metrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Revenue Trend
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Occupancy Trends
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Request Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}