import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date/time for display with timezone handling
export function formatDateTime(isoString) {
  if (!isoString) return "N/A"

  const date = new Date(isoString)
  return {
    local: date.toLocaleString(),
    iso: isoString,
    short: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
  }
}

// Format tracking number for display (add dashes for readability)
export function formatTracking(tracking) {
  if (!tracking) return ""

  // Already formatted if it contains dashes
  if (tracking.includes("-")) return tracking

  // Add dashes every 4 characters for readability
  return tracking.replace(/(.{4})/g, "$1-").slice(0, -1)
}

// Generate a new tracking number
export function generateTracking() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "TRK-"

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < 3) result += "-"
  }

  return result
}

// Calculate if shipment is late
export function isLate(eta, status) {
  if (!eta || status === "DELIVERED" || status === "CANCELLED") return false
  return new Date() > new Date(eta)
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(isoString) {
  if (!isoString) return ""

  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
