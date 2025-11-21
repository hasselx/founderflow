"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Trash2 } from "lucide-react"

interface Feedback {
  id: string
  subject: string
  message: string
  category: string
  status: string
  created_at: string
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchFeedbacks()
  }, [filter])

  const fetchFeedbacks = async () => {
    try {
      const supabase = getSupabaseClient()
      let query = supabase.from("user_feedback").select("*").order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setFeedbacks(data || [])
    } catch (error) {
      console.error("[v0] Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase.from("user_feedback").delete().eq("id", id)
      setFeedbacks(feedbacks.filter((f) => f.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting feedback:", error)
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700",
    resolved: "bg-green-500/10 text-green-700",
    in_progress: "bg-blue-500/10 text-blue-700",
  }

  const categoryColors: Record<string, string> = {
    bug: "bg-red-500/10 text-red-700",
    feature: "bg-purple-500/10 text-purple-700",
    improvement: "bg-blue-500/10 text-blue-700",
    general: "bg-gray-500/10 text-gray-700",
    question: "bg-cyan-500/10 text-cyan-700",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Feedback Management</h1>
        <p className="text-muted-foreground">View and manage user feedback</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "in_progress", "resolved"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No feedback found</p>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{feedback.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{feedback.message}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(feedback.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={categoryColors[feedback.category] || categoryColors.general}>
                    {feedback.category}
                  </Badge>
                  <Badge className={statusColors[feedback.status] || statusColors.pending}>{feedback.status}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
