import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    await supabase.auth.signOut()

    const cookieStore = await cookies()
    cookieStore.delete("sb-uwcifjtvhrbqrhfwtjtc-auth-token")

    return NextResponse.json({ success: true, redirectUrl: "/" })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}
