"use client"

import Navigation from "@/components/navigation"
import PortfolioBuilderPage from "@/components/portfolio-builder-page"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function PortfolioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ name: "User", email: "" })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/")
        return
      }

      setUser({
        name: authUser.user_metadata?.full_name || "User",
        email: authUser.email || "",
      })
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="portfolio" onPageChange={() => {}} user={user} />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortfolioBuilderPage />
      </div>
    </div>
  )
}
