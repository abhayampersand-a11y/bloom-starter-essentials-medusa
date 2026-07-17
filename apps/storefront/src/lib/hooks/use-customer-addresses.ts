import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { HttpTypes } from "@medusajs/types"

import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { AddressFormData } from "@/lib/types/global"

type AddressListResponse = {
  addresses: HttpTypes.StoreCustomerAddress[]
}

/**
 * The signed-in customer's saved addresses, used to offer a pick-list at
 * checkout instead of retyping. Returns an empty list for guests.
 */
export function useCustomerAddresses({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.customer.addresses(),
    queryFn: async () => {
      const { addresses } = await sdk.client.fetch<AddressListResponse>(
        "/store/customers/me/addresses",
        { method: "GET", query: { limit: 50 } }
      )
      return addresses ?? []
    },
    enabled,
    retry: false,
  })
}

/** Saves a new address to the signed-in customer's address book. */
export function useCreateCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: AddressFormData & { is_default_shipping?: boolean }) => {
      const { customer } = await sdk.client.fetch<{
        customer: HttpTypes.StoreCustomer
      }>("/store/customers/me/addresses", {
        method: "POST",
        body: address,
      })
      return customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.addresses() })
    },
  })
}

/**
 * Picks the address to preselect: the one marked default for shipping, falling
 * back to the first saved address.
 */
export function pickDefaultAddress(
  addresses: HttpTypes.StoreCustomerAddress[]
): HttpTypes.StoreCustomerAddress | undefined {
  return addresses.find((a) => a.is_default_shipping) ?? addresses[0]
}

/**
 * Whether a saved address is the one held in the form, so checkout doesn't add
 * a duplicate to the address book. Street, postcode and city are enough to tell
 * two of a customer's own addresses apart.
 */
export function isSameAddress(
  saved: HttpTypes.StoreCustomerAddress,
  form: AddressFormData
): boolean {
  const norm = (value?: string | null) => (value || "").trim().toLowerCase()

  return (
    norm(saved.address_1) === norm(form.address_1) &&
    norm(saved.postal_code) === norm(form.postal_code) &&
    norm(saved.city) === norm(form.city)
  )
}

/** Flattens a saved address into the shape the checkout form state uses. */
export function toAddressFormData(
  address: HttpTypes.StoreCustomerAddress,
  fallbackCountryCode = ""
): AddressFormData {
  return {
    first_name: address.first_name || "",
    last_name: address.last_name || "",
    company: address.company || "",
    address_1: address.address_1 || "",
    address_2: address.address_2 || "",
    city: address.city || "",
    postal_code: address.postal_code || "",
    province: address.province || "",
    country_code: address.country_code || fallbackCountryCode,
    phone: address.phone || "",
  }
}
