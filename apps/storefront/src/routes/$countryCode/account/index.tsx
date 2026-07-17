import { createFileRoute } from "@tanstack/react-router"
import Overview from "@/pages/account/overview"

export const Route = createFileRoute("/$countryCode/account/")({
  component: Overview,
})
