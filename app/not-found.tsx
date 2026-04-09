import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
      >
        Back to Home
      </Link>
    </div>
  )
}
