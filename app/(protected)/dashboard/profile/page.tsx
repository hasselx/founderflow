import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: userData } = await supabase
    .from("users")
    .select("full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single()

  const profileData = userData || { full_name: "", email: user.email, role: "", avatar_url: "" }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account information and profile details</p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Profile Picture</h2>
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-2xl">
                {(profileData.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <Button variant="outline">Upload Photo</Button>
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              type="text"
              placeholder="Your full name"
              defaultValue={profileData.full_name || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Contact support to change your name</p>
          </div>

          {/* Email Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              defaultValue={profileData.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Your email is managed by your authentication provider</p>
          </div>

          {/* Role Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <div className="px-4 py-2 bg-muted rounded-lg text-foreground font-medium capitalize">
              {profileData.role || "Not set"}
            </div>
            <p className="text-xs text-muted-foreground">Your startup role (Founder, Co-founder, etc.)</p>
          </div>

          {/* Change Role Button */}
          <div className="pt-4 border-t border-border">
            <Link href="/auth/role-select">
              <Button className="w-full">Change Role & Interests</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
