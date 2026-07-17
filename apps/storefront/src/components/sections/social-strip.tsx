import { Thumbnail } from "@/components/ui/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@tanstack/react-router"

type SocialStripProps = {
  /** Products stand in for community photography until real posts are wired up. */
  products: HttpTypes.StoreProduct[]
  countryCode: string
  handle: string
}

/**
 * A desaturated band of imagery standing in for the community feed. Muting the
 * colour keeps it from competing with the product runs it sits between.
 */
export const SocialStrip = ({
  products,
  countryCode,
  handle,
}: SocialStripProps) => {
  const tiles = products.slice(0, 6)

  if (tiles.length < 6) {
    return null
  }

  return (
    <section className="border-t border-neutral-200 bg-[#F7F6F4] py-16 md:py-20">
      <div className="content-container">
        <div className="mb-8 text-center">
          <h2 className="font-editorial text-2xl font-light italic tracking-tight text-neutral-900 md:text-3xl">
            Living in Essentials
          </h2>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
            Tag us {handle}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {tiles.map((product) => (
            <Link
              key={product.id}
              to="/$countryCode/products/$handle"
              params={{ countryCode, handle: product.handle || "" }}
              className="group relative aspect-square overflow-hidden bg-neutral-200"
            >
              <Thumbnail
                thumbnail={product.thumbnail || product.images?.[0]?.url}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover object-center grayscale transition-all duration-500 group-hover:scale-[1.05] group-hover:grayscale-0"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
