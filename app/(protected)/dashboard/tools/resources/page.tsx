"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Loader2, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from "@/lib/supabase/client"

interface ResourceItem {
  name: string
  role: string
}

interface ResourceCategory {
  category: string
  items: ResourceItem[]
}

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: cofounders } = await supabase
          .from("cofounder_profiles")
          .select("id, bio")
          .eq("user_id", user.id)
          .limit(5)

        const teamMembers =
          cofounders?.map((cf) => ({
            name: cf.bio?.split("\n")[0] || "Team Member",
            role: "Team Member",
          })) || []

        const { data: ideas } = await supabase.from("startup_ideas").select("id, business_model").eq("user_id", user.id)

        const toolsSet = new Set<string>()
        ideas?.forEach((idea) => {
          if (idea.business_model) {
            toolsSet.add(idea.business_model)
          }
        })

        const tools = Array.from(toolsSet).map((tool) => ({
          name: tool || "Tool",
          role: "Business Model",
        }))

        setResources([
          {
            category: "Team Members",
            items: teamMembers.length > 0 ? teamMembers : [{ name: "Add team members", role: "Start collaborating" }],
          },
          {
            category: "Tools & Services",
            items: tools.length > 0 ? tools : [{ name: "Add tools", role: "Infrastructure" }],
          },
          {
            category: "Funding & Financial",
            items: [{ name: "Track your funding", role: "Financial management" }],
          },
        ])
      } catch (error) {
        console.error("[v0] Error fetching resources:", error)
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Resources</h1>
        <p className="text-muted-foreground mb-8">Manage your team, tools, and financial resources</p>

        <div className="space-y-6">
          {resources.map((resource) => (
            <Card key={resource.category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {resource.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resource.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
