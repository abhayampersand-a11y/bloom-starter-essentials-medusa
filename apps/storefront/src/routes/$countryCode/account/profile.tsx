import { createFileRoute } from "@tanstack/react-router"
import Profile from "@/pages/account/profile"

export const Route = createFileRoute("/$countryCode/account/profile")({
  component: Profile,
})
