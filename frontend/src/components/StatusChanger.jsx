"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { allowedTransitions } from "@/lib/status"
import { useToast } from "@/hooks/use-toast"

export function StatusChanger({ currentStatus, tracking, onStatusChange = null, trigger = null }) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const allowedStatuses = allowedTransitions[currentStatus] || []

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await onStatusChange?.(tracking, selectedStatus, note)
      toast({
        title: "Success",
        description: `Status changed to ${selectedStatus.replace(/_/g, " ")}`,
      })
      setOpen(false)
      setSelectedStatus("")
      setNote("")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (allowedStatuses.length === 0) {
    return null // No transitions available
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Change Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedStatus}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
