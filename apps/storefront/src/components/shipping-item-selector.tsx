import { Loading } from "@/components/ui/loading"
import { Price } from "@/components/ui/price"
import SquareRadio from "@/components/ui/square-radio"
import { calculatePriceForShippingOption } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

type ShippingItemSelectorProps = {
  shippingOption: HttpTypes.StoreCartShippingOption;
  cart: HttpTypes.StoreCart;
  isSelected: boolean;
  handleSelect: (optionId: string) => void;
};

const ShippingItemSelector = ({
  shippingOption,
  cart,
  isSelected,
  handleSelect,
}: ShippingItemSelectorProps) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(
    undefined
  )
  const isDisabled =
    shippingOption.price_type === "calculated" &&
    typeof calculatedPrice !== "number"
  const price =
    shippingOption.price_type === "calculated"
      ? calculatedPrice
      : shippingOption.amount

  useEffect(() => {
    if (shippingOption.price_type !== "calculated") {
      return
    }

    calculatePriceForShippingOption({
      option_id: shippingOption.id,
    }).then((option) => {
      setCalculatedPrice(option.amount)
    })
  }, [shippingOption.price_type, shippingOption.id])

  return (
    <label
      className={`block transition-all duration-200 ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <div
        className={`flex items-center justify-between p-5 border transition-colors ${
          isSelected
            ? "border-neutral-900 bg-white"
            : "border-neutral-200 bg-white hover:border-neutral-400"
        }`}
      >
        <div className="flex items-center gap-4">
          <SquareRadio
            name="shipping_option"
            checked={isSelected}
            onChange={() => handleSelect(shippingOption.id)}
            disabled={isDisabled}
          />

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-900">
              {shippingOption.name}
            </p>
            {shippingOption.data?.description !== undefined && (
              <p className="text-xs text-neutral-500 mt-1.5">
                {shippingOption.data.description as string}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          {typeof price !== "number" ? (
            <Loading className="w-4 h-4" rows={1} />
          ) : price === 0 ? (
            // Free shipping reads better as a word than as a zero amount.
            <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-neutral-900">
              Complimentary
            </span>
          ) : (
            <Price
              price={price}
              currencyCode={cart.currency_code}
              textSize="small"
              textWeight="plus"
            />
          )}
        </div>
      </div>
    </label>
  )
}

export default ShippingItemSelector
