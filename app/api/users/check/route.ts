import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role to bypass RLS for user lookup
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, avatar_url")
      .ilike("email", email.trim())
      .single()

    if (error || !user) {
      return NextResponse.json({
        exists: false,
        message: "User not found. They must be registered on the platform first.",
      })
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    console.error("Error checking user:", error)
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 })
  }
}
