import { createFileRoute } from "@tanstack/react-router"
import { Auth } from "@/pages/auth"

export const Route = createFileRoute("/$countryCode/auth")({
  validateSearch: (search): { redirect?: string } => {
    const redirect = search.redirect
    // Only same-origin paths, so this can't be used as an open redirect.
    if (typeof redirect === "string" && redirect.startsWith("/")) {
      return { redirect }
    }
    return {}
  },
  component: Auth,
})
