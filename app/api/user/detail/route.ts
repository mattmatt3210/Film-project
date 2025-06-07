import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const apiKey = request.headers.get("k")

    if (!authHeader && !apiKey) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    // Try to get user details from the API
    const endpoints = [
      "https://pcpdfilm.starsknights.com:18888/api/v2/user/detail",
      "http://pcpdfilm.starsknights.com/api/v2/user/detail",
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`👤 Fetching user details from: ${endpoint}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        }

        // Add authentication headers
        if (apiKey) {
          headers["k"] = apiKey
        }
        if (authHeader) {
          headers["Authorization"] = authHeader
        }

        const response = await fetch(endpoint, {
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const text = await response.text()
          try {
            const userDetails = JSON.parse(text)
            console.log(`✅ Successfully fetched user details from: ${endpoint}`)
            return NextResponse.json({
              ...userDetails,
              meta: {
                source: "api",
                timestamp: new Date().toISOString(),
              },
            })
          } catch (parseError) {
            console.log(`🔧 Invalid JSON from ${endpoint}:`, parseError.message)
            continue
          }
        } else if (response.status === 401) {
          console.log(`🚫 Unauthorized access to ${endpoint}`)
          continue
        } else {
          console.log(`🚫 HTTP ${response.status} from ${endpoint}`)
          continue
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log(`⏰ Request timeout for ${endpoint}`)
        } else {
          console.log(`❌ Failed to fetch user details from ${endpoint}: ${error.message}`)
        }
        continue
      }
    }

    // If API fails, return mock user details
    console.log("🎭 API failed, using mock user details")
    const mockUserDetails = {
      username: "s235776767",
      email: "staff@cinemavault.com",
      phone: "+1234567890",
      firstName: "John",
      lastName: "Staff",
      dateJoined: "2024-01-01",
      lastLogin: new Date().toISOString(),
      meta: {
        source: "mock",
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(mockUserDetails)
  } catch (error) {
    console.error("💥 Failed to fetch user details:", error)
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}
