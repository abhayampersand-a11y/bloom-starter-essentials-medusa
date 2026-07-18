import { HttpTypes } from "@medusajs/types"
import { useMemo, useState } from "react"

/**
 * The fields a listing needs for filtering to work: variant options carry colour
 * and size, and the collection/category links drive their own filter groups.
 */
export const LISTING_PRODUCT_FIELDS =
  "*variants,*variants.options,*variants.options.option,*variants.calculated_price,*images,*collection,*categories,*type,*tags"

/** One card on the grid: a product shown under one of its colours. */
export type VariantItem = {
  product: HttpTypes.StoreProduct
  variant: HttpTypes.StoreProductVariant
  color: string | null
  /** Every size this product offers in that colour, used by the size filter. */
  sizes: string[]
}

export type FilterOption = {
  id: string
  label: string
  count: number
}

export type FilterGroupType = "checkbox" | "swatch" | "size"

export type FilterGroup = {
  id: string
  title: string
  type: FilterGroupType
  options: FilterOption[]
}

export type PriceRange = { min: number; max: number }

export const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "title-asc", label: "A-Z" },
]

/** Sand and beige are the same shade to a shopper; they were split in the data. */
const normalizeColor = (value: string) =>
  value.trim().toLowerCase() === "beige" ? "sand" : value.trim().toLowerCase()

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const optionValue = (
  variant: HttpTypes.StoreProductVariant,
  optionTitle: string
) =>
  variant.options?.find(
    (opt) => opt.option?.title?.toLowerCase() === optionTitle
  )?.value ?? null

const priceOf = (item: VariantItem) =>
  item.variant?.calculated_price?.calculated_amount ?? null

/** Sizes read in the order clothing is actually sold, not alphabetically. */
const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"]

const bySizeOrder = (a: FilterOption, b: FilterOption) => {
  const indexA = SIZE_ORDER.indexOf(a.id)
  const indexB = SIZE_ORDER.indexOf(b.id)
  if (indexA === -1 && indexB === -1) return a.id.localeCompare(b.id)
  if (indexA === -1) return 1
  if (indexB === -1) return -1
  return indexA - indexB
}

const tally = (values: string[]) => {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return counts
}

/**
 * The single source of truth for every product listing — store, collection and
 * category. Each page used to carry its own copy of this, and they had already
 * drifted apart: one hardcoded dollar price bands, only one folded beige into
 * sand. Pages now differ in what they fetch and what they title the page, not in
 * how filtering behaves.
 *
 * Filtering happens client-side over whatever the caller has loaded, so callers
 * are expected to have fetched the full result set before trusting the counts.
 */
export const useProductFilters = ({
  products,
  bestSellingIds = [],
}: {
  products: HttpTypes.StoreProduct[]
  bestSellingIds?: string[]
}) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState("featured")
  /** Null until the shopper moves a handle, so it can't fight the derived bounds. */
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)

  // One card per colour, carrying the sizes that colour comes in.
  const items = useMemo((): VariantItem[] => {
    return products.flatMap((product) => {
      if (!product.variants?.length) {
        return []
      }

      const byColor = new Map<string, VariantItem>()

      product.variants.forEach((variant) => {
        const rawColor = optionValue(variant, "color")
        const color = rawColor ? normalizeColor(rawColor) : "default"
        const size = optionValue(variant, "size")

        const existing = byColor.get(color)
        if (existing) {
          if (size && !existing.sizes.includes(size.toLowerCase())) {
            existing.sizes.push(size.toLowerCase())
          }
          return
        }

        byColor.set(color, {
          product,
          variant,
          color: rawColor ? color : null,
          sizes: size ? [size.toLowerCase()] : [],
        })
      })

      return Array.from(byColor.values())
    })
  }, [products])

  const priceBounds = useMemo((): PriceRange => {
    const prices = items
      .map(priceOf)
      .filter((price): price is number => price !== null)

    if (!prices.length) {
      return { min: 0, max: 0 }
    }

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }
  }, [items])

  const activeRange = priceRange ?? priceBounds

  const groups = useMemo((): FilterGroup[] => {
    const collectionCounts = tally(
      items.flatMap((item) => (item.product.collection ? [item.product.collection.handle] : []))
    )
    const collectionTitles = new Map(
      items.flatMap((item) =>
        item.product.collection
          ? [[item.product.collection.handle, item.product.collection.title] as const]
          : []
      )
    )

    const categoryCounts = tally(
      items.flatMap((item) =>
        (item.product.categories ?? []).map((category) => category.handle)
      )
    )
    const categoryNames = new Map(
      items.flatMap((item) =>
        (item.product.categories ?? []).map(
          (category) => [category.handle, category.name] as const
        )
      )
    )

    const typeCounts = tally(
      items.flatMap((item) => (item.product.type ? [item.product.type.value] : []))
    )

    const tagCounts = tally(
      items.flatMap((item) =>
        (item.product.tags ?? []).map((tag) => tag.value)
      )
    )

    const colorCounts = tally(
      items.flatMap((item) => (item.color ? [item.color] : []))
    )

    const sizeCounts = tally(items.flatMap((item) => item.sizes))

    const built: FilterGroup[] = [
      {
        id: "collection",
        title: "Collection",
        type: "checkbox",
        options: Array.from(collectionCounts, ([handle, count]) => ({
          id: handle,
          label: collectionTitles.get(handle) ?? handle,
          count,
        })).sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "category",
        title: "Category",
        type: "checkbox",
        options: Array.from(categoryCounts, ([handle, count]) => ({
          id: handle,
          label: categoryNames.get(handle) ?? handle,
          count,
        })).sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "type",
        title: "Product Type",
        type: "checkbox",
        options: Array.from(typeCounts, ([value, count]) => ({
          id: value,
          label: value,
          count,
        })).sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "tag",
        title: "Tags",
        type: "checkbox",
        options: Array.from(tagCounts, ([value, count]) => ({
          id: value,
          label: value,
          count,
        })).sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "color",
        title: "Color",
        type: "swatch",
        options: Array.from(colorCounts, ([color, count]) => ({
          id: color,
          label: titleCase(color),
          count,
        })).sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "size",
        title: "Size",
        type: "size",
        options: Array.from(sizeCounts, ([size, count]) => ({
          id: size,
          label: size.toUpperCase(),
          count,
        })).sort(bySizeOrder),
      },
    ]

    // A group offering one choice filters nothing — on a collection page every
    // product shares a collection, so that group drops out on its own.
    return built.filter((group) => group.options.length > 1)
  }, [items])

  const toggle = (groupId: string, optionId: string) => {
    setSelected((prev) => {
      const current = prev[groupId] ?? []
      return {
        ...prev,
        [groupId]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      }
    })
  }

  const clearAll = () => {
    setSelected({})
    setPriceRange(null)
  }

  const hasActive =
    Object.values(selected).some((values) => values.length > 0) ||
    priceRange !== null

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const collections = selected.collection ?? []
      if (
        collections.length &&
        !collections.includes(item.product.collection?.handle ?? "")
      ) {
        return false
      }

      const categories = selected.category ?? []
      if (
        categories.length &&
        !(item.product.categories ?? []).some((category) =>
          categories.includes(category.handle)
        )
      ) {
        return false
      }

      const types = selected.type ?? []
      if (
        types.length &&
        !(item.product.type && types.includes(item.product.type.value))
      ) {
        return false
      }

      const tags = selected.tag ?? []
      if (
        tags.length &&
        !(item.product.tags ?? []).some((tag) => tags.includes(tag.value))
      ) {
        return false
      }

      const colors = selected.color ?? []
      if (colors.length && !(item.color && colors.includes(item.color))) {
        return false
      }

      const sizes = selected.size ?? []
      if (sizes.length && !item.sizes.some((size) => sizes.includes(size))) {
        return false
      }

      if (priceRange) {
        const price = priceOf(item)
        // A product with no price can't be judged against a range; keeping it
        // would let it slip past a filter the shopper explicitly set.
        if (price === null) return false
        if (price < priceRange.min || price > priceRange.max) return false
      }

      return true
    })

    const byPrice = (direction: 1 | -1) => (a: VariantItem, b: VariantItem) => {
      const priceA = priceOf(a)
      const priceB = priceOf(b)
      // Unpriced products sink to the bottom either way round.
      if (priceA === null && priceB === null) return 0
      if (priceA === null) return 1
      if (priceB === null) return -1
      return (priceA - priceB) * direction
    }

    switch (sortBy) {
      case "featured":
        return result.sort((a, b) => {
          const indexA = bestSellingIds.indexOf(a.product.id)
          const indexB = bestSellingIds.indexOf(b.product.id)
          if (indexA === -1 && indexB === -1) return 0
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })
      case "price-asc":
        return result.sort(byPrice(1))
      case "price-desc":
        return result.sort(byPrice(-1))
      case "title-asc":
        return result.sort((a, b) => a.product.title.localeCompare(b.product.title))
      case "newest":
        return result.sort(
          (a, b) =>
            new Date(b.product.created_at || 0).getTime() -
            new Date(a.product.created_at || 0).getTime()
        )
      default:
        return result
    }
  }, [items, selected, priceRange, sortBy, bestSellingIds])

  return {
    items: filtered,
    totalCount: filtered.length,
    groups,
    selected,
    toggle,
    clearAll,
    hasActive,
    priceBounds,
    priceRange: activeRange,
    setPriceRange,
    sortBy,
    setSortBy,
    sortOptions: SORT_OPTIONS,
  }
}
