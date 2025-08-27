"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUSES } from "@/lib/status"
import { getDashboardCounts } from "@/lib/api"
import { useState, useEffect } from "react"

export function StatusCards({  isLoading = false }) {
  // Handle both old format (array of shipments) and new format (array of {status, count})
  

	// private String status;

	// private int count;
  
//  /shipments/dashboard-counts

const [countsArray, setCountsArray] = useState([]);

useEffect(() => {
  async function load() {
    const data = await getDashboardCounts(); // ✅ resolved array
    setCountsArray(data);
  }
  load();
}, []);


const getCount = (status) =>
  countsArray.find(c => c.status === status)?.count ?? 0;


  const cards = [
    {
      title: "Created",
      count:  getCount(STATUSES.CREATED),
      status: STATUSES.CREATED,
      description: "New shipments",
    },
    {
      title: "In Transit",
      count: getCount(STATUSES.IN_TRANSIT),
      status: STATUSES.IN_TRANSIT,
      description: "Currently shipping",
    },
    {
      title: "Out for Delivery",
      count: getCount(STATUSES.OUT_FOR_DELIVERY),
      status: STATUSES.OUT_FOR_DELIVERY,
      description: "Final delivery",
    },
    {
      title: "Delivered",
      count: getCount(STATUSES.DELIVERED),
      status: STATUSES.DELIVERED,
      description: "Successfully delivered",
    },
    {
      title: "Delayed",
      count: getCount(STATUSES.DELAYED),
      status: STATUSES.DELAYED,
      description: "Behind schedule",
    },
    {
      title: "Exception",
      count: getCount(STATUSES.EXCEPTION),
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
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{card.count}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
