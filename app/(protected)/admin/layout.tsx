"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BarChart3, MessageSquare, BookOpen, LogOut } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
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

        const { data: userData } = await supabase.from("users").select("is_admin").eq("id", authUser.id).single()

        if (!userData?.is_admin) {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("[v0] Error checking admin access:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        router.push("/")
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const adminNavigation = [
    { label: "Dashboard", href: "/admin", icon: BarChart3 },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { label: "Business Insights", href: "/admin/insights", icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/admin")}
            >
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                A
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">Admin Panel</span>
            </div>

            <div className="flex items-center gap-2">
              {adminNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button key={item.href} variant="ghost" className="gap-2" onClick={() => router.push(item.href)}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                )
              })}
            </div>

            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
