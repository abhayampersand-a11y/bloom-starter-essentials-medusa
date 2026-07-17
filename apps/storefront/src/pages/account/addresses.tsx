import { HttpTypes } from "@medusajs/types"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import AccountLayout from "@/components/account/account-layout"
import AddressCard from "@/components/account/address-card"
import AddressDrawer from "@/components/account/address-drawer"
import DeleteAddressDialog from "@/components/account/delete-address-dialog"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { BUTTON_LABEL } from "@/lib/constants/account-ui"
import { useCustomer } from "@/lib/hooks/use-customer"
import {
  AddressWriteData,
  useCreateCustomerAddress,
  useCustomerAddresses,
  useDeleteCustomerAddress,
  useUpdateCustomerAddress,
} from "@/lib/hooks/use-customer-addresses"

const Addresses = () => {
  const { countryCode = "in" } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: customer, isLoading: customerLoading } = useCustomer()
  const { data: addresses = [], isLoading: addressesLoading } =
    useCustomerAddresses({ enabled: !!customer })

  const createAddress = useCreateCustomerAddress()
  const updateAddress = useUpdateCustomerAddress()
  const deleteAddress = useDeleteCustomerAddress()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<HttpTypes.StoreCustomerAddress>()
  const [pendingDelete, setPendingDelete] =
    useState<HttpTypes.StoreCustomerAddress>()
  const [saveError, setSaveError] = useState<string | null>(null)
  /** Which card's "set as default" is in flight — the list shares one mutation. */
  const [promotingId, setPromotingId] = useState<string>()

  // The auth token lives in localStorage, so the server can't know who's signed
  // in — this can't be a loader redirect.
  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate({
        to: "/$countryCode/auth",
        params: { countryCode },
        search: { redirect: `/${countryCode}/account/addresses` },
        replace: true,
      })
    }
  }, [customer, customerLoading, countryCode, navigate])

  const openAdd = () => {
    setEditing(undefined)
    setSaveError(null)
    setIsDrawerOpen(true)
  }

  const openEdit = (address: HttpTypes.StoreCustomerAddress) => {
    setEditing(address)
    setSaveError(null)
    setIsDrawerOpen(true)
  }

  const handleSubmit = async (data: AddressWriteData) => {
    setSaveError(null)

    try {
      if (editing?.id) {
        await updateAddress.mutateAsync({ id: editing.id, ...data })
      } else {
        // The first address is the one checkout will preselect, so it becomes
        // the default whether or not the customer ticked the box.
        await createAddress.mutateAsync({
          ...data,
          is_default_shipping: data.is_default_shipping || addresses.length === 0,
        })
      }
      setIsDrawerOpen(false)
    } catch {
      setSaveError("We couldn't save that address. Try again.")
    }
  }

  const handleSetDefault = async (address: HttpTypes.StoreCustomerAddress) => {
    if (!address.id) {
      return
    }

    setPromotingId(address.id)
    try {
      await updateAddress.mutateAsync({
        id: address.id,
        is_default_shipping: true,
      })
    } catch {
      // The list still shows the old default, which is the true state.
    } finally {
      setPromotingId(undefined)
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete?.id) {
      return
    }

    try {
      await deleteAddress.mutateAsync(pendingDelete.id)
    } catch {
      // Leaves the card in place — the address is still there.
    } finally {
      setPendingDelete(undefined)
      setIsDrawerOpen(false)
    }
  }

  const isLoading = customerLoading || addressesLoading

  return (
    <AccountLayout
      countryCode={countryCode}
      current="addresses"
      title="Addresses"
      subline="Save the places you order to, so checkout is one click."
      action={
        addresses.length > 0 ? (
          <Button size="fit" onClick={openAdd} className={BUTTON_LABEL}>
            + Add New Address
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <Loading rows={3} height="h-32" />
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center border border-neutral-200 bg-white px-6 py-20 text-center">
          <p className="text-[13px] uppercase tracking-[0.15em] text-neutral-900">
            No saved addresses
          </p>
          <p className="max-w-xs pt-3 text-sm text-neutral-600">
            Add an address and it&apos;ll be ready and waiting at checkout.
          </p>
          <Button
            size="fit"
            onClick={openAdd}
            className={`${BUTTON_LABEL} mt-8`}
          >
            Add New Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onSetDefault={handleSetDefault}
              isSettingDefault={promotingId === address.id}
            />
          ))}

          <button
            type="button"
            onClick={openAdd}
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[11px] uppercase tracking-[0.15em]">
              Add New Address
            </span>
          </button>
        </div>
      )}

      <AddressDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        address={editing}
        defaultCountryCode={countryCode}
        onSubmit={handleSubmit}
        onDelete={setPendingDelete}
        isSaving={createAddress.isPending || updateAddress.isPending}
        error={saveError}
      />

      <DeleteAddressDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteAddress.isPending}
      />
    </AccountLayout>
  )
}

export default Addresses
