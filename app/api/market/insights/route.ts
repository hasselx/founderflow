import { type NextRequest, NextResponse } from "next/server"

// Fetch real market data from multiple sources
async function fetchMarketData(domain: string) {
  try {
    const marketstackRes = await fetch(
      `http://api.marketstack.com/v1/tickers?access_key=${process.env.MARKETSTACK_API_KEY}&search=${encodeURIComponent(domain)}&limit=5`,
    ).catch(() => null)

    const marketstackData = marketstackRes?.ok ? await marketstackRes.json() : { data: [] }

    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(domain)} market trends startup&sortBy=publishedAt&language=en&pageSize=8`,
      {
        headers: {
          "X-API-Key": process.env.NEWS_API_KEY || "",
        },
      },
    ).catch(() => null)

    const newsData = newsRes?.ok ? await newsRes.json() : { articles: [] }

    // Extract market trends and news
    const insights = {
      domain,
      marketTrends:
        marketstackData.data?.slice(0, 3).map((ticker: any) => ({
          symbol: ticker.symbol,
          name: ticker.name,
          lastUpdate: ticker.last_update,
        })) || [],
      trends:
        newsData.articles?.slice(0, 5).map((article: any) => ({
          title: article.title,
          description: article.description,
          source: article.source.name,
          url: article.url,
          date: article.publishedAt,
          image: article.urlToImage,
        })) || [],
      timestamp: new Date().toISOString(),
    }

    return insights
  } catch (error) {
    console.error("[v0] Market data fetch error:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
  }

  try {
    const insights = await fetchMarketData(domain)

    if (!insights) {
      return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
