'use client'

import { useState, useEffect } from 'react'
import CreateVenueModal from './venues/create-venue-modal'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
    Users,
    Store,
    BarChart2,
    DollarSign,
    AlertCircle,
    Plus,
    Search
} from 'lucide-react'

type DashboardStats = {
    totalUsers: number
    totalVenues: number
    totalRequests: number
    totalRevenue: number
    recentUsers: any[]
    recentVenues: any[]
    pendingVenues: any[]
}

export default function AdminDashboard({ profile }: { profile: any }) {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalVenues: 0,
        totalRequests: 0,
        totalRevenue: 0,
        recentUsers: [],
        recentVenues: [],
        pendingVenues: []
    })
    const [loading, setLoading] = useState(true)
    const [showCreateVenue, setShowCreateVenue] = useState(false)

    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        try {
            // Run all queries in parallel for better performance
            const [
                usersResponse,
                venuesResponse,
                recentUsersResponse,
                recentVenuesResponse,
                requestsResponse
            ] = await Promise.all([
                // Total users (excluding store accounts)
                supabase
                    .from('profiles')
                    .select('*', { count: 'exact' })
                    .eq('role', 'user'),
    
                // Total venues
                supabase
                    .from('venues')
                    .select('*', { count: 'exact' }),
    
                // Recent users
                supabase
                    .from('profiles')
                    .select(`
                        id,
                        first_name,
                        last_name,
                        email,
                        role,
                        profile_image_url,
                        created_at
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5),
    
                // Recent venues with store owner details
                supabase
                    .from('venues')
                    .select(`
                        id,
                        name,
                        type,
                        location,
                        status,
                        image_url,
                        created_at
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5),
    
                // Completed requests for revenue calculation
                supabase
                    .from('requests')
                    .select('price_offer')
                    .eq('status', 'completed')
            ]);
    
            setStats({
                totalUsers: usersResponse.count || 0,
                totalVenues: venuesResponse.count || 0,
                totalRequests: requestsResponse.data?.length || 0,
                totalRevenue: requestsResponse.data?.reduce((sum, req) => sum + (Number(req.price_offer) || 0), 0) || 0,
                recentUsers: recentUsersResponse.data || [],
                recentVenues: recentVenuesResponse.data || [],
                pendingVenues: recentVenuesResponse.data?.filter(v => v.status === 'pending') || []
            });
    
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-full dark:text-white">Loading...</div>
    }

    return (
        <div className="space-y-6 mt-12 dark:text-white">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl text-black dark:text-white font-bold mb-2">
                            Admin Dashboard
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Overview of your system's performance and management tools
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateVenue(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Venue
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                        <div>
                            <h3 className="text-lg text-black dark:text-white font-semibold">Total Users</h3>
                            <p className="text-3xl text-black dark:text-gray-100 font-bold">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <Store className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                        <div>
                            <h3 className="text-lg text-black dark:text-white font-semibold">Active Venues</h3>
                            <p className="text-3xl text-black dark:text-gray-100 font-bold">{stats.totalVenues}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <BarChart2 className="h-8 w-8 text-green-500 dark:text-green-400" />
                        <div>
                            <h3 className="text-lg text-black dark:text-white font-semibold">Total Requests</h3>
                            <p className="text-3xl text-black dark:text-gray-100 font-bold">{stats.totalRequests}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <DollarSign className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                        <div>
                            <h3 className="text-lg text-black dark:text-white font-semibold">Total Revenue</h3>
                            <p className="text-3xl text-black dark:text-gray-100 font-bold">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity and Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg text-black dark:text-white font-semibold">Recent Users</h3>

                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {stats.recentUsers.map((user) => (
                            <div key={user.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-black dark:text-white">{user.first_name} {user.last_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                        user.role === 'store' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Venues */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg text-black dark:text-white font-semibold">Recent Venues</h3>

                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {stats.recentVenues.map((venue) => (
                            <div key={venue.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-black dark:text-white">{venue.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{venue.location}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${venue.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`}>
                                    {venue.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {stats.pendingVenues.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-600" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                                Attention Required
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                {stats.pendingVenues.length} new venue{stats.pendingVenues.length === 1 ? '' : 's'} pending approval
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {showCreateVenue && (
                <CreateVenueModal
                    isOpen={showCreateVenue}
                    onClose={() => setShowCreateVenue(false)}
                    onSuccess={async () => {
                        await fetchDashboardData()
                        setShowCreateVenue(false)
                    }}
                />
            )}
        </div>
    )
}