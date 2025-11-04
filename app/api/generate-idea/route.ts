import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { idea } = await request.json()

    if (!idea || idea.trim().length === 0) {
      return Response.json({ error: "Idea is required" }, { status: 400 })
    }

    const { text: executiveSummary } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Based on this startup idea: "${idea}"
      
Write a concise executive summary (2-3 sentences) that clearly describes the business, the problem it solves, and why it matters. Be direct and compelling.`,
    })

    const { text: valueProposition } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup: "${idea}"
      
Create a concise value proposition (1-2 sentences) that highlights key benefits and differentiators from competitors.`,
    })

    const { text: targetMarket } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup: "${idea}"
      
Define the target market including:
- Primary customer segments (2-3 segments)
- Estimated Total Addressable Market (TAM)
- Specific pain points they face
Be concise and data-oriented when possible.`,
    })

    return Response.json({
      executiveSummary,
      valueProposition,
      targetMarket,
    })
  } catch (error) {
    console.error("Generation error:", error)
    return Response.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
