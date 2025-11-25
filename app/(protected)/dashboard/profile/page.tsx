"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Upload, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedbackSheet } from "@/components/feedback-sheet"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
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
          .select("full_name, email, role, avatar_url, phone")
          .eq("id", user.id)
          .single()

        if (userData) {
          setProfile({
            full_name: userData.full_name || "",
            email: userData.email || user.email || "",
            role: userData.role || "",
            phone: userData.phone || "",
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setMessage("")
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        setMessage("File size must be less than 5MB")
        setUploading(false)
        return
      }

      if (!file.type.startsWith("image/")) {
        setMessage("Please upload an image file")
        setUploading(false)
        return
      }

      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setMessage("User not authenticated")
        setUploading(false)
        return
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        if (uploadError.message.includes("not found") || uploadError.message.includes("Bucket")) {
          setMessage(
            "Avatar storage bucket not configured. Please run the SQL script and create the 'avatars' bucket in Supabase Dashboard.",
          )
        } else {
          setMessage(`Upload error: ${uploadError.message}`)
        }
        return
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id)

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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
          phone: profile.phone,
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
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Hover overlay */}
                <div
                  onClick={handleAvatarClick}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="gap-2 bg-transparent"
                  onClick={handleAvatarClick}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF (Max 5MB)</p>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
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
            <p className="text-xs text-muted-foreground">Optional - used for account recovery</p>
          </div>

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
                <SelectItem value="creator">Creator / Founder</SelectItem>
                <SelectItem value="community_member">Community Member</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Your role in the startup ecosystem</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.includes("successfully")
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
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

        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Feedback & Support</h2>
          <p className="text-muted-foreground mb-4">
            Have suggestions or found a bug? Let us know! Your feedback helps us improve the platform.
          </p>
          <FeedbackSheet />
        </div>
      </div>
    </div>
  )
}
