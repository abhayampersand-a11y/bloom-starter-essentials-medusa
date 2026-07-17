import Home from "@/pages/home"
import { createFileRoute } from "@tanstack/react-router"
import { getRegion } from "@/lib/data/regions"

export const Route = createFileRoute("/$countryCode/")({
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    // Fetch region for the country code
    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    return {
      countryCode,
      region: region ?? null,
    }
  },
  head: () => {
    const title = `Essentials — Movement, simplified.`
    const description = `Scandinavian-inspired athleisure designed for everyday balance. Explore new arrivals, seasonal collections, and the stories behind them.`

    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
        },
        {
          property: "twitter:title",
          content: title,
        },
        {
          property: "twitter:description",
          content: description,
        },
      ]
    }
  },
  component: Home,
})
