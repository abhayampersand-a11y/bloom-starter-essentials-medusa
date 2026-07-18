import { FilterSidebar } from "@/components/filters/filter-sidebar"
import ProductCard from "@/components/product-card"
import { useProductFilters } from "@/lib/hooks/use-product-filters"
import { HttpTypes } from "@medusajs/types"
import { ArrowLeftMini, ArrowRightMini, ChevronDown } from "@medusajs/icons"
import { Link } from "@tanstack/react-router"
import { clsx } from "clsx"
import { useEffect, useMemo, useState } from "react"

const PAGE_SIZE = 9

export type Crumb = { label: string; href?: string }

type ProductListingProps = {
  title: string
  description?: string
  /** Banner shown under the breadcrumb — a category/collection display image. */
  imageUrl?: string
  crumbs: Crumb[]
  products: HttpTypes.StoreProduct[]
  bestSellingIds?: string[]
  currencyCode: string
  isLoading: boolean
}

/**
 * The shared shell behind every product listing — store, collection, category.
 *
 * Filtering and paging both run over the products handed in, so callers must
 * have loaded the whole set before the counts here mean anything.
 */
export const ProductListing = ({
  title,
  description,
  imageUrl,
  crumbs,
  products,
  bestSellingIds = [],
  currencyCode,
  isLoading,
}: ProductListingProps) => {
  const {
    items,
    totalCount,
    groups,
    selected,
    toggle,
    clearAll,
    hasActive,
    priceBounds,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    sortOptions,
  } = useProductFilters({ products, bestSellingIds })

  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Narrowing the results can strand the shopper past the last page.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  const visible = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page]
  )

  const selectedSort = sortOptions.find((option) => option.id === sortBy)

  return (
    <div className="content-container pt-32 pb-20">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-neutral-500">
          {crumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="transition-colors hover:text-neutral-900">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-900">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {imageUrl && (
        <div className="mb-10 aspect-[16/5] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="mb-10 flex flex-col gap-6 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-editorial text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-neutral-600">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
            Showing {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>

          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none border-b border-neutral-900 bg-transparent py-1 pr-6 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-900 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  Sort by: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <span className="sr-only">Currently {selectedSort?.label}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
        <FilterSidebar
          groups={groups}
          selected={selected}
          onToggle={toggle}
          onClearAll={clearAll}
          hasActive={hasActive}
          priceBounds={priceBounds}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          currencyCode={currencyCode}
        />

        <div className="min-w-0 flex-1">
          {isLoading && !items.length ? (
            <p className="py-16 text-xs uppercase tracking-[0.15em] text-neutral-500">
              Loading…
            </p>
          ) : !items.length ? (
            <div className="py-16">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                No products match these filters
              </p>
              {hasActive && (
                <button
                  onClick={clearAll}
                  className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-900 underline underline-offset-4"
                >
                  Clear all
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {visible.map((item) => (
                  <ProductCard
                    key={`${item.product.id}-${item.variant.id}`}
                    product={item.product}
                    variant={item.variant}
                  />
                ))}
              </div>

              {pageCount > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-16 flex items-center justify-center gap-5"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="text-neutral-900 transition-opacity disabled:opacity-30"
                  >
                    <ArrowLeftMini />
                  </button>

                  {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => setPage(number)}
                        aria-current={number === page ? "page" : undefined}
                        className={clsx(
                          "pb-1 text-[10px] tracking-[0.15em] transition-colors",
                          number === page
                            ? "border-b border-neutral-900 text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-900"
                        )}
                      >
                        {String(number).padStart(2, "0")}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    aria-label="Next page"
                    className="text-neutral-900 transition-opacity disabled:opacity-30"
                  >
                    <ArrowRightMini />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
