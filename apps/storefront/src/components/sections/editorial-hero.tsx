import { Link } from "@tanstack/react-router"

type EditorialHeroProps = {
  eyebrow: string
  title: string
  countryCode: string
  /** Collection the primary call to action opens. */
  collectionHandle: string
  videoUrl: string
}

/**
 * Full-bleed opening statement: campaign footage behind a headline sat on the
 * bottom-left, in the manner of a fashion house's seasonal landing page.
 */
export const EditorialHero = ({
  eyebrow,
  title,
  countryCode,
  collectionHandle,
  videoUrl,
}: EditorialHeroProps) => {
  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-neutral-900">
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Keeps the headline legible whatever frame the footage is on. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20"
        aria-hidden="true"
      />

      <div className="relative flex h-full items-end pb-16 md:pb-24">
        <div className="content-container">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-white/80">
            {eyebrow}
          </p>
          <h1 className="font-editorial text-4xl font-light italic leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/$countryCode/collections/$handle"
              params={{ countryCode, handle: collectionHandle }}
              className="inline-flex items-center justify-center bg-neutral-900 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
            >
              Explore Collection
            </Link>
            <Link
              to="/$countryCode/store"
              params={{ countryCode }}
              className="inline-flex items-center justify-center border border-white/70 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-neutral-900"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
