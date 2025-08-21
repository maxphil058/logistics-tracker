"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/NavBar"
import { SearchIcon, ShieldCheckIcon, ClockIcon, TruckIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Track Your Shipments
            <br />
            <span className="text-primary">In Real Time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant updates on your package location, delivery status, and estimated arrival time with our
            comprehensive logistics tracking system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/track">
                <SearchIcon className="mr-2 h-5 w-5" />
                Track Package
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Admin Login</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose LogiTrack?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <ClockIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Real-Time Updates</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Get instant notifications and updates as your package moves through our network.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <TruckIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Comprehensive Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Track every step of your shipment's journey from pickup to final delivery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Your shipment data is protected with enterprise-grade security and reliability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to track your shipment?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Enter your tracking number and get instant access to your package status.
          </p>
          <Button size="lg" asChild>
            <Link href="/track">
              <SearchIcon className="mr-2 h-5 w-5" />
              Start Tracking Now
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-bold text-xl">LogiTrack</span>
              <p className="text-sm text-muted-foreground mt-1">Professional logistics tracking solution</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/track">Track Package</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
