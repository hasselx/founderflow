"use client"

import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useUserTheme } from "./user-theme-provider"

export function ThemeToggleDropdown() {
  const { theme, setTheme, isLoading } = useUserTheme()

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  const isDark = theme === "dark"

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="w-full justify-start gap-3 px-4 py-2 h-auto data-[state=on]:bg-muted"
      disabled={isLoading}
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <span className="text-sm">{isLoading ? "Loading..." : isDark ? "Dark Mode" : "Light Mode"}</span>
    </Toggle>
  )
}
