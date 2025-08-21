"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUSES } from "@/lib/status"

export function StatusCards({ shipments = [] }) {
  // Count shipments by status
  const counts = Object.values(STATUSES).reduce((acc, status) => {
    acc[status] = shipments.filter((s) => s.status === status).length
    return acc
  }, {})

  const cards = [
    {
      title: "Created",
      count: counts[STATUSES.CREATED],
      status: STATUSES.CREATED,
      description: "New shipments",
    },
    {
      title: "In Transit",
      count: counts[STATUSES.IN_TRANSIT],
      status: STATUSES.IN_TRANSIT,
      description: "Currently shipping",
    },
    {
      title: "Out for Delivery",
      count: counts[STATUSES.OUT_FOR_DELIVERY],
      status: STATUSES.OUT_FOR_DELIVERY,
      description: "Final delivery",
    },
    {
      title: "Delivered",
      count: counts[STATUSES.DELIVERED],
      status: STATUSES.DELIVERED,
      description: "Successfully delivered",
    },
    {
      title: "Delayed",
      count: counts[STATUSES.DELAYED],
      status: STATUSES.DELAYED,
      description: "Behind schedule",
    },
    {
      title: "Exception",
      count: counts[STATUSES.EXCEPTION],
      status: STATUSES.EXCEPTION,
      description: "Requires attention",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.status}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.count}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
