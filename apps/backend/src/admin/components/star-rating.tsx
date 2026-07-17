type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "small" | "large";
};

/**
 * Read-only star display, or an input when `onChange` is passed.
 */
export const StarRating = ({ value, onChange, size = "small" }: StarRatingProps) => {
  const isInteractive = Boolean(onChange);
  const dimension = size === "large" ? "text-xl" : "text-base";

  return (
    <div className="flex items-center gap-x-0.5" role={isInteractive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const className = `${dimension} leading-none ${
          filled ? "text-ui-tag-orange-icon" : "text-ui-fg-disabled"
        }`;

        if (!isInteractive) {
          return (
            <span key={star} className={className} aria-hidden="true">
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            className={`${className} cursor-pointer transition-transform hover:scale-110`}
          >
            ★
          </button>
        );
      })}
      {!isInteractive && <span className="sr-only">{value} out of 5</span>}
    </div>
  );
};
