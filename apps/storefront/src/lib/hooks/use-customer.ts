import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { HttpTypes } from "@medusajs/types"

/**
 * Resolves the customer behind a freshly issued auth token.
 *
 * A token from a first-time OTP or Google login authenticates the identity but
 * isn't yet tied to a customer, so `retrieve` 401s. In that case we create the
 * customer and refresh the token, which is what binds the two together — without
 * the refresh the token keeps its empty actor and every /store call stays
 * unauthorized.
 */
async function resolveCustomer(details: {
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
}): Promise<HttpTypes.StoreCustomer> {
  try {
    const { customer } = await sdk.store.customer.retrieve()
    return customer
  } catch {
    const { customer } = await sdk.store.customer.create(details)
    await sdk.auth.refresh()
    return customer
  }
}

/**
 * Hands the open cart to the customer who just signed in.
 *
 * `transferCart` is the part order history depends on: a cart started while
 * signed out belongs to a guest customer, and completing it files the order
 * under that guest, where the customer's own account can never see it. Setting
 * the email doesn't move ownership — only the transfer does.
 *
 * `headers` carries the token explicitly for callers whose token hasn't landed
 * in storage yet; the transfer is rejected without an authenticated customer.
 */
async function associateCart(
  email?: string | null,
  headers?: Record<string, string>
) {
  const cartId = typeof window !== "undefined"
    ? localStorage.getItem("medusa_cart_id")
    : null

  if (!cartId) {
    return
  }

  try {
    await sdk.store.cart.transferCart(cartId, {}, headers)

    if (email) {
      await sdk.store.cart.update(cartId, { email }, {}, headers)
    }
  } catch {
    // A cart that's already completed or gone shouldn't block signing in.
  }
}

export function useCustomer() {
  return useQuery({
    queryKey: queryKeys.customer.current(),
    queryFn: async () => {
      try {
        const token = localStorage.getItem("medusa_auth_token")

        if (!token) {
          return null
        }

        const { customer } = await sdk.store.customer.retrieve()
        return customer
      } catch {
        return null
      }
    },
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      const token = await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })

      // Small delay to ensure SDK has stored the token
      await new Promise(resolve => setTimeout(resolve, 100))

      const authHeader = { Authorization: `Bearer ${token}` }

      const { customer } = await sdk.store.customer.retrieve({}, authHeader)
      await associateCart(customer.email, authHeader)
      return customer
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customer.current(), customer)
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      email,
      password,
      first_name,
      last_name,
    }: {
      email: string
      password: string
      first_name?: string
      last_name?: string
    }) => {
      let token: string
      try {
        token = await sdk.auth.register("customer", "emailpass", {
          email,
          password,
        })
      } catch (error: unknown) {
        const err = error as { statusText?: string; message?: string }
        if (
          err.statusText === "Unauthorized" &&
          err.message?.includes("already exists")
        ) {
          throw new Error(
            "An account with this email already exists. Please login instead."
          )
        }
        throw error
      }

      const { customer } = await sdk.store.customer.create(
        {
          email,
          first_name,
          last_name,
        },
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      )

      await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })

      await associateCart(customer.email)

      return customer
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customer.current(), customer)
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] })
    },
  })
}

/**
 * Requests an OTP for a mobile number. In dev the backend echoes the code back so
 * the flow is testable without an SMS gateway; in production it only reaches the log.
 */
export function useSendOtp() {
  return useMutation({
    mutationFn: async ({ phone, email }: { phone: string; email?: string }) => {
      const res = await fetch(
        `${import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/otp/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ phone, email }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Couldn't send the code. Try again.")
      }

      return data as { phone: string; dev_otp?: string }
    },
  })
}

export type VerifyOtpResult = {
  /** Set when the phone belongs to an existing account — signed in directly. */
  customer: HttpTypes.StoreCustomer | null
  /** True for a first-time phone: the token is live but there's no profile yet. */
  needsProfile: boolean
  /** Email remembered from a previous OTP send, if any — used to prefill the profile form. */
  knownEmail: string | null
  /** The freshly minted token, passed to `useCompleteProfile` for first-time users. */
  token: string
}

export function useVerifyOtp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      phone,
      otp,
    }: {
      phone: string
      otp: string
    }): Promise<VerifyOtpResult> => {
      const token = await sdk.auth.login("customer", "otp", { phone, otp })

      if (typeof token !== "string") {
        throw new Error("Unexpected authentication response")
      }

      // The token is passed explicitly rather than relying on the SDK having
      // already written it to storage — that write races with these calls, and a
      // 401 here would be misread as "this phone has no account yet".
      const authHeader = { Authorization: `Bearer ${token}` }

      // An existing account signs in directly; a first-time phone has a valid
      // token but no customer record yet, so the caller must collect profile
      // details before continuing.
      try {
        const { customer } = await sdk.store.customer.retrieve({}, authHeader)
        await associateCart(customer.email, authHeader)
        return { customer, needsProfile: false, knownEmail: null, token }
      } catch {
        let knownEmail: string | null = null
        try {
          const { email } = await sdk.client.fetch<{ email: string | null }>(
            "/store/auth-identity/me",
            { headers: authHeader }
          )
          knownEmail = email
        } catch {
          // Prefill is best-effort; the profile form works without it.
        }
        return { customer: null, needsProfile: true, knownEmail, token }
      }
    },
    onSuccess: (result) => {
      if (result.customer) {
        queryClient.setQueryData(queryKeys.customer.current(), result.customer)
        queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() })
      }
    },
  })
}

/**
 * Finishes a first-time OTP sign-in: creates the customer record from the
 * profile details, then refreshes the token so it's bound to the new customer
 * (without the refresh every /store call would stay unauthorized).
 */
export function useCompleteProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      email,
      first_name,
      last_name,
      phone,
      token,
    }: {
      email: string
      first_name: string
      last_name?: string
      phone?: string
      /** The token from OTP verification, passed explicitly for the same reason. */
      token: string
    }) => {
      const { customer } = await sdk.store.customer.create(
        { email, first_name, last_name, phone },
        {},
        { Authorization: `Bearer ${token}` }
      )
      // Binds the token to the new customer; without it every /store call would
      // stay unauthorized.
      await sdk.auth.refresh()
      await associateCart(customer.email)
      return customer
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customer.current(), customer)
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() })
    },
  })
}

/** Kicks off Google OAuth; resolves to the URL the browser should be sent to. */
export function useGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      const result = await sdk.auth.login("customer", "google", {})

      if (typeof result === "string" || !("location" in result)) {
        throw new Error("Google sign-in is not configured on the backend")
      }

      return result.location
    },
  })
}

/** Completes Google OAuth from the callback URL's query string. */
export function useGoogleCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (query: Record<string, unknown>) => {
      const token = await sdk.auth.callback("customer", "google", query)

      if (typeof token !== "string") {
        throw new Error("Unexpected authentication response")
      }

      // A first-time Google customer has to be created with an email, and only
      // the auth identity knows it at this point.
      const { email } = await sdk.client.fetch<{ email: string | null }>(
        "/store/auth-identity/me"
      )

      const customer = await resolveCustomer({ email: email ?? undefined })
      await associateCart(customer.email)
      return customer
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customer.current(), customer)
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await sdk.auth.logout()
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.customer.current(), null)
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() })
    },
  })
}
