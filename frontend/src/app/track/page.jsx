"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { NavBar } from "@/components/NavBar"
import { StatusBadge } from "@/components/StatusBadge"
import { Timeline } from "@/components/Timeline"
import { Toaster } from "@/components/Toaster"
import { getShipment, getShipmentEvents } from "@/lib/api"
import { formatDateTime, isLate } from "@/lib/utils"
import { SearchIcon, PackageIcon, MapPinIcon, ClockIcon } from "lucide-react"

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shipment, setShipment] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setIsLoading(true)
    setError("")
    setShipment(null)
    setEvents([])
    setHasSearched(true)

    try {
      const [shipmentData, eventsData] = await Promise.all([
        getShipment(trackingNumber.trim()),
        getShipmentEvents(trackingNumber.trim()),
      ])

      setShipment(shipmentData)
      setEvents(eventsData)
    } catch (err) {
      setError(err.message || "Shipment not found")
    } finally {
      setIsLoading(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-3 h-3 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
          <p className="text-muted-foreground">Enter your tracking number to see the latest updates</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., TRK-7F9H-3K2M-8Q5D-C)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <Button type="submit" disabled={isLoading} size="lg" className="px-8">
                <SearchIcon className="mr-2 h-4 w-4" />
                {isLoading ? "Searching..." : "Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {shipment && !isLoading && (
          <div className="space-y-6">
            {/* Shipment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                    <p className="font-mono text-lg">{shipment.tracking}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={shipment.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      Route
                    </label>
                    <p className="text-sm">
                      <span className="font-medium">{shipment.origin}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="font-medium">{shipment.destination}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Expected Delivery
                    </label>
                    <p
                      className={`text-sm ${isLate(shipment.eta, shipment.status) ? "text-red-600 font-medium" : ""}`}
                      title={shipment.eta}
                    >
                      {formatDateTime(shipment.eta).local}
                      {isLate(shipment.eta, shipment.status) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">LATE</span>
                      )}
                    </p>
                  </div>
                </div>

                {shipment.deliveredAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivered At</label>
                    <p className="text-sm text-green-600 font-medium" title={shipment.deliveredAt}>
                      {formatDateTime(shipment.deliveredAt).local}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline events={events} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State - No Results */}
        {hasSearched && !shipment && !isLoading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipment found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find a shipment with that tracking number. Please check the number and try again.
              </p>
              <Button variant="outline" onClick={() => setTrackingNumber("")}>
                Try Another Number
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Initial State - No Search Yet */}
        {!hasSearched && (
          <Card>
            <CardContent className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to track</h3>
              <p className="text-muted-foreground">Enter your tracking number above to get started</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Toaster />
    </div>
  )
}
