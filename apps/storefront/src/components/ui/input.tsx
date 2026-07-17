import { clsx } from "clsx"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /**
   * `box` is the default bordered field. `underline` is the editorial rule-only
   * field used across checkout — the two never mix their border utilities, so
   * Tailwind can't resolve them in the wrong order.
   */
  variant?: "box" | "underline"
}

export const Input = ({
  className,
  value,
  variant = "box",
  ...props
}: InputProps) => {
  // Ensure value is always defined to prevent uncontrolled->controlled warning
  const controlledValue = value === undefined || value === null ? "" : value

  return (
    <input
      className={clsx(
        "appearance-none shadow-none outline-none focus:outline-none",
        "rounded-none",
        "text-base font-medium text-zinc-900",
        "w-full",
        "placeholder:text-zinc-400",
        variant === "box" && [
          "border border-zinc-200",
          "px-4 py-2",
          "bg-white",
        ],
        variant === "underline" && [
          "border-b border-zinc-300 focus:border-zinc-900",
          "px-0 py-2.5",
          "bg-transparent",
          "transition-colors",
        ],
        className
      )}
      value={controlledValue}
      {...props}
    />
  )
}
