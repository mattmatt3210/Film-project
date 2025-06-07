import { NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password, type } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use a simple check
    // In a real application, you would verify against your database
    if (type === "staff") {
      if (username === "s235776767" && password === "1234567890") {
        const user = {
          id: "1",
          username: "s235776767",
          type: "staff",
          apiKey: "pcpdfilm" // Add API key for staff users
        }

        const token = generateToken(user)
        if (!token) {
          return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          token,
          user,
        })
      }
    } else if (type === "wallet") {
      // For wallet login, we'll use the address as both username and password
      if (username && username.startsWith("0x")) {
        const user = {
          id: "2",
          username,
          type: "customer",
          wallet: username, // Using username as wallet address
          apiKey: "pcpdfilm" // Add API key for customers too
        }

        const token = generateToken(user)
        if (!token) {
          return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          token,
          user,
        })
      }
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
