import { type NextRequest, NextResponse } from "next/server"

async function fetchEducationResources(category: string) {
  try {
    // Fetch from NewsAPI for educational startup content
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(category)} startup education tutorial business&sortBy=publishedAt&language=en&pageSize=10`,
      {
        headers: {
          "X-API-Key": process.env.NEWS_API_KEY || "",
        },
        next: { revalidate: 86400 },
      },
    )

    let resources = []

    if (newsRes?.ok) {
      try {
        const newsData = await newsRes.json()
        resources =
          newsData.articles?.map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            image: article.urlToImage,
            publishedAt: article.publishedAt,
            type: "article",
          })) || []
      } catch (e) {
        console.error("[v0] Failed to parse education resources:", e)
      }
    }

    return {
      category,
      resources,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[v0] Education resources fetch error:", error)
    return {
      category,
      resources: [],
      timestamp: new Date().toISOString(),
      error: "Failed to fetch resources",
    }
  }
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || "startup"

  try {
    const resources = await fetchEducationResources(category)
    return NextResponse.json(resources)
  } catch (error) {
    console.error("[v0] Education API error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
