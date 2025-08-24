"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageShell } from "@/components/PageShell"
import { createShipment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon } from "lucide-react"

export default function CreateShipmentPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    tracking: "",
    origin: "",
    destination: "",
    eta: "",
    customerEmail: "",
    note: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.origin.trim()) {
      newErrors.origin = "Origin is required"
    }
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required"
    }
    if (!formData.eta) {
      newErrors.eta = "ETA is required"
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const shipment = await createShipment({
        ...formData,
        tracking: formData.tracking.trim() || undefined, // Let API generate if empty
      })

      toast({
        title: "Shipment created",
        description: `Shipment ${shipment.tracking} has been created successfully`,
      })

      router.push(`/admin/shipments/${shipment.tracking}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell
      title="Create Shipment"
      description="Add a new shipment to the system"
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Create Shipment" }]}
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            New Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* remove this later, not needed */}
              {/* <div className="space-y-2">
                <Label htmlFor="tracking">Tracking Number (Optional)</Label>
                <Input
                  id="tracking"
                  placeholder="Leave empty to auto-generate"
                  value={formData.tracking}
                  onChange={(e) => handleChange("tracking", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, a tracking number will be generated automatically
                </p>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => handleChange("customerEmail", e.target.value)}
                  className={errors.customerEmail ? "border-red-500" : ""}
                />
                {errors.customerEmail && <p className="text-xs text-red-500">{errors.customerEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Input
                  id="origin"
                  placeholder="e.g., New York, NY"
                  value={formData.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  className={errors.origin ? "border-red-500" : ""}
                />
                {errors.origin && <p className="text-xs text-red-500">{errors.origin}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Los Angeles, CA"
                  value={formData.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  className={errors.destination ? "border-red-500" : ""}
                />
                {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eta">Expected Delivery Date & Time *</Label>
              <Input
                id="eta"
                type="datetime-local"
                value={formData.eta}
                onChange={(e) => handleChange("eta", e.target.value)}
                className={errors.eta ? "border-red-500" : ""}
              />
              {errors.eta && <p className="text-xs text-red-500">{errors.eta}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Initial Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any initial notes about this shipment..."
                value={formData.note}
                onChange={(e) => handleChange("note", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Shipment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
