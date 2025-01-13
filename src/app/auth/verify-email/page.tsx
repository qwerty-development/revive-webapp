import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h2>
          <div className="mt-4 text-gray-600">
            <p className="mb-4">
              We've sent you a verification link to your email address.
              Please click the link to verify your account.
            </p>
            <p className="text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/auth/resend-verification" className="text-blue-600 hover:text-blue-500">
                click here to resend
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}