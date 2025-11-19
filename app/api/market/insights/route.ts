import { type NextRequest, NextResponse } from "next/server"

// Fallback data when API limits are reached
const FALLBACK_MARKET_DATA = {
  FinTech: {
    marketTrends: [
      { symbol: "PYPL", name: "PayPal Holdings", lastUpdate: new Date().toISOString() },
      { symbol: "SQ", name: "Block Inc.", lastUpdate: new Date().toISOString() },
      { symbol: "INTU", name: "Intuit Inc.", lastUpdate: new Date().toISOString() },
    ],
    trends: [
      {
        title: "FinTech Innovation Continues",
        description: "Digital payment solutions reshape financial services",
        source: "Finance Today",
        url: "#",
        date: new Date().toISOString(),
      },
      {
        title: "Blockchain Adoption in Banking",
        description: "Traditional banks explore blockchain technology",
        source: "Crypto News",
        url: "#",
        date: new Date().toISOString(),
      },
    ]
  },
  "AI/ML": {
    marketTrends: [
      { symbol: "NVDA", name: "NVIDIA Corporation", lastUpdate: new Date().toISOString() },
      { symbol: "AMD", name: "AMD Inc.", lastUpdate: new Date().toISOString() },
      { symbol: "MSFT", name: "Microsoft Corporation", lastUpdate: new Date().toISOString() },
    ],
    trends: [
      {
        title: "AI Market Growth Accelerates",
        description: "Artificial intelligence market shows strong growth momentum",
        source: "Tech News Daily",
        url: "#",
        date: new Date().toISOString(),
      },
      {
        title: "Enterprise AI Adoption Rises",
        description: "More companies integrating AI into their core operations",
        source: "Business Intelligence",
        url: "#",
        date: new Date().toISOString(),
      },
    ]
  },
  SaaS: {
    marketTrends: [
      { symbol: "CRM", name: "Salesforce Inc.", lastUpdate: new Date().toISOString() },
      { symbol: "WDAY", name: "Workday Inc.", lastUpdate: new Date().toISOString() },
      { symbol: "SNOW", name: "Snowflake Inc.", lastUpdate: new Date().toISOString() },
    ],
    trends: [
      {
        title: "SaaS Growth Accelerates Post-Pandemic",
        description: "Cloud-based software solutions continue expanding market share",
        source: "Cloud Computing Today",
        url: "#",
        date: new Date().toISOString(),
      },
      {
        title: "AI Integration in SaaS Platforms",
        description: "SaaS providers incorporating AI capabilities into products",
        source: "Enterprise Software News",
        url: "#",
        date: new Date().toISOString(),
      },
    ]
  }
}

async function fetchMarketData(domain: string) {
  try {
    let marketstackData = { data: [] }
    let marketstackFailed = false
    
    try {
      const marketstackRes = await fetch(
        `https://api.marketstack.com/v1/tickers?access_key=${process.env.MARKETSTACK_API_KEY}&search=${encodeURIComponent(domain)}&limit=5`,
        { 
          next: { revalidate: 3600 },
          cache: 'no-store'
        },
      )

      if (marketstackRes.ok) {
        try {
          marketstackData = await marketstackRes.json()
        } catch (parseError) {
          console.error("[v0] Failed to parse Marketstack JSON:", parseError)
          marketstackFailed = true
        }
      } else if (marketstackRes.status === 429) {
        console.warn("[v0] MarketStack API rate limit reached (429) - using fallback data")
        marketstackFailed = true
      } else if (marketstackRes.status === 401) {
        console.warn("[v0] MarketStack API authentication failed (401) - using fallback data")
        marketstackFailed = true
      } else {
        console.warn(`[v0] MarketStack API returned status ${marketstackRes.status}`)
        marketstackFailed = true
      }
    } catch (fetchError) {
      console.warn("[v0] MarketStack unavailable - using fallback data:", String(fetchError).substring(0, 100))
      marketstackFailed = true
    }

    let newsData = { articles: [] }
    
    try {
      const newsRes = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(domain)} market trends startup&sortBy=publishedAt&language=en&pageSize=8`,
        {
          headers: {
            "X-API-Key": process.env.NEWS_API_KEY || "",
          },
          next: { revalidate: 3600 },
        },
      )

      if (newsRes.ok) {
        try {
          newsData = await newsRes.json()
        } catch (parseError) {
          console.error("[v0] Failed to parse NewsAPI JSON:", parseError)
        }
      } else {
        console.warn(`[v0] NewsAPI returned status ${newsRes.status}`)
      }
    } catch (fetchError) {
      console.error("[v0] NewsAPI fetch error:", fetchError)
    }

    // Use fallback data if API calls failed
    const fallbackKey = domain.includes("/") 
      ? domain.split("/")[0] 
      : domain.split(/\s+/)[0] as keyof typeof FALLBACK_MARKET_DATA
    const fallback = FALLBACK_MARKET_DATA[fallbackKey] || FALLBACK_MARKET_DATA.FinTech

    const insights = {
      domain,
      marketTrends:
        (marketstackData.data && marketstackData.data.length > 0)
          ? marketstackData.data.slice(0, 3).map((ticker: any) => ({
              symbol: ticker.symbol,
              name: ticker.name,
              lastUpdate: ticker.last_update,
            }))
          : (marketstackFailed ? fallback.marketTrends : []),
      trends:
        (newsData.articles && newsData.articles.length > 0)
          ? newsData.articles.slice(0, 5).map((article: any) => ({
              title: article.title,
              description: article.description,
              source: article.source.name,
              url: article.url,
              date: article.publishedAt,
              image: article.urlToImage,
            }))
          : (marketstackFailed ? fallback.trends : []),
      timestamp: new Date().toISOString(),
      fallbackUsed: marketstackFailed,
    }

    return insights
  } catch (error) {
    console.error("[v0] Market data fetch error:", error)
    return {
      domain,
      marketTrends: [],
      trends: [],
      timestamp: new Date().toISOString(),
      error: "Failed to fetch market data",
      fallbackUsed: false,
    }
  }
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
  }

  try {
    const insights = await fetchMarketData(domain)
    return NextResponse.json(insights)
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "An error occurred", details: String(error) },
      { status: 500 }
    )
  }
}
