import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Missing Supabase configuration" }, { status: 500 })
    }

    const response = await fetch(`${supabaseUrl}/api/v1/storage/buckets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "project-images",
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Bucket might already exist, that's ok
      if (data.message?.includes("already exists")) {
        return NextResponse.json({ success: true, message: "Bucket already exists" })
      }
      return NextResponse.json({ success: false, error: data.message || "Failed to create bucket" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Bucket created successfully" })
  } catch (error) {
    console.error("[v0] Storage bucket error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
