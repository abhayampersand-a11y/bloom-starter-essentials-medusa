import { ArrowUpRightMini } from "@medusajs/icons"
import { Link } from "@tanstack/react-router"

export type TrendingEntry = {
  handle: string
  title: string
  subtitle: string
  imageUrl: string
}

type TrendingNowProps = {
  entries: TrendingEntry[]
  countryCode: string
}

/**
 * Three collections given equal billing, centred under a ruled heading — the
 * page's one symmetrical moment.
 */
export const TrendingNow = ({ entries, countryCode }: TrendingNowProps) => {
  if (!entries.length) {
    return null
  }

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="content-container">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
            Most Coveted
          </p>
          <h2 className="font-editorial text-3xl font-light tracking-tight text-neutral-900 md:text-4xl">
            Trending Now
          </h2>
          <span className="mt-5 h-px w-10 bg-neutral-900" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.handle}
              to="/$countryCode/collections/$handle"
              params={{ countryCode, handle: entry.handle }}
              className="group flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F3F0]">
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-900">
                    {entry.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-500">
                    {entry.subtitle}
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                  <ArrowUpRightMini />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
