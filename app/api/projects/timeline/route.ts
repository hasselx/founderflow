import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { projectTitle, description, timeline, teamSize } = await request.json()

    const prompt = `Create a detailed project timeline and implementation roadmap for a startup with these details:
Project: ${projectTitle}
Description: ${description}
Timeline: ${timeline} months
Team Size: ${teamSize} people

Provide a structured JSON response with:
1. phases (array of phases with name, startMonth, endMonth, objectives, deliverables)
2. tasks (array of tasks with title, phase, duration, priority)
3. milestones (array of key milestones)
4. resources (list of resources needed)

Format as valid JSON only, no markdown or explanation.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let timeline_data
    try {
      timeline_data = JSON.parse(text)
    } catch {
      console.error("[v0] Failed to parse AI timeline:", text)
      timeline_data = {
        phases: [],
        tasks: [],
        milestones: [],
        resources: [],
      }
    }

    return NextResponse.json(timeline_data)
  } catch (error) {
    console.error("[v0] Timeline generation error:", error)
    return NextResponse.json({ error: "Failed to generate timeline" }, { status: 500 })
  }
}
