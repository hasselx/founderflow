"use client"

import { Home, Lightbulb, LogOut, TrendingUp, ChevronDown, Settings, HelpCircle, Menu, X, BookOpen } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import Dock from "@/components/ui/dock"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavigationProps {
  user: { name: string; email: string }
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "business-plan", label: "Business Plan", icon: Lightbulb, href: "/business-plan" },
    { id: "planner", label: "Project Planner", icon: TrendingUp, href: "/project-planner" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, href: "/knowledge-base" },
  ]

  const dockItems = navItems.map((item) => ({
    icon: <item.icon className="w-6 h-6" />,
    label: item.label,
    onClick: () => handleNavigation(item.href),
    isActive: pathname === item.href,
  }))

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const handleNavigation = (href: string) => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleNavigation("/dashboard")}
            >
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                FF
              </div>
              <span className="text-xl font-bold text-foreground">FounderFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Dock items={dockItems} panelHeight={60} baseItemSize={48} magnification={72} />
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent/90 text-primary-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-foreground"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </button>

                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-foreground"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm">Help & Support</span>
                    </button>

                    <div className="border-t border-border pt-2 mt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-2 bg-card">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="h-20" />
    </>
  )
}
