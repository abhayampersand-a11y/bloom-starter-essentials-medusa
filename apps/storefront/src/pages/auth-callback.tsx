import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useGoogleCallback } from "@/lib/hooks/use-customer"
import { Loading } from "@/components/ui/loading"

/**
 * Where Google sends the customer back to. Exchanges the callback's query params
 * for a session, then returns them to whatever they were doing.
 */
export function AuthCallback() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const googleCallbackMutation = useGoogleCallback()
  const [error, setError] = useState("")
  const ran = useRef(false)

  useEffect(() => {
    // Guards against React strict-mode double-invoke burning the one-time code.
    if (ran.current) {
      return
    }
    ran.current = true

    googleCallbackMutation
      .mutateAsync(search)
      .then(() => {
        const redirect = sessionStorage.getItem("post_auth_redirect")
        sessionStorage.removeItem("post_auth_redirect")
        if (redirect?.startsWith("/")) {
          navigate({ href: redirect })
          return
        }
        navigate({ to: "/" })
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Google sign-in failed. Please try again."
        )
      })
  }, [googleCallbackMutation, navigate, search])

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-light mb-4">Sign-in failed</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full bg-neutral-900 text-white py-3 hover:bg-neutral-800 transition-colors"
          >
            Back to store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading />
    </div>
  )
}
