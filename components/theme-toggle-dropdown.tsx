"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { Toggle } from "@/components/ui/toggle"

const THEME_STORAGE_KEY = "founderflow-theme"

export function ThemeToggleDropdown() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchThemeFromServer = useCallback(async () => {
    try {
      const response = await fetch("/api/user/preferences")
      if (response.ok) {
        const data = await response.json()
        if (data.theme) {
          return data.theme as "light" | "dark"
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch theme from server:", error)
    }
    return null
  }, [])

  const saveThemeToServer = useCallback(async (newTheme: "light" | "dark") => {
    try {
      setIsSyncing(true)
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch (error) {
      console.error("[v0] Failed to save theme to server:", error)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }, [])

  useEffect(() => {
    setMounted(true)

    const initTheme = async () => {
      // First check localStorage for immediate display
      const localTheme = localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null

      if (localTheme) {
        applyTheme(localTheme)
      }

      // Then fetch from server for cross-device sync
      const serverTheme = await fetchThemeFromServer()

      if (serverTheme) {
        // Server theme takes priority for cross-device uniformity
        applyTheme(serverTheme)
      } else if (!localTheme) {
        // No server or local theme, use system preference
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        applyTheme(systemTheme)
      }
    }

    initTheme()
  }, [applyTheme, fetchThemeFromServer])

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    applyTheme(newTheme)
    // Save to server for cross-device sync
    await saveThemeToServer(newTheme)
  }

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="w-full justify-start gap-3 px-4 py-2 h-auto data-[state=on]:bg-muted"
      disabled={isSyncing}
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <span className="text-sm">{isSyncing ? "Syncing..." : isDark ? "Dark Mode" : "Light Mode"}</span>
    </Toggle>
  )
}
