import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MagnifyingGlass } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import { useState, useCallback, memo, useEffect } from "react"

type ImageGalleryEnhancedProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGalleryEnhanced = memo(function ImageGalleryEnhanced({
  images,
}: ImageGalleryEnhancedProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentZoomIndex, setCurrentZoomIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Reset to first image when images change
  useEffect(() => {
    setActiveIndex(0)
    setCurrentZoomIndex(0)
  }, [images])

  const goToNext = useCallback(() => {
    setCurrentZoomIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentZoomIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const openZoom = useCallback((index: number) => {
    setCurrentZoomIndex(index)
    setIsZoomed(true)
  }, [])

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-sand-50 flex items-center justify-center">
        <span className="text-neutral-300">No images available</span>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div>
      <div className="flex gap-3 md:gap-4">
        {/* Thumbnail rail */}
        {images.length > 1 && (
          <div className="flex flex-col gap-3 shrink-0 w-14 md:w-[72px]">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeIndex}
                className={clsx(
                  "relative aspect-[4/5] overflow-hidden bg-sand-50 transition-opacity",
                  index === activeIndex
                    ? "ring-1 ring-neutral-900"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {!!image.url && (
                  <img
                    src={image.url}
                    alt={`Product thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 min-w-0">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden bg-sand-50 group cursor-zoom-in"
            onClick={() => openZoom(activeIndex)}
          >
            {!!activeImage?.url && (
              <img
                src={activeImage.url}
                className="w-full h-full object-cover"
                alt="Main product image"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>

          {/* Zoom affordance */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => openZoom(activeIndex)}
              aria-label="Zoom image"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <MagnifyingGlass className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-full">
            {images[currentZoomIndex]?.url && (
              <img
                src={images[currentZoomIndex].url}
                alt="Zoomed product image"
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}

            {images.length > 1 && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900 p-3"
                  aria-label="Previous image"
                  variant="secondary"
                  size="fit"
                >
                  <ChevronLeft />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-900 p-3"
                  aria-label="Next image"
                  variant="secondary"
                  size="fit"
                >
                  <ChevronRight />
                </Button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 text-xs text-neutral-900">
                  {currentZoomIndex + 1} / {images.length}
                </div>
              </>
            )}

            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white text-sm hover:text-neutral-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

ImageGalleryEnhanced.displayName = "ImageGalleryEnhanced"

export { ImageGalleryEnhanced }
export default ImageGalleryEnhanced
