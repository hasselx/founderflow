"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function submitFeedback(formData: { subject: string; message: string; category: string }) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const { subject, message, category } = formData

    if (!subject || !message) {
      return { success: false, error: "Subject and message are required" }
    }

    const { data, error } = await supabase
      .from("user_feedback")
      .insert({
        user_id: user.id,
        subject,
        message,
        category: category || "general",
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating feedback:", error)
      return { success: false, error: "Failed to submit feedback" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in feedback submission:", error)
    return { success: false, error: "Internal server error" }
  }
}
