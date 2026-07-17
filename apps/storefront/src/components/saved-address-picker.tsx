import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"

import Radio from "@/components/ui/radio"

export const NEW_ADDRESS_ID = "__new__"

type SavedAddressPickerProps = {
  addresses: HttpTypes.StoreCustomerAddress[]
  /** Either a saved address id, or NEW_ADDRESS_ID while entering a new one. */
  selectedId: string
  onSelect: (id: string) => void
}

/**
 * Lets a returning customer pick one of their saved addresses instead of
 * retyping it, with a final option to enter a new one.
 *
 * Saved cards carry no visible marker: the black border and the "Delivering
 * here" badge say which is chosen. The radio itself stays in the DOM, hidden,
 * so the group is still keyboard and screen reader navigable.
 */
const SavedAddressPicker = ({
  addresses,
  selectedId,
  onSelect,
}: SavedAddressPickerProps) => {
  return (
    <div
      className="flex flex-col gap-3"
      role="radiogroup"
      aria-label="Delivery address"
    >
      {addresses.map((address) => {
        const isSelected = selectedId === address.id

        return (
          <label
            key={address.id}
            className={clsx(
              "block cursor-pointer border p-6 transition-colors",
              isSelected
                ? "border-neutral-900 bg-white"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            )}
          >
            <input
              type="radio"
              name="saved_address"
              value={address.id}
              checked={isSelected}
              onChange={() => onSelect(address.id!)}
              className="sr-only"
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-900">
                  {address.first_name} {address.last_name}
                </span>
                {address.is_default_shipping && (
                  <span className="bg-neutral-100 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
                    Default
                  </span>
                )}
              </div>

              {isSelected && (
                <span className="shrink-0 bg-neutral-900 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                  Delivering here
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-1 text-sm text-neutral-600">
              <span>
                {address.address_1}
                {address.address_2 ? `, ${address.address_2}` : ""}
              </span>
              <span>
                {[address.city, address.province, address.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </span>
              <span>
                {address.country_code?.toUpperCase()}
                {address.phone ? ` • ${address.phone}` : ""}
              </span>
            </div>
          </label>
        )
      })}

      <label
        className={clsx(
          "flex cursor-pointer items-center gap-4 border p-6 transition-colors",
          selectedId === NEW_ADDRESS_ID
            ? "border-neutral-900 bg-white"
            : "border-neutral-200 bg-white hover:border-neutral-400"
        )}
      >
        <Radio
          name="saved_address"
          value={NEW_ADDRESS_ID}
          checked={selectedId === NEW_ADDRESS_ID}
          onChange={() => onSelect(NEW_ADDRESS_ID)}
        />
        <span className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-900">
          Use a new address
        </span>
      </label>
    </div>
  )
}

export default SavedAddressPicker
