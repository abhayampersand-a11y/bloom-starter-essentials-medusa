import { createFileRoute } from "@tanstack/react-router"
import { AuthCallback } from "@/pages/auth-callback"

// Country-agnostic on purpose: Google requires an exact, fixed redirect URI.
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
})
