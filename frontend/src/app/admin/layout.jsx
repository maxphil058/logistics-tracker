"use client"

import { SideNav } from "@/components/SideNav"
import { Toaster } from "@/components/Toaster"

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <Toaster />
    </div>
  )
}
