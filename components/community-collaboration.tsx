"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MessageSquare, Heart, Share2, Plus, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Discussion {
  id: string
  title: string
  content: string
  created_at: string
  category: string
  users?: {
    full_name: string
    email: string
  }
}

const CATEGORIES = ["Fundraising", "Product", "Marketing", "Technical", "General"]

export default function CommunityColl() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [formData, setFormData] = useState({ title: "", content: "", category: "General" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      const res = await fetch("/api/community/discussions")
      const data = await res.json()
      setDiscussions(data.discussions || [])
    } catch (error) {
      console.error("[v0] Failed to fetch discussions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/community/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ title: "", content: "", category: "General" })
        setShowNewDiscussion(false)
        await fetchDiscussions()
      }
    } catch (error) {
      console.error("[v0] Failed to submit discussion:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Community & Collaboration</h2>
          <p className="text-muted-foreground">Connect with founders, share insights, and collaborate on ideas</p>
        </div>

        <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Start Discussion
        </Button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <h3 className="font-bold text-foreground">Start a New Discussion</h3>
          <form onSubmit={handleSubmitDiscussion} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's on your mind?"
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? "Posting..." : "Post Discussion"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNewDiscussion(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : discussions.length > 0 ? (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {discussion.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{discussion.title}</h3>
                  <p className="text-muted-foreground">{discussion.content}</p>
                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span>{discussion.users?.full_name || "Anonymous"}</span>
                    <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No discussions yet. Start one to connect with the community!</p>
          </div>
        )}
      </div>
    </div>
  )
}
