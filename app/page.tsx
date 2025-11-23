"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getSupabaseClient } = await import("@/lib/supabase/client")
        const supabase = getSupabaseClient()

        if (!supabase) {
          console.warn("[v0] Supabase client not available, showing landing page")
          setIsChecking(false)
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.warn("[v0] Auth check unavailable, showing landing page:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
