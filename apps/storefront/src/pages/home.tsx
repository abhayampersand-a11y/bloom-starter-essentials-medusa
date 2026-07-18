import { EditorialHero } from "@/components/sections/editorial-hero"
import { EditorialSplit } from "@/components/sections/editorial-split"
import { JoinTheCircle } from "@/components/sections/join-the-circle"
import { NewArrivals } from "@/components/sections/new-arrivals"
import { SocialStrip } from "@/components/sections/social-strip"
import { TrendingNow, type TrendingEntry } from "@/components/sections/trending-now"
import { useCollections } from "@/lib/hooks/use-collections"
import { useProducts } from "@/lib/hooks/use-products"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { useLoaderData, useLocation } from "@tanstack/react-router"

/** Art direction that has no home in the backend yet. */
const MEDIA = {
  heroVideo:
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/Bring_a_bit_202602041404_u6uf6-01KGMC3H3BPBGYA1KXAMFFT0AM.mp4",
  campaign:
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/nano_banana_pro_20260204_141238_1-01KGMCQQ1KXNTY3K55VA3T84KE.png",
  craft:
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/nano_banana_pro_20260204_143825_1-01KGMGX3A0D7S471Q2533HQ322.png",
  trending: [
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/NanoBanana-2026-02-04-01KGMCGE8HA4MP3JQAJ1PAEGGX.png",
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/NanoBanana-2026-02-04-1--01KGMCJ09NGECFMM8QVAY13MY3.png",
    "https://cdn.mignite.app/ws/works_01KGFKTHDC6ZD3WS7GQTX8992N/Gro-nano_banana_pro_20260204_133831_1--01KGMCNPB3SC30ZKSH1ZPWX149.jpeg",
  ],
}

const HERO_COLLECTION = "core-essentials"

/**
 * Home — an editorial storefront: campaign hero, a short run of new arrivals, a
 * magazine spread, the collections in play, the community, and an invitation.
 */
const Home = () => {
  const location = useLocation()
  const { region } = useLoaderData({ from: "/$countryCode/" })
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  const { data: productsData } = useProducts({
    region_id: region?.id,
    query_params: {
      limit: 10,
      order: "-created_at",
    },
  })

  const { data: collections } = useCollections({
    fields: "id,title,handle,metadata",
  })

  const products = (productsData?.pages?.[0]?.products ??
    []) as HttpTypes.StoreProduct[]

  // A collection's own display image (set in the admin) wins; the campaign art
  // fills in for collections that don't have one yet.
  const trending: TrendingEntry[] = (collections ?? [])
    .slice(0, MEDIA.trending.length)
    .map((collection: HttpTypes.StoreCollection, index: number) => {
      const displayImage = collection.metadata?.image_url
      return {
        handle: collection.handle,
        title: collection.title,
        subtitle: "Shop the collection",
        imageUrl:
          typeof displayImage === "string" && displayImage
            ? displayImage
            : MEDIA.trending[index],
      }
    })

  return (
    <div className="min-h-screen bg-white">
      <EditorialHero
        eyebrow="Autumn / Winter 2026"
        title="Movement, simplified."
        countryCode={countryCode}
        collectionHandle={HERO_COLLECTION}
        videoUrl={MEDIA.heroVideo}
      />

      <NewArrivals products={products.slice(0, 4)} countryCode={countryCode} />

      <EditorialSplit
        countryCode={countryCode}
        campaignTitle="The In-Between"
        campaignBody="Built for the walk to the studio, the coffee after training, and the quiet hours at home."
        campaignHandle={HERO_COLLECTION}
        campaignImageUrl={MEDIA.campaign}
        craftImageUrl={MEDIA.craft}
        quote="Functional athleisure, made of premium materials, to improve your life in small but mighty ways."
        quoteAttribution="The Essentials Philosophy"
      />

      <TrendingNow entries={trending} countryCode={countryCode} />

      <SocialStrip
        products={products.slice(4, 10)}
        countryCode={countryCode}
        handle="@essentials"
      />

      <JoinTheCircle />
    </div>
  )
}

export default Home
