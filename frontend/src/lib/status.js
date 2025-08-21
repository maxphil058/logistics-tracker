// Status definitions and transitions for logistics tracking

export const STATUSES = {
  CREATED: "CREATED",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELAYED: "DELAYED",
  EXCEPTION: "EXCEPTION",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}

// Define allowed status transitions
export const allowedTransitions = {
  [STATUSES.CREATED]: [STATUSES.IN_TRANSIT, STATUSES.CANCELLED],
  [STATUSES.IN_TRANSIT]: [STATUSES.OUT_FOR_DELIVERY, STATUSES.DELAYED, STATUSES.EXCEPTION, STATUSES.CANCELLED],
  [STATUSES.OUT_FOR_DELIVERY]: [STATUSES.DELIVERED, STATUSES.DELAYED, STATUSES.EXCEPTION],
  [STATUSES.DELAYED]: [STATUSES.IN_TRANSIT, STATUSES.OUT_FOR_DELIVERY, STATUSES.EXCEPTION, STATUSES.CANCELLED],
  [STATUSES.EXCEPTION]: [STATUSES.IN_TRANSIT, STATUSES.CANCELLED],
  [STATUSES.DELIVERED]: [], // Terminal state
  [STATUSES.CANCELLED]: [], // Terminal state
}

// Badge styling variants for each status
export const badgeVariants = {
  [STATUSES.CREATED]: "secondary", // gray
  [STATUSES.IN_TRANSIT]: "default", // blue
  [STATUSES.OUT_FOR_DELIVERY]: "default", // indigo
  [STATUSES.DELAYED]: "destructive", // orange/red
  [STATUSES.EXCEPTION]: "destructive", // red
  [STATUSES.DELIVERED]: "default", // green
  [STATUSES.CANCELLED]: "secondary", // slate
}

// Color classes for status badges
export const statusColors = {
  [STATUSES.CREATED]: "bg-gray-100 text-gray-800 border-gray-200",
  [STATUSES.IN_TRANSIT]: "bg-blue-100 text-blue-800 border-blue-200",
  [STATUSES.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-800 border-indigo-200",
  [STATUSES.DELAYED]: "bg-orange-100 text-orange-800 border-orange-200",
  [STATUSES.EXCEPTION]: "bg-red-100 text-red-800 border-red-200",
  [STATUSES.DELIVERED]: "bg-green-100 text-green-800 border-green-200",
  [STATUSES.CANCELLED]: "bg-slate-100 text-slate-800 border-slate-200",
}
