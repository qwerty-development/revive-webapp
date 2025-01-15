// components/dashboard/admin/Analytics.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Store,
  Calendar,
  Activity,
  Percent
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

type AnalyticsProps = {
  initialData: {
    venues: any[]
    requests: any[]
    users: any[]
  }
}

export default function AdminAnalytics({ initialData }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('year')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(initialData)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.requests || !data.venues || !data.users) return null

    const now = new Date()
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
    
    // Filter recent data
    const recentRequests = data.requests.filter(r => 
      new Date(r.created_at) >= oneMonthAgo
    )

    const totalRevenue = data.requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (Number(r.price_offer) || 0), 0)

    const revenueLastMonth = recentRequests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (Number(r.price_offer) || 0), 0)

    const avgRequestValue = totalRevenue / (data.requests.filter(r => r.status === 'completed').length || 1)

    const conversionRate = (data.requests.filter(r => r.status === 'completed').length / 
      (data.requests.length || 1)) * 100

    return {
      totalRevenue,
      revenueLastMonth,
      avgRequestValue,
      conversionRate,
      totalVenues: data.venues.length,
      activeVenues: data.venues.filter(v => v.status === 'active').length,
      totalUsers: data.users.filter(u => u.role === 'user').length,
      totalStores: data.users.filter(u => u.role === 'store').length
    }
  }, [data])

  // Prepare chart data
  const revenueByMonth = useMemo(() => {
    if (!data.requests) return []

    const grouped = data.requests.reduce((acc: any, req) => {
      const date = new Date(req.created_at)
      const month = date.toLocaleString('default', { month: 'short' })
      if (!acc[month]) acc[month] = 0
      if (req.status === 'completed') {
        acc[month] += Number(req.price_offer) || 0
      }
      return acc
    }, {})

    return Object.entries(grouped).map(([month, revenue]) => ({
      month,
      revenue
    }))
  }, [data.requests])

  const requestsByType = useMemo(() => {
    if (!data.venues || !data.requests) return []

    return data.requests.reduce((acc: any, req) => {
      const venue = data.venues.find(v => v.id === req.venue_id)
      if (venue) {
        const type = venue.type || 'other'
        if (!acc[type]) acc[type] = 0
        acc[type]++
      }
      return acc
    }, {})
  }, [data.requests, data.venues])

  return (
    <div className="space-y-6 mt-12">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="year">Last Year</option>
          <option value="month">Last Month</option>
          <option value="week">Last Week</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+{((stats?.revenueLastMonth || 0) / (stats?.totalRevenue || 1) * 100).toFixed(1)}%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        {/* More stat cards... */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0088FE" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Requests by Type */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requests by Venue Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(requestsByType).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }:any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(requestsByType).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}