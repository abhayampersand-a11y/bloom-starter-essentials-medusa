# Google Stitch prompts — ESSENTIALS checkout

Prompts for redesigning the four checkout screens (Addresses → Delivery → Payment → Review)
in [Google Stitch](https://stitch.withgoogle.com), then exporting to Figma.

**How to use**

1. Open Stitch → **Web** mode. Turn on **Experimental / high-effort** mode — these prompts are
   detailed and standard mode truncates long input.
2. Paste **Prompt 0 (design system)** first and generate. This anchors the look.
3. Then run **Prompts 1–4**, one screen at a time, in the same project so Stitch keeps the
   system consistent. Don't paste all four at once — Stitch degrades badly on multi-screen prompts.
4. Refine with the follow-ups at the bottom.
5. **Copy to Figma** from Stitch's output menu, then paste into a Figma file.

Everything below matches the real design tokens in `apps/storefront/src/styles/theme.css`
and the states the checkout code actually renders — so the design stays buildable.

---

## Prompt 0 — Design system

```
Create a design system for "ESSENTIALS", a minimal Scandinavian athleisure fashion
e-commerce brand for the Indian market. Quiet, editorial, premium — closer to COS or
Arket than to a typical Indian marketplace. Restraint over decoration.

TYPOGRAPHY
- Headings and all UI text: "Outfit". Tight tracking (-0.02em).
- Body and form text: "Inter".
- Editorial accents only: "Cormorant Garamond" — a light serif, used sparingly.
- Eyebrow/label style: 11px, UPPERCASE, letter-spacing 0.2em, colour #737373.
- Section headings: 16px, semibold, near-black.
- Page title: 28-32px, Outfit, uppercase, wide tracking.

COLOUR
- Page background: #FAFAFA (warm off-white). Cards/surfaces: #FFFFFF.
- Primary text: #171717. Secondary text: #525252. Muted text: #737373.
- Hairline borders: #E5E5E5. Selected border: #171717.
- Primary button: #27272A background, white text.
- Secondary button: #FFFFFF background, 1px #18181B border, near-black text.
- Sand accents: #F5F3EF, #EBE8E0, #B5AB95.
- Olive accent (use very sparingly, for success/selected ticks only): #626F4A.
- No blues, no purples, no gradients.

SHAPE AND DEPTH
- Strictly SQUARE corners everywhere — 0px border radius on every button, input,
  card and badge. This is essential to the brand.
- Flat design: NO drop shadows, no elevation. Separation comes from 1px hairline
  borders and generous whitespace only.
- Selected state = 1px near-black border + very light #FAFAFA fill. Never a coloured glow.

LAYOUT
- Max content width 1440px, centred, with generous side padding (96-160px on desktop).
- Vertical rhythm on an 8px grid. Sections separated by 32-48px.
- Currency is Indian Rupee, formatted like ₹3,499.00.

COMPONENTS
- Text input: full width, 1px #E5E5E5 border, square, 12px vertical padding,
  white fill, label above in 14px medium.
- Radio card: full-width selectable row, 1px border, 16px padding, radio on the
  left, content beside it. Unselected #E5E5E5 border; selected near-black border.
- Badge: square, 1px border, 11px uppercase text, 6px horizontal padding.
- Primary/secondary buttons: square, 12px vertical padding, 15px medium label.
```

---

## Prompt 1 — Addresses

```
Design the "Addresses" step of a 4-step checkout for ESSENTIALS, desktop web.

HEADER (persists on all checkout screens)
- Slim announcement bar across the top, #F5F3EF background, centred 12px text:
  "Free shipping available on all orders".
- Below it a white header with a 1px bottom border: wordmark "ESSENTIALS" on the
  left in Outfit, uppercase, wide letter-spacing. Centre nav: Tops, Bottoms,
  Collections (each with a small chevron), About. Right side: search, account and
  bag icons, thin line style; the bag has a small square count badge showing "1".

STEPPER
- Horizontal, left aligned, below the header: Addresses — Delivery — Payment — Review.
- Steps joined by a 32px hairline rule. Current step near-black semibold;
  completed steps near-black with a small tick; upcoming steps grey #A3A3A3.
- Text only, no numbered circles. Understated.

PAGE LAYOUT
- Two columns: left content 2/3 width, right order summary 1/3, 64-96px gutter.
- Left column heading "Addresses" (28px) with sub-line "Enter your shipping and
  billing addresses." in #525252.

LEFT COLUMN — SHIPPING ADDRESS
- Eyebrow label "SHIPPING ADDRESS".
- A list of saved address radio cards. Show two:
  1. SELECTED: near-black 1px border, faint #FAFAFA fill. Radio filled on the left.
     Name "Mariko Randall" in medium, followed by two small square badges: an
     outlined "DEFAULT" badge and a solid near-black "DELIVERING HERE" badge with
     white text. Below, in #525252: street address on one line, area and city on
     the next, then "IN · +91 98765 43210". Add a small "Edit" text link on the far
     right of the card, aligned to the top.
  2. UNSELECTED: hairline border, empty radio, another address, no badges.
- Below them a final radio card: "Use a new address" with a small plus icon.
- When "Use a new address" is chosen it expands to reveal a form (show this state
  in a second variant frame): First name / Last name side by side, Address line 1,
  Address line 2, City / State side by side, PIN code / Phone side by side, Country
  dropdown. Plus a square checkbox "Save this address to my account".

LEFT COLUMN — BELOW ADDRESSES
- Square checkbox, ticked: "Billing address is the same as shipping address".
- Then an "Email Address" field, pre-filled "abhay@yopmail.com", with helper text
  below in 12px #737373: "You'll receive order updates to this email."
- A single primary button "Continue to delivery", left aligned, about 240px wide.

RIGHT COLUMN — ORDER SUMMARY (sticky)
- White card, 1px hairline border, 24px padding.
- Heading "Order Summary" (18px).
- One line item: 64x80px product image on the left (a cream t-shirt), then title
  "Minimal Tee" in medium, "S / Olive" and "Quantity: 1" in 13px #737373, with the
  price "₹3,499.00" right-aligned on the title row.
- Hairline divider. Then rows, label left / value right, 14px:
  Subtotal ₹2,965.25 · Shipping ₹0.00 · Discount ₹0.00 · Tax ₹533.75.
- Hairline divider. "Total" row in 18px semibold, "₹3,499.00" right aligned.
- Below, an underlined text link "Add promo code".
- At the bottom, a small reassurance line in 12px #737373 with a tiny lock icon:
  "Secure checkout".
```

---

## Prompt 2 — Delivery

```
Design the "Delivery" step of the same ESSENTIALS checkout. Keep the identical
header, announcement bar, stepper and sticky Order Summary from the Addresses screen.

- Stepper: "Addresses" now shows a small tick, "Delivery" is the current step.
- Heading "Delivery" (28px), sub-line "Select a shipping method." in #525252.

SHIPPING METHOD OPTIONS — full-width radio cards, stacked with 12px gaps:
1. SELECTED: near-black 1px border, faint fill, filled radio.
   "Standard Shipping (India)" in 15px medium, and beneath it in 13px #737373:
   "Arrives in 4-6 business days". On the right, "FREE" in 15px medium.
2. UNSELECTED: hairline border.
   "Express Shipping (India)", beneath it "Arrives in 1-2 business days".
   On the right, "₹149.00".

- Below the options, a subtle sand #F5F3EF strip with 16px padding and a small
  truck icon: "Free standard shipping on all orders. No minimum."
- Footer actions: secondary "Back" button on the left, primary "Continue to payment"
  on the right, on one row, each about 240px wide, separated by a hairline rule above.
```

---

## Prompt 3 — Payment

```
Design the "Payment" step of the same ESSENTIALS checkout. Keep the identical header,
stepper and sticky Order Summary.

- Stepper: "Addresses" and "Delivery" ticked, "Payment" current.
- Heading "Payment" (28px), sub-line "Select a payment method. You won't be charged
  until you place your order." in #525252.

PAYMENT OPTIONS — full-width radio cards, stacked with 12px gaps:
1. SELECTED: near-black border, faint fill, filled radio.
   A small square-outlined banknote icon, then "Cash on Delivery" in 15px medium,
   and beneath it in 13px #737373: "Pay in cash when your order arrives."
2. UNSELECTED: hairline border. A card icon, then "Manual Payment", beneath it
   "Pay via bank transfer. We'll share details after you order."

- Beneath the options, a sand #F5F3EF strip with a small lock icon and 12px text:
  "Your payment details are encrypted and never stored on our servers."
- Footer actions: secondary "Back" left, primary "Review order" right, hairline
  rule above them.
```

---

## Prompt 4 — Review

```
Design the "Review" step of the same ESSENTIALS checkout. Keep the identical header,
stepper and sticky Order Summary.

- Stepper: Addresses, Delivery and Payment all ticked; "Review" current.
- Heading "Review" (28px), sub-line "Review your order details before placing your
  order." in #525252.

REVIEW SUMMARY — a single white card with a 1px hairline border, divided into four
rows by hairline dividers. Each row has an eyebrow label on the left (11px uppercase,
0.2em tracking, #737373), the value in the middle, and a small underlined "Change"
text link on the far right:
1. "SHIPPING ADDRESS" → "Mariko Randall", street address, area and city,
   "IN · +91 98765 43210" in #525252.
2. "SHIPPING METHOD" → "Standard Shipping (India)" with "FREE" beside it.
3. "BILLING ADDRESS" → "Same as shipping address" in #525252.
4. "PAYMENT METHOD" → a small banknote icon and "Cash on Delivery".

ITEMS
- Below that card, an eyebrow "ITEMS (1)" and one row: 64x80px cream t-shirt image,
  "Minimal Tee" in medium, "S / Olive · Qty 1" in 13px #737373, "₹3,499.00" right aligned.

PLACE ORDER
- A hairline rule, then 12px #737373 text: "When you place your order, your payment
  will be authorized and we'll start processing your order."
- Footer actions: secondary "Back" on the left; primary "Place Order" on the right,
  visually the heaviest button in the flow — full-height, 15px semibold white label.
- Beneath the button, 11px #737373: "By placing this order you agree to our Terms
  and Privacy Policy." with "Terms" and "Privacy Policy" underlined.
```

---

## Follow-up refinements

Run these one at a time after the screens exist:

```
Make it responsive for mobile at 390px wide: stack to a single column, move the
Order Summary into a collapsible "Order summary · ₹3,499.00" bar pinned under the
stepper, and pin the primary button to the bottom of the viewport as a full-width
sticky bar with a hairline top border.
```

```
Show the empty and error states: an Addresses screen for a customer with no saved
addresses (the new-address form is open by default, no radio list), and an inline
form error under the PIN code field reading "Enter a valid 6-digit PIN code" in
#B91C1C with the input border in the same colour.
```

```
Add a loading state: the primary button with its label replaced by a small spinner
and the text "Placing order…", disabled at 50% opacity.
```

---

## Notes on fidelity to the build

Things the prompts deliberately match, so the design maps onto the existing code:

- Saved addresses with **Default** and **Delivering here** badges, plus **Use a new address**
  revealing the form with **Save this address to my account** — these are the real states in
  `checkout-address-step.tsx` and `saved-address-picker.tsx`.
- **Cash on Delivery** and **Manual Payment** are the two payment providers actually configured.
- **Standard / Express Shipping (India)** and ₹ pricing reflect the seeded India region.
- Square corners, hairline borders and the flat, shadowless treatment come from the existing
  `Button`, `Input` and `Checkbox` components (`rounded-none`, `shadow-none`).

Things that are **new design, not yet built** — worth deciding before implementing:

- Per-address **Edit** links, and **Change** links on the Review screen.
- Delivery **arrival estimates** ("4-6 business days") — Medusa shipping options don't carry
  these yet; they'd need adding as option metadata.
- The reassurance strips, "Secure checkout" line, and the Terms/Privacy consent line.
- The mobile collapsible summary and sticky action bar.
