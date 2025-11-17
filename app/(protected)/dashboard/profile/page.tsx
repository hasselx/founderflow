"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
    avatar_url: "",
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
          .select("full_name, email, role, avatar_url")
          .eq("id", user.id)
          .single()

        if (userData) {
          setProfile({
            full_name: userData.full_name || "",
            email: userData.email || user.email || "",
            role: userData.role || "",
            phone: "",
            avatar_url: userData.avatar_url || "",
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        setMessage("File size must be less than 5MB")
        setUploading(false)
        return
      }

      if (!file.type.startsWith('image/')) {
        setMessage("Please upload an image file")
        setUploading(false)
        return
      }

      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage("User not authenticated")
        setUploading(false)
        return
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        if (uploadError.message.includes('not found')) {
          setMessage("Avatar storage not configured. Please contact support.")
        } else {
          setMessage(`Upload error: ${uploadError.message}`)
        }
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Update error:", updateError)
        setMessage(`Update error: ${updateError.message}`)
        return
      }

      setProfile({ ...profile, avatar_url: publicUrl })
      setMessage("Avatar updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("[v0] Error uploading avatar:", error)
      setMessage("Error uploading avatar. Please try again.")
    } finally {
      setUploading(false)
    }
  }

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
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="relative">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Avatar"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF (Max 5MB)</p>
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
