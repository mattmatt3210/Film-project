import { NextResponse } from "next/server"

// Update the endpoints to include both HTTPS and HTTP for OMDb API
const API_ENDPOINTS = {
  search: [
    "https://pcpdfilm.starsknights.com:18888/api/v2/ofilm",
    "http://pcpdfilm.starsknights.com/api/v2/ofilm"
  ]
};

// Helper function to format OMDb response
function formatOMDbResponse(data: any, title: string) {
  // Extract cast from the response
  const cast = data.Actors ? data.Actors.split(',').map((actor: string) => actor.trim()) : [];
  
  // Convert runtime from "142 min" to number
  const duration = data.Runtime ? parseInt(data.Runtime) : 120;
  
  // Convert rating from string to number
  const rating = data.imdbRating ? parseFloat(data.imdbRating) : 0;
  
  // Convert year from string to number
  const year = data.Year ? parseInt(data.Year) : new Date().getFullYear();

  return {
    title: data.Title || title,
    poster: data.Poster || "/placeholder.svg?height=400&width=300",
    genre: data.Genre || "Unknown",
    year: year,
    duration: duration,
    rating: rating,
    description: data.Plot || "No description available",
    director: data.Director || "Unknown",
    cast: cast,
    releaseDate: data.Released || new Date().toISOString().split('T')[0],
    price: 0.059, // Default price
    meta: {
      source: "omdb",
      timestamp: new Date().toISOString(),
      imdbID: data.imdbID,
      imdbRating: data.imdbRating,
      imdbVotes: data.imdbVotes
    }
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")
  const authHeader = request.headers.get("Authorization")

  if (!title) {
    return NextResponse.json({ error: "Title parameter is required" }, { status: 400 })
  }

  if (!authHeader) {
    return NextResponse.json({ error: "Authorization token is required" }, { status: 401 })
  }

  // Encode the title for URL safety
  const encodedTitle = encodeURIComponent(title.trim())

  // Try each endpoint in sequence
  for (const endpoint of API_ENDPOINTS.search) {
    try {
      const searchUrl = `${endpoint}/${encodedTitle}`
      console.log(`🔍 Searching for "${title}" at: ${searchUrl}`)

      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "CinemaVault/1.0",
          "Authorization": authHeader
        },
        cache: "no-store",
        next: { revalidate: 0 } // Disable caching
      })

      if (response.ok) {
        const text = await response.text()
        
        // Check if response is empty
        if (!text || text.trim() === "") {
          console.log(`📭 Empty response from ${searchUrl}`)
          continue
        }

        try {
          const data = JSON.parse(text)
          console.log(`✅ Found movie "${title}" at: ${searchUrl}`)

          // Check if this is an OMDb response
          if (data.Response === "True" || data.Title) {
            const formattedData = formatOMDbResponse(data, title)
            return NextResponse.json(formattedData)
          } else if (data.Error) {
            console.log(`❌ OMDb API error: ${data.Error}`)
            continue
          } else {
            // Handle non-OMDb response format
            const movieData = {
              title: data.title || title,
              poster: data.poster || data.image || data.thumbnail || "/placeholder.svg?height=400&width=300",
              genre: data.genre || "Unknown",
              year: data.year || new Date().getFullYear(),
              duration: data.duration || 120,
              rating: data.rating || 0,
              description: data.description || "No description available",
              director: data.director || "Unknown",
              cast: Array.isArray(data.cast) ? data.cast : [],
              releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
              price: data.price || 0.059,
              meta: {
                source: "api",
                timestamp: new Date().toISOString()
              }
            }
            return NextResponse.json(movieData)
          }
        } catch (parseError) {
          console.error(`🔧 Invalid JSON from ${searchUrl}:`, parseError)
          continue
        }
      } else if (response.status === 401) {
        console.error(`🔒 Unauthorized access to ${searchUrl}`)
        return NextResponse.json({ error: "Invalid or expired authorization token" }, { status: 401 })
      } else if (response.status === 404) {
        console.log(`📭 Movie "${title}" not found at ${searchUrl}`)
        continue
      } else {
        console.error(`🚫 HTTP ${response.status} from ${searchUrl}`)
        continue
      }
    } catch (error) {
      console.error(`❌ Search failed for ${endpoint}/${encodedTitle}:`, error)
      continue
    }
  }

  // If all endpoints fail, return a mock response
  console.log(`🎭 All search endpoints failed for "${title}", returning mock data`)
  return NextResponse.json({
    title: title,
    genre: "Unknown",
    year: new Date().getFullYear(),
    duration: 120,
    rating: 0,
    description: "No description available",
    director: "Unknown",
    cast: [],
    releaseDate: new Date().toISOString().split('T')[0],
    poster: "/placeholder.svg?height=400&width=300",
    price: 0.059,
    meta: {
      source: "mock",
      timestamp: new Date().toISOString()
    }
  })
}
