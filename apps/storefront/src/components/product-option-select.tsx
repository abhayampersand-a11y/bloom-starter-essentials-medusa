import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import React from "react"

type ProductOptionSelectProps = {
  option: HttpTypes.StoreProductOption;
  current: string | undefined;
  updateOption: (title: string, value: string) => void;
  title: string;
  disabled: boolean;
  /** Map of option value -> hex colour code (from product.metadata.color_hex) */
  colorMap?: Record<string, string>;
  /** Rendered opposite the label, e.g. a "Size guide" link */
  action?: React.ReactNode;
  "data-testid"?: string;
};

export const COLOR_OPTION_TITLES = ["color", "colour"]
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

// Garment sizes read smallest-to-largest, regardless of the order the admin
// happened to create the option values in. Values outside this list keep their
// original order and sort after the ones that match.
const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "4xl"]

const sortBySize = (values: string[]): string[] => {
  const rank = (value: string) => {
    const index = SIZE_ORDER.indexOf(value.trim().toLowerCase())
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  return values.every((v) => rank(v) === Number.MAX_SAFE_INTEGER)
    ? values
    : [...values].sort((a, b) => rank(a) - rank(b))
}

const getSwatchColor = (
  value: string,
  colorMap?: Record<string, string>
): string | undefined => {
  const hex = colorMap?.[value]
  if (hex && HEX_PATTERN.test(hex)) {
    return hex
  }
  // Fall back to the option value itself when it's a valid CSS colour name
  if (
    typeof CSS !== "undefined" &&
    CSS.supports("color", value.toLowerCase())
  ) {
    return value.toLowerCase()
  }
  return undefined
}

const ProductOptionSelect: React.FC<ProductOptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  colorMap,
  action,
  "data-testid": dataTestId,
  disabled,
}) => {
  const isColorOption = COLOR_OPTION_TITLES.includes(
    option.title?.toLowerCase() ?? ""
  )

  const optionValues = (option.values ?? []).map((v) => v.value)
  const filteredOptions = isColorOption ? optionValues : sortBySize(optionValues)

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
          {title}
          {isColorOption && current ? `: ${current}` : ""}
        </span>
        {action}
      </div>
      <div
        className={clsx("flex flex-wrap gap-2", {
          "gap-3": isColorOption,
        })}
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isActive = v === current
          const swatch = isColorOption ? getSwatchColor(v, colorMap) : undefined

          if (swatch) {
            return (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                type="button"
                title={v}
                aria-label={v}
                aria-pressed={isActive}
                className={clsx(
                  "h-6 w-6 shrink-0 rounded-full border border-neutral-300 transition-all duration-200 ease-in-out",
                  {
                    "ring-1 ring-neutral-900 ring-offset-2": isActive,
                    "hover:ring-1 hover:ring-neutral-400 hover:ring-offset-2":
                      !isActive && !disabled,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
                style={{ backgroundColor: swatch }}
                disabled={disabled}
                data-testid="option-button"
              />
            )
          }

          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              type="button"
              className={clsx(
                "border text-xs font-medium uppercase tracking-[0.1em] px-4 py-3 flex-1 min-w-[64px]",
                "inline-flex items-center justify-center transition-all duration-200 ease-in-out",
                {
                  // Active state
                  "border-neutral-900 bg-neutral-900 text-white": isActive,
                  // Default state
                  "border-neutral-300 bg-white text-neutral-900": !isActive,
                  // Hover state
                  "hover:border-neutral-900": !isActive && !disabled,
                  // Disabled state
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductOptionSelect
