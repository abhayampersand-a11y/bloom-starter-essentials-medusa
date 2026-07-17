import { DEFAULT_CART_DROPDOWN_FIELDS } from "@/components/cart"
import ProductOptionSelect, {
  COLOR_OPTION_TITLES,
} from "@/components/product-option-select"
import ProductPrice from "@/components/product-price"
import { SizeGuideModal } from "@/components/product/size-guide-modal"
import { Button } from "@/components/ui/button"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { getVariantOptionsKeymap, isVariantInStock } from "@/lib/utils/product"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { CheckoutStepKey } from "@/lib/types/global"
import { HttpTypes } from "@medusajs/types"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { isEqual } from "lodash-es"
import { useEffect, useMemo, useRef, useState, memo } from "react"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  disabled?: boolean;
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void;
  onOptionsChange?: (options: Record<string, string>) => void;
};

const ProductActions = memo(function ProductActions({
  product,
  region,
  disabled,
  onVariantChange,
  onOptionsChange,
}: ProductActionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | undefined>
  >({})
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const addToCartMutation = useAddToCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const { openCart } = useCartDrawer()

  const actionsRef = useRef<HTMLDivElement>(null)

  // Reset options on product change, preselecting the first colour so the
  // gallery starts filtered to one colour
  useEffect(() => {
    const colorOption = product?.options?.find((o) =>
      COLOR_OPTION_TITLES.includes(o.title?.toLowerCase() ?? "")
    )
    const firstColor = colorOption?.values?.[0]?.value
    setSelectedOptions(
      colorOption && firstColor ? { [colorOption.id]: firstColor } : {}
    )
  }, [product?.handle, product?.options])

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product?.variants?.length === 1) {
      const optionsKeymap = getVariantOptionsKeymap(
        product?.variants?.[0]?.options ?? []
      )
      setSelectedOptions(optionsKeymap ?? {})
    }
  }, [product?.variants])

  // Colour codes set in the admin (product.metadata.color_hex)
  const colorMap = useMemo(() => {
    const stored = product?.metadata?.color_hex
    return stored && typeof stored === "object"
      ? (stored as Record<string, string>)
      : undefined
  }, [product?.metadata])

  const selectedVariant = useMemo(() => {
    if (!product?.variants || product?.variants.length === 0) {
      return
    }

    // If there's only one variant and no options, select it directly
    if (
      product?.variants.length === 1 &&
      (!product?.options || product?.options.length === 0)
    ) {
      return product?.variants[0]
    }

    const variant = product?.variants.find((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      const matches = isEqual(optionsKeymap, selectedOptions)

      return matches
    })

    return variant
  }, [product?.variants, product?.options, selectedOptions])

  // Notify parent component when variant changes
  useEffect(() => {
    onVariantChange?.(selectedVariant)
  }, [selectedVariant, onVariantChange])

  // Notify parent component when options change
  useEffect(() => {
    // Filter out undefined values before calling callback
    const definedOptions: Record<string, string> = {}
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (value !== undefined) {
        definedOptions[key] = value
      }
    }
    onOptionsChange?.(definedOptions)
  }, [selectedOptions, onOptionsChange])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product?.variants?.some((v) => {
      const optionsKeymap = getVariantOptionsKeymap(v?.options ?? [])
      return isEqual(optionsKeymap, selectedOptions)
    })
  }, [product?.variants, selectedOptions])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If no variant is selected, we can't add to cart
    if (!selectedVariant) {
      return false
    }

    return isVariantInStock(selectedVariant)
  }, [selectedVariant])

  const canPurchase =
    !!selectedVariant && inStock && !!isValidVariant && !disabled

  // add the selected variant to the cart
  const addToCart = async () => {
    if (!selectedVariant?.id) return null

    return addToCartMutation.mutateAsync({
      variant_id: selectedVariant.id,
      quantity: 1,
      country_code: countryCode,
      product,
      variant: selectedVariant,
      region,
    })
  }

  const handleAddToCart = async () => {
    try {
      await addToCart()
      openCart()
    } catch {
      // Failure is surfaced through the mutation's error state
    }
  }

  // Skip the cart drawer and send the shopper straight to checkout
  const handleBuyNow = async () => {
    try {
      await addToCart()
      navigate({
        to: "/$countryCode/checkout",
        params: { countryCode },
        search: { step: CheckoutStepKey.ADDRESSES },
      })
    } catch {
      // Failure is surfaced through the mutation's error state
    }
  }

  const addToBagLabel = !selectedVariant
    ? "Select options"
    : !inStock || !isValidVariant
      ? "Out of stock"
      : addToCartMutation.isPending
        ? "Adding..."
        : "Add to bag"

  return (
    <div className="flex flex-col gap-y-8" ref={actionsRef}>
      {/* Price */}
      <ProductPrice
        product={product as HttpTypes.StoreProduct}
        variant={selectedVariant}
        priceProps={{
          textSize: "large",
        }}
      />

      {/* Variant options (color, size, etc.) */}
      {(product.variants?.length ?? 0) > 1 && (
        <div className="flex flex-col gap-y-8">
          {(product.options || []).map((option) => {
            const isColorOption = COLOR_OPTION_TITLES.includes(
              option.title?.toLowerCase() ?? ""
            )

            return (
              <ProductOptionSelect
                key={option.id}
                option={option}
                current={selectedOptions[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                colorMap={colorMap}
                action={isColorOption ? undefined : <SizeGuideModal />}
                data-testid="product-options"
                disabled={!!disabled || addToCartMutation.isPending}
              />
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canPurchase || addToCartMutation.isPending}
          variant="primary"
          className="w-full bg-neutral-900 hover:bg-neutral-800 py-4 text-xs font-medium uppercase tracking-[0.15em]"
          data-testid="add-product-button"
        >
          {addToBagLabel}
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={!canPurchase || addToCartMutation.isPending}
          variant="secondary"
          className="w-full border-neutral-300 py-4 text-xs font-medium uppercase tracking-[0.15em] hover:border-neutral-900"
        >
          Buy it now
        </Button>
      </div>
    </div>
  )
})

export default ProductActions
