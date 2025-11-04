import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { startupInfo } = await request.json()

    if (!startupInfo || startupInfo.trim().length === 0) {
      return Response.json({ error: "Startup info is required" }, { status: 400 })
    }

    const { text: executiveSummary } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup: "${startupInfo}"
      
Write a compelling 3-4 sentence executive summary for a pitch deck that:
1. Captures the core problem
2. Presents your unique solution
3. Shows market opportunity
4. Hints at traction/team strength

Make it punchy and investor-ready.`,
    })

    const { text: pitchOutline } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup: "${startupInfo}"
      
Create a complete pitch deck outline with bullet points for:
1. Problem (2-3 bullets)
2. Solution (2-3 bullets)
3. Market Size (TAM/SAM/SOM)
4. Business Model (2-3 revenue streams)
5. Go-to-Market Strategy (key channels)
6. Competitive Advantage (3-4 differentiators)
7. Financial Projections (3-year summary)
8. Use of Funds (how you'll spend the investment)

Be data-driven and specific.`,
    })

    const { text: investorPitch } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup: "${startupInfo}"
      
Write a 2-3 paragraph investor pitch that:
1. Opens with a compelling hook
2. Explains the massive opportunity
3. Shows why your team can execute
4. Ends with clear call-to-action

Sound confident and specific.`,
    })

    return Response.json({
      executiveSummary,
      pitchOutline,
      investorPitch,
    })
  } catch (error) {
    console.error("Pitch generation error:", error)
    return Response.json({ error: "Failed to generate pitch" }, { status: 500 })
  }
}
