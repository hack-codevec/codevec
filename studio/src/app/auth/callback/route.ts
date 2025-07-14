import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  console.log("Full Request URL:", request.url)

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  let next = searchParams.get("next") ?? "/"

  console.log("Code:", code)
  console.log("Next parameter:", next)
  console.log("Origin:", origin)

  // Validate the next parameter to prevent open redirects
  if (!next.startsWith("/")) {
    console.log("Next parameter is not a relative URL, using default")
    next = "/"
  }

  if (code) {
    const supabase = await createClient()
    console.log("Attempting to exchange code for session...")

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    console.log("Successfully exchanged code for session")

    const forwardedHost = request.headers.get("x-forwarded-host")
    const forwardedProto = request.headers.get("x-forwarded-proto")
    const isLocalEnv = process.env.NODE_ENV === "development"

    console.log("Forwarded Host:", forwardedHost)
    console.log("Forwarded Proto:", forwardedProto)
    console.log("Is Local Env:", isLocalEnv)

    let redirectUrl: string

    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      const protocol = forwardedProto || "https"
      redirectUrl = `${protocol}://${forwardedHost}${next}`
    } else {
      redirectUrl = `${origin}${next}`
    }

    console.log("Redirecting to:", redirectUrl)
    return NextResponse.redirect(redirectUrl)
  }

  console.log("No code parameter found, redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
