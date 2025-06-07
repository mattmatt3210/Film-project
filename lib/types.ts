export interface Movie {
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

export interface User {
  type: "staff" | "customer"
  username?: string
  wallet?: boolean
}

export interface RentalTransaction {
  movieId: string
  userId: string
  transactionId: string
  price: number
  timestamp: Date
}
