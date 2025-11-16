import { NextResponse, NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, channelId } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get user's Slack configuration
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("config")
      .eq("user_id", user.id)
      .eq("integration_name", "slack")
      .single()

    if (!integration || !integration.config.bot_token) {
      return NextResponse.json({ error: "Slack not configured" }, { status: 400 })
    }

    // Call Slack API to invite user
    const slackResponse = await fetch("https://slack.com/api/admin.users.invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${integration.config.bot_token}`
      },
      body: JSON.stringify({
        email,
        channel_ids: channelId ? [channelId] : [],
        team_id: integration.config.team_id
      })
    })

    const slackData = await slackResponse.json()

    if (!slackData.ok) {
      return NextResponse.json(
        { error: slackData.error || "Failed to invite user to Slack" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: slackData })
  } catch (error) {
    console.error("[v0] Slack invite error:", error)
    return NextResponse.json(
      { error: "Failed to invite user to Slack" },
      { status: 500 }
    )
  }
}
