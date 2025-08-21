"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"
import { formatDateTime, isLate } from "@/lib/utils"
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react"

export function ShipmentsTable({
  shipments = [],
  onRowClick = null,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
}) {
  const [sortField, setSortField] = useState("updatedAt")
  const [sortDirection, setSortDirection] = useState("desc")

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedShipments = [...shipments].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === "updatedAt" || sortField === "createdAt" || sortField === "eta") {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("tracking")}>
                <div className="flex items-center gap-2">
                  Tracking
                  <SortIcon field="tracking" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("eta")}>
                <div className="flex items-center gap-2">
                  ETA
                  <SortIcon field="eta" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("updatedAt")}>
                <div className="flex items-center gap-2">
                  Updated
                  <SortIcon field="updatedAt" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              sortedShipments.map((shipment) => (
                <TableRow
                  key={shipment.tracking}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(shipment.tracking)}
                >
                  <TableCell className="font-mono text-sm">{shipment.tracking}</TableCell>
                  <TableCell>
                    <StatusBadge status={shipment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{shipment.origin}</div>
                      <div className="text-muted-foreground">→ {shipment.destination}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{shipment.customerEmail}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className={isLate(shipment.eta, shipment.status) ? "text-red-600" : ""}>
                        {formatDateTime(shipment.eta).local}
                      </div>
                      {isLate(shipment.eta, shipment.status) && <div className="text-xs text-red-500">Late</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(shipment.updatedAt).local}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
