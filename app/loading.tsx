export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading CinemaVault...</p>
      </div>
    </div>
  )
}
