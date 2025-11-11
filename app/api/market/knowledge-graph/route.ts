import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "startup"

  try {
    const response = await fetch(
      `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_KNOWLEDGE_GRAPH_KEY}&limit=5`,
    )

    if (!response.ok) {
      throw new Error("Google Knowledge Graph API error")
    }

    const data = await response.json()

    return NextResponse.json({
      query,
      results:
        data.itemListElement?.map((item: any) => ({
          name: item.result.name,
          description: item.result.description,
          image: item.result.image?.contentUrl,
          detailedDescription: item.result.detailedDescription?.articleBody,
        })) || [],
    })
  } catch (error) {
    console.error("[v0] Google Knowledge Graph error:", error)
    return NextResponse.json({ error: "Failed to fetch knowledge graph data" }, { status: 500 })
  }
}
