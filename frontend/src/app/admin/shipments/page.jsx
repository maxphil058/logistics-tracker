"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/PageShell"
import { ShipmentsTable } from "@/components/ShipmentsTable"
import { FiltersBar } from "@/components/FiltersBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { listShipments, exportCsv } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon } from "lucide-react"

export default function ShipmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [shipments, setShipments] = useState([])
  const [totalShipments, setTotalShipments] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Filters state from URL
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    from: searchParams.get("from") || null,
    to: searchParams.get("to") || null,
    page: Number.parseInt(searchParams.get("page")) || 1,
    limit: Number.parseInt(searchParams.get("limit")) || 10,
  })

  // Update URL when filters change
  const updateUrl = (newFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== null) {
        params.set(key, value.toString())
      }
    })
    const newUrl = `/admin/shipments?${params.toString()}`
    window.history.replaceState({}, "", newUrl)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }
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
      setShipments(result.items)
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

  // Load data when filters change
  useEffect(() => {
    loadShipments()
  }, [filters])

  const totalPages = Math.ceil(totalShipments / filters.limit)

  return (
    <PageShell
      title="All Shipments"
      description={`Manage and track all shipments (${totalShipments} total)`}
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Shipments" }]}
      actions={
        <Button asChild>
          <a href="/admin/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Shipment
          </a>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FiltersBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            showExport={true}
            onExport={handleExport}
            isExporting={isExporting}
          />

          {isLoading ? (
            <div className="text-center py-8">Loading shipments...</div>
          ) : (
            <ShipmentsTable
              shipments={shipments}
              onRowClick={handleRowClick}
              showPagination={true}
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
