import { useProducts } from "@/lib/hooks/use-products"
import { LISTING_PRODUCT_FIELDS } from "@/lib/hooks/use-product-filters"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo } from "react"

/**
 * Loads every product a listing needs, with the fields its filters depend on.
 *
 * Filtering, counting and paging all happen client-side, so a partially loaded
 * set would quietly under-report: a colour with no match on page one would look
 * like it has no products at all. Remaining pages are pulled in the background
 * until the set is whole. That's fine for a catalogue of this size and would
 * need server-side filtering to scale much further.
 */
export const useListingProducts = ({
  region_id,
  query_params,
  optionValueIds,
}: {
  region_id?: string
  query_params?: HttpTypes.StoreProductListParams
  /** Server-side option filter, set from the URL. Narrows before we ever see it. */
  optionValueIds?: string[]
}) => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching } =
    useProducts({
      region_id,
      optionValueIds,
      query_params: {
        limit: 50,
        fields: LISTING_PRODUCT_FIELDS,
        ...query_params,
      },
    })

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const products = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.products) ??
        []) as HttpTypes.StoreProduct[],
    [data]
  )

  return {
    products,
    // Still settling while more pages are on the way; the grid shouldn't claim
    // it's done until the set is complete.
    isLoading: (isFetching && !products.length) || hasNextPage === true,
  }
}
