"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LogoutButton from "@/components/logout-button"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const pathname = usePathname()

  const [userName, setUserName] = React.useState("User")
  const [userEmail, setUserEmail] = React.useState("")
  const [userInitial, setUserInitial] = React.useState("U")

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()
        if (data.user) {
          setUserName(data.user.full_name || "User")
          setUserEmail(data.user.email || "")
          setUserInitial((data.user.full_name || "U").charAt(0).toUpperCase())
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">FF</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">FounderFlow</span>
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant={isActive("/dashboard") ? "default" : "ghost"} className="gap-2">
                  Dashboard
                </Button>
              </Link>
              <Link href="/business-plan">
                <Button variant={isActive("/business-plan") ? "default" : "ghost"} className="gap-2">
                  Business Plan
                </Button>
              </Link>
              <Link href="/project-planner">
                <Button variant={isActive("/project-planner") ? "default" : "ghost"} className="gap-2">
                  Project Planner
                </Button>
              </Link>
              <Link href="/knowledge-base">
                <Button variant={isActive("/knowledge-base") ? "default" : "ghost"} className="gap-2">
                  Knowledge Base
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
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/preferences">Preferences</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  )
}
