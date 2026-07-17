import { HttpTypes } from "@medusajs/types"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { useEffect } from "react"

import AccountLayout from "@/components/account/account-layout"
import OrderStatusBadge from "@/components/account/order-status-badge"
import { Loading } from "@/components/ui/loading"
import {
  CARD,
  FIELD_LABEL,
  FIELD_VALUE,
  SECTION_ACTION,
  SECTION_EYEBROW,
} from "@/lib/constants/account-ui"
import { useCustomer } from "@/lib/hooks/use-customer"
import { useCustomerAddresses } from "@/lib/hooks/use-customer-addresses"
import { useCustomerOrders } from "@/lib/hooks/use-customer-orders"
import { getOrderStage } from "@/lib/utils/order-status"
import { formatPrice } from "@/lib/utils/price"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const Overview = () => {
  const { countryCode = "in" } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: customer, isLoading: customerLoading } = useCustomer()
  const { data: orders, isLoading: ordersLoading } = useCustomerOrders()
  const { data: addresses = [] } = useCustomerAddresses({ enabled: !!customer })

  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate({
        to: "/$countryCode/auth",
        params: { countryCode },
        search: { redirect: `/${countryCode}/account` },
        replace: true,
      })
    }
  }, [customer, customerLoading, countryCode, navigate])

  if (customerLoading || !customer) {
    return (
      <div className="container mx-auto px-4 pb-24 pt-40">
        <Loading rows={4} height="h-8" />
      </div>
    )
  }

  const fullName = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")

  const defaultAddress =
    addresses.find((a) => a.is_default_shipping) ?? addresses[0]

  const recentOrders = orders?.slice(0, 3) ?? []

  return (
    <AccountLayout
      countryCode={countryCode}
      current="overview"
      title={fullName || "My Account"}
      subline={customer.email}
    >
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className={SECTION_EYEBROW}>Account Details</h2>
            <Link
              to="/$countryCode/account/profile"
              params={{ countryCode }}
              className={SECTION_ACTION}
            >
              Edit
            </Link>
          </div>

          <div className={`${CARD} grid grid-cols-1 gap-6 p-6 sm:grid-cols-2`}>
            <div className="flex flex-col gap-1">
              <span className={FIELD_LABEL}>Name</span>
              <span className={FIELD_VALUE}>{fullName || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={FIELD_LABEL}>Email</span>
              <span className={FIELD_VALUE}>{customer.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={FIELD_LABEL}>Phone</span>
              <span className={FIELD_VALUE}>{customer.phone || "—"}</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className={SECTION_EYEBROW}>Default Address</h2>
            <Link
              to="/$countryCode/account/addresses"
              params={{ countryCode }}
              className={SECTION_ACTION}
            >
              Manage
            </Link>
          </div>

          {defaultAddress ? (
            <div className={`${CARD} p-6`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-neutral-900">
                  {defaultAddress.first_name} {defaultAddress.last_name}
                </p>
                {defaultAddress.is_default_shipping && (
                  <span className="shrink-0 border border-neutral-900 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-neutral-900">
                    Default
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 pt-3 text-[13px] text-neutral-600">
                <span>{defaultAddress.address_1}</span>
                {defaultAddress.address_2 && <span>{defaultAddress.address_2}</span>}
                <span>
                  {[
                    defaultAddress.city,
                    defaultAddress.province,
                    defaultAddress.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <span className="uppercase">{defaultAddress.country_code}</span>
                {defaultAddress.phone && <span>{defaultAddress.phone}</span>}
              </div>
            </div>
          ) : (
            <div className={`${CARD} p-6`}>
              <p className="text-sm text-neutral-600">
                No address saved yet.{" "}
                <Link
                  to="/$countryCode/account/addresses"
                  params={{ countryCode }}
                  className="underline underline-offset-4 hover:text-neutral-900"
                >
                  Add one
                </Link>{" "}
                and checkout becomes one click.
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className={SECTION_EYEBROW}>Recent Orders</h2>
            <Link
              to="/$countryCode/account/orders"
              params={{ countryCode }}
              className={SECTION_ACTION}
            >
              View all
            </Link>
          </div>

          {ordersLoading ? (
            <Loading rows={2} height="h-16" />
          ) : recentOrders.length > 0 ? (
            <div className={CARD}>
              {recentOrders.map((order: HttpTypes.StoreOrder) => (
                <Link
                  key={order.id}
                  to="/$countryCode/account/orders/$orderId"
                  params={{ countryCode, orderId: order.id }}
                  className="flex items-center justify-between gap-4 border-b border-neutral-200 p-5 transition-colors last:border-b-0 hover:bg-neutral-50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium uppercase text-neutral-900">
                      Order #{order.display_id}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDate(String(order.created_at))}
                    </span>
                  </div>

                  <OrderStatusBadge stage={getOrderStage(order)} />

                  <span className="text-sm font-medium text-neutral-900">
                    {formatPrice({
                      amount: order.total,
                      currency_code: order.currency_code,
                    })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`${CARD} p-6`}>
              <p className="text-sm text-neutral-600">
                When you place your first order it&apos;ll appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </AccountLayout>
  )
}

export default Overview
