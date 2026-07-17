import { Link } from "@tanstack/react-router"

type EditorialSplitProps = {
  countryCode: string
  campaignTitle: string
  campaignBody: string
  campaignHandle: string
  campaignImageUrl: string
  craftImageUrl: string
  quote: string
  quoteAttribution: string
}

/**
 * The magazine spread of the page: a tall campaign frame beside a craft detail
 * and a pull quote, set on a warm ground so it reads as a pause between the
 * product runs above and below it.
 */
export const EditorialSplit = ({
  countryCode,
  campaignTitle,
  campaignBody,
  campaignHandle,
  campaignImageUrl,
  craftImageUrl,
  quote,
  quoteAttribution,
}: EditorialSplitProps) => {
  return (
    <section className="bg-[#F0EEEA] py-20 md:py-28">
      <div className="content-container">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Campaign frame */}
          <Link
            to="/$countryCode/collections/$handle"
            params={{ countryCode, handle: campaignHandle }}
            className="group relative block aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[560px]"
          >
            <img
              src={campaignImageUrl}
              alt={campaignTitle}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <h3 className="font-editorial text-2xl font-light italic text-white md:text-3xl">
                {campaignTitle}
              </h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/80">
                {campaignBody}
              </p>
            </div>
          </Link>

          {/* Craft detail above the pull quote */}
          <div className="flex flex-col gap-6">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={craftImageUrl}
                alt="Fabric being finished by hand"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <span className="absolute right-4 top-4 bg-white/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-900">
                Craftsmanship
              </span>
            </div>

            <figure className="flex flex-1 flex-col justify-center bg-white p-8 md:p-10">
              <figcaption className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
                {quoteAttribution}
              </figcaption>
              <blockquote className="font-editorial text-xl font-light italic leading-relaxed text-neutral-900 md:text-2xl">
                {quote}
              </blockquote>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
