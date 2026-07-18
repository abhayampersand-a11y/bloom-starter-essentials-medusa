import ProductActions from "@/components/product-actions"
import { COLOR_OPTION_TITLES } from "@/components/product-option-select"
import { ImageGalleryEnhanced } from "@/components/ui/image-gallery-enhanced"
import { ProductAccordions } from "@/components/product/product-accordions"
import { ProductReviews } from "@/components/product/product-reviews"
import { RelatedProducts } from "@/components/product/related-products"
import { useLoaderData, useLocation } from "@tanstack/react-router"
import { useProducts } from "@/lib/hooks/use-products"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useState, useMemo, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { Share } from "@medusajs/icons"

/**
 * Enhanced Product Page
 *
 * Features:
 * - High-res image gallery with zoom
 * - Image rollover on thumbnails
 * - Variant selection (size, color swatches)
 * - Product information accordions
 * - Related products carousel
 * - Add to cart with Quick Buy option
 */
const ProductDetails = () => {
  const { product, region } = useLoaderData({
    from: "/$countryCode/products/$handle",
  })
  
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "us"

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const handleVariantChange = useCallback((_variant: HttpTypes.StoreProductVariant | undefined) => {
    // Variant tracking available for future use
  }, [])

  const handleOptionsChange = useCallback((options: Record<string, string | undefined>) => {
    // Filter out undefined values
    const definedOptions = Object.entries(options).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)
    setSelectedOptions(definedOptions)
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        // Fallback: create a temporary input to copy
        const input = document.createElement("input")
        input.value = url
        input.style.position = "fixed"
        input.style.opacity = "0"
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        document.body.removeChild(input)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }, [])

  // Fetch related products (showing first 4 products as related)
  const { data: relatedProductsData } = useProducts({
    query_params: {
      limit: 5,
      fields: "id,title,handle,thumbnail,*variants.calculated_price",
    },
    region_id: region.id,
  })

  // Filter out current product from related products
  const relatedProducts =
    relatedProductsData?.pages
      .flatMap((page) => page.products)
      .filter((p) => p.id !== product.id)
      .slice(0, 4) || []

  // Filter images based on selected color option: only the images linked to
  // variants with the selected color are shown
  const displayImages = useMemo(() => {
    const allImages = product.images || []

    // Find the color option
    const colorOption = product.options?.find(
      (opt: HttpTypes.StoreProductOption) =>
        COLOR_OPTION_TITLES.includes(opt.title?.toLowerCase() ?? "")
    )

    if (!colorOption) {
      return allImages
    }

    const selectedColorValue = selectedOptions[colorOption.id]
    
    if (!selectedColorValue) {
      return allImages
    }

    // Find variants that match the selected color
    const matchingVariants = product.variants?.filter((variant: HttpTypes.StoreProductVariant) => {
      return variant.options?.some(
        (opt: HttpTypes.StoreProductOptionValue) => opt.option_id === colorOption.id && opt.value === selectedColorValue
      )
    }) || []

    // Get all image IDs from matching variants
    const variantImageIds = new Set(
      matchingVariants.flatMap((v: HttpTypes.StoreProductVariant) => v.images?.map((img: HttpTypes.StoreProductImage) => img.id) || [])
    )

    const variantImages = allImages.filter((img: HttpTypes.StoreProductImage) => variantImageIds.has(img.id))

    // Show only the selected colour's images; fall back to all images when
    // no images are linked to the matching variants
    return variantImages.length > 0 ? variantImages : allImages
  }, [product.images, product.options, product.variants, selectedOptions])

  return (
    <>
      <div className="content-container pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20">
          {/* Left: Image gallery with zoom */}
          <div>
            <ImageGalleryEnhanced images={displayImages} />
          </div>

          {/* Right: Product info + variant selection */}
          <div className="flex flex-col">
            <div className="sticky top-32 self-start w-full max-w-md">
              {product.collection?.title && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">
                  {product.collection.title}
                </p>
              )}

              <h1 className="font-editorial text-3xl md:text-4xl uppercase tracking-wide text-neutral-900 mb-6">
                {product.title}
              </h1>

              {/* Variant selection & Add to Bag - contains price */}
              <ProductActions
                product={product}
                region={region}
                onVariantChange={handleVariantChange}
                onOptionsChange={handleOptionsChange}
              />

              {/* Product Information Accordions */}
              <div className="mt-12">
                <ProductAccordions description={product.description} />
              </div>

              {/* Type & tags */}
              {(product.type?.value || (product.tags?.length ?? 0) > 0) && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {product.type?.value && (
                    <span className="border border-neutral-900 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-neutral-900">
                      {product.type.value}
                    </span>
                  )}
                  {product.tags?.map((tag: HttpTypes.StoreProductTag) => (
                    <span
                      key={tag.id}
                      className="border border-neutral-200 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-neutral-500"
                    >
                      {tag.value}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Product */}
              <button
                onClick={handleShare}
                className="mt-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Share className="w-4 h-4" />
                {copied ? "Link copied" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <ProductReviews productId={product.id} countryCode={countryCode} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} countryCode={countryCode} />
      )}
    </>
  )
}

export default ProductDetails
