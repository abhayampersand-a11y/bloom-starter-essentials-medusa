/**
 * Shared class strings for the checkout screens, so the four steps stay visually
 * consistent. Purely presentational — no behaviour depends on these.
 */

/** 11px uppercase micro-label. Used for field labels and section eyebrows. */
export const EYEBROW =
  "text-[11px] uppercase tracking-[0.15em] text-neutral-900 font-medium"

/** Same as EYEBROW but muted, for labels over values rather than inputs. */
export const EYEBROW_MUTED =
  "text-[11px] uppercase tracking-[0.15em] text-neutral-500 font-medium"

/** "STEP 02 / 04" line above each step heading. */
export const STEP_COUNTER =
  "text-[11px] uppercase tracking-[0.2em] text-neutral-500"

/** Large uppercase step title. */
export const STEP_HEADING =
  "font-display text-3xl md:text-4xl uppercase tracking-tight text-neutral-900"

/** Section heading inside a step, e.g. "DELIVERY METHOD". */
export const SECTION_HEADING =
  "text-[11px] uppercase tracking-[0.2em] text-neutral-900 font-semibold"

/** Uppercase, letter-spaced button label used for every checkout action. */
export const BUTTON_LABEL = "uppercase tracking-[0.15em] text-xs py-4 px-8"

/** Selectable row (shipping option, payment method, saved address). */
export const SELECT_CARD = "border p-5 transition-colors"
export const SELECT_CARD_ON = "border-neutral-900 bg-white"
export const SELECT_CARD_OFF = "border-neutral-200 bg-white hover:border-neutral-400"

/** The tinted panel used for the order summary and review blocks. */
export const PANEL = "border border-neutral-200 bg-neutral-100/60"
