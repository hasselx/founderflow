import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { industry } = await request.json()

    if (!industry || industry.trim().length === 0) {
      return Response.json({ error: "Industry is required" }, { status: 400 })
    }

    const { text: marketInsights } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Analyze the ${industry} market and provide:
1. Current market size estimation
2. Growth rate (YoY percentage)
3. Top 3 market opportunities
4. Key market trends

Be concise and data-driven. Format as clear bullet points.`,
    })

    const { text: competitiveAnalysis } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For a startup in the ${industry} space, identify:
1. Top 5 direct competitors
2. Their key strengths
3. Potential market gaps/weaknesses
4. Differentiation opportunities for new entrants

Be strategic and identify actionable opportunities.`,
    })

    return Response.json({
      marketInsights,
      competitiveAnalysis,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
