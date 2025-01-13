import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function RequestSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Request Submitted!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your request has been successfully submitted. The venue will review your request and respond shortly.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/venues"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Venues
          </Link>
        </div>
      </div>
    </div>
  )
}