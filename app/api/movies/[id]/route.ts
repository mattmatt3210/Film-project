import { NextResponse } from "next/server"

// Mock movie details for specific IDs with updated prices in 0.0x ETH format
const mockMovieDetails = {
  "1": {
    _id: "1",
    title: "The Matrix",
    poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    genre: "Sci-Fi",
    year: 1999,
    duration: 136,
    rating: 8.7,
    price: 0.049,
    description:
      "A computer programmer discovers that reality as he knows it is a simulation controlled by machines. He joins a rebellion to free humanity from the Matrix.",
    director: "The Wachowskis",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    releaseDate: "1999-03-31",
  },
  "2": {
    _id: "2",
    title: "Inception",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    genre: "Thriller",
    year: 2010,
    duration: 148,
    rating: 8.8,
    price: 0.059,
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"],
    releaseDate: "2010-07-16",
  },
  "3": {
    _id: "3",
    title: "Interstellar",
    poster:
      "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    genre: "Sci-Fi",
    year: 2014,
    duration: 169,
    rating: 8.6,
    price: 0.069,
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    releaseDate: "2014-11-07",
  },
  "4": {
    _id: "4",
    title: "The Dark Knight",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    genre: "Action",
    year: 2008,
    duration: 152,
    rating: 9.0,
    price: 0.059,
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    releaseDate: "2008-07-18",
  },
  "5": {
    _id: "5",
    title: "Pulp Fiction",
    poster:
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    genre: "Crime",
    year: 1994,
    duration: 154,
    rating: 8.9,
    price: 0.049,
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    releaseDate: "1994-10-14",
  },
  "6": {
    _id: "6",
    title: "The Godfather",
    poster:
      "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    genre: "Crime",
    year: 1972,
    duration: 175,
    rating: 9.2,
    price: 0.069,
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan", "Richard S. Castellano"],
    releaseDate: "1972-03-24",
  },
  "7": {
    _id: "7",
    title: "Forrest Gump",
    poster:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    genre: "Drama",
    year: 1994,
    duration: 142,
    rating: 8.8,
    price: 0.059,
    description:
      "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    releaseDate: "1994-07-06",
  },
  "8": {
    _id: "8",
    title: "The Shawshank Redemption",
    poster:
      "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    genre: "Drama",
    year: 1994,
    duration: 142,
    rating: 9.3,
    price: 0.069,
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    releaseDate: "1994-09-23",
  },
}

async function tryFetchMovieFromAPI(id: string) {
  const endpoints = [
    `https://pcpdfilm.starsknights.com:18888/api/v2/film/${id}`,
    `http://pcpdfilm.starsknights.com/api/v2/film/${id}`,
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`🎬 Attempting to fetch movie ${id} from: ${endpoint}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const text = await response.text()
        try {
          const movie = JSON.parse(text)
          console.log(`✅ Successfully fetched movie ${id} from: ${endpoint}`)

          // Ensure movie has a poster field and price is in 0.0x format
          const movieWithPoster = {
            ...movie,
            poster: movie.poster || movie.image || movie.thumbnail || "/placeholder.svg?height=600&width=400",
            price: movie.price > 1 ? movie.price / 100 : movie.price, // Convert to 0.0x format if needed
          }

          return { movie: movieWithPoster, source: "api" }
        } catch (parseError) {
          console.log(`🔧 Invalid JSON from ${endpoint}:`, parseError.message)
          continue
        }
      } else if (response.status === 404) {
        console.log(`📭 Movie ${id} not found at ${endpoint}`)
        continue
      } else {
        console.log(`🚫 HTTP ${response.status} from ${endpoint}`)
        continue
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log(`⏰ Request timeout for ${endpoint}`)
      } else {
        console.log(`❌ Failed to fetch from ${endpoint}: ${error.message}`)
      }
      continue
    }
  }

  return null
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`🎬 Fetching movie details for ID: ${params.id}`)

    // Try to fetch from the actual API
    const apiResult = await tryFetchMovieFromAPI(params.id)

    if (apiResult) {
      return NextResponse.json({
        ...apiResult.movie,
        meta: {
          source: "api",
          timestamp: new Date().toISOString(),
        },
      })
    }

    // If API fails, return mock data based on ID
    console.log(`🎭 API failed, using mock data for movie ${params.id}`)

    if (mockMovieDetails[params.id as keyof typeof mockMovieDetails]) {
      return NextResponse.json({
        ...mockMovieDetails[params.id as keyof typeof mockMovieDetails],
        meta: {
          source: "mock",
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Generic mock data for any other ID
    const mockMovie = {
      _id: params.id,
      title: `Sample Movie ${params.id}`,
      poster: "/placeholder.svg?height=600&width=400",
      genre: "Action",
      year: 2024,
      duration: 120,
      rating: 8.0,
      price: 0.059,
      description: "A sample movie description for demonstration purposes.",
      director: "Sample Director",
      cast: ["Actor One", "Actor Two"],
      releaseDate: "2024-01-01",
      meta: {
        source: "mock",
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(mockMovie)
  } catch (error) {
    console.error(`💥 Unexpected error fetching movie ${params.id}:`, error)

    // Return basic mock data as final fallback
    const mockMovie = {
      _id: params.id,
      title: "Sample Movie",
      poster: "/placeholder.svg?height=600&width=400",
      genre: "Action",
      year: 2024,
      duration: 120,
      rating: 8.0,
      price: 0.059,
      description: "A sample movie description for demonstration purposes.",
      director: "Sample Director",
      cast: ["Actor One", "Actor Two"],
      releaseDate: "2024-01-01",
      meta: {
        source: "fallback",
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(mockMovie)
  }
}
