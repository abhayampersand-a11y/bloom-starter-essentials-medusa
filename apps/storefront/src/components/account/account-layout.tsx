import { Link, useNavigate } from "@tanstack/react-router"
import { clsx } from "clsx"
import { ReactNode } from "react"

import { useLogout } from "@/lib/hooks/use-customer"
import {
  PAGE,
  PAGE_EYEBROW,
  PAGE_HEADING,
  PAGE_SUBLINE,
} from "@/lib/constants/account-ui"

export type AccountSection = "overview" | "orders" | "addresses" | "profile"

type NavItem = {
  key: AccountSection
  label: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", to: "/$countryCode/account" },
  { key: "orders", label: "Orders", to: "/$countryCode/account/orders" },
  { key: "addresses", label: "Addresses", to: "/$countryCode/account/addresses" },
  { key: "profile", label: "Profile", to: "/$countryCode/account/profile" },
]

type AccountLayoutProps = {
  countryCode: string
  /** Which sidebar item reads as current. */
  current: AccountSection
  /** The 11px line above the title. */
  eyebrow?: string
  title: string
  subline?: string
  /** Sits on the title's row, right aligned — e.g. "+ ADD NEW ADDRESS". */
  action?: ReactNode
  children: ReactNode
}

/**
 * The shell every account screen sits in: page heading, the sidebar nav, and
 * the content column beside it.
 *
 * Below `lg` the sidebar becomes a horizontal scrolling tab strip under the
 * title, since a 240px column doesn't survive a phone.
 */
const AccountLayout = ({
  countryCode,
  current,
  eyebrow = "My Account",
  title,
  subline,
  action,
  children,
}: AccountLayoutProps) => {
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

  const handleSignOut = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate({ to: "/$countryCode", params: { countryCode } })
      },
    })
  }

  return (
    <div className={PAGE}>
      <div className="container mx-auto px-4 pb-24 pt-32 md:pt-40">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className={PAGE_EYEBROW}>{eyebrow}</span>
            <h1 className={PAGE_HEADING}>{title}</h1>
            {subline && <p className={PAGE_SUBLINE}>{subline}</p>}
          </div>
          {action}
        </header>

        <div className="flex flex-col gap-8 pt-8 lg:flex-row lg:gap-16">
          <nav
            aria-label="Account"
            className="shrink-0 lg:w-[240px]"
          >
            {/* Horizontal tabs on small screens, a stacked list from lg up. */}
            <ul className="flex overflow-x-auto border-b border-neutral-200 lg:flex-col lg:overflow-visible lg:border-b-0">
              {NAV_ITEMS.map((item) => {
                const isCurrent = item.key === current

                return (
                  <li key={item.key} className="lg:border-b lg:border-neutral-200">
                    <Link
                      to={item.to}
                      params={{ countryCode }}
                      className={clsx(
                        "block whitespace-nowrap px-4 py-4 text-[11px] uppercase tracking-[0.15em] transition-colors lg:px-0",
                        isCurrent
                          ? "font-semibold text-neutral-900 lg:border-l-2 lg:border-neutral-900 lg:pl-4"
                          : "text-neutral-500 hover:text-neutral-900"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-6 block px-4 text-left text-[11px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:text-neutral-900 lg:px-0"
            >
              Sign Out
            </button>
          </nav>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
