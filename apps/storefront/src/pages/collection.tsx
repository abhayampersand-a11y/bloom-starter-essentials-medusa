import { ProductListing } from "@/components/product-listing"
import { useListingProducts } from "@/lib/hooks/use-listing-products"
import { HttpTypes } from "@medusajs/types"
import { useLoaderData, useParams } from "@tanstack/react-router"

interface CollectionProps {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}

/** A single collection, rendered through the shared listing shell. */
export const Collection = ({ collection, region }: CollectionProps) => {
  const loaderData = useLoaderData({ from: "/$countryCode/collections/$handle" })
  const { bestSellingIds = [] } = loaderData || {}
  const { countryCode } = useParams({ strict: false })

  const { products, isLoading } = useListingProducts({
    region_id: region.id,
    query_params: { collection_id: [collection.id] },
  })

  const description = collection.metadata?.description

  return (
    <ProductListing
      title={collection.title}
      description={typeof description === "string" ? description : undefined}
      crumbs={[
        { label: "Home", href: `/${countryCode ?? "in"}` },
        { label: "Collections" },
        { label: collection.title },
      ]}
      products={products}
      bestSellingIds={bestSellingIds}
      currencyCode={region.currency_code}
      isLoading={isLoading}
    />
  )
}
