import { NextResponse, NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("user_integrations")
      .upsert(
        {
          user_id: user.id,
          service: "slack",
          config: {
            app_id: body.appId,
            client_id: body.clientId,
            client_secret: body.clientSecret,
            signing_secret: body.signingSecret,
            verification_token: body.verificationToken,
            bot_token: body.botToken,
            channel_id: body.channelId,
          },
          active: !!body.botToken,
        },
        { onConflict: "user_id,service" }
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Slack config error:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Slack configuration saved successfully",
      data,
    })
  } catch (error) {
    console.error("[v0] Slack config save error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save Slack configuration" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("service", "slack")
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ integration: data || null })
  } catch (error) {
    console.error("[v0] Slack config fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Slack configuration" },
      { status: 500 }
    )
  }
}
