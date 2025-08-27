// API Client for Logistics Tracker Backend
// Base URL: http://localhost:8080

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"

// Token management helpers
export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("jwt")
}

export function setToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwt", token)
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt")
  }
}

// Generic API client helper
async function apiCall(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" }
  
  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const config = {
    method,
    headers,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, config)
  
  const text = await response.text()
  let data = null
  
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    // Clear token on auth errors
    if (response.status === 401 || response.status === 403) {
      clearToken()
    }
    throw new Error("Request failed")
  }

  return data
}

// Authentication
export async function login(email, password) {
  const response = await apiCall("/api/auth/login", {
    method: "POST",
    body: { email, password }
  })
  
  if (!response.token) {
    throw new Error("No token in response")
  }
  
  setToken(response.token)
  return {
    token: response.token,
    user: { email, role: "admin" }
  }
}

export function logout() {
  clearToken()
}

// Admin endpoints (require JWT)

// List shipments with filtering
export async function listShipments({ q = "", status = "", from = null, to = null, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams()
  
  if (q) params.set("trackingOrEmail", q)
  if (status) params.set("status", status)
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  
  const queryString = params.toString() ? `?${params}` : ""
  const shipments = await apiCall(`/api/admin/shipments${queryString}`, { auth: true })
  
  // Transform to match UI expectations (add pagination)
  const total = shipments.length
  const start = (page - 1) * limit
  const items = shipments.slice(start, start + limit)
  
  return { items, total, page, limit }
}

// Get single shipment (admin view)
export async function getShipment(tracking) {
  return await apiCall(`/api/admin/tracking/${encodeURIComponent(tracking)}`, { auth: true })
}

// Get shipment events (admin view)
export async function getShipmentEvents(tracking) {
  return await apiCall(`/api/admin/tracking/${encodeURIComponent(tracking)}/events`, { auth: true })
}

// Create new shipment
export async function createShipment(data) {
  const payload = {
    origin: data.origin,
    destination: data.destination,
    eta: data.eta,
    customerEmail: data.customerEmail,
    actor: "admin@company.com", // Default actor
    note: data.note || "Shipment created"
  }
  
  return await apiCall("/api/admin/shipments", {
    method: "POST",
    auth: true,
    body: payload
  })
}

// Change shipment status
export async function changeStatus(tracking, toStatus, note = "") {
  return await apiCall(`/api/admin/shipments/${encodeURIComponent(tracking)}/status`, {
    method: "PATCH",
    auth: true,
    body: { status: toStatus, note: note || `Status changed to ${toStatus}` }
  })
}

// Update ETA
export async function updateEta(tracking, isoString) {
  return await apiCall(`/api/admin/shipments/${encodeURIComponent(tracking)}/ETA`, {
    method: "PATCH",
    auth: true,
    body: { eta: isoString }
  })
}

// Add note to shipment
export async function addNote(tracking, note) {
  return await apiCall(`/api/admin/shipments/${encodeURIComponent(tracking)}/note`, {
    method: "PATCH",
    auth: true,
    body: { note }
  })
}

// Mark shipment as delayed
export async function markDelayed(tracking) {
  return await apiCall(`/api/admin/shipments/${encodeURIComponent(tracking)}/delayed`, {
    method: "PATCH",
    auth: true
  })
}

// Get dashboard counts
export async function getDashboardCounts() {
  return await apiCall("/api/admin/shipments/dashboard-counts", { auth: true })
}

// Get recent activity
export async function getRecentActivity() {
  return await apiCall("/api/admin/shipmentsActivity", { auth: true })
}

// Public endpoints (no auth required)

// Get shipment for public tracking
export async function getShipmentPublic(tracking) {
  return await apiCall(`/api/tracking/${encodeURIComponent(tracking)}`)
}

// Get shipment events for public tracking
export async function getShipmentEventsPublic(tracking) {
  return await apiCall(`/api/tracking/${encodeURIComponent(tracking)}/events`)
}

// Export CSV (client-side generation using real data)
export async function exportCsv(filters = {}) {
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
