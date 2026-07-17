import { createFileRoute } from "@tanstack/react-router"
import Orders from "@/pages/account/orders"

export const Route = createFileRoute("/$countryCode/account/orders/")({
  component: Orders,
})
