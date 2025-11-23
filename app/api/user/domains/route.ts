import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ domains: [] }, { status: 200 })
    }

    const { data, error } = await supabase.from("user_domains").select("domain").eq("user_id", user.id)

    if (error) throw error

    const domains = Array.from(new Set(data?.map((d) => d.domain) || []))

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("[v0] Error fetching user domains:", error)
    return NextResponse.json({ domains: [] }, { status: 200 })
  }
}
