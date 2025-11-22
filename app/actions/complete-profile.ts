"use server"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function completeProfile(role: string, domains: string[]) {
  try {
    // Get authenticated user from server
    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error in complete-profile:", authError)
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] Authenticated user:", user.email)

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Upsert user profile
    const { error: upsertError } = await supabaseAdmin.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (upsertError) {
      console.error("[v0] User upsert error:", upsertError)
      return { success: false, error: upsertError.message }
    }

    // Delete existing domains and insert new ones
    await supabaseAdmin.from("user_domains").delete().eq("user_id", user.id)

    const domainInserts = domains.map((domain: string) => ({
      user_id: user.id,
      domain,
    }))

    const { error: domainError } = await supabaseAdmin.from("user_domains").insert(domainInserts)

    if (domainError) {
      console.error("[v0] Domain insert error:", domainError)
      return { success: false, error: domainError.message }
    }

    console.log("[v0] Profile completed successfully for:", user.email)
    return { success: true }
  } catch (error) {
    console.error("[v0] Profile completion error:", error)
    return { success: false, error: "An error occurred" }
  }
}
