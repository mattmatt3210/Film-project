"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Save, X, ImageIcon, Film, CheckCircle, Wifi, WifiOff, AlertCircle } from "lucide-react"
import Image from "next/image"

interface MovieData {
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

export default function AddFilmPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [movieData, setMovieData] = useState<MovieData>({
    title: "",
    poster: "",
    genre: "",
    year: new Date().getFullYear(),
    duration: 0,
    rating: 0,
    price: 0,
    description: "",
    director: "",
    cast: [],
    releaseDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string>("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dataSource, setDataSource] = useState<"api" | "mock" | "fallback">("mock")

  useEffect(() => {
    // Check if user is authenticated staff
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    setIsAuthenticated(true)

    // Check API connection
    const checkApiConnection = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch("/api/movies", {
          headers: {
            Authorization: `Bearer ${token}`,
            "k": "pcpdfilm",
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          console.log("API Response:", data)
          if (data.meta?.source === "api" || data.meta?.source === "mixed") {
            setDataSource("api")
            console.log("Setting dataSource to api")
          } else {
            setDataSource("mock")
            console.log("Setting dataSource to mock")
          }
        } else {
          console.log("API Response not OK:", response.status)
          setDataSource("fallback")
        }
      } catch (error) {
        console.error("API connection check failed:", error)
        setDataSource("fallback")
      }
    }
    checkApiConnection()
  }, [router])

  // Get status info based on data source
  const getStatusInfo = () => {
    switch (dataSource) {
      case "api":
        return {
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Live Mode - Connected to API",
          color: "text-green-400 border-green-400",
        }
      case "mock":
        return {
          icon: <Wifi className="h-3 w-3 mr-1" />,
          text: "Demo Mode - Using sample data",
          color: "text-yellow-400 border-yellow-400",
        }
      case "fallback":
        return {
          icon: <WifiOff className="h-3 w-3 mr-1" />,
          text: "Offline Mode - Limited functionality",
          color: "text-red-400 border-red-400",
        }
      default:
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: "Loading...",
          color: "text-gray-400 border-gray-400",
        }
    }
  }

  const statusInfo = getStatusInfo()

  const searchMovie = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch(`/api/search-movie?title=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token")
        router.push("/")
        return
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      // Ensure poster URL is properly formatted
      const posterUrl = data.poster || data.image || data.thumbnail || ""
      // Set a consistent price based on movie rating
      const basePrice = 0.049 // Base price for all movies
      const ratingMultiplier = data.rating ? (data.rating / 10) : 1 // Scale price based on rating
      const calculatedPrice = Number((basePrice * ratingMultiplier).toFixed(3))
      
      setMovieData({
        title: data.title || "",
        poster: posterUrl,
        genre: data.genre || "",
        year: data.year || new Date().getFullYear(),
        duration: data.duration || 0,
        rating: data.rating || 0,
        price: calculatedPrice,
        description: data.description || "",
        director: data.director || "",
        cast: data.cast || [],
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0]
      })
      setPosterPreview(posterUrl)
      setSuccess("Movie found! You can now edit the details before adding.")
      setError("")
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to search for movie. Please try again.")
      setSuccess("")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof MovieData, value: any) => {
    if (!movieData) return

    setMovieData({
      ...movieData,
      [field]: value,
    })

    // Update poster preview when poster URL changes
    if (field === "poster") {
      setPosterPreview(value)
    }
  }

  const handlePosterUrlChange = (url: string) => {
    handleInputChange("poster", url)
    setPosterPreview(url)
  }

  const handleCastChange = (index: number, value: string) => {
    if (!movieData) return

    const newCast = [...movieData.cast]
    newCast[index] = value
    setMovieData({
      ...movieData,
      cast: newCast,
    })
  }

  const addCastMember = () => {
    if (!movieData) return

    setMovieData({
      ...movieData,
      cast: [...movieData.cast, ""],
    })
  }

  const removeCastMember = (index: number) => {
    if (!movieData) return

    const newCast = movieData.cast.filter((_, i) => i !== index)
    setMovieData({
      ...movieData,
      cast: newCast,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const filmData = {
      title: formData.get("title"),
      poster: formData.get("poster"),
      genre: formData.get("genre"),
      year: parseInt(formData.get("year") as string),
      runtime: parseInt(formData.get("duration") as string),
      language: "English",
      director: formData.get("director"),
      description: formData.get("description"),
      cast: (formData.get("cast") as string).split(",").map(s => s.trim()),
      releaseDate: formData.get("releaseDate"),
    }

    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "k": "pcpdfilm",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(filmData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add film")
      }

      setSuccess("Add Film Success")
      setError("")
      
      localStorage.setItem("newFilmAdded", Date.now().toString())
      
      setMovieData({
        title: "",
        poster: "",
        genre: "",
        year: new Date().getFullYear(),
        duration: 0,
        rating: 0,
        price: 0,
        description: "",
        director: "",
        cast: [],
        releaseDate: new Date().toISOString().split('T')[0]
      })
      setSearchTerm("")
      setPosterPreview("")
      
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to add film. Please try again.")
      setSuccess("")
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setMovieData({
      title: "",
      poster: "",
      genre: "",
      year: new Date().getFullYear(),
      duration: 0,
      rating: 0,
      price: 0,
      description: "",
      director: "",
      cast: [],
      releaseDate: new Date().toISOString().split('T')[0]
    })
    setSearchTerm("")
    setPosterPreview("")
    setError("")
    setSuccess("")
  }

  // Add a function to handle image errors
  const handleImageError = () => {
    setPosterPreview("")
    if (movieData) {
      setMovieData({
        ...movieData,
        poster: ""
      })
    }
  }

  // Update the generateRandomPrice function
  const generateRandomPrice = () => {
    const basePrice = 0.049 // Base price for all movies
    const ratingMultiplier = movieData.rating ? (movieData.rating / 10) : 1 // Scale price based on rating
    const calculatedPrice = Number((basePrice * ratingMultiplier).toFixed(3))
    if (movieData) {
      handleInputChange("price", calculatedPrice)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400"></div>
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

        {/* Status Banner */}
        <div
          className={`${dataSource === "api" ? "bg-green-600/20 border-green-400/30" : dataSource === "mock" ? "bg-yellow-600/20 border-yellow-400/30" : "bg-red-600/20 border-red-400/30"} border-b mb-6`}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div
                className={`flex items-center ${dataSource === "api" ? "text-green-200" : dataSource === "mock" ? "text-yellow-200" : "text-red-200"}`}
              >
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-6xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-purple-400" />
              <CardTitle className="text-2xl font-bold text-white">Add New Film</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Search for a movie and edit its details before adding to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Section */}
            <div className="space-y-4 mb-6">
              <Label htmlFor="search" className="text-white">
                Search Movie
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="Enter movie title to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && searchMovie()}
                />
                <Button onClick={searchMovie} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Movie Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    value={movieData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poster" className="text-white">Poster URL</Label>
                  <Input
                    id="poster"
                    name="poster"
                    required
                    value={movieData.poster}
                    onChange={(e) => handleInputChange("poster", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white">Genre</Label>
                  <Input
                    id="genre"
                    name="genre"
                    required
                    value={movieData.genre}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-white">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    value={movieData.year || ""}
                    onChange={(e) => handleInputChange("year", e.target.value ? parseInt(e.target.value) : "")}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    required
                    min="1"
                    value={movieData.duration || ""}
                    onChange={(e) => handleInputChange("duration", e.target.value ? parseInt(e.target.value) : "")}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-white">Rating (0-10)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    required
                    min="0"
                    max="10"
                    step="0.1"
                    value={movieData.rating || ""}
                    onChange={(e) => handleInputChange("rating", e.target.value ? parseFloat(e.target.value) : "")}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">Price (ETH)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.001"
                    value={movieData.price || ""}
                    onChange={(e) => handleInputChange("price", e.target.value ? parseFloat(e.target.value) : "")}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate" className="text-white">Release Date</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    required
                    value={movieData.releaseDate}
                    onChange={(e) => handleInputChange("releaseDate", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={movieData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="director" className="text-white">Director</Label>
                <Input
                  id="director"
                  name="director"
                  required
                  value={movieData.director}
                  onChange={(e) => handleInputChange("director", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cast" className="text-white">Cast (comma-separated)</Label>
                <Input
                  id="cast"
                  name="cast"
                  required
                  value={movieData.cast.join(", ")}
                  onChange={(e) => handleInputChange("cast", e.target.value.split(",").map(s => s.trim()))}
                  placeholder="Actor 1, Actor 2, Actor 3"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-400 text-sm">{success}</div>
              )}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="text-white border-white/20 hover:bg-white/20 bg-blue-500/20 hover:bg-blue-500/30"
                >
                  Clear Form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="text-white border-white/20 hover:bg-white/20 bg-red-500/20 hover:bg-red-500/30"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Adding Film..." : "Add Film"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
