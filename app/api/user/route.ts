import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    // Check for required 'k' header parameter
    const apiKey = request.headers.get("k")
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key (k) is required" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { firstname, lastname, type, password, valid } = data

    // Validate required fields
    if (!firstname || !lastname || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate user type
    if (type !== 1 && type !== 2) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      )
    }

    // Prepare request body according to API schema
    const requestBody = {
      firstname,
      lastname,
      type,
      password: password || undefined,
      valid: valid ?? 1
    }

    // Try both URLs
    const urls = [
      "https://pcpdfilm.starsknights.com:18888/api/v2/user",
      "http://pcpdfilm.starsknights.com/api/v2/user"
    ]

    let lastError = null
    for (const url of urls) {
      try {
        console.log(`👤 Updating user at: ${url}`)

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "k": apiKey
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          console.log(`✅ Successfully updated user at: ${url}`)
          return NextResponse.json({ 
            success: true,
            message: "User updated successfully" 
          })
        }

        const errorData = await response.json()
        console.log(`❌ Failed to update user at ${url}:`, errorData)
        lastError = errorData
      } catch (error) {
        console.error(`❌ Error updating user at ${url}:`, error)
        lastError = error
        continue
      }
    }

    // If we get here, both URLs failed
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update user", 
        details: lastError 
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Check for required 'k' header parameter
    const apiKey = request.headers.get("k")
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key (k) is required" },
        { status: 401 }
      )
    }

    // Try both URLs
    const urls = [
      "https://pcpdfilm.starsknights.com:18888/api/v2/user",
      "http://pcpdfilm.starsknights.com/api/v2/user"
    ]

    let lastError = null
    for (const url of urls) {
      try {
        console.log(`👤 Fetching user from: ${url}`)

        const response = await fetch(url, {
          headers: {
            "Accept": "application/json",
            "k": apiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Successfully fetched user from: ${url}`)
          return NextResponse.json({
            success: true,
            data
          })
        }

        const errorData = await response.json()
        console.log(`❌ Failed to fetch user from ${url}:`, errorData)
        lastError = errorData
      } catch (error) {
        console.error(`❌ Error fetching user from ${url}:`, error)
        lastError = error
        continue
      }
    }

    // If we get here, both URLs failed
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch user data", 
        details: lastError 
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    )
  }
}
