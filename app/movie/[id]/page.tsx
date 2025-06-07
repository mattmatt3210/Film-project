"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Star, Clock, Calendar, User } from "lucide-react"
import Image from "next/image"

interface Movie {
  _id: string
  title: string
  poster: string
  genre: string
  year: number
  duration: number
  rating: number
  price: number
  description: string
  director: string
  cast: string[]
  releaseDate: string
}

export default function MovieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovieDetails()
  }, [params.id])

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`/api/movies/${params.id}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setMovie(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching movie details:", error)
      setMovie(null)
      setLoading(false)
    }
  }

  const handleRentMovie = async () => {
    if (!movie) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("/api/rent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ movieId: movie._id, price: movie.price }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      alert("Movie rented successfully!")
    } catch (error) {
      console.error("Rental error:", error)
      alert("Failed to rent movie. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => router.push("/")} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Movie Poster - Now smaller */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="aspect-[2/3] w-full max-w-xs mx-auto overflow-hidden rounded-lg">
                  <Image
                    src={movie.poster || "/placeholder.svg?height=600&width=400"}
                    alt={`${movie.title} movie poster`}
                    width={300}
                    height={450}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=600&width=400"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Details - Now takes more space */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl text-white mb-2">{movie.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-300">
                      <Badge variant="secondary">{movie.genre}</Badge>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {movie.year}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {movie.duration} min
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {movie.rating}/10
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {movie.price ? `${movie.price.toFixed(3)} ETH` : '0.000 ETH'}
                    </div>
                    <Button onClick={handleRentMovie} size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <Play className="mr-2 h-4 w-4" />
                      Rent Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Synopsis</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Director</h4>
                      <div className="flex items-center text-gray-300">
                        <User className="mr-2 h-4 w-4" />
                        {movie.director}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Release Date</h4>
                      <div className="flex items-center text-gray-300">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Cast</h4>
                    <div className="flex flex-wrap gap-2">
                      {movie.cast?.map((actor, index) => (
                        <Badge key={index} variant="outline" className="text-gray-300">
                          {actor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Rental Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-300">
                  <div className="flex justify-between">
                    <span>Rental Period:</span>
                    <span>48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video Quality:</span>
                    <span>4K Ultra HD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audio:</span>
                    <span>Dolby Atmos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtitles:</span>
                    <span>Multiple Languages</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>Ethereum (ETH)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
