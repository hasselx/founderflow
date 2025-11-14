"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getSupabaseClient } from "@/lib/supabase/client"

const AVAILABLE_DOMAINS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "SaaS",
  "AI/ML",
  "Blockchain",
  "IoT",
  "Green Energy",
  "Real Estate",
  "Travel",
]

export default function PreferencesPage() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchUserDomains = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase.from("user_domains").select("domain").eq("user_id", user.id)

          if (data) {
            setSelectedDomains(data.map((d) => d.domain))
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching domains:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDomains()
  }, [])

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains((prev) => {
      const updated = prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
      handleSavePreferences(updated)
      return updated
    })
  }

  const handleSavePreferences = async (domains: string[]) => {
    try {
      setSaving(true)
      setMessage("")

      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Delete existing domains
      await supabase.from("user_domains").delete().eq("user_id", user.id)

      // Insert new domains
      if (domains.length > 0) {
        await supabase.from("user_domains").insert(
          domains.map((domain) => ({
            user_id: user.id,
            domain,
          })),
        )
      }

      setMessage("Preferences updated!")
      setTimeout(() => setMessage(""), 2000)
    } catch (error) {
      console.error("[v0] Error saving preferences:", error)
      setMessage("Error saving preferences. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Preferences</h1>
        <p className="text-muted-foreground mb-8">Select the industries and topics you're interested in</p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Interested Topics</h2>
            <p className="text-sm text-muted-foreground">
              Select topics that interest you to personalize your experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_DOMAINS.map((domain) => (
                <label
                  key={domain}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedDomains.includes(domain)}
                    onCheckedChange={() => handleDomainToggle(domain)}
                  />
                  <span className="text-foreground font-medium">{domain}</span>
                </label>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.includes("successfully")
                  ? "bg-green-500/10 text-green-700"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message}
            </div>
          )}

          {/* <div className="flex gap-4 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  )
}
