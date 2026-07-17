import { clsx } from "clsx"
import { forwardRef } from "react"

type SquareRadioProps = React.InputHTMLAttributes<HTMLInputElement>

/**
 * The editorial square selection marker used across checkout: an outlined square
 * that fills with a smaller solid square when chosen.
 *
 * The real input stays in the DOM but visually hidden, so keyboard and screen
 * reader behaviour is unchanged — only the painted box differs.
 */
const SquareRadio = forwardRef<HTMLInputElement, SquareRadioProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <span className="relative inline-flex">
        <input
          type="radio"
          ref={ref}
          checked={checked}
          className="sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
            checked ? "border-neutral-900" : "border-neutral-300",
            className
          )}
        >
          {checked && <span className="h-2 w-2 bg-neutral-900" />}
        </span>
      </span>
    )
  }
)

SquareRadio.displayName = "SquareRadio"

export default SquareRadio
