"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function EtaDialog({ currentEta, tracking, onEtaChange = null, trigger = null }) {
  const [open, setOpen] = useState(false)
  const [eta, setEta] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleOpen = (isOpen) => {
    setOpen(isOpen)
    if (isOpen && currentEta) {
      // Convert ISO string to datetime-local format
      const date = new Date(currentEta)
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setEta(localDateTime)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!eta) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Convert datetime-local to ISO string
      const isoString = new Date(eta).toISOString()
      await onEtaChange?.(tracking, isoString)
      toast({
        title: "Success",
        description: "ETA updated successfully",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ETA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Update ETA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update ETA</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eta">Expected Delivery Date & Time</Label>
            <Input id="eta" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !eta}>
              {isLoading ? "Updating..." : "Update ETA"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
