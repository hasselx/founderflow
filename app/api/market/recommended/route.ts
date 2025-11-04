import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

async function fetchStartupData(domain: string) {
  try {
    const instaRes = await fetch(
      `https://api.instabase.com/v1/companies?domain=${encodeURIComponent(domain)}&limit=5&api_key=${process.env.INSTA_API_KEY}`,
    ).catch(() => null)

    if (instaRes?.ok) {
      return await instaRes.json()
    }
    return null
  } catch (error) {
    console.error("[v0] InstaAPI fetch error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ideaDescription, userRole, domains } = await request.json()

    const startupData = await fetchStartupData(domains[0] || "technology")

    const prompt = startupData
      ? `Based on this startup idea: "${ideaDescription}" and these similar companies: ${JSON.stringify(startupData.companies?.slice(0, 3))}
      
      User role: ${userRole}
      Interested domains: ${domains.join(", ")}
      
      Provide a JSON response with the following structure:
      {
        "marketOpportunity": {
          "title": "string",
          "description": "string",
          "marketGrowth": "percentage",
          "avgFunding": "string",
          "relatedTags": ["tag1", "tag2"]
        },
        "similarStartups": [
          {
            "name": "string",
            "description": "string",
            "fundingRaised": "string",
            "founders": ["name1", "name2"],
            "matchPercentage": number
          }
        ]
      }
      
      Return ONLY valid JSON, no other text.`
      : `Based on this startup idea: "${ideaDescription}" 
      
      User role: ${userRole}
      Interested domains: ${domains.join(", ")}
      
      Provide a JSON response with the following structure:
      {
        "marketOpportunity": {
          "title": "string",
          "description": "string",
          "marketGrowth": "percentage",
          "avgFunding": "string",
          "relatedTags": ["tag1", "tag2"]
        },
        "similarStartups": [
          {
            "name": "string",
            "description": "string",
            "fundingRaised": "string",
            "founders": ["name1", "name2"],
            "matchPercentage": number
          }
        ]
      }
      
      Return ONLY valid JSON, no other text.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the JSON response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const recommendations = JSON.parse(cleanedText)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("[v0] Recommendation error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
