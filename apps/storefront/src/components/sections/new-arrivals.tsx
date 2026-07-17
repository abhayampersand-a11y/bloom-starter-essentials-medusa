import ProductPrice from "@/components/product-price"
import { Thumbnail } from "@/components/ui/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@tanstack/react-router"

type NewArrivalsProps = {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}

/**
 * A short, quiet run of the newest products — four across, generous white space,
 * with the name and price sat beneath each image rather than over it.
 */
export const NewArrivals = ({ products, countryCode }: NewArrivalsProps) => {
  if (!products.length) {
    return null
  }

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="content-container">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
              Curated Selection
            </p>
            <h2 className="font-editorial text-3xl font-light tracking-tight text-neutral-900 md:text-4xl">
              New Arrivals
            </h2>
          </div>

          <Link
            to="/$countryCode/store"
            params={{ countryCode }}
            className="shrink-0 border-b border-neutral-900 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:border-neutral-400 hover:text-neutral-500"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to="/$countryCode/products/$handle"
              params={{ countryCode, handle: product.handle || "" }}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F3F0]">
                <Thumbnail
                  thumbnail={product.thumbnail || product.images?.[0]?.url}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {/* The freshest arrival earns the flag; the rest speak for themselves. */}
                {index === 0 && (
                  <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-900">
                    New
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-xs font-normal tracking-wide text-neutral-800">
                {product.title}
              </h3>
              <ProductPrice
                product={product}
                variant={product.variants?.[0]}
                className="mt-1 text-xs font-normal text-neutral-500"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
