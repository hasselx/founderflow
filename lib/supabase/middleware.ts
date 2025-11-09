import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

let supabaseInstance: ReturnType<typeof createServerClient> | null = null

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  if (!supabaseInstance) {
    supabaseInstance = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )
  }

  const supabase = supabaseInstance

  // Refresh session to update user
  await supabase.auth.getSession()

  return supabaseResponse
}
