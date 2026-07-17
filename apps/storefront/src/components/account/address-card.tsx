import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"

import { CARD_ACTION, CARD_ACTION_DANGER } from "@/lib/constants/account-ui"

type AddressCardProps = {
  address: HttpTypes.StoreCustomerAddress
  onEdit: (address: HttpTypes.StoreCustomerAddress) => void
  onDelete: (address: HttpTypes.StoreCustomerAddress) => void
  onSetDefault: (address: HttpTypes.StoreCustomerAddress) => void
  /** True while this card's set-default write is in flight. */
  isSettingDefault?: boolean
}

/**
 * One saved address. The default carries a near-black border instead of the
 * hairline, so it's identifiable before you read the badge.
 */
const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
}: AddressCardProps) => {
  const isDefault = !!address.is_default_shipping

  const locality = [address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ")

  return (
    <div
      className={clsx(
        "flex flex-col bg-white p-6",
        isDefault ? "border border-neutral-900" : "border border-neutral-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.15em] text-neutral-900">
          {address.address_name || "Address"}
        </span>
        {isDefault && (
          <span className="shrink-0 bg-neutral-900 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
            Default
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-neutral-900">
        {address.first_name} {address.last_name}
      </p>

      <div className="mt-2 flex flex-1 flex-col gap-1 text-[13px] text-neutral-600">
        {address.company && <span>{address.company}</span>}
        <span>{address.address_1}</span>
        {address.address_2 && <span>{address.address_2}</span>}
        <span>{locality}</span>
        <span className="uppercase">{address.country_code}</span>
        {address.phone && <span className="pt-2">{address.phone}</span>}
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className={clsx(CARD_ACTION, "text-neutral-900 hover:text-neutral-600")}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(address)}
            className={clsx(CARD_ACTION, CARD_ACTION_DANGER)}
          >
            Delete
          </button>
          {!isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              disabled={isSettingDefault}
              className={clsx(
                CARD_ACTION,
                "ml-auto text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
              )}
            >
              {isSettingDefault ? "Saving…" : "Set as default"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressCard
