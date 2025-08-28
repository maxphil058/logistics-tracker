"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageShell } from "@/components/PageShell"
import { StatusBadge } from "@/components/StatusBadge"
import { Timeline } from "@/components/Timeline"
import { StatusChanger } from "@/components/StatusChanger"
import { EtaDialog } from "@/components/EtaDialog"
import { NoteDialog } from "@/components/NoteDialog"
import { getShipment, getShipmentEvents, changeStatus, updateEta, addNote } from "@/lib/api"
import { formatDateTime, isLate } from "@/lib/utils"
import { STATUSES } from "@/lib/status"
import { useToast } from "@/hooks/use-toast"
import {
  PackageIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react"

export default function ShipmentDetailPage() {
  const params = useParams()
  const tracking = params.tracking
  const router = useRouter()
  const { toast } = useToast()

  const [shipment, setShipment] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Derived flags
  const finished = shipment && (shipment.status === STATUSES.DELIVERED || shipment.status === STATUSES.CANCELLED)
  const late = shipment && isLate(shipment.eta, shipment.status)

  const loadData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const [shipmentData, eventsData] = await Promise.all([getShipment(tracking), getShipmentEvents(tracking)])

      setShipment(shipmentData)
      setEvents(eventsData)
    } catch (err) {
      setError(err.message || "Failed to load shipment details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tracking) {
      loadData()
    }
  }, [tracking])

  const handleStatusChange = async (trackingNum, newStatus, note) => {
    try {
      const updatedShipment = await changeStatus(trackingNum, newStatus, note)
      setShipment(updatedShipment)

      // Reload events to show the new status change
      const updatedEvents = await getShipmentEvents(trackingNum)
      setEvents(updatedEvents)
      window.location.reload();
    } catch (error) {
      throw error // Re-throw to let StatusChanger handle the error
    }
  }

  const handleEtaChange = async (trackingNum, newEta) => {
    try {
      const updatedShipment = await updateEta(trackingNum, newEta)
      setShipment(updatedShipment)

      // Reload events to show the ETA update
      const updatedEvents = await getShipmentEvents(trackingNum)
      setEvents(updatedEvents)
      window.location.reload();
    } catch (error) {
      throw error
    }
  }

  const handleNoteAdd = async (trackingNum, note) => {
    try {
      const updatedShipment = await addNote(trackingNum, note)
      setShipment(updatedShipment)

      // Reload events to show the new note
      const updatedEvents = await getShipmentEvents(trackingNum)
      window.location.reload();
      
      setEvents(updatedEvents)
    } catch (error) {
      throw error
    }
  }

  const handleMarkDelayed = async () => {
    try {
      await handleStatusChange(tracking, STATUSES.DELAYED, "Marked as delayed")
      toast({
        title: "Status updated",
        description: "Shipment marked as delayed",
      })
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as delayed",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading shipment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <PageShell
        title="Shipment Not Found"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Shipments", href: "/admin/shipments" },
          { label: tracking },
        ]}
      >
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`Shipment ${tracking}`}
      description="Manage shipment details and track progress"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Shipments", href: "/admin/shipments" },
        { label: tracking },
      ]}
      actions={
        <div className="flex gap-2">
          {!finished && (
            <>
              <StatusChanger currentStatus={shipment.status} tracking={tracking} onStatusChange={handleStatusChange} />
              <EtaDialog currentEta={shipment.eta} tracking={tracking} onEtaChange={handleEtaChange} />
              <NoteDialog tracking={tracking} onNoteAdd={handleNoteAdd} />
              {shipment.status !== STATUSES.DELAYED && (
                <Button variant="outline" size="sm" onClick={handleMarkDelayed}>
                  <AlertTriangleIcon className="mr-2 h-4 w-4" />
                  Mark Delayed
                </Button>
              )}
            </>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Shipment Information
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
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={shipment.status} />
                    {finished && <Badge variant="outline">Finished</Badge>}
                    {late && <Badge variant="destructive">Late</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    Origin
                  </label>
                  <p>{shipment.origin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    Destination
                  </label>
                  <p>{shipment.destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    Customer Email
                  </label>
                  <p>{shipment.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Expected Delivery
                  </label>
                  <p className={late ? "text-red-600 font-medium" : ""} title={shipment.eta}>
                    {formatDateTime(shipment.eta).local}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Created
                  </label>
                  <p className="text-sm" title={shipment.createdAt}>
                    {formatDateTime(shipment.createdAt).local}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Last Updated
                  </label>
                  <p className="text-sm" title={shipment.updatedAt}>
                    {formatDateTime(shipment.updatedAt).local}
                  </p>
                </div>
              </div>

              {shipment.deliveredAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    Delivered At
                  </label>
                  <p className="text-green-600 font-medium" title={shipment.deliveredAt}>
                    {formatDateTime(shipment.deliveredAt).local}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={events} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
