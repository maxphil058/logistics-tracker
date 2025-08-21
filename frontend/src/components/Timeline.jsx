"use client"

import { StatusBadge } from "./StatusBadge"
import { formatDateTime, getRelativeTime } from "@/lib/utils"

export function Timeline({ events = [] }) {
  if (events.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No events found</div>
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={`${event.tracking}-${event.at}-${index}`} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1" />
            {index < events.length - 1 && <div className="w-px bg-border flex-1 mt-2" />}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={event.status} />
              <span className="text-sm text-muted-foreground">{getRelativeTime(event.at)}</span>
            </div>

            <p className="text-sm mb-1">{event.note}</p>

            <div className="text-xs text-muted-foreground">
              <div>By: {event.actor}</div>
              <div title={event.at}>{formatDateTime(event.at).local}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
