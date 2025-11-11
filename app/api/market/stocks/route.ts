import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "AAPL"

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Alpha Vantage API error")
    }

    const data = await response.json()

    return NextResponse.json({
      symbol,
      price: data["Global Quote"]?.["05. price"],
      change: data["Global Quote"]?.["09. change"],
      changePercent: data["Global Quote"]?.["10. change percent"],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Alpha Vantage error:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
