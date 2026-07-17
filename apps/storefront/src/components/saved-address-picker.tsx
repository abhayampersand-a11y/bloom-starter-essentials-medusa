import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"

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
        const isDefault = address.is_default_shipping

        return (
          <label
            key={address.id}
            className={clsx(
              "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
              isSelected
                ? "border-zinc-900 bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-400"
            )}
          >
            <input
              type="radio"
              name="saved_address"
              value={address.id}
              checked={isSelected}
              onChange={() => onSelect(address.id!)}
              className="mt-1 accent-zinc-900"
            />
            <span className="flex flex-col gap-1 text-sm">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-900">
                  {address.first_name} {address.last_name}
                </span>
                {isDefault && (
                  <span className="border border-zinc-300 px-1.5 py-0.5 text-xs text-zinc-600">
                    Default
                  </span>
                )}
                {isSelected && (
                  <span className="bg-zinc-900 px-1.5 py-0.5 text-xs text-white">
                    Delivering here
                  </span>
                )}
              </span>
              <span className="text-zinc-600">
                {address.address_1}
                {address.address_2 ? `, ${address.address_2}` : ""}
                <br />
                {address.city}
                {address.province ? `, ${address.province}` : ""} {address.postal_code}
                <br />
                {address.country_code?.toUpperCase()}
                {address.phone ? ` · ${address.phone}` : ""}
              </span>
            </span>
          </label>
        )
      })}

      <label
        className={clsx(
          "flex cursor-pointer items-center gap-3 border p-4 transition-colors",
          selectedId === NEW_ADDRESS_ID
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-200 hover:border-zinc-400"
        )}
      >
        <input
          type="radio"
          name="saved_address"
          value={NEW_ADDRESS_ID}
          checked={selectedId === NEW_ADDRESS_ID}
          onChange={() => onSelect(NEW_ADDRESS_ID)}
          className="accent-zinc-900"
        />
        <span className="text-sm font-medium text-zinc-900">
          Use a new address
        </span>
      </label>
    </div>
  )
}

export default SavedAddressPicker
