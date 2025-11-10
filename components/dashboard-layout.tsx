// Keeping for backwards compatibility, but new pages should use the Server Component layout
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, CheckSquare, Users, BarChart3, Bell, Zap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const router = useRouter()
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("")
  const [userInitial, setUserInitial] = useState("U")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/auth/login")
          return
        }

        const { data: userData } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", authUser.id)
          .single()

        if (userData) {
          setUserName(userData.full_name || "User")
          setUserEmail(userData.email || authUser.email || "")
          setUserInitial((userData.full_name || "U").charAt(0).toUpperCase())
        } else {
          setUserEmail(authUser.email || "")
          setUserInitial((authUser.email?.charAt(0) || "U").toUpperCase())
        }
      } catch (error) {
        console.error("[v0] Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const projectTools = [
    { id: "timeline", label: "Timeline", icon: Calendar, href: "#timeline" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, href: "#tasks" },
    { id: "resources", label: "Resources", icon: Users, href: "#resources" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "#analytics" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "#notifications" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/dashboard")}
            >
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">FounderFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={currentPage === "business-plan" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => router.push("/business-plan")}
              >
                Business Plan
              </Button>
              <Button
                variant={currentPage === "project-planner" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => router.push("/planner")}
              >
                Project Planner
              </Button>
            </div>

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
                  <DropdownMenuItem onClick={() => router.push("/profile")}>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/preferences")}>Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col gap-6 p-6 sticky top-20 h-[calc(100vh-80px)]">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Project Tools</h3>
            <nav className="space-y-2">
              {projectTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === tool.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
