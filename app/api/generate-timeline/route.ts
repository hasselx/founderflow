import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { projectDescription, timeline } = await request.json()

    if (!projectDescription || projectDescription.trim().length === 0) {
      return Response.json({ error: "Project description is required" }, { status: 400 })
    }

    const { text: phases } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this startup project: "${projectDescription}"
      
Create a detailed implementation roadmap with ${timeline || 6} months timeline. For each phase:
1. Phase name
2. Duration (weeks)
3. Key objectives (2-3 bullet points)
4. Main deliverables
5. Success metrics

Format as a structured roadmap. Be realistic and data-driven.`,
    })

    const { text: taskBreakdown } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For this project: "${projectDescription}"
      
Break down the first phase into:
1. Critical path tasks (numbered)
2. Dependencies between tasks
3. Resource requirements
4. Risk factors to watch

Make it actionable and specific.`,
    })

    return Response.json({
      phases,
      taskBreakdown,
    })
  } catch (error) {
    console.error("Timeline generation error:", error)
    return Response.json({ error: "Failed to generate timeline" }, { status: 500 })
  }
}
