import { useState } from "react"

/**
 * Closing invitation, set dark so it separates the page from the footer below.
 *
 * The submit is deliberately local: there's no newsletter service wired up yet,
 * so it acknowledges the address without pretending to have stored it.
 */
export const JoinTheCircle = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    await new Promise((resolve) => setTimeout(resolve, 600))

    setStatus("success")
    setEmail("")
    setTimeout(() => setStatus("idle"), 4000)
  }

  return (
    <section className="bg-neutral-950 py-20 md:py-24">
      <div className="content-container">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-editorial text-3xl font-light tracking-tight text-white md:text-4xl">
            Join the Circle
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-neutral-400">
            Receive exclusive access to new collections, editorial stories, and
            private events.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="circle-email" className="sr-only">
              Your email address
            </label>
            <input
              id="circle-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status !== "idle"}
              placeholder="Your email address"
              className="flex-1 border border-neutral-700 bg-neutral-900 px-4 py-3 text-xs text-white placeholder:text-neutral-500 transition-colors focus:border-neutral-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== "idle"}
              className="border border-white bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-transparent hover:text-white disabled:opacity-50"
            >
              {status === "loading" ? "…" : "Subscribe"}
            </button>
          </form>

          <p
            aria-live="polite"
            className="mt-4 text-[10px] uppercase tracking-[0.15em] text-neutral-500"
          >
            {status === "success"
              ? "Thank you — we'll be in touch."
              : "By subscribing you agree to our Privacy Policy."}
          </p>
        </div>
      </div>
    </section>
  )
}
