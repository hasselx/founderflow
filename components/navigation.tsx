"use client"

import { Zap, BarChart3, Lightbulb, Users, FileText, Compass, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: any) => void
  user: { name: string; email: string }
}

export default function Navigation({ currentPage, onPageChange, user }: NavigationProps) {
  const router = useRouter()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "idea", label: "Submit Idea", icon: Lightbulb },
    { id: "competitor", label: "Market Research", icon: Compass },
    { id: "planner", label: "Project Planner", icon: FileText },
    { id: "portfolio", label: "Portfolio", icon: Zap },
    { id: "community", label: "Community", icon: Users },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Updated to use SVG community icon */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange("dashboard")}
          >
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              FF
            </div>
            <span className="text-xl font-bold text-foreground">FounderFlow</span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent text-primary-foreground flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
