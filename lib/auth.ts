// Simple token verification
const TOKEN_SECRET = process.env.TOKEN_SECRET || "your-secret-key"

export async function verifyToken(token: string) {
  try {
    if (!token) {
      return null
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '')

    // Decode the token (assuming it's a base64 encoded JSON string)
    const decodedToken = JSON.parse(atob(cleanToken))
    
    // Check if the token has expired
    if (decodedToken.exp && decodedToken.exp < Date.now()) {
      return null
    }

    // Add API key for owner account
    if (decodedToken.type === "staff") {
      decodedToken.apiKey = "pcpdfilm"
    }

    return decodedToken
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function generateToken(user: any) {
  try {
    // Create a simple token with user info and expiration
    const tokenData = {
      ...user,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    }

    // Encode the token data
    return btoa(JSON.stringify(tokenData))
  } catch (error) {
    console.error("Token generation error:", error)
    return null
  }
} 