import type React from "react"
import { Calendar, CheckSquare, Users, BarChart3, Bell, Zap, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: userData } = await supabase.from("users").select("full_name, email").eq("id", user.id).single()

  const userName = userData?.full_name || "User"
  const userEmail = userData?.email || user.email || ""
  const userInitial = (userName || "U").charAt(0).toUpperCase()

  const projectTools = [
    { id: "timeline", label: "Timeline", icon: Calendar, href: "#timeline" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, href: "#tasks" },
    { id: "resources", label: "Resources", icon: Users, href: "#resources" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "#analytics" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "#notifications" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">FounderFlow</span>
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="default" className="gap-2">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/business-plan">
                <Button variant="ghost" className="gap-2">
                  Business Plan
                </Button>
              </Link>
              <Link href="/dashboard/project-planner">
                <Button variant="ghost" className="gap-2">
                  Project Planner
                </Button>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                      {userInitial}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-foreground">{userName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="font-semibold">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Left Sidebar - Project Tools */}
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col gap-6 p-6 sticky top-20 h-[calc(100vh-80px)]">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Project Tools</h3>
            <nav className="space-y-2">
              {projectTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
