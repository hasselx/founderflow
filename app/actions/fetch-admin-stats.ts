"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface DashboardStats {
  totalFeedback: number
  totalInsights: number
  totalUsers: number
  averageSentiment: number
}

export async function fetchAdminStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient()

    // Fetch feedback count
    const { count: feedbackCount } = await supabase.from("user_feedback").select("*", { count: "exact", head: true })

    // Fetch insights count
    const { count: insightsCount } = await supabase
      .from("business_insights")
      .select("*", { count: "exact", head: true })

    // Fetch users count
    const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Fetch feedback for sentiment analysis
    const { data: feedbackData } = await supabase.from("user_feedback").select("status").limit(100)

    // Simple sentiment calculation (positive: resolved, neutral: pending, negative: others)
    const sentiment =
      feedbackData && feedbackData.length > 0
        ? (feedbackData.filter((f: any) => f.status === "resolved").length / feedbackData.length) * 100
        : 0

    return {
      success: true,
      data: {
        totalFeedback: feedbackCount || 0,
        totalInsights: insightsCount || 0,
        totalUsers: usersCount || 0,
        averageSentiment: Math.round(sentiment) / 10,
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching admin stats:", error)
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}
