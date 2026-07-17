import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

import AddressForm from "@/components/address-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { BUTTON_LABEL } from "@/lib/constants/account-ui"
import { EYEBROW } from "@/lib/constants/checkout-ui"
import {
  AddressWriteData,
  toAddressFormData,
} from "@/lib/hooks/use-customer-addresses"
import { AddressFormData } from "@/lib/types/global"

const emptyAddress = (countryCode: string): AddressFormData => ({
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  postal_code: "",
  province: "",
  country_code: countryCode,
  phone: "",
})

type AddressDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The address being edited, or undefined when adding a new one. */
  address?: HttpTypes.StoreCustomerAddress
  /** Preselected country for a new address — the region the customer is browsing. */
  defaultCountryCode: string
  onSubmit: (data: AddressWriteData) => Promise<void>
  onDelete?: (address: HttpTypes.StoreCustomerAddress) => void
  isSaving?: boolean
  /** Message from a failed save, shown above the footer. */
  error?: string | null
}

/**
 * The add / edit address panel. One drawer serves both: `address` decides
 * whether it opens blank or prefilled, and which title and actions it shows.
 */
const AddressDrawer = ({
  open,
  onOpenChange,
  address,
  defaultCountryCode,
  onSubmit,
  onDelete,
  isSaving,
  error,
}: AddressDrawerProps) => {
  const isEditing = !!address

  const [formData, setFormData] = useState<AddressFormData>(
    emptyAddress(defaultCountryCode)
  )
  const [nickname, setNickname] = useState("")
  const [isDefaultShipping, setIsDefaultShipping] = useState(false)
  const [isDefaultBilling, setIsDefaultBilling] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  // Reset on each open so an edit never inherits the last address's values, and
  // a cancelled edit doesn't leave its changes behind for the next open.
  useEffect(() => {
    if (!open) {
      return
    }

    if (address) {
      setFormData(toAddressFormData(address, defaultCountryCode))
      setNickname(address.address_name || "")
      setIsDefaultShipping(!!address.is_default_shipping)
      setIsDefaultBilling(!!address.is_default_billing)
      return
    }

    setFormData(emptyAddress(defaultCountryCode))
    setNickname("")
    setIsDefaultShipping(false)
    setIsDefaultBilling(false)
  }, [open, address, defaultCountryCode])

  const handleSave = async () => {
    if (!isFormValid || isSaving) {
      return
    }

    await onSubmit({
      ...formData,
      address_name: nickname.trim(),
      is_default_shipping: isDefaultShipping,
      is_default_billing: isDefaultBilling,
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="flex flex-col sm:max-w-[480px]"
        aria-label={isEditing ? "Edit address" : "Add new address"}
      >
        <DrawerHeader>
          <DrawerTitle className="font-display text-base uppercase tracking-[0.1em]">
            {isEditing ? "Edit Address" : "Add New Address"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-2 pb-4">
            <label htmlFor="address_name" className={EYEBROW}>
              Address Nickname
            </label>
            <Input
              variant="underline"
              id="address_name"
              name="address_name"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Home"
            />
            <p className="text-[11px] text-neutral-500">
              e.g. Home, Work — only you see this.
            </p>
          </div>

          <AddressForm
            addressFormData={formData}
            setAddressFormData={setFormData}
            setIsFormValid={setIsFormValid}
          />

          <div className="flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_default_shipping"
                checked={isDefaultShipping}
                onChange={(e) => setIsDefaultShipping(!!e.target.checked)}
              />
              <label htmlFor="is_default_shipping" className="text-sm">
                Set as my default shipping address
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_default_billing"
                checked={isDefaultBilling}
                onChange={(e) => setIsDefaultBilling(!!e.target.checked)}
              />
              <label htmlFor="is_default_billing" className="text-sm">
                Set as my default billing address
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 p-6">
          {error && <p className="pb-4 text-xs text-rose-700">{error}</p>}

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="fit"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className={BUTTON_LABEL}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              className={BUTTON_LABEL}
            >
              {isSaving ? "Saving…" : "Save Address"}
            </Button>
          </div>

          {isEditing && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(address)}
              disabled={isSaving}
              className="mt-4 text-[11px] uppercase tracking-[0.12em] text-rose-700 underline underline-offset-4 transition-colors hover:text-rose-800 disabled:opacity-50"
            >
              Delete Address
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AddressDrawer
