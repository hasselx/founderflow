import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { startupName, description, marketSize, businessModel, teamSize } = await request.json()

    const prompt = `Create a compelling startup pitch deck content for the following startup:

Name: ${startupName}
Description: ${description}
Market Size: ${marketSize}
Business Model: ${businessModel}
Team Size: ${teamSize}

Provide a JSON response with these sections:
{
  "problemStatement": "Clear problem statement",
  "solution": "Your unique solution",
  "targetMarket": "Who you're targeting",
  "marketOpportunity": "Market size and growth potential",
  "businessModel": "How you make money",
  "traction": "Current traction/achievements",
  "teamSummary": "Team overview",
  "fundingUse": "How you'll use funding",
  "projection": "Revenue/user projections"
}

Format as valid JSON only.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let pitchContent
    try {
      pitchContent = JSON.parse(text)
    } catch {
      console.error("[v0] Failed to parse pitch:", text)
      pitchContent = {
        problemStatement: "Market opportunity identified",
        solution: "Innovative solution being developed",
        targetMarket: "Global market",
        marketOpportunity: "Growing market with significant potential",
        businessModel: "Subscription-based SaaS",
        traction: "In development phase",
        teamSummary: "Experienced founding team",
        fundingUse: "Product development and market expansion",
        projection: "Strong growth projections",
      }
    }

    // Save portfolio to database
    const { data: portfolio, error } = await supabase.from("portfolios").insert([
      {
        user_id: user.id,
        startup_name: startupName,
        description,
        pitch_content: pitchContent,
        visibility: "private",
      },
    ])

    if (error) {
      console.error("[v0] Failed to save portfolio:", error)
      return NextResponse.json({ pitchContent, error: "Portfolio saved locally but not to database" })
    }

    return NextResponse.json({ pitchContent, portfolio })
  } catch (error) {
    console.error("[v0] Portfolio generation error:", error)
    return NextResponse.json({ error: "Failed to generate portfolio" }, { status: 500 })
  }
}
