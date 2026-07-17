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
  "data-testid"?: string;
};

export const COLOR_OPTION_TITLES = ["color", "colour"]
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

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
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  const isColorOption = COLOR_OPTION_TITLES.includes(
    option.title?.toLowerCase() ?? ""
  )

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className={clsx("flex flex-wrap gap-2", {
          "justify-between": !isColorOption,
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
                  "h-9 w-9 shrink-0 rounded-full border transition-all duration-200 ease-in-out",
                  {
                    // Active state
                    "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2":
                      isActive,
                    // Default state
                    "border-zinc-300": !isActive,
                    // Hover state
                    "hover:ring-2 hover:ring-zinc-400 hover:ring-offset-2":
                      !isActive && !disabled,
                    // Disabled state
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
                "border text-sm font-medium px-4 py-2.5 flex-1 rounded-base transition-all duration-200 ease-in-out",
                "inline-flex items-center justify-center gap-x-2",
                {
                  // Active state
                  "border-zinc-900 bg-zinc-50 text-zinc-900 shadow-sm":
                    isActive,
                  // Default state
                  "border-zinc-300 bg-zinc-50 text-zinc-600":
                    !isActive,
                  // Hover states
                  "hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-900":
                    !isActive && !disabled,
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
