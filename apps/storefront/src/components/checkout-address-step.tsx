import AddressForm from "@/components/address-form"
import SavedAddressPicker, { NEW_ADDRESS_ID } from "@/components/saved-address-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  BUTTON_LABEL,
  EYEBROW,
  SECTION_HEADING,
} from "@/lib/constants/checkout-ui"
import { useSetCartAddresses } from "@/lib/hooks/use-checkout"
import { useCustomer } from "@/lib/hooks/use-customer"
import {
  isSameAddress,
  pickDefaultAddress,
  toAddressFormData,
  useCreateCustomerAddress,
  useCustomerAddresses,
} from "@/lib/hooks/use-customer-addresses"
import { AddressFormData } from "@/lib/types/global"
import { getStoredCountryCode } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"

interface AddressStepProps {
  cart: HttpTypes.StoreCart;
  onNext: () => void;
}

const AddressStep = ({ cart, onNext }: AddressStepProps) => {
  const setAddressesMutation = useSetCartAddresses()
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShippingAddressValid, setIsShippingAddressValid] = useState(false)
  const [isBillingAddressValid, setIsBillingAddressValid] = useState(false)
  const [email, setEmail] = useState(cart.email || "")
  const storedCountryCode = getStoredCountryCode()

  const { data: customer } = useCustomer()
  const { data: savedAddresses = [] } = useCustomerAddresses({
    enabled: !!customer,
  })
  const createAddressMutation = useCreateCustomerAddress()

  // Which saved address is in use, or NEW_ADDRESS_ID while typing a new one.
  const [selectedAddressId, setSelectedAddressId] = useState<string>(NEW_ADDRESS_ID)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  // Fetch all regions and countries for worldwide shipping
  const { data: allCountries } = useQuery({
    queryKey: ["regions", "all-countries"],
    queryFn: async () => {
      const { regions } = await sdk.store.region.list({
        fields: "countries.*",
      })
      // Flatten all countries from all regions
      const countries = regions?.flatMap((region: HttpTypes.StoreRegion) => region.countries || []) || []
      return countries
    },
  })
  // Get the default country from the cart's region
  const defaultCountryCode = cart.region?.countries?.[0]?.iso_2 || storedCountryCode || ""

  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    first_name: cart.shipping_address?.first_name || "",
    last_name: cart.shipping_address?.last_name || "",
    company: cart.shipping_address?.company || "",
    address_1: cart.shipping_address?.address_1 || "",
    address_2: cart.shipping_address?.address_2 || "",
    city: cart.shipping_address?.city || "",
    postal_code: cart.shipping_address?.postal_code || "",
    province: cart.shipping_address?.province || "",
    country_code:
      cart.shipping_address?.country_code || defaultCountryCode,
    phone: cart.shipping_address?.phone || "",
  })
  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    first_name: cart.billing_address?.first_name || "",
    last_name: cart.billing_address?.last_name || "",
    company: cart.billing_address?.company || "",
    address_1: cart.billing_address?.address_1 || "",
    address_2: cart.billing_address?.address_2 || "",
    city: cart.billing_address?.city || "",
    postal_code: cart.billing_address?.postal_code || "",
    province: cart.billing_address?.province || "",
    country_code: cart.billing_address?.country_code || defaultCountryCode,
    phone: cart.billing_address?.phone || "",
  })

  // Once the saved addresses arrive, preselect the default (or the only one) and
  // fill the form from it, so a returning customer can just click Next. Runs
  // once so it never fights a later manual choice.
  useEffect(() => {
    if (hasAutoSelected || !savedAddresses.length) {
      return
    }

    setHasAutoSelected(true)

    // A cart that already carries an address was set on a previous visit —
    // leave it alone rather than overwriting the customer's earlier choice.
    if (cart.shipping_address?.address_1) {
      const matching = savedAddresses.find(
        (a) =>
          a.address_1 === cart.shipping_address?.address_1 &&
          a.postal_code === cart.shipping_address?.postal_code
      )
      if (matching?.id) {
        setSelectedAddressId(matching.id)
      }
      return
    }

    const preferred = pickDefaultAddress(savedAddresses)
    if (preferred?.id) {
      setSelectedAddressId(preferred.id)
      setShippingAddress(toAddressFormData(preferred, defaultCountryCode))
    }
  }, [savedAddresses, hasAutoSelected, cart.shipping_address, defaultCountryCode])

  // The account's email is the one orders should go to; only prefill an empty field.
  useEffect(() => {
    if (!email && customer?.email) {
      setEmail(customer.email)
    }
  }, [customer?.email, email])

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)

    if (id === NEW_ADDRESS_ID) {
      // Start from a blank form rather than leaving the previous address behind.
      setShippingAddress({
        first_name: "",
        last_name: "",
        company: "",
        address_1: "",
        address_2: "",
        city: "",
        postal_code: "",
        province: "",
        country_code: defaultCountryCode,
        phone: "",
      })
      return
    }

    const selected = savedAddresses.find((a) => a.id === id)
    if (selected) {
      setShippingAddress(toAddressFormData(selected, defaultCountryCode))
    }
  }

  const isUsingNewAddress = selectedAddressId === NEW_ADDRESS_ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const submitData = new FormData()

      // Add email
      submitData.append("email", email)

      // Add shipping address
      Object.entries(shippingAddress).forEach(([key, value]) => {
        submitData.append(`shipping_address.${key}`, value)
      })

      // Add billing address (same as shipping if checkbox is checked)
      const billingData = sameAsBilling ? shippingAddress : billingAddress
      Object.entries(billingData).forEach(([key, value]) => {
        submitData.append(`billing_address.${key}`, value)
      })

      await setAddressesMutation.mutateAsync(submitData)

      // A new address goes into the address book automatically, so the next
      // checkout offers it as a pick instead of an empty form. The first one
      // becomes the default, which is what gets preselected from then on.
      // Saving shouldn't block checkout if it fails.
      const isAlreadySaved = savedAddresses.some((saved) =>
        isSameAddress(saved, shippingAddress)
      )

      if (customer && isUsingNewAddress && !isAlreadySaved) {
        try {
          await createAddressMutation.mutateAsync({
            ...shippingAddress,
            is_default_shipping: savedAddresses.length === 0,
          })
        } catch {
          // The order can still proceed with the address set on the cart.
        }
      }

      onNext()
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const emailValid = email.trim() && email.includes("@")

    // A saved address was already validated when it was created, and the form
    // that reports `isShippingAddressValid` isn't rendered while one is picked.
    const shippingValid = isUsingNewAddress ? isShippingAddressValid : true

    return (
      emailValid &&
      shippingValid &&
      (isBillingAddressValid || sameAsBilling)
    )
  }



  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h2 className={SECTION_HEADING}>Shipping Address</h2>
            <div className="h-px bg-neutral-200" />
          </div>

          {/* Saved addresses, when the customer has any */}
          {savedAddresses.length > 0 && (
            <SavedAddressPicker
              addresses={savedAddresses}
              selectedId={selectedAddressId}
              onSelect={handleSelectAddress}
            />
          )}

          {/* The form is only needed while entering a new address */}
          {isUsingNewAddress && (
            <div className="flex flex-col gap-2">
              <AddressForm
                addressFormData={shippingAddress}
                setAddressFormData={setShippingAddress}
                countries={allCountries}
                setIsFormValid={setIsShippingAddressValid}
              />

              {customer && (
                <p className="pt-2 text-xs text-zinc-600">
                  {savedAddresses.length === 0
                    ? "We'll save this to your account as your default delivery address."
                    : "We'll save this to your account so you can pick it next time."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Billing Address Checkbox */}
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="same_as_billing"
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(!!e.target.checked)}
          />
          <label htmlFor="same_as_billing" className="text-sm">
            Billing address is the same as shipping address
          </label>
        </div>

        {/* Billing Address (if different) */}
        {!sameAsBilling && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className={SECTION_HEADING}>Billing Address</h2>
              <div className="h-px bg-neutral-200" />
            </div>
            <AddressForm
              addressFormData={billingAddress}
              setAddressFormData={setBillingAddress}
              countries={allCountries}
              setIsFormValid={setIsBillingAddressValid}
            />
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={EYEBROW}>
            Contact Email
          </label>
          <Input
            id="email"
            type="email"
            variant="underline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <p className="text-xs text-neutral-500">
            Order confirmation and updates will be sent to this email.
          </p>
        </div>

        <div className="flex border-t border-neutral-200 pt-8">
          <Button
            type="submit"
            size="fit"
            disabled={!isFormValid() || isSubmitting}
            className={`${BUTTON_LABEL} min-w-[280px]`}
          >
            Continue to delivery
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddressStep
