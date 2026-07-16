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

const COLOR_OPTION_TITLES = ["color", "colour"]
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

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
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isActive = v === current
          const hex = isColorOption ? colorMap?.[v] : undefined
          const swatch = hex && HEX_PATTERN.test(hex) ? hex : undefined
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
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
              {swatch && (
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 shrink-0 rounded-full border border-zinc-300"
                  style={{ backgroundColor: swatch }}
                />
              )}
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductOptionSelect
