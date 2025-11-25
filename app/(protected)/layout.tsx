"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Lightbulb, TrendingUp, BookOpen, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LogoutButton from "@/components/logout-button"
import { ThemeToggleDropdown } from "@/components/theme-toggle-dropdown"
import Dock from "@/components/ui/dock"
import { UserThemeProvider } from "@/components/user-theme-provider"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

function ProtectedLayoutContent({ children }: ProtectedLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [userName, setUserName] = React.useState("User")
  const [userEmail, setUserEmail] = React.useState("")
  const [userInitial, setUserInitial] = React.useState("U")
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()
        if (data.user) {
          setUserName(data.user.full_name || "User")
          setUserEmail(data.user.email || "")
          setUserInitial((data.user.full_name || "U").charAt(0).toUpperCase())
          setUserAvatar(data.user.avatar_url || null)
        }
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
      }
    }
    fetchUserData()
  }, [])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" || (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/tools"))
      )
    }
    if (href === "/business-plan") {
      return pathname === "/business-plan" || pathname.startsWith("/business-plan/")
    }
    if (href === "/project-planner") {
      return pathname === "/project-planner" || pathname.startsWith("/project-planner/")
    }
    if (href === "/knowledge-base") {
      return pathname === "/knowledge-base"
    }
    return false
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "business-plan", label: "Business Plan", icon: Lightbulb, href: "/business-plan" },
    { id: "planner", label: "Project Planner", icon: TrendingUp, href: "/project-planner" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, href: "/knowledge-base" },
  ]

  const dockItems = navItems.map((item) => ({
    icon: <item.icon className="w-6 h-6" />,
    label: item.label,
    onClick: () => router.push(item.href),
    isActive: isActive(item.href),
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-[#0d2b81] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">FF</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">FounderFlow</span>
            </Link>

            <div className="hidden md:flex items-center">
              <Dock items={dockItems} panelHeight={60} baseItemSize={48} magnification={72} />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={userAvatar || undefined} alt={userName} />
                      <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium text-foreground">{userName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="font-semibold">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/preferences">Preferences</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground mb-2">Theme</p>
                    <ThemeToggleDropdown />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-2 bg-card">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  )
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <UserThemeProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </UserThemeProvider>
  )
}
