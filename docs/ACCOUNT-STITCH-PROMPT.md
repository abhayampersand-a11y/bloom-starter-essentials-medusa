# Google Stitch prompts — ESSENTIALS account area

Prompts for designing the customer account: overview, orders, order detail, and an
address book where customers add and manage their own addresses.

Companion to [CHECKOUT-STITCH-PROMPT.md](./CHECKOUT-STITCH-PROMPT.md) — same brand, same
components, so the two flows feel like one product.

**How to use**

1. Open Stitch → **Web** mode, **Experimental / high-effort** on.
2. Paste **Prompt 0 (design system)** from the checkout doc first — these screens assume it.
   If you're continuing in the same Stitch project, skip it; it's already anchored.
3. Then run **Prompts 1–5 below, one at a time**. Don't paste them together.
4. **Copy to Figma** from Stitch's output menu.

Every field named below is real data the app already has, except where flagged under
*Notes on fidelity* at the bottom.

---

## Prompt 1 — Account layout + Overview

```
Design the "My Account" overview page for ESSENTIALS, a minimal Scandinavian
athleisure brand for the Indian market. Desktop web. Same design system as the
checkout: Outfit headings, Inter body, off-white #FAFAFA page, white surfaces,
#E5E5E5 hairline borders, near-black #171717 ink, STRICTLY SQUARE corners, NO
shadows, flat. Currency ₹.

HEADER
- Slim announcement bar, #F5F3EF, centred 12px: "Free shipping available on all orders".
- White header with 1px bottom border: "ESSENTIALS" wordmark left in Outfit uppercase
  with wide tracking; centre nav Tops, Bottoms, Collections, About; right side search,
  account and bag icons in thin line style.

PAGE HEADING
- Eyebrow above the title, 11px uppercase 0.2em tracking #737373: "MY ACCOUNT".
- Title "Aarav Mehta" — 32px Outfit, uppercase, tight tracking.
- Sub-line in #525252: "aarav@example.com".

LAYOUT
- Two columns: a 240px left sidebar nav, and the content area beside it, 64px gutter.
- Sidebar: a vertical list of text links, 11px uppercase, 0.15em tracking, each with
  16px vertical padding and a hairline divider between them:
  Overview (current — near-black, semibold, with a 2px near-black bar on its left edge),
  Orders, Addresses, Profile, then a gap, then "Sign Out" in #737373.
- No icons in the sidebar. Text only, quiet.

CONTENT — three stacked blocks, each separated by 48px:

1. ACCOUNT DETAILS
   - Eyebrow "ACCOUNT DETAILS" with a small underlined "Edit" link on the far right.
   - A white card, 1px hairline border, 24px padding, holding a 2-column grid of
     label/value pairs. Labels 11px uppercase #737373, values 14px near-black:
     NAME → Aarav Mehta · EMAIL → aarav@example.com · PHONE → +91 98765 43210

2. DEFAULT ADDRESS
   - Eyebrow "DEFAULT ADDRESS" with an underlined "Manage" link on the right.
   - A white card, hairline border, 24px padding: the name in 14px medium, then in
     #525252 the street, area, "Mumbai, Maharashtra 400050", "IN", "+91 98765 43210".
   - A small outlined square "DEFAULT" badge in the card's top-right.

3. RECENT ORDERS
   - Eyebrow "RECENT ORDERS" with an underlined "View all" link on the right.
   - Two order rows in a single white card divided by hairline rules. Each row:
     left side "ORDER #1042" in 13px medium uppercase and "17 July 2026" in 12px
     #737373 beneath it; middle a small square status badge; right side "₹3,499.00"
     in 14px medium and a small right chevron.
   - Status badges are square, 1px border, 10px uppercase 0.1em tracking:
     "DELIVERED" olive #626F4A border and text; "PROCESSING" near-black border.

FOOTER
- Hairline top border. "ESSENTIALS" wordmark left; links Terms & Conditions, Privacy
  Policy, Sustainability, Contact Us in 11px uppercase; "© 2026 ESSENTIALS. ALL RIGHTS
  RESERVED." right in #A3A3A3.
```

---

## Prompt 2 — Orders list

```
Design the "Orders" page of the same ESSENTIALS account. Keep the identical header,
sidebar (with "Orders" now the current item) and footer.

- Eyebrow "MY ACCOUNT", title "ORDERS" (32px Outfit uppercase).
- Sub-line #525252: "Track and review everything you've ordered."

ORDERS TABLE — one white card, 1px hairline border, rows split by hairline rules.
- A header row in 11px uppercase 0.15em tracking #737373:
  ORDER · DATE · STATUS · TOTAL · (empty column for the chevron)
- Five order rows, 20px vertical padding, each with:
  - "#1042" in 13px medium near-black.
  - "17 July 2026" in 13px #525252.
  - A square status badge, 1px border, 10px uppercase: DELIVERED (olive #626F4A),
    SHIPPED (near-black), PROCESSING (#737373), CANCELLED (#B91C1C).
  - "₹3,499.00" in 14px medium.
  - A small right chevron in #A3A3A3 on the far right.
- The whole row is hoverable: on hover the row background goes #FAFAFA.
- Show one row with a small stacked-thumbnails detail: three 32x40px product images
  overlapping slightly, under the order number.

EMPTY STATE (show as a second frame)
- Centred in the card: a thin line-art bag icon, "NO ORDERS YET" in 13px uppercase
  0.15em tracking, a #737373 line "When you place your first order it'll appear here.",
  and a black square button "START SHOPPING" in 11px uppercase 0.15em tracking.

PAGINATION
- Below the card, right aligned: "1–5 of 12" in 12px #737373, then square outlined
  "Previous" and "Next" buttons in 11px uppercase.
```

---

## Prompt 3 — Order detail

```
Design the "Order Detail" page of the same ESSENTIALS account. Keep the identical
header, sidebar ("Orders" current) and footer.

TOP
- A small back link with a thin left arrow: "BACK TO ORDERS", 11px uppercase 0.15em
  tracking #737373.
- Eyebrow "ORDER #1042". Title "ORDER DETAILS" (32px Outfit uppercase).
- Sub-line #525252: "Placed on 17 July 2026".

STATUS STRIP — one white card, hairline border, split into three equal columns by
vertical hairline dividers, 24px padding. Each column has an 11px uppercase #737373
label above a 16px near-black value:
  ORDER TOTAL → ₹3,499.00 · PAYMENT → PAID · FULFILMENT → SHIPPED
- Only the fulfilment value carries a square olive #626F4A badge.

ITEMS
- Eyebrow "ITEMS (2)".
- A white card, hairline border, rows split by hairline rules. Each row: a 64x80px
  product image, then the title in 13px uppercase 0.1em tracking medium, the variant
  "S / Olive" and "Qty: 1" in 12px #737373 beneath it, and the line total "₹3,499.00"
  right aligned in 14px medium.

ADDRESSES — two equal white cards side by side, hairline borders, 24px padding:
- "SHIPPING ADDRESS" eyebrow, then name in 14px medium and the address lines in
  #525252, ending with "IN" and the phone.
- "BILLING ADDRESS" eyebrow, same treatment.

SUMMARY
- A white card, hairline border, 24px padding, max 400px wide, right aligned.
- Eyebrow "SUMMARY". Rows label left (11px uppercase #737373) / value right (14px):
  SUBTOTAL ₹2,965.25 · SHIPPING FREE · TAXES ₹533.75.
- Hairline rule, then "TOTAL" in 16px Outfit uppercase and "₹3,499.00" in 20px semibold.

ACTIONS
- Two square buttons, left aligned, 11px uppercase 0.15em tracking:
  a black "BUY IT AGAIN" and an outlined "NEED HELP?".
```

---

## Prompt 4 — Address book

```
Design the "Addresses" page of the same ESSENTIALS account — where a customer manages
their own saved addresses. Keep the identical header, sidebar ("Addresses" current)
and footer.

- Eyebrow "MY ACCOUNT". Title "ADDRESSES" (32px Outfit uppercase).
- Sub-line #525252: "Save the places you order to, so checkout is one click."
- On the same row as the title, right aligned: a black square button
  "+ ADD NEW ADDRESS" in 11px uppercase 0.15em tracking.

ADDRESS GRID — a 2-column grid of white cards, 24px gap, each card 1px hairline
border and 24px padding, square corners, no shadow. Show three cards:

1. DEFAULT CARD
   - A near-black 1px border instead of the hairline, to mark it out.
   - Top row: an optional address nickname "HOME" in 11px uppercase 0.15em tracking
     near-black, and beside it a small SOLID near-black square badge with white 10px
     text "DEFAULT".
   - Name "Aarav Mehta" in 14px medium.
   - Address lines in 13px #525252: street, area, "Mumbai, Maharashtra 400050", "IN".
   - Phone "+91 98765 43210" in 13px #525252.
   - A hairline rule near the bottom, then a row of three small text actions in 11px
     uppercase 0.12em tracking, underlined, spaced apart: "EDIT", "DELETE" (in
     #B91C1C), and nothing else — this one is already default.

2. SECOND CARD ("WORK")
   - Hairline border, no DEFAULT badge.
   - Same content structure, different address.
   - Its action row has three actions: "EDIT", "DELETE", and "SET AS DEFAULT".

3. ADD CARD
   - An empty card with a 1px DASHED #D4D4D4 border, same height as the others,
     centred content: a thin plus icon, then "ADD NEW ADDRESS" in 11px uppercase
     0.15em tracking #737373. Hovering turns the border and text near-black.

EMPTY STATE (show as a second frame)
- No grid. A single centred block: a thin line-art pin icon, "NO SAVED ADDRESSES" in
  13px uppercase 0.15em tracking, a #737373 line "Add an address and it'll be ready
  and waiting at checkout.", and a black square "ADD NEW ADDRESS" button.
```

---

## Prompt 5 — Add / edit address panel

```
Design the "Add a new address" panel for the same ESSENTIALS account, opening over
the Addresses page.

- A right-hand side drawer, 480px wide, full height, white, with a 1px left border and
  NO rounded corners and NO shadow. The page behind is dimmed with a 40% black overlay.

HEADER
- 24px padding, hairline bottom border. Title "ADD NEW ADDRESS" in 16px Outfit
  uppercase 0.1em tracking. A thin × close icon on the far right.

FORM — 24px padding, fields stacked with 20px gaps. Every field is the editorial
rule-only style: NO box, just a 1px #D4D4D4 bottom border that turns near-black on
focus, with the label ABOVE it in 11px uppercase 0.15em tracking near-black, and no
placeholder text inside.
- ADDRESS NICKNAME (optional) — one field, helper text below in 11px #737373:
  "e.g. Home, Work — only you see this."
- FIRST NAME and LAST NAME, side by side.
- COMPANY (optional).
- ADDRESS LINE 1.
- ADDRESS LINE 2 (optional).
- CITY and STATE, side by side.
- PIN CODE and PHONE, side by side.
- COUNTRY — a select in the same underline style, showing "India", with a small
  chevron on the right.
- Two square checkboxes, stacked, 14px labels:
  "Set as my default shipping address" and "Set as my default billing address".

FOOTER
- Pinned to the bottom of the drawer, 24px padding, hairline top border.
- Two square buttons on one row: an outlined "CANCEL" and a black "SAVE ADDRESS",
  both 11px uppercase 0.15em tracking. The black button takes the remaining width.

ALSO SHOW these variants as separate frames:
- The EDIT state: title "EDIT ADDRESS", fields pre-filled, and a "DELETE ADDRESS"
  text link in #B91C1C at the bottom-left of the footer.
- An ERROR state: under PIN CODE, the border turns #B91C1C and 11px #B91C1C text
  reads "Enter a valid 6-digit PIN code".
- A SAVING state: the black button shows a small spinner and "SAVING…", disabled at
  50% opacity.
```

---

## Follow-up refinements

Run one at a time:

```
Make the account responsive at 390px wide: the sidebar becomes a horizontal
scrollable row of uppercase tabs pinned under the page title; the orders table
becomes stacked cards (order number and status on the first line, date and total on
the second); the address grid becomes a single column; and the add/edit drawer becomes
a full-screen sheet with its actions pinned to the bottom.
```

```
Add a delete confirmation: a small centred modal, 400px wide, square, white, hairline
border, no shadow. Title "DELETE ADDRESS" in 16px Outfit uppercase, body in #525252
"This removes the address from your account. Orders already placed keep the address
they were shipped to.", then an outlined "CANCEL" and a #B91C1C "DELETE" button.
```

---

## Notes on fidelity to the build

**Already real — the design maps straight onto existing data:**

- Order fields: `display_id`, `created_at`, `status`, `payment_status`, fulfilment derived
  from `fulfillments[].shipped_at / delivered_at`, `total`, `subtotal`, `shipping_total`,
  `tax_total`, `currency_code`, plus `items` with product thumbnail, title, variant and
  quantity — all rendered today in `routes/$countryCode/account/orders/$orderId.tsx`.
- Order shipping and billing addresses on the detail page.
- Customer `first_name`, `last_name`, `email`, `phone`.
- Address fields: `first_name`, `last_name`, `company`, `address_1`, `address_2`, `city`,
  `province`, `postal_code`, `country_code`, `phone`, `is_default_shipping`,
  `is_default_billing`, and `address_name` (the "nickname" field above).
- The address REST endpoints already exist: `GET`/`POST /store/customers/me/addresses`
  and `/store/customers/me/addresses/{id}` for update and delete. `useCustomerAddresses`
  and `useCreateCustomerAddress` in `lib/hooks/use-customer-addresses.ts` already cover
  list and create — edit, delete and set-default would need adding.

**New — not built yet, decide before implementing:**

- **The whole Addresses page.** There is no account address book today; customers can
  currently only add an address as a side effect of checking out. This is the main new
  build in this doc.
- The sidebar account nav (Overview / Orders / Addresses / Profile / Sign out) — today
  the account is a single page with orders inline, and there's no Profile screen.
- Editing account details, "Buy it again", "Need help?", and order search/pagination.
- Status badges: `status` and `payment_status` exist, but nothing maps them to colours yet.
- Stacked item thumbnails on the orders list — the list endpoint would need `*items`.

**Worth knowing:** the account pages today use rounded corners and bold headings
(`rounded-lg`, `font-bold`), which is off-brand against the checkout. These prompts
deliberately pull them onto the same square, hairline, uppercase system — so expect the
redesign to replace that styling rather than extend it.
