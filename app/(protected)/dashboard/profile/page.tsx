"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: userData } = await supabase
          .from("users")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single()

        if (userData) {
          setProfile({
            full_name: userData.full_name || "",
            email: userData.email || user.email || "",
            role: userData.role || "",
            phone: "",
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage("")

      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          role: profile.role,
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      setMessage("Error updating profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account information and profile details</p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Profile Picture</h2>
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              type="text"
              placeholder="Your full name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          {/* Email Section (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Your email is managed by your authentication provider</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Select value={profile.role} onValueChange={(value) => setProfile({ ...profile, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="co-founder">Co-Founder</SelectItem>
                <SelectItem value="solo-entrepreneur">Solo Entrepreneur</SelectItem>
                <SelectItem value="aspiring-founder">Aspiring Founder</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Your role in the startup ecosystem</p>
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

          <div className="pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
