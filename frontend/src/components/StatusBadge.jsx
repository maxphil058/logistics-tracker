"use client"

import { Badge } from "@/components/ui/badge"
import { statusColors } from "@/lib/status"

export function StatusBadge({ status, className = "" }) {
  if (!status) return null

  const colorClass = statusColors[status] || statusColors.CREATED

  return (
    <Badge variant="outline" className={`${colorClass} ${className}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}
