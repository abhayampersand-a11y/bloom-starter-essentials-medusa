import { ProductListing } from "@/components/product-listing"
import { useListingProducts } from "@/lib/hooks/use-listing-products"
import { HttpTypes } from "@medusajs/types"
import { useLoaderData, useParams } from "@tanstack/react-router"

/** A product category, rendered through the shared listing shell. */
const Category = () => {
  const loaderData = useLoaderData({ from: "/$countryCode/categories/$handle" })
  const { category, region, bestSellingIds = [] } = loaderData || {}
  const { countryCode } = useParams({ strict: false })

  // A parent category shows everything filed beneath it, not just its own.
  const categoryIds = category?.id
    ? [
        category.id,
        ...(category.category_children?.map(
          (child: HttpTypes.StoreProductCategory) => child.id
        ) ?? []),
      ]
    : undefined

  const { products, isLoading } = useListingProducts({
    region_id: region.id,
    query_params: { category_id: categoryIds },
  })

  const imageUrl = category?.metadata?.image_url

  return (
    <ProductListing
      title={category?.name || "Category"}
      description={category?.description || undefined}
      imageUrl={typeof imageUrl === "string" && imageUrl ? imageUrl : undefined}
      crumbs={[
        { label: "Home", href: `/${countryCode ?? "in"}` },
        { label: "Categories" },
        { label: category?.name || "Category" },
      ]}
      products={products}
      bestSellingIds={bestSellingIds}
      currencyCode={region.currency_code}
      isLoading={isLoading}
    />
  )
}

export default Category
