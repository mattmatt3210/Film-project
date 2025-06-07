"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserDetails {
  firstname: string
  lastname: string
  type: number // 1 for staff, 2 for customer
  valid: string
  password?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    setIsAuthenticated(true)
    fetchUserDetails()
  }, [router])

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setUserDetails({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        type: data.type || 1,
        valid: data.valid || new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      console.error("Error fetching user details:", error)
      setError("Failed to load user details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserDetails, value: string | number) => {
    if (!userDetails) return

    setUserDetails({
      ...userDetails,
      [field]: value,
    })
  }

  const saveUserDetails = async () => {
    if (!userDetails) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userDetails),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      console.error("Save error:", error)
      setError(error.message || "Error updating profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load profile</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
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

        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <User className="mr-2 h-6 w-6" />
              User Profile
            </CardTitle>
            <CardDescription className="text-gray-300">Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-white">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  value={userDetails.firstname}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-white">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  value={userDetails.lastname}
                  onChange={(e) => handleInputChange("lastname", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">
                  User Type
                </Label>
                <Select
                  value={userDetails.type.toString()}
                  onValueChange={(value) => handleInputChange("type", parseInt(value))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Staff</SelectItem>
                    <SelectItem value="2">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid" className="text-white">
                  Registration Date
                </Label>
                <Input
                  id="valid"
                  type="date"
                  value={userDetails.valid}
                  onChange={(e) => handleInputChange("valid", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 bg-red-500/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-400 bg-green-500/20 p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <Button onClick={saveUserDetails} disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={() => router.push("/")} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
