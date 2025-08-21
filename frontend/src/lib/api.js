import { shipments, eventsByTracking } from "./mockData.js"
import { STATUSES, allowedTransitions } from "./status.js"
import { generateTracking } from "./utils.js"

// Simulate network delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock authentication - UI only
export async function login(email, password) {
  await delay()

  // Simple mock validation
  if (email === "admin@company.com" && password === "password") {
    return {
      token: "mock-jwt-token-" + Date.now(),
      user: { email, role: "admin" },
    }
  }

  throw new Error("Invalid credentials")
}

// List shipments with filtering and pagination
export async function listShipments({ q = "", status = "", from = null, to = null, page = 1, limit = 10 } = {}) {
  await delay()

  let filtered = [...shipments]

  // Filter by search query (tracking or email)
  if (q) {
    const query = q.toLowerCase()
    filtered = filtered.filter(
      (s) => s.tracking.toLowerCase().includes(query) || s.customerEmail.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((s) => s.status === status)
  }

  // Filter by date range (createdAt)
  if (from) {
    filtered = filtered.filter((s) => new Date(s.createdAt) >= new Date(from))
  }
  if (to) {
    filtered = filtered.filter((s) => new Date(s.createdAt) <= new Date(to))
  }

  // Sort by updatedAt desc
  filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  // Paginate
  const total = filtered.length
  const start = (page - 1) * limit
  const items = filtered.slice(start, start + limit)

  return { items, total, page, limit }
}

// Get single shipment by tracking
export async function getShipment(tracking) {
  await delay()

  const shipment = shipments.find((s) => s.tracking === tracking)
  if (!shipment) {
    throw new Error("Shipment not found")
  }

  return shipment
}

// Get shipment events timeline
export async function getShipmentEvents(tracking) {
  await delay()

  const events = eventsByTracking[tracking] || []
  // Return newest first
  return [...events].reverse()
}

// Create new shipment
export async function createShipment(data) {
  await delay()

  const now = new Date().toISOString()
  const tracking = data.tracking || generateTracking()

  const newShipment = {
    tracking,
    origin: data.origin,
    destination: data.destination,
    eta: data.eta,
    status: STATUSES.CREATED,
    customerEmail: data.customerEmail,
    createdAt: now,
    updatedAt: now,
    deliveredAt: null,
  }

  // Add to mock data
  shipments.push(newShipment)

  // Add initial event
  const initialEvent = {
    tracking,
    status: STATUSES.CREATED,
    note: data.note || "Shipment created",
    at: now,
    actor: "ops@company.com",
  }

  if (!eventsByTracking[tracking]) {
    eventsByTracking[tracking] = []
  }
  eventsByTracking[tracking].push(initialEvent)

  return newShipment
}

// Change shipment status
export async function changeStatus(tracking, toStatus, note = "") {
  await delay()

  const shipment = shipments.find((s) => s.tracking === tracking)
  if (!shipment) {
    throw new Error("Shipment not found")
  }

  // Validate transition
  const allowed = allowedTransitions[shipment.status] || []
  if (!allowed.includes(toStatus)) {
    throw new Error(`Cannot transition from ${shipment.status} to ${toStatus}`)
  }

  // Update shipment
  const now = new Date().toISOString()
  shipment.status = toStatus
  shipment.updatedAt = now

  if (toStatus === STATUSES.DELIVERED) {
    shipment.deliveredAt = now
  }

  // Add event
  const event = {
    tracking,
    status: toStatus,
    note: note || `Status changed to ${toStatus}`,
    at: now,
    actor: "ops@company.com",
  }

  if (!eventsByTracking[tracking]) {
    eventsByTracking[tracking] = []
  }
  eventsByTracking[tracking].push(event)

  return shipment
}

// Update ETA
export async function updateEta(tracking, isoString) {
  await delay()

  const shipment = shipments.find((s) => s.tracking === tracking)
  if (!shipment) {
    throw new Error("Shipment not found")
  }

  const now = new Date().toISOString()
  shipment.eta = isoString
  shipment.updatedAt = now

  // Add event
  const event = {
    tracking,
    status: shipment.status,
    note: `ETA updated to ${new Date(isoString).toLocaleString()}`,
    at: now,
    actor: "ops@company.com",
  }

  if (!eventsByTracking[tracking]) {
    eventsByTracking[tracking] = []
  }
  eventsByTracking[tracking].push(event)

  return shipment
}

// Add note to shipment
export async function addNote(tracking, note) {
  await delay()

  const shipment = shipments.find((s) => s.tracking === tracking)
  if (!shipment) {
    throw new Error("Shipment not found")
  }

  const now = new Date().toISOString()
  shipment.updatedAt = now

  // Add event
  const event = {
    tracking,
    status: shipment.status,
    note,
    at: now,
    actor: "ops@company.com",
  }

  if (!eventsByTracking[tracking]) {
    eventsByTracking[tracking] = []
  }
  eventsByTracking[tracking].push(event)

  return shipment
}

// Export CSV (client-side generation)
export async function exportCsv(filters = {}) {
  await delay(300)

  const { items } = await listShipments({ ...filters, page: 1, limit: 1000 })

  const headers = ["Tracking", "Origin", "Destination", "Status", "Customer Email", "ETA", "Created At", "Updated At"]
  const rows = items.map((s) => [
    s.tracking,
    s.origin,
    s.destination,
    s.status,
    s.customerEmail,
    s.eta,
    s.createdAt,
    s.updatedAt,
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `shipments-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}

/* 
SWITCH TO REAL API - Replace the above functions with actual fetch calls:

// Example real implementation:
export async function login(email, password) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  
  return response.json();
}

export async function listShipments(filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/shipments?${params}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch shipments');
  }
  
  return response.json();
}

// Add similar patterns for all other functions...
// Remember to add Authorization header for admin routes
// Map backend response shapes to match current UI expectations
*/
