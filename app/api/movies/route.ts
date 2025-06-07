import { NextResponse } from "next/server"

// Add this function at the top level
function generateRandomPrice() {
  // Generate price between 0.01 and 0.09 ETH with 3 decimal places
  return Number((0.01 + Math.random() * 0.08).toFixed(3))
}

// Function to generate a random date within a specific year range
function generateRandomDate(): string {
  const year = Math.floor(Math.random() * (2017 - 1998 + 1)) + 1998; // Random year between 1998 and 2017
  const month = Math.floor(Math.random() * 12) + 1; // Random month between 1 and 12
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Generate mock movie data with random dates
const mockMovies = [
  {
    _id: "1",
    title: "The Matrix",
    poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    genre: "Sci-Fi",
    year: 1999,
    duration: 136,
    rating: 8.7,
    price: 0.05,
    description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    director: "Lana Wachowski",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    releaseDate: "1999-03-31" // Fixed date for testing
  },
  {
    _id: "2",
    title: "Inception",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    genre: "Sci-Fi",
    year: 2010,
    duration: 148,
    rating: 8.8,
    price: 0.07,
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
    releaseDate: "2010-07-16" // Fixed date for testing
  },
  {
    _id: "3",
    title: "The Dark Knight",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    genre: "Action",
    year: 2008,
    duration: 152,
    rating: 9.0,
    price: 0.06,
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    releaseDate: "2008-07-18" // Fixed date for testing
  },
  {
    _id: "4",
    title: "Pulp Fiction",
    poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    genre: "Crime",
    year: 1994,
    duration: 154,
    rating: 8.9,
    price: 0.04,
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    releaseDate: "1994-10-14" // Fixed date for testing
  },
  {
    _id: "5",
    title: "Forrest Gump",
    poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    genre: "Drama",
    year: 1994,
    duration: 142,
    rating: 8.8,
    price: 0.05,
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
    releaseDate: "1994-07-06" // Fixed date for testing
  },
  {
    _id: "6",
    title: "The Shawshank Redemption",
    poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    genre: "Drama",
    year: 1994,
    duration: 142,
    rating: 9.3,
    price: 0.06,
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    releaseDate: "1994-09-23" // Fixed date for testing
  },
  {
    _id: "7",
    title: "The Godfather",
    poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    genre: "Crime",
    year: 1972,
    duration: 175,
    rating: 9.2,
    price: 0.07,
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan"],
    releaseDate: "1972-03-24" // Fixed date for testing
  },
  {
    _id: "8",
    title: "Fight Club",
    poster: "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    genre: "Drama",
    year: 1999,
    duration: 139,
    rating: 8.8,
    price: 0.05,
    description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
    releaseDate: "1999-11-10" // Fixed date for testing
  }
];

// Update the endpoints to include both HTTPS and HTTP
const API_ENDPOINTS = {
  films: [
    "https://pcpdfilm.starsknights.com:18888/api/v2/films",
    "http://pcpdfilm.starsknights.com/api/v2/films"
  ],
  search: [
    "https://pcpdfilm.starsknights.com:18888/api/v2/ofilm",
    "http://pcpdfilm.starsknights.com/api/v2/ofilm"
  ],
  create: [
    "https://pcpdfilm.starsknights.com:18888/api/v2/film",
    "http://pcpdfilm.starsknights.com/api/v2/film"
  ]
};

// Add this at the top with other mock data
let localMovies: any[] = [...mockMovies]; // Initialize with mock movies

export async function GET(request: Request) {
  try {
    console.log("🎬 CinemaVault: Fetching movies from API...");
    const apiKey = request.headers.get("k");
    
    // Try each endpoint in sequence
    for (const endpoint of API_ENDPOINTS.films) {
      try {
        console.log(`Attempting to fetch from: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "k": apiKey || "pcpdfilm"
          },
          cache: "no-store",
          next: { revalidate: 0 }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Successfully fetched from: ${endpoint}`);
          
          // Combine API movies with local movies
          const allMovies = [
            ...data.map((movie: any) => ({
              ...movie,
              price: movie.price || generateRandomPrice()
            })),
            ...localMovies
          ];

          return NextResponse.json({
            movies: allMovies,
            meta: {
              source: "api",
              timestamp: new Date().toISOString(),
              total: allMovies.length,
              apiCount: data.length,
              localCount: localMovies.length
            },
          });
        } else {
          console.log(`🚫 HTTP ${response.status} from ${endpoint}`);
          continue;
        }
      } catch (error) {
        console.error(`❌ Error fetching from ${endpoint}:`, error);
        continue;
      }
    }

    // If all endpoints fail, return mock data
    console.log("🎭 All endpoints failed, returning mock data");
    const allMovies = [...mockMovies, ...localMovies];
    return NextResponse.json({
      movies: allMovies,
      meta: {
        source: "fallback",
        timestamp: new Date().toISOString(),
        total: allMovies.length,
        apiCount: 0,
        localCount: localMovies.length,
        error: "All API endpoints failed"
      },
    });
  } catch (error) {
    console.error("❌ Error in GET handler:", error);
    return NextResponse.json({
      movies: [...mockMovies, ...localMovies],
      meta: {
        source: "fallback",
        timestamp: new Date().toISOString(),
        total: mockMovies.length + localMovies.length,
        apiCount: 0,
        localCount: localMovies.length,
        error: error instanceof Error ? error.message : "Unknown error"
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const movieData = await request.json();
    const apiKey = request.headers.get("k");

    // Check for required API key
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Missing API key",
        message: "The 'k' header parameter is required"
      }, { status: 401 });
    }

    // Validate required fields
    const requiredFields = ['title', 'year', 'runtime', 'language', 'genre', 'director', 'poster'];
    const missingFields = requiredFields.filter(field => !movieData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        message: `The following fields are required: ${missingFields.join(', ')}`,
        details: { missingFields }
      }, { status: 400 });
    }

    // Format the request body according to the API schema
    const formattedMovieData = {
      title: movieData.title,
      year: movieData.year.toString(), // Convert to string as required
      runtime: parseInt(movieData.runtime), // Ensure it's an integer
      language: movieData.language,
      genre: movieData.genre,
      director: movieData.director,
      poster: movieData.poster,
      // Optional fields that might be present in the original data
      description: movieData.description || "",
      cast: movieData.cast || [],
      rating: movieData.rating || 0,
      price: movieData.price || generateRandomPrice()
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "k": apiKey // Add the required k header
    };

    let lastError: string | null = null;
    let lastResponse: any = null;

    // Try each endpoint in sequence
    for (const endpoint of API_ENDPOINTS.create) {
      try {
        console.log(`📝 Attempting to create movie at: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(formattedMovieData),
        });

        const responseData = await response.json().catch(() => ({}));

        if (response.ok) {
          console.log(`✅ Successfully created movie at: ${endpoint}`);
          return NextResponse.json({
            success: true,
            message: "Movie added successfully to API",
            movie: responseData,
            source: "api"
          });
        } else {
          lastError = responseData.error || `HTTP ${response.status}`;
          lastResponse = responseData;
          console.error(`🚫 HTTP ${response.status} from ${endpoint}:`, lastError);
          continue;
        }
      } catch (error: any) {
        lastError = error?.message || "Unknown error";
        console.error(`❌ Failed to create movie at ${endpoint}:`, error);
        continue;
      }
    }

    // If we get here, all API endpoints failed, save to local storage
    console.log("🎭 API endpoints failed, saving to local storage");
    
    // Generate a unique ID for the local movie
    const localMovie = {
      ...formattedMovieData,
      _id: `local_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Add to local storage
    localMovies.push(localMovie);

    return NextResponse.json({
      success: true,
      message: "Movie added successfully to local storage (API unavailable)",
      movie: localMovie,
      source: "local"
    });

  } catch (error: any) {
    console.error("❌ Error creating movie:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to add film",
      message: "Failed to add film. Please try again."
    }, { status: 500 });
  }
}
