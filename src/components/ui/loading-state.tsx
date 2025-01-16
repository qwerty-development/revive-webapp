// components/ui/loading-state.tsx
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  fullScreen?: boolean
  message?: string
}

export const LoadingState = ({ fullScreen, message }: LoadingStateProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}