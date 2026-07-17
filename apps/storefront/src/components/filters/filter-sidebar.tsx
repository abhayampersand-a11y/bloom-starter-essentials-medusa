import type {
  FilterGroup,
  PriceRange,
} from "@/lib/hooks/use-product-filters"
import { formatPrice } from "@/lib/utils/price"
import { clsx } from "clsx"

type FilterSidebarProps = {
  groups: FilterGroup[]
  selected: Record<string, string[]>
  onToggle: (groupId: string, optionId: string) => void
  onClearAll: () => void
  hasActive: boolean
  priceBounds: PriceRange
  priceRange: PriceRange
  onPriceChange: (range: PriceRange) => void
  currencyCode: string
}

/** Swatch fills. Anything unmapped falls back to a neutral chip. */
const SWATCHES: Record<string, string> = {
  black: "#1a1a1a",
  white: "#ffffff",
  grey: "#9ca3af",
  gray: "#9ca3af",
  charcoal: "#36454f",
  sand: "#ddd9cd",
  olive: "#7d8c5f",
  navy: "#1e293b",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#b91c1c",
  brown: "#92400e",
}

/**
 * The listing's vertical filter rail: quiet uppercase headings over checkboxes,
 * colour swatches, size chips and a price range.
 */
export const FilterSidebar = ({
  groups,
  selected,
  onToggle,
  onClearAll,
  hasActive,
  priceBounds,
  priceRange,
  onPriceChange,
  currencyCode,
}: FilterSidebarProps) => {
  const hasPriceRange = priceBounds.max > priceBounds.min

  if (!groups.length && !hasPriceRange) {
    return null
  }

  return (
    <aside className="w-full shrink-0 lg:w-56">
      {hasActive && (
        <button
          onClick={onClearAll}
          className="mb-6 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900"
        >
          Clear all
        </button>
      )}

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.id}>
            <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              {group.title}
            </h3>

            {group.type === "swatch" && (
              <div className="flex flex-wrap gap-2.5">
                {group.options.map((option) => {
                  const isSelected = selected[group.id]?.includes(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onToggle(group.id, option.id)}
                      aria-pressed={isSelected}
                      aria-label={`${option.label} (${option.count})`}
                      title={`${option.label} (${option.count})`}
                      className={clsx(
                        "h-6 w-6 rounded-full border transition-all",
                        isSelected
                          ? "border-neutral-900 ring-1 ring-neutral-900 ring-offset-2"
                          : "border-neutral-300 hover:border-neutral-500"
                      )}
                      style={{
                        backgroundColor: SWATCHES[option.id] ?? "#e5e7eb",
                      }}
                    />
                  )
                })}
              </div>
            )}

            {group.type === "size" && (
              <div className="grid grid-cols-3 gap-1.5">
                {group.options.map((option) => {
                  const isSelected = selected[group.id]?.includes(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onToggle(group.id, option.id)}
                      aria-pressed={isSelected}
                      className={clsx(
                        "border py-2 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors",
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-900"
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}

            {group.type === "checkbox" && (
              <div className="flex flex-col gap-3">
                {group.options.map((option) => {
                  const isSelected = selected[group.id]?.includes(option.id)

                  return (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center justify-between gap-3 text-xs"
                    >
                      <span
                        className={clsx(
                          "transition-colors",
                          isSelected
                            ? "font-medium text-neutral-900"
                            : "text-neutral-600 hover:text-neutral-900"
                        )}
                      >
                        {option.label}{" "}
                        <span className="text-neutral-400">({option.count})</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => onToggle(group.id, option.id)}
                        className="h-3.5 w-3.5 shrink-0 accent-neutral-900"
                      />
                    </label>
                  )
                })}
              </div>
            )}
          </section>
        ))}

        {hasPriceRange && (
          <section>
            <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Price Range
            </h3>

            <label htmlFor="price-max" className="sr-only">
              Maximum price
            </label>
            <input
              id="price-max"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceRange.max}
              onChange={(e) =>
                onPriceChange({
                  min: priceBounds.min,
                  max: Number(e.target.value),
                })
              }
              className="w-full accent-neutral-900"
            />

            <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
              <span>
                {formatPrice({
                  amount: priceBounds.min,
                  currency_code: currencyCode,
                })}
              </span>
              <span className="font-medium text-neutral-900">
                {formatPrice({
                  amount: priceRange.max,
                  currency_code: currencyCode,
                })}
              </span>
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
