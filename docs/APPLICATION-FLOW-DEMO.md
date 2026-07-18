# Bloom Store — Full Application Flow Demo (India Edition)

A step-by-step walkthrough of how this e-commerce application works, from scratch, on both sides:

- **Admin dashboard** → `http://localhost:9000/app` (login: `admin@bloom.local` / `supersecret123`)
- **Storefront (customer site)** → `http://localhost:5176`

The store is configured for **India**: currency **INR (₹)**, 18% GST (tax-inclusive prices, like MRP), free standard shipping across India.

---

## Part 0 — How the two apps connect

```
┌─────────────────┐        HTTP (port 9000)        ┌──────────────────┐
│   STOREFRONT    │  ──── /store/* API + key ────▶ │     BACKEND      │
│  (customer UI)  │                                │  Medusa server   │
│  localhost:5176 │                                │  localhost:9000  │
└─────────────────┘                                └────────┬─────────┘
                                                            │
┌─────────────────┐        /admin/* API                     │
│ ADMIN DASHBOARD │  ◀────────────────────────────  PostgreSQL (bloom_medusa)
│ localhost:9000/app                                Redis (cache/events)
└─────────────────┘
```

- The **backend** owns all data (products, orders, customers) in PostgreSQL.
- The **admin dashboard** is where you (the store owner) manage everything.
- The **storefront** reads data through the Store API using a **publishable API key** and shows it to customers.

To start both apps, from the repo root: `pnpm dev`

---

## Part 1 — Foundation setup (Admin side, in order)

> In this project, steps 1–6 were already done automatically by the seed + `setup-india.ts` script. Read them to understand *what* exists and *where to find it* — this is the order you would follow to build a store from scratch.

### Step 1 — Store settings (the root of everything)
**Page:** Admin → click the gear icon (bottom left) → **Settings → Store**

- **What you see:** A details card with the store name, default currency, and a table of **supported currencies**.
- **Ours:** Default currency is **INR** (marked "Default" in the table), with the "Tax inclusive pricing" toggle ON — Indian style, price shown = price paid.
- **Try it:** Click the `...` (three-dots) button on the currencies table → **Add currencies** opens a searchable list — ticking a currency and clicking **Save** makes it available for pricing products.

### Step 2 — Regions (where you sell + in what currency)
**Page:** Settings → **Regions**

- **What you see:** A table of regions. Ours has one row: **India** — currency INR, 1 country.
- Click the **India** row → detail page shows countries (India), payment providers (System Default), and the tax-inclusive flag.
- **Why it matters:** A region decides the currency and payment options a customer gets. The storefront URL contains the country: `localhost:5176/in/...` → matched to the India region.
- **Try it:** Click **Create** (top right of the table) → a form asks for name, currency, countries, payment provider → **Save** creates a new selling region.

### Step 3 — Tax regions (GST)
**Page:** Settings → **Tax Regions**

- **What you see:** A table of countries. Click **India** → the detail shows the default tax rate: **India GST, 18%** (code `IN18`).
- Because the region is *tax-inclusive*, a ₹11,599 product already contains the GST; the checkout does not add tax on top.

### Step 4 — Sales channel (which "shop window" products appear in)
**Page:** Settings → **Sales Channels**

- **What you see:** A table with one row: **Default Sales Channel**.
- Click it → detail page has a **Products** table showing every product published to this channel. The `...` button lets you add/remove products.
- **Why it matters:** A product not added to a sales channel is invisible on the storefront, even if published.

### Step 5 — API key (the storefront's entry pass)
**Page:** Settings → **Publishable API Keys**

- **What you see:** A table with one key (`pk_...`). Click the row → the detail shows which **sales channels** the key exposes.
- The storefront sends this key with every request; the backend then only returns products of the linked sales channel.
- This key is stored in `apps/storefront/.env` as `VITE_MEDUSA_PUBLISHABLE_KEY`.

### Step 6 — Stock location & shipping
**Page:** Settings → **Locations & Shipping**

- **What you see:** A card for **Mumbai Warehouse** (Plot 42, Andheri East, Mumbai, Maharashtra).
- Inside it: the fulfillment set **Main Warehouse Delivery** with service zones. The **India** zone covers country India and contains the shipping option:
  - **Standard Shipping (India)** — flat rate, **₹0 (free)**, 3–5 business days.
- **Try it:** Click **Create option** inside a zone → form asks name, price type (flat/calculated), price per currency → this is how you'd add e.g. "Express Delivery ₹199".
- **Why it matters:** At checkout, the customer's address (India) is matched to this zone → only its shipping options are offered.

---

## Part 2 — Catalog (Admin side)

### Step 7 — Categories (the navigation tree)
**Page:** Admin → **Products → Categories** (left sidebar)

- **What you see:** A tree/table of categories, some nested (parent → child). Besides the garment tree (Tops/Bottoms), there are two **gender categories — Men and Women** — every product is filed under one or both, so shoppers can browse by gender from the navbar.
- Click a category → detail page shows its products table; the `...` button → **Edit ranking** lets you drag to reorder.
- **Display Image** *(our custom widget, right sidebar)* — upload a photo or paste a URL → **Save**. The storefront uses it as the category's banner and in the navbar dropdown.
- **Try it:** Click **Create** → type name + handle → choose a parent (or none) → **Save**. The storefront navbar/menus are built from these — every top-level category gets its own menu entry automatically.

### Step 8 — Collections (curated groups for marketing)
**Page:** Admin → **Products → Collections**

- **What you see:** A table of collections (e.g. seasonal or featured groups).
- Difference vs categories: **categories = permanent navigation tree**; **collections = marketing groupings** ("New Arrivals", "Summer Sale") shown as featured sections on the storefront home page.
- Click a collection → **Products** section → `...` → **Add products** opens a product picker with checkboxes.
- **Display Image** *(our custom widget)* — same as categories: the image you set here becomes the collection's banner on the storefront and its card in the home page's "Trending" section.

### Step 8b — Product tags & types
**Pages:** Settings → **Product Tags** and Settings → **Product Types**

- **Tags** are marketing labels (Essential, Bestseller, Training, New Arrival, Outerwear, Unisex); **types** name the garment (T-Shirt, Hoodie, Leggings, ...). Both are assigned per product in the product page's **Organize** card.
- Each tag/type detail page also has the **Display Image** widget.
- On the storefront, tags and type show as chips on the product page and drive the **Product Type** and **Tags** filter groups on every listing.

### Step 9 — Products (the heart of the store)
**Page:** Admin → **Products**

- **What you see:** A table of 12 products with thumbnail, title, collection, sales channel, variant count, and status badge (Published/Draft).
- Click **Studio Zip Jacket** → the product detail page has cards for:
  - **General** — title, description, handle
  - **Media** — product images
  - **Options** — `Color: Black, Olive` and `Size: S, M, L, XL`
  - **Variants table** — every Color × Size combination (8 rows), each with its own SKU, prices and inventory
  - **Colour Codes** *(our custom widget, right sidebar)* — a colour picker + hex input per colour value. Pick a colour → **Save** → the storefront shows that exact swatch.
  - **Organize** — category, collection, tags
  - **Sales channels** — must include Default Sales Channel
- **Editing a price:** Variants table → `...` on a variant → **Edit prices** → a spreadsheet-like grid opens with one column per currency (INR first) → type → **Save**.
- **Creating a product:** Click **Create** (top right) → a multi-step wizard:
  1. *Details* — title, description, media, options (add "Color" with values here)
  2. *Organize* — category, collection, sales channel
  3. *Variants* — tick which option combinations to sell
  4. *Prices* — the price grid (enter the ₹ amount)
  Then **Publish**. After creating, open the product and set its swatches in the **Colour Codes** widget.

### Step 10 — Inventory
**Page:** Admin → **Inventory**

- **What you see:** A table of every SKU with its **In stock** quantity at Mumbai Warehouse.
- Click a row → **Locations** card → click **Mumbai Warehouse** → edit the stock quantity → **Save**. When stock hits 0, the storefront shows "Out of stock" on that variant.

---

## Part 3 — Customer journey (Storefront side)

### Step 11 — Home page (`localhost:5176` → redirects to `/in`)
- The URL gets the country prefix `/in` — that is how the app knows to use the **India region and ₹ prices**.
- You see: hero banner, **featured collections** (from Step 8), and product grids. Every price is in **₹**.

### Step 12 — Browse & filter
- Click a category in the navbar → product listing page.
- **What you see:** A grid of product cards + a **filter sidebar** (options like colour/size) and a **sort dropdown** (price low→high etc.). Filters call the backend with your selections and re-render the grid.

### Step 13 — Product page
- Click any product card → `localhost:5176/in/products/studio-zip-jacket`
- **What you see:**
  - Image gallery (left)
  - Price in ₹ (updates when you pick a variant)
  - **Select Color** — buttons with the **colour swatch dots** you set in the admin widget
  - **Select Size** — S/M/L/XL buttons
  - Quantity `−`/`+` stepper
  - **Add to cart** button — disabled ("Select variant") until you pick both options; shows "Out of stock" if that variant has no inventory
- Click **Add to cart** → the cart drawer slides in from the right with the item, quantity and subtotal.

### Step 14 — Cart
- Click the cart icon (navbar) or **Go to cart** in the drawer → `/in/cart`
- **What you see:** A table of line items (image, variant, unit price, quantity stepper, remove ✕), an order summary card (subtotal, shipping, total in ₹), and a **Checkout** button.

### Step 15 — Checkout (3 steps on one page)
1. **Address** — email + shipping address form. Country is pre-selected **India**. Click **Continue**.
2. **Delivery** — shows the options that match your address zone: **Standard Shipping (India) — Free**. Select → **Continue**.
3. **Payment** — the dev store uses the **System Default** provider (a test provider — no real money). Click **Place Order**.
- You land on the **order confirmation page** with an order number and summary.

### Step 16 — Customer account
- Navbar → account icon → register/login (`/in/auth`).
- Logged-in customers get **/in/account**: profile, addresses, and an **Orders** list where they can track each order's status.

---

## Part 4 — Order lifecycle (back to Admin)

### Step 17 — The order arrives
**Page:** Admin → **Orders**

- **What you see:** A table of orders — the one you just placed is on top: order number, date, customer, **Payment status: Authorized**, **Fulfillment status: Not fulfilled**, total in ₹.

### Step 18 — Capture payment
- Click the order row → detail page with Summary, Customer, Payment and Fulfillment cards.
- **Payment card** → `...` → **Capture payment** → confirm. Status changes to **Captured** (with the system provider this simulates a real gateway capture).

### Step 19 — Fulfill & ship
- **Fulfillment card** → **Fulfill items** button → a dialog lists the items with quantity to fulfill from **Mumbai Warehouse** → confirm.
- Status becomes **Fulfilled**; stock at the warehouse decreases automatically.
- Then click **Mark as shipped** (optionally enter a tracking number) → status **Shipped**. The customer sees this in their account.

### Step 20 — After-sales
- The same order page's `...` menus handle **Returns**, **Exchanges**, **Refunds** and **Cancellations** — each opens a guided dialog and adjusts payment/inventory automatically.

---

## Quick reference

| Thing | Where |
|---|---|
| Admin dashboard | `http://localhost:9000/app` — `admin@bloom.local` / `supersecret123` |
| Storefront | `http://localhost:5176` (auto-prefixes `/in`) |
| Start both apps | `pnpm dev` (repo root) |
| DB | PostgreSQL `bloom_medusa` (user `postgres` / `admin`) |
| Region | India — INR, 18% GST, tax-inclusive |
| Shipping | Standard Shipping (India), free, Mumbai Warehouse |
| Colour swatches | Product page (admin) → "Colour Codes" widget → picked colours appear on storefront |
| Re-run India setup | `npx medusa exec ./src/scripts/setup-india.ts` (idempotent) |
| Re-run catalog setup (Men/Women, tags, types, images) | `npx medusa exec ./src/scripts/setup-catalog.ts` (idempotent) |
| Category/collection/tag/type images | Their admin detail pages → "Display Image" widget → shown as storefront banners, nav & home imagery |
