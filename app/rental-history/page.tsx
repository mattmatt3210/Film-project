"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ticket, Clock, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface RentalInfo {
  id: string
  movieId: string
  price: number
  transactionHash: string
  walletAddress: string
  startTime: string
  endTime: string
  status: string
  movie?: {
    title: string
    poster: string
    price: number
  }
}

export default function RentalHistoryPage() {
  const [rentals, setRentals] = useState<RentalInfo[]>([])
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("active")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      
      if (!token || !user.wallet) {
        router.push("/")
        return
      }

      const response = await fetch(`/api/rent?walletAddress=${user.wallet}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store' // Disable caching to ensure fresh data
      })

      if (!response.ok) {
        throw new Error("Failed to fetch rentals")
      }

      const data = await response.json()
      setRentals(data.rentals)
    } catch (error) {
      console.error("Error fetching rentals:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRentals()
  }, [router])

  // Refresh rentals every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true)
      fetchRentals()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Update time remaining every second
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining: Record<string, string> = {}
      rentals.forEach(rental => {
        newTimeRemaining[rental.id] = formatTimeRemaining(new Date(rental.endTime).getTime())
      })
      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [rentals])

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const remaining = endTime - now

    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    return `${hours}h ${minutes}m ${seconds}s`
  }

  const getEtherscanUrl = (hash: string) => {
    return `https://etherscan.io/tx/${hash}`
  }

  const handleExtendRental = async (rental: RentalInfo) => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!token || !user.wallet) {
        router.push("/")
        return
      }

      // Calculate new end time (48 hours from current end time)
      const currentEndTime = new Date(rental.endTime)
      const newEndTime = new Date(currentEndTime.getTime() + 48 * 60 * 60 * 1000)

      // Update rental in API
      const response = await fetch("/api/rent", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: rental.id,
          endTime: newEndTime.toISOString(),
          transactionHash: rental.transactionHash
        })
      })

      if (!response.ok) {
        throw new Error("Failed to extend rental")
      }

      // Refresh rentals to get updated status
      setRefreshing(true)
      await fetchRentals()

      alert("Rental extended successfully!")
    } catch (error) {
      console.error("Error extending rental:", error)
      alert("Failed to extend rental. Please try again.")
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRentals()
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setRefreshing(true)
    fetchRentals()
  }

  const filteredRentals = rentals.filter(rental => rental.status === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading rental history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Rental History</h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="text-white hover:bg-white/20"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" onClick={() => handleTabChange("active")}>
              Active Rentals
            </TabsTrigger>
            <TabsTrigger value="ending-soon" onClick={() => handleTabChange("ending-soon")}>
              Ending Soon
            </TabsTrigger>
            <TabsTrigger value="expired" onClick={() => handleTabChange("expired")}>
              Expired
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredRentals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white text-xl">No {activeTab} rentals found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRentals.map((rental) => (
                  <Card key={rental.id} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white">{rental.movie?.title || "Unknown Movie"}</CardTitle>
                        <Badge
                          variant="secondary"
                          className={
                            rental.status === "expired"
                              ? "bg-red-500/20 text-red-400"
                              : rental.status === "ending-soon"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }
                        >
                          {rental.status === "expired"
                            ? "Expired"
                            : rental.status === "ending-soon"
                            ? "Ending Soon"
                            : "Active"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Price:</span>
                          <span className="text-purple-400">{rental.price} ETH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Time Remaining:</span>
                          <span className="text-purple-400">{timeRemaining[rental.id]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Transaction:</span>
                          <a
                            href={getEtherscanUrl(rental.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center"
                          >
                            <span className="mr-1">View</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        {rental.status !== "expired" && (
                          <Button
                            onClick={() => handleExtendRental(rental)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Extend Rental
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 