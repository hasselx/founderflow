"use client"

import * as React from "react"

const THEME_STORAGE_KEY = "founderflow-theme"

type Theme = "light" | "dark"

interface UserThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isLoading: boolean
}

const UserThemeContext = React.createContext<UserThemeContextType | undefined>(undefined)

export function useUserTheme() {
  const context = React.useContext(UserThemeContext)
  if (!context) {
    throw new Error("useUserTheme must be used within a UserThemeProvider")
  }
  return context
}

interface UserThemeProviderProps {
  children: React.ReactNode
}

export function UserThemeProvider({ children }: UserThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>("light")
  const [isLoading, setIsLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  // Apply theme to DOM
  const applyTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }, [])

  // Set theme and save to server
  const setTheme = React.useCallback(
    async (newTheme: Theme) => {
      applyTheme(newTheme)

      // Save to server for cross-device sync
      try {
        await fetch("/api/user/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        })
      } catch (error) {
        console.error("[v0] Failed to save theme to server:", error)
      }
    },
    [applyTheme],
  )

  // Fetch user's theme preference from server on mount
  React.useEffect(() => {
    setMounted(true)

    const fetchUserTheme = async () => {
      setIsLoading(true)

      try {
        // Fetch from server - this is the user's actual preference
        const response = await fetch("/api/user/preferences")

        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            // User has a saved preference - apply it
            applyTheme(data.theme)
            setIsLoading(false)
            return
          }
        }

        // No server preference found - check localStorage as fallback
        const localTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
        if (localTheme) {
          applyTheme(localTheme)
        } else {
          // Use system preference as default
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          applyTheme(systemTheme)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch theme:", error)
        // Fallback to localStorage or system preference
        const localTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
        if (localTheme) {
          applyTheme(localTheme)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserTheme()
  }, [applyTheme])

  if (!mounted) {
    return null
  }

  return <UserThemeContext.Provider value={{ theme, setTheme, isLoading }}>{children}</UserThemeContext.Provider>
}

// Helper to clear theme on logout
export function clearThemeOnLogout() {
  localStorage.removeItem(THEME_STORAGE_KEY)
  document.documentElement.classList.remove("dark")
}
