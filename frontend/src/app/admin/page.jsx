"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/PageShell"
import { StatusCards } from "@/components/StatusCards"
import { ShipmentsTable } from "@/components/ShipmentsTable"
import { FiltersBar } from "@/components/FiltersBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { listShipments, exportCsv, getRecentActivity, getDashboardCounts } from "@/lib/api"
import { shipments, eventsByTracking } from "@/lib/mockData"
import { getRelativeTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // State for shipments table
  const [tableShipments, setTableShipments] = useState([])
  const [totalShipments, setTotalShipments] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)

  // Filters state from URL
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    from: searchParams.get("from") || null,
    to: searchParams.get("to") || null,
    page: Number.parseInt(searchParams.get("page")) || 1,
    limit: Number.parseInt(searchParams.get("limit")) || 10,
  })

  // Recent activity - combine all events and get latest 20
  const [recentActivity, setRecentActivity] = useState([])
  const [dashboardCounts, setDashboardCounts] = useState({})

  // Update URL when filters change
  const updateUrl = (newFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== null) {
        params.set(key, value.toString())
      }
    })
    const newUrl = `/admin?${params.toString()}`
    window.history.replaceState({}, "", newUrl)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 } // Reset to page 1 on filter change
    setFilters(updatedFilters)
    updateUrl(updatedFilters)
  }

  // Handle page changes
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage }
    setFilters(updatedFilters)
    updateUrl(updatedFilters)
  }

  // Handle row click
  const handleRowClick = (tracking) => {
    router.push(`/admin/shipments/${tracking}`)
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportCsv(filters)
      toast({
        title: "Export successful",
        description: "CSV file has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Load shipments data
  const loadShipments = async () => {
    setIsLoading(true)
    try {
      const result = await listShipments(filters)
      setTableShipments(result.items)
      setTotalShipments(result.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsDashboardLoading(true)
    try {
      const [activityData, countsData] = await Promise.all([
        getRecentActivity(),
        getDashboardCounts()
      ])
      setRecentActivity(activityData.slice(0, 20)) // Limit to 20 items
      setDashboardCounts(countsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsDashboardLoading(false)
    }
  }

  // Load data when filters change
  useEffect(() => {
    loadShipments()
  }, [filters])

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const totalPages = Math.ceil(totalShipments / filters.limit)

  return (
    <PageShell
      title="Dashboard"
      description="Overview of all shipments and recent activity"
      breadcrumbs={[{ label: "Dashboard" }]}
      actions={
        <Button asChild>
          <a href="/admin/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Shipment
          </a>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status Cards */}
        <StatusCards  />

        {/* Recent Activity  AND NUMBER OF SHIPMENTS BY STATUS*/}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((event, index) => (
                  <div
                    key={`${event.tracking}-${event.at}-${index}`}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{event.tracking}</span> - {event.note}
                      </p>
                      <p className="text-xs text-muted-foreground">by {event.actor}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{getRelativeTime(event.at)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* END OF Recent Activity */}




        {/* Shipments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Shipments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showExport={true}
              onExport={handleExport}
              isExporting={isExporting}
            />

            {isLoading || isDashboardLoading ? (
              <div className="text-center py-8">Loading shipments...</div>
            ) : (
              <ShipmentsTable
                shipments={tableShipments}
                onRowClick={handleRowClick}
                showPagination={true}
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
