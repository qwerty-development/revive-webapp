'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { X, Copy, Check } from 'lucide-react'

type CreateVenueModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateVenueModal({ isOpen, onClose, onSuccess }: CreateVenueModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creationSuccess, setCreationSuccess] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
// Add this to your existing state
const [image, setImage] = useState<File | null>(null)
const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    venueName: '',
    location: '',
    description: '',
    type: 'restaurant',
    managerEmail: '',
    managerFirstName: '',
    managerLastName: '',
    managerPhone: ''
  })

  const supabase = createClientComponentClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const uploadImage = async (userId: string) => {
    if (!image) return null
  
    try {
      const fileExt = image.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `${userId}/${fileName}`
  
      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(filePath, image)
  
      if (uploadError) throw uploadError
  
      const { data: { publicUrl } } = supabase.storage
        .from('venue-images')
        .getPublicUrl(filePath)
  
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const generatedPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!'
      let imageUrl = null

      // 1. Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.managerEmail,
        password: generatedPassword,
        options: {
          data: {
            first_name: formData.managerFirstName,
            last_name: formData.managerLastName,
            phone_number: formData.managerPhone
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Upload image first if it exists
        if (image) {
          imageUrl = await uploadImage(authData.user.id)
        }

        // 3. Update the profile in a single operation
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: authData.user.id,  // This is important
            role: 'store',         // Explicitly set the role
            first_name: formData.managerFirstName,
            last_name: formData.managerLastName,
            phone_number: formData.managerPhone,
            profile_image_url: imageUrl,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile Error:', profileError)
          throw profileError
        }

        // 4. Create the venue after profile is updated
        const { error: venueError } = await supabase
          .from('venues')
          .insert([
            {
              name: formData.venueName,
              location: formData.location,
              description: formData.description,
              type: formData.type,
              store_id: authData.user.id,
              status: 'active',
              image_url: imageUrl
            }
          ])

        if (venueError) throw venueError

        setTempPassword(generatedPassword)
        setCreationSuccess(true)
      }
    } catch (error: any) {
      console.error('Error creating venue:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  

  const handleCopy = async () => {
    if (!tempPassword) return
    try {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleClose = () => {
    if (creationSuccess) {
      onSuccess()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {creationSuccess ? 'Venue Created Successfully' : 'Create New Venue'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {creationSuccess ? (
          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="text-green-800 font-medium mb-1">
                  Venue Manager Credentials
                </h3>
                <p className="text-sm text-green-700">
                  Please save these credentials and share them securely with the venue manager.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-800">Email</label>
                  <p className="text-sm text-green-700">{formData.managerEmail}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Temporary Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {tempPassword}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Copy password"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-6">
            <div className="space-y-4">
  <h3 className="text-lg font-medium text-gray-900">Venue Image</h3>
  <div className="flex flex-col items-center">
    <div className="w-full max-w-md relative">
      <label 
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
          ${imagePreview ? 'border-transparent' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
      >
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img
              src={imagePreview}
              alt="Venue preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <p className="text-white text-sm">Click to change image</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleImageChange}
          accept="image/*"
        />
      </label>
      {image && (
        <button
          type="button"
          onClick={() => {
            setImage(null)
            setImagePreview(null)
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
</div>
              {/* Venue Information */}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Venue Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      name="venueName"
                      value={formData.venueName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="club">Club</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Manager Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Manager Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="managerFirstName"
                      value={formData.managerFirstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="managerLastName"
                      value={formData.managerLastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="managerEmail"
                      value={formData.managerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="managerPhone"
                      value={formData.managerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Venue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}