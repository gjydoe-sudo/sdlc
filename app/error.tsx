'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-red-200 dark:text-red-900">500</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Something went wrong</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
      >
        Try again
      </button>
    </div>
  )
}
