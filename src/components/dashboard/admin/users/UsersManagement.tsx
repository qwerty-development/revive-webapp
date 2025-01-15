'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
    Search,
    Filter,
    User,
    Mail,
    Phone,
    Calendar,
    Loader2
} from 'lucide-react'

type UserProfile = {
    id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    role: 'admin' | 'store' | 'user'
    profile_image_url: string | null
    created_at: string
}

type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc'
type RoleFilter = 'all' | 'admin' | 'store' | 'user'

export default function UsersManagement({ initialUsers }: { initialUsers: UserProfile[] }) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('date_desc')
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const supabase = createClientComponentClient()

    // Fetch users based on filters
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
      
        try {
          let query = supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              email,
              phone_number,
              role,
              profile_image_url,
              created_at
            `);
      
          // Apply role filter
          if (roleFilter !== 'all') {
            query = query.eq('role', roleFilter);
          }
      
          // Apply search if present
          if (searchTerm) {
              const searchTermLike = `%${searchTerm}%`; // Add '%' for pattern matching
              query = query.or(
                `first_name.ilike.${searchTermLike},last_name.ilike.${searchTermLike},email.ilike.${searchTermLike},phone_number.ilike.${searchTermLike}`
              );
          }
      
          // Apply sorting
          switch (sortBy) {
            case 'name_asc':
              query = query.order('first_name', { ascending: true });
              break;
            case 'name_desc':
              query = query.order('first_name', { ascending: false });
              break;
            case 'date_asc':
              query = query.order('created_at', { ascending: true });
              break;
            case 'date_desc':
              query = query.order('created_at', { ascending: false });
              break;
          }
      
          const { data, error: queryError } = await query;
      
          if (queryError) throw queryError;
      
          setUsers(data || []);
        } catch (error: any) {
          console.error('Error fetching users:', error);
          setError('Failed to fetch users. Please try again.');
        } finally {
          setIsLoading(false);
        }
    };

    // Fetch users when filters change
    useEffect(() => {
        fetchUsers()
    }, [searchTerm, sortBy, roleFilter])

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            case 'store':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }
    }

    const handleEditSuccess = (updatedUser: UserProfile) => {
        setUsers(users.map(user =>
            user.id === updatedUser.id ? updatedUser : user
        ))
        setIsEditModalOpen(false)
        setSelectedUser(null)
    }

    const handleDeleteSuccess = (deletedUserId: string) => {
        setUsers(users.filter(user => user.id !== deletedUserId))
        setIsDeleteModalOpen(false)
        setSelectedUser(null)
    }

    return (
        <div className="sm:p-6 mt-20 dark:text-white">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage all users in the system</p>
            </div>

            {/* Search, Sort, and Filter Controls */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="store">Stores</option>
                            <option value="admin">Admins</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    </div>

                    {/* Sort Options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                         className="pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                    >
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Found {users.length} users
                    {roleFilter !== 'all' && ` with role: ${roleFilter}`}
                    {searchTerm && ` matching: "${searchTerm}"`}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
            )}

            {/* Users List */}
            {!isLoading && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <div className="grid gap-4 sm:gap-6  sm:p-6">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white dark:bg-gray-900 border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    {/* User Avatar */}
                                    <div className="flex-shrink-0">
                                        {user.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url}
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                                {user.first_name} {user.last_name}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                                <div className="relative group">
                                                    <button
                                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/10"
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                    {selectedUser?.id === user.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => setIsEditModalOpen(true)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/10 flex items-center"
                                                                >
                                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                                    Edit User
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete User
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {user.email}
                                            </div>
                                            {user.phone_number && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    {user.phone_number}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Joined {new Date(user.created_at).toLocaleDateString()}
                                        </div>


                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {users.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No users found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-300">
                                Try adjusting your search terms or filters
                            </p>
                        </div>
                    )}
                </div>
            )}
            {/* Modals */}
            {selectedUser && (
                <>
                    <EditUserModal
                        user={selectedUser}
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedUser(null)
                        }}
                        onSuccess={handleEditSuccess}
                    />
                    <DeleteUserModal
                        userId={selectedUser.id}
                        userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                        isOpen={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false)
                            setSelectedUser(null)
                        }}
                        onSuccess={handleDeleteSuccess}
                    />
                </>
            )}
        </div>

    )

}