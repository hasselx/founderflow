import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ success: false, error: "Supabase configuration incomplete" }, { status: 500 })
    }

    const response = await fetch(`${supabaseUrl}/api/v1/storage/buckets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        name: "project-images",
        public: true,
      }),
    })

    const data = await response.json()

    // Check if bucket already exists or was created successfully
    if (!response.ok && !data.message?.includes("already exists")) {
      console.error("[v0] Storage creation failed:", data)
      return NextResponse.json(
        { success: false, error: data.message || "Failed to create storage bucket" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message?.includes("already exists") ? "Bucket already exists" : "Bucket created successfully",
    })
  } catch (error) {
    console.error("[v0] Storage bucket error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
