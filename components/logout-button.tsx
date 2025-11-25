"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { clearThemeOnLogout } from "./user-theme-provider"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      clearThemeOnLogout()

      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left flex items-center gap-2 text-destructive cursor-pointer px-2 py-1.5 text-sm rounded hover:bg-destructive/10"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  )
}
