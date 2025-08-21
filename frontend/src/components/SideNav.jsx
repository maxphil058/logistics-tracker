"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboardIcon, PackageIcon, PlusIcon, LogOutIcon } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "All Shipments",
    href: "/admin/shipments",
    icon: PackageIcon,
  },
  {
    title: "Create Shipment",
    href: "/admin/create",
    icon: PlusIcon,
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-muted/40 border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || (item.href === "/admin/shipments" && pathname.startsWith("/admin/shipments"))

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Back to Site
          </Link>
        </Button>
      </div>
    </div>
  )
}
