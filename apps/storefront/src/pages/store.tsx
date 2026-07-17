import { ProductListing } from "@/components/product-listing"
import { useListingProducts } from "@/lib/hooks/use-listing-products"
import { OPTION_VALUE_QUERY_KEY } from "@/lib/utils/option-values"
import { useLoaderData, useSearch } from "@tanstack/react-router"

/** Every product in the region, rendered through the shared listing shell. */
const Store = () => {
  const loaderData = useLoaderData({ from: "/$countryCode/store" })
  const { region, bestSellingIds = [], countryCode } = loaderData || {}

  // Kept so existing deep links that pin option values still narrow the list,
  // server-side, before the sidebar's own filters run over the result.
  const search = useSearch({ from: "/$countryCode/store" }) as {
    [OPTION_VALUE_QUERY_KEY]?: string[]
  }
  const optionValueIds = search[OPTION_VALUE_QUERY_KEY] ?? []

  const { products, isLoading } = useListingProducts({
    region_id: region.id,
    optionValueIds,
    query_params: { order: "-created_at" },
  })

  return (
    <ProductListing
      title="All Products"
      description="The full collection — functional athleisure made of premium materials, designed for everyday balance."
      crumbs={[{ label: "Home", href: `/${countryCode}` }, { label: "Shop" }]}
      products={products}
      bestSellingIds={bestSellingIds}
      currencyCode={region.currency_code}
      isLoading={isLoading}
    />
  )
}

export default Store
