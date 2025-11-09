"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Heart, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function CommunityPage() {
  const router = useRouter()
  const [discussions, setDiscussions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("discussions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("[v0] Error fetching discussions:", error)
      } else {
        setDiscussions(data || [])
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please sign in to create a discussion")
        return
      }

      const { error } = await supabase.from("discussions").insert({
        user_id: user.id,
        title: newTitle,
        content: newContent,
        category: "general",
        upvotes: 0,
        views: 0,
      })

      if (error) {
        alert("Error creating discussion: " + error.message)
      } else {
        setNewTitle("")
        setNewContent("")
        setShowNewDiscussion(false)
        fetchDiscussions()
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Community</h1>
            <p className="text-muted-foreground">Connect with other founders and mentors</p>
          </div>
          <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)} className="bg-primary">
            New Discussion
          </Button>
        </div>

        {showNewDiscussion && (
          <Card>
            <CardHeader>
              <CardTitle>Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewDiscussion} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Discussion title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Posting..." : "Post Discussion"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDiscussion(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading discussions...</div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No discussions yet. Be the first to start one!
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{discussion.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground line-clamp-2">{discussion.content}</p>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{discussion.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{discussion.upvotes || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
