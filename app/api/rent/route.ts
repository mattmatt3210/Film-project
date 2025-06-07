import { NextResponse } from "next/server"

// Mock database for rentals
let rentals: any[] = []

// Helper function to determine rental status
function getRentalStatus(endTime: string): string {
  const now = Date.now()
  const endTimeMs = new Date(endTime).getTime()
  
  if (endTimeMs < now) {
    return "expired"
  } else if (endTimeMs - now < 24 * 60 * 60 * 1000) { // Less than 24 hours
    return "ending-soon"
  }
  return "active"
}

export async function POST(request: Request) {
  try {
    const { movieId, price, transactionHash, walletAddress } = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    // Create rental record
    const endTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
    const rental = {
      id: `rental-${Date.now()}`,
      movieId,
      price,
      transactionHash,
      walletAddress,
      startTime: new Date().toISOString(),
      endTime,
      status: getRentalStatus(endTime)
    }

    // Add to rentals array
    rentals.push(rental)

    // Return success response
    return NextResponse.json({
      success: true,
      rental,
      message: "Movie rented successfully",
      rentalPeriod: "48 hours",
      expiresAt: rental.endTime
    })
  } catch (error) {
    console.error("Rental failed:", error)
    return NextResponse.json({ error: "Rental failed" }, { status: 500 })
  }
}

// Add GET endpoint to fetch rentals
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    // Update status for all rentals before returning
    rentals = rentals.map(rental => ({
      ...rental,
      status: getRentalStatus(rental.endTime)
    }))

    // Filter rentals by wallet address if provided
    const filteredRentals = walletAddress 
      ? rentals.filter(r => r.walletAddress === walletAddress)
      : rentals

    return NextResponse.json({
      success: true,
      rentals: filteredRentals
    })
  } catch (error) {
    console.error("Failed to fetch rentals:", error)
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}

// Add PUT endpoint to update rental
export async function PUT(request: Request) {
  try {
    const { id, endTime, transactionHash } = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    // Find and update the rental
    const rentalIndex = rentals.findIndex(r => r.id === id)
    if (rentalIndex === -1) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    // Update rental with new status
    rentals[rentalIndex] = {
      ...rentals[rentalIndex],
      endTime,
      transactionHash,
      status: getRentalStatus(endTime)
    }

    return NextResponse.json({
      success: true,
      rental: rentals[rentalIndex],
      message: "Rental updated successfully"
    })
  } catch (error) {
    console.error("Failed to update rental:", error)
    return NextResponse.json({ error: "Failed to update rental" }, { status: 500 })
  }
}
