"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem("founderflow-theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = (savedTheme as "light" | "dark") || (systemDark ? "dark" : "light")
    
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("founderflow-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Toggle 
      pressed={theme === "dark"} 
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="h-9 w-9"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Toggle>
  )
}
