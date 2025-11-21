"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, Edit2 } from "lucide-react"

interface BusinessInsight {
  id: string
  title: string
  category: string
  content: string
  is_published: boolean
  views: number
  created_at: string
}

export default function BusinessInsightsManagement() {
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    content: "",
    is_published: false,
  })

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("business_insights")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      console.error("[v0] Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        alert("Please fill in all required fields")
        return
      }

      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (editingId) {
        const { error } = await supabase.from("business_insights").update(formData).eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("business_insights").insert({
          ...formData,
          author_id: user.id,
        })

        if (error) throw error
      }

      setFormData({ title: "", category: "general", content: "", is_published: false })
      setEditingId(null)
      setIsAdding(false)
      await fetchInsights()
    } catch (error) {
      console.error("[v0] Error saving insight:", error)
      alert("Failed to save insight")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      await supabase.from("business_insights").delete().eq("id", id)
      setInsights(insights.filter((i) => i.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting insight:", error)
    }
  }

  const handleEdit = (insight: BusinessInsight) => {
    setFormData({
      title: insight.title,
      category: insight.category,
      content: insight.content,
      is_published: insight.is_published,
    })
    setEditingId(insight.id)
    setIsAdding(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Insights</h1>
          <p className="text-muted-foreground">Create and manage business wisdom content</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Insight
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 space-y-4 bg-muted/50">
          <h3 className="font-semibold text-foreground">{editingId ? "Edit" : "Add"} Business Insight</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
              <Input
                placeholder="Enter title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="startup">Startup Tips</option>
                <option value="funding">Funding</option>
                <option value="marketing">Marketing</option>
                <option value="product">Product</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
              <Textarea
                placeholder="Enter detailed content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">Publish immediately</span>
            </label>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData({ title: "", category: "general", content: "", is_published: false })
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Insight</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No insights yet. Create one to get started!</p>
          </Card>
        ) : (
          insights.map((insight) => (
            <Card key={insight.id} className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{insight.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(insight)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(insight.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={insight.is_published ? "default" : "outline"}>
                    {insight.is_published ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">{insight.category}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {insight.views} views • {new Date(insight.created_at).toLocaleDateString()}
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
