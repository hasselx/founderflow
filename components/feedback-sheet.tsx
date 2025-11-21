"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, Send } from "lucide-react"
import { submitFeedback } from "@/app/actions/submit-feedback"

export function FeedbackSheet() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject.trim() || !formData.message.trim()) {
      setMessage("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      setMessage("")

      const result = await submitFeedback(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to submit feedback")
      }

      setMessage("Thank you for your feedback! We'll review it soon.")
      setFormData({ subject: "", message: "", category: "general" })

      setTimeout(() => {
        setOpen(false)
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      setMessage(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <MessageSquare className="w-4 h-4" />
          Send Feedback
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Send Feedback</SheetTitle>
          <SheetDescription>
            Share your thoughts, report bugs, or suggest new features. Your feedback helps us improve!
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Subject <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Brief description of your feedback"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Message <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Tell us more about your feedback..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              required
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.includes("Thank you")
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Send Feedback"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
