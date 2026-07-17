import { clsx } from "clsx"

type StarRatingProps = {
  value: number
  /** Pass to turn the stars into a rating input. */
  onChange?: (value: number) => void
  size?: "small" | "medium" | "large"
  className?: string
}

const SIZE_CLASSES = {
  small: "text-sm",
  medium: "text-lg",
  large: "text-2xl",
} as const

/**
 * Renders five stars. Read-only by default; pass `onChange` to let the user
 * pick a rating.
 */
export const StarRating = ({
  value,
  onChange,
  size = "small",
  className,
}: StarRatingProps) => {
  const isInteractive = Boolean(onChange)
  const sizeClass = SIZE_CLASSES[size]

  return (
    <div
      className={clsx("flex items-center gap-0.5", className)}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={isInteractive ? "Rating" : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const starClass = clsx(
          sizeClass,
          "leading-none",
          star <= value ? "text-amber-500" : "text-neutral-300"
        )

        if (!isInteractive) {
          return (
            <span key={star} className={starClass} aria-hidden="true">
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            className={clsx(
              starClass,
              "cursor-pointer transition-transform hover:scale-110"
            )}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
