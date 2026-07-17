import { useState } from "react"
import {
  useCompleteProfile,
  useGoogleLogin,
  useLogin,
  useSendOtp,
  useVerifyOtp,
} from "@/lib/hooks/use-customer"
import { useNavigate, useParams, useSearch } from "@tanstack/react-router"

type Mode = "otp" | "password"

/** Where the mobile flow currently is: enter number → enter code → (new users) profile. */
type OtpStage = "phone" | "code" | "profile"

const inputClass =
  "w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-neutral-900"

export function Auth() {
  const [mode, setMode] = useState<Mode>("otp")
  const [stage, setStage] = useState<OtpStage>("phone")
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")
  /** Held between OTP verification and profile submission for first-time users. */
  const [otpToken, setOtpToken] = useState("")

  const navigate = useNavigate()
  const { countryCode } = useParams({ strict: false })
  const { redirect } = useSearch({ strict: false }) as { redirect?: string }

  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const completeProfileMutation = useCompleteProfile()
  const loginMutation = useLogin()
  const googleLoginMutation = useGoogleLogin()

  // A redirect back to the sign-in page would leave the shopper looking at the
  // form they just completed, so it's treated as no redirect at all.
  const returnTo =
    redirect && !redirect.replace(/\?.*$/, "").endsWith("/auth")
      ? redirect
      : undefined

  const done = () => {
    if (returnTo) {
      // `href` rather than `to`: the redirect is an already-built path and may
      // carry a query string, which `to` would swallow into the pathname.
      navigate({ href: returnTo })
      return
    }
    navigate({
      to: "/$countryCode/account",
      params: { countryCode: countryCode || "in" },
    })
  }

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof Error ? err.message : fallback)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const result = await sendOtpMutation.mutateAsync({ phone })
      setStage("code")
      setDevOtp(result.dev_otp ?? null)
    } catch (err) {
      fail(err, "Couldn't send the code. Try again.")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const result = await verifyOtpMutation.mutateAsync({ phone, otp })

      // Existing account → signed in already, carry on. First-time phone →
      // the token is live but there's no profile yet, so collect it before
      // returning to wherever the shopper came from (e.g. checkout).
      if (result.needsProfile) {
        if (result.knownEmail) {
          setEmail(result.knownEmail)
        }
        setOtpToken(result.token)
        setStage("profile")
        return
      }
      done()
    } catch (err) {
      fail(err, "That code didn't work. Try again.")
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await completeProfileMutation.mutateAsync({
        email,
        first_name: firstName,
        last_name: lastName || undefined,
        phone,
        token: otpToken,
      })
      done()
    } catch (err) {
      fail(err, "Couldn't save your details. Try again.")
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await loginMutation.mutateAsync({ email, password })
      done()
    } catch (err) {
      fail(err, "Authentication failed. Please try again.")
    }
  }

  const handleGoogle = async () => {
    setError("")

    try {
      const location = await googleLoginMutation.mutateAsync()
      if (returnTo) {
        sessionStorage.setItem("post_auth_redirect", returnTo)
      }
      window.location.href = location
    } catch (err) {
      fail(err, "Google sign-in is unavailable right now.")
    }
  }

  const sending = sendOtpMutation.isPending
  const verifying = verifyOtpMutation.isPending
  const savingProfile = completeProfileMutation.isPending

  const inProfileStage = mode === "otp" && stage === "profile"

  return (
    <div className="min-h-[60vh] flex items-center justify-center pt-32 pb-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-2">
            {inProfileStage ? "Complete your profile" : "Sign in to continue"}
          </h1>
          <p className="text-neutral-600">
            {inProfileStage
              ? "Just a few details and you're all set."
              : returnTo
                ? "Sign in to place your order."
                : "Welcome to Essentials."}
          </p>
        </div>

        {mode === "otp" && stage === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Mobile number
              </label>
              <div className="flex">
                <span className="px-3 py-2 border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-600">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="98765 43210"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                We&apos;ll text you a one-time code. New to Essentials? This
                creates your account.
              </p>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-neutral-900 text-white py-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? "Sending code..." : "Send OTP"}
            </button>
          </form>
        )}

        {mode === "otp" && stage === "code" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-2">
                Enter the 6-digit code
              </label>
              <input
                id="otp"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} tracking-[0.5em] text-center text-lg`}
                placeholder="------"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Sent to +91 {phone}.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStage("phone")
                    setOtp("")
                    setDevOtp(null)
                    setError("")
                  }}
                  className="underline hover:text-neutral-900"
                >
                  Change number
                </button>
              </p>
            </div>

            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
                Dev mode — your code is <strong>{devOtp}</strong>. With no SMS gateway
                configured, codes are only written to the server log.
              </div>
            )}

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="w-full bg-neutral-900 text-white py-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifying ? "Verifying..." : "Verify & continue"}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending}
              className="w-full text-neutral-600 hover:text-neutral-900 text-sm disabled:opacity-50"
            >
              {sending ? "Resending..." : "Resend code"}
            </button>
          </form>
        )}

        {mode === "otp" && stage === "profile" && (
          <form onSubmit={handleCompleteProfile} className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
              +91 {phone} verified ✓
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700 mb-2">
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Aarav"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Mehta"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Order confirmations and updates go here.
              </p>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-neutral-900 text-white py-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingProfile ? "Saving..." : "Save & continue"}
            </button>
          </form>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label htmlFor="pw-email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="pw-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="pw" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="pw"
                type="password"
                required
                autoComplete="current-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter your password"
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-neutral-900 text-white py-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* Once the phone is verified, switching method or provider mid-way
            would abandon a live token — hide the alternatives. */}
        {!inProfileStage && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-neutral-200 flex-1" />
              <span className="text-xs text-neutral-500 uppercase tracking-wide">or</span>
              <div className="h-px bg-neutral-200 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoginMutation.isPending}
              className="w-full border border-neutral-300 py-3 hover:border-neutral-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
            >
              <GoogleMark />
              {googleLoginMutation.isPending ? "Redirecting..." : "Continue with Google"}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "otp" ? "password" : "otp")
                  setStage("phone")
                  setOtp("")
                  setDevOtp(null)
                  setError("")
                }}
                className="text-neutral-600 hover:text-neutral-900 text-sm"
              >
                {mode === "otp"
                  ? "Have a password? Sign in with email instead"
                  : "Sign in with your mobile number instead"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
      {message}
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}
