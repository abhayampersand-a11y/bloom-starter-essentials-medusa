import { useNavigate, useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import AccountLayout from "@/components/account/account-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { BUTTON_LABEL, CARD, FIELD_LABEL } from "@/lib/constants/account-ui"
import { EYEBROW } from "@/lib/constants/checkout-ui"
import { useCustomer, useUpdateCustomer } from "@/lib/hooks/use-customer"

const Profile = () => {
  const { countryCode = "in" } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: customer, isLoading: customerLoading } = useCustomer()
  const updateCustomer = useUpdateCustomer()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")

  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate({
        to: "/$countryCode/auth",
        params: { countryCode },
        search: { redirect: `/${countryCode}/account/profile` },
        replace: true,
      })
    }
  }, [customer, customerLoading, countryCode, navigate])

  // Fills the form once the customer lands. Keyed on the id so it doesn't
  // overwrite what's being typed on every refetch.
  useEffect(() => {
    if (!customer) {
      return
    }
    setFirstName(customer.first_name || "")
    setLastName(customer.last_name || "")
    setPhone(customer.phone || "")
  }, [customer?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("idle")

    try {
      await updateCustomer.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      })
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }

  if (customerLoading || !customer) {
    return (
      <div className="container mx-auto px-4 pb-24 pt-40">
        <Loading rows={4} height="h-8" />
      </div>
    )
  }

  return (
    <AccountLayout
      countryCode={countryCode}
      current="profile"
      title="Profile"
      subline="The name and number we use on your orders."
    >
      <form onSubmit={handleSubmit} className={`${CARD} flex flex-col gap-6 p-6`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="first_name" className={EYEBROW}>
              First Name
            </label>
            <Input
              variant="underline"
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="last_name" className={EYEBROW}>
              Last Name
            </label>
            <Input
              variant="underline"
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:max-w-sm">
          <label htmlFor="phone" className={EYEBROW}>
            Phone
          </label>
          <Input
            variant="underline"
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />
        </div>

        {/* Email is the login, so it isn't editable here. */}
        <div className="flex flex-col gap-1 border-t border-neutral-200 pt-6">
          <span className={FIELD_LABEL}>Email</span>
          <span className="text-sm text-neutral-900">{customer.email}</span>
          <span className="pt-1 text-xs text-neutral-500">
            Your email is how you sign in — contact us if you need it changed.
          </span>
        </div>

        <div className="flex items-center gap-4 border-t border-neutral-200 pt-6">
          <Button
            type="submit"
            size="fit"
            disabled={updateCustomer.isPending}
            className={BUTTON_LABEL}
          >
            {updateCustomer.isPending ? "Saving…" : "Save Changes"}
          </Button>

          {status === "saved" && (
            <span className="text-xs text-neutral-600">Saved.</span>
          )}
          {status === "error" && (
            <span className="text-xs text-rose-700">
              We couldn&apos;t save that. Try again.
            </span>
          )}
        </div>
      </form>
    </AccountLayout>
  )
}

export default Profile
