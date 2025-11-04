import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { userProfile } = await request.json()

    if (!userProfile || userProfile.trim().length === 0) {
      return Response.json({ error: "User profile is required" }, { status: 400 })
    }

    const { text: matches } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Based on this founder profile: "${userProfile}"
      
Generate 5 ideal co-founder matches with:
1. Complementary skills needed
2. Personality traits that would work well
3. What experience level they should have
4. Key qualities to look for in interviews

Be specific and practical.`,
    })

    const { text: colabAdvice } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `For a founder with profile: "${userProfile}"
      
Provide advice on:
1. How to find co-founders (top 3 strategies)
2. Questions to ask during co-founder interviews
3. Red flags to watch out for
4. How to structure the co-founder agreement

Be actionable and specific.`,
    })

    return Response.json({
      matches,
      colabAdvice,
    })
  } catch (error) {
    console.error("Co-founder matching error:", error)
    return Response.json({ error: "Failed to generate matches" }, { status: 500 })
  }
}
