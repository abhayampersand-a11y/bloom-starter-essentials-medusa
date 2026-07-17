/**
 * Shared class strings for the account screens. Deliberately the same square,
 * hairline, uppercase system as `checkout-ui.ts`, so the account and the
 * checkout read as one product. Purely presentational.
 */

/** Off-white page field the white cards sit on. */
export const PAGE = "min-h-screen bg-neutral-50"

/** "MY ACCOUNT" line above a page title. */
export const PAGE_EYEBROW =
  "text-[11px] uppercase tracking-[0.2em] text-neutral-500"

/** Large uppercase page title. */
export const PAGE_HEADING =
  "font-display text-3xl md:text-4xl uppercase tracking-tight text-neutral-900"

/** The muted sentence under a page title. */
export const PAGE_SUBLINE = "text-sm text-neutral-600"

/** Section label above a card, e.g. "RECENT ORDERS". */
export const SECTION_EYEBROW =
  "text-[11px] uppercase tracking-[0.2em] text-neutral-900 font-semibold"

/** The underlined "Edit" / "Manage" / "View all" link beside a section label. */
export const SECTION_ACTION =
  "text-[11px] uppercase tracking-[0.15em] text-neutral-600 underline underline-offset-4 hover:text-neutral-900 transition-colors"

/** White surface with a hairline border. Square, flat — no radius, no shadow. */
export const CARD = "border border-neutral-200 bg-white"

/** Label over a value inside a card. */
export const FIELD_LABEL =
  "text-[11px] uppercase tracking-[0.15em] text-neutral-500"

/** The value under a FIELD_LABEL. */
export const FIELD_VALUE = "text-sm text-neutral-900"

/** Uppercase, letter-spaced button label, matching checkout's BUTTON_LABEL. */
export const BUTTON_LABEL = "uppercase tracking-[0.15em] text-xs py-4 px-8"

/** Small inline text action inside a card, e.g. "EDIT" / "SET AS DEFAULT". */
export const CARD_ACTION =
  "text-[11px] uppercase tracking-[0.12em] underline underline-offset-4 transition-colors"

/** The destructive variant of CARD_ACTION. */
export const CARD_ACTION_DANGER = "text-rose-700 hover:text-rose-800"
