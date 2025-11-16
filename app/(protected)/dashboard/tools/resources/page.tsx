"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from "@/lib/supabase/client"

interface ResourceItem {
  name: string
  role: string
}

interface Integration {
  name: string
  key: string
  configured: boolean
}

interface ResourceCategory {
  category: string
  items: ResourceItem[]
}

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<ResourceCategory[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [slackConfig, setSlackConfig] = useState({
    appId: "",
    clientId: "",
    clientSecret: "",
    signingSecret: "",
    verificationToken: "",
    botToken: "",
    channelId: ""
  })
  const [slackMembers, setSlackMembers] = useState<string[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const handleSaveSlackConfig = async () => {
    if (!slackConfig.botToken) {
      alert("Please enter at least the Bot User OAuth Token")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/integrations/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackConfig),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save Slack configuration")
        return
      }

      setIntegrations(prev =>
        prev.map((i) =>
          i.key === "slack" ? { ...i, configured: true } : i
        )
      )
      alert("Slack configuration saved successfully!")
    } catch (error) {
      console.error("[v0] Slack save error:", error)
      alert("Failed to save Slack configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlackMember = async () => {
    if (!newMemberEmail || !slackConfig.botToken) {
      alert("Please configure Slack first and enter a valid email")
      return
    }

    try {
      const res = await fetch("/api/integrations/slack/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: newMemberEmail,
          channelId: slackConfig.channelId 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSlackMembers([...slackMembers, newMemberEmail])
        setNewMemberEmail("")
        alert("Invitation sent successfully!")
      } else {
        alert(data.error || "Failed to invite member")
      }
    } catch (error) {
      console.error("[v0] Slack invite error:", error)
      alert("Failed to invite member")
    }
  }

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        try {
          const slackRes = await fetch("/api/integrations/slack")
          const slackData = await slackRes.json()
          
          let isConfigured = false
          if (slackData.integration && slackData.integration.config) {
            const config = slackData.integration.config
            setSlackConfig({
              appId: config.app_id || "",
              clientId: config.client_id || "",
              clientSecret: config.client_secret || "",
              signingSecret: config.signing_secret || "",
              verificationToken: config.verification_token || "",
              botToken: config.bot_token || "",
              channelId: config.channel_id || ""
            })
            isConfigured = !!config.bot_token
          }
          
          setIntegrations([
            { name: "Slack", key: "slack", configured: isConfigured },
            { name: "GitHub", key: "github", configured: false },
            { name: "Jira", key: "jira", configured: false },
          ])
        } catch (err) {
          console.error("[v0] Error loading Slack config:", err)
          setIntegrations([
            { name: "Slack", key: "slack", configured: false },
            { name: "GitHub", key: "github", configured: false },
            { name: "Jira", key: "jira", configured: false },
          ])
        }

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
        <p className="text-muted-foreground mb-8">Manage your team, tools, financial resources, and integrations</p>

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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.key} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-foreground">{integration.name}</h3>
                    <div className={`text-sm px-3 py-1 rounded ${integration.configured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {integration.configured ? "Connected" : "Not configured"}
                    </div>
                  </div>

                  {integration.key === "slack" && (
                    <div className="space-y-3">
                      <Input placeholder="App ID" value={slackConfig.appId} onChange={(e) => setSlackConfig({...slackConfig, appId: e.target.value})} />
                      <Input placeholder="Client ID" value={slackConfig.clientId} onChange={(e) => setSlackConfig({...slackConfig, clientId: e.target.value})} />
                      <Input placeholder="Client Secret" type="password" value={slackConfig.clientSecret} onChange={(e) => setSlackConfig({...slackConfig, clientSecret: e.target.value})} />
                      <Input placeholder="Signing Secret" type="password" value={slackConfig.signingSecret} onChange={(e) => setSlackConfig({...slackConfig, signingSecret: e.target.value})} />
                      <Input placeholder="Bot User OAuth Token" type="password" value={slackConfig.botToken} onChange={(e) => setSlackConfig({...slackConfig, botToken: e.target.value})} />
                      <Input placeholder="Channel ID" value={slackConfig.channelId} onChange={(e) => setSlackConfig({...slackConfig, channelId: e.target.value})} />
                      <div className="text-sm text-muted-foreground">Scopes: channels:history, channels:read, chat:write, im:history, im:read, users:read, users:read.email, channels:write.invites, chat:write</div>
                      <Button className="w-full" onClick={handleSaveSlackConfig} disabled={loading}>
                        {loading ? "Saving..." : "Save Slack Configuration"}
                      </Button>

                      {integration.configured && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-medium text-foreground mb-3">Add Team Members to Slack</h4>
                          <div className="flex gap-2 mb-3">
                            <Input 
                              placeholder="Email address" 
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleAddSlackMember()
                              }}
                            />
                            <Button onClick={handleAddSlackMember}>
                              <Plus className="w-4 h-4 mr-2" />
                              Invite
                            </Button>
                          </div>
                          {slackMembers.length > 0 && (
                            <div className="space-y-2">
                              {slackMembers.map((email, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span className="text-sm">{email}</span>
                                  <button 
                                    onClick={() => setSlackMembers(slackMembers.filter((_, i) => i !== idx))}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
