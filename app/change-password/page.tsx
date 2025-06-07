"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Lock } from "lucide-react"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userType, setUserType] = useState<"staff" | "customer" | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.type) {
      router.push("/")
      return
    }
    setUserType(user.type)
  }, [router])

  const validatePassword = (password: string) => {
    const minLength = 4
    if (password.length < minLength) {
      return "Password must be at least 4 characters long"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate passwords
      const passwordError = validatePassword(newPassword)
      if (passwordError) {
        setError(passwordError)
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match")
        setLoading(false)
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to change your password")
        router.push("/login")
        return
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to change password")
      }

      setSuccess("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Redirect to appropriate page after 2 seconds
      setTimeout(() => {
        if (userType === "staff") {
          router.push("/dashboard")
        } else {
          router.push("/")
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An error occurred while changing password")
    } finally {
      setLoading(false)
    }
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-2xl font-bold text-white">Change Password</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Update your {userType} account password securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Confirm your new password"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/20 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-400 bg-green-500/20 p-3 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push(userType === "staff" ? "/dashboard" : "/")}
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-300">
            <h3 className="font-semibold mb-2">Password Requirements:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 4 characters long</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
