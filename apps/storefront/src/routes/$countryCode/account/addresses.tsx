import { createFileRoute } from "@tanstack/react-router"
import Addresses from "@/pages/account/addresses"

export const Route = createFileRoute("/$countryCode/account/addresses")({
  component: Addresses,
})
