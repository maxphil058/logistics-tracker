"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { STATUSES } from "@/lib/status"
import { CalendarIcon, SearchIcon, XIcon } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export function FiltersBar({
  filters = {},
  onFiltersChange = null,
  showExport = false,
  onExport = null,
  isExporting = false,
}) {
  const [localFilters, setLocalFilters] = useState({
    q: "",
    status: "",
    from: null,
    to: null,
    ...filters,
  })

  // Update local state when filters prop changes
  useEffect(() => {
    setLocalFilters((prev) => ({ ...prev, ...filters }))
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { q: "", status: "", from: null, to: null }
    setLocalFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = localFilters.q || localFilters.status || localFilters.from || localFilters.to

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking or email..."
            value={localFilters.q}
            onChange={(e) => handleFilterChange("q", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={localFilters.status}
          onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(STATUSES).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filters */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-40 justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.from ? formatDateTime(localFilters.from).short : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.from ? new Date(localFilters.from) : undefined}
                onSelect={(date) => handleFilterChange("from", date?.toISOString() || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-40 justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.to ? formatDateTime(localFilters.to).short : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.to ? new Date(localFilters.to) : undefined}
                onSelect={(date) => handleFilterChange("to", date?.toISOString() || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            <XIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}

        {showExport && (
          <Button variant="outline" onClick={onExport} disabled={isExporting} size="sm">
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        )}
      </div>
    </div>
  )
}
