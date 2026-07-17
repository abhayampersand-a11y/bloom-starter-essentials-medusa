import { model } from "@medusajs/framework/utils";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/**
 * A customer review of a product.
 *
 * Reviews submitted from the storefront always start as `pending` and stay
 * invisible to shoppers until an admin approves them. Reviews created by an
 * admin are approved on creation.
 *
 * `Review` and `ReviewImage` share a file because the relationship helpers must
 * reference a model in the same module, and the lint rule that enforces this
 * only recognises same-file identifiers reliably on Windows.
 */
export const Review = model
  .define("review", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text(),
    // Set when the reviewer was a logged-in customer at submission time.
    customer_id: model.text().nullable(),
    name: model.text(),
    // Optional: admins can add a review for a walk-in customer with a name only.
    email: model.text().nullable(),
    rating: model.number(),
    title: model.text().nullable(),
    content: model.text(),
    status: model.enum([...REVIEW_STATUSES]).default("pending"),
    // Who authored it, so the admin list can tell shopper reviews apart from
    // ones the team entered by hand.
    source: model.enum(["storefront", "admin"]).default("storefront"),
    // Free-text note an admin can leave when rejecting.
    moderation_note: model.text().nullable(),
    moderated_at: model.dateTime().nullable(),
    images: model.hasMany(() => ReviewImage, { mappedBy: "review" }),
  })
  .indexes([
    {
      on: ["product_id", "status"],
    },
    {
      on: ["status"],
    },
  ]);

/**
 * An image attached to a review. Files live in the configured file provider
 * (S3/R2); only the resulting public URL is stored here.
 */
export const ReviewImage = model.define("review_image", {
  id: model.id({ prefix: "revimg" }).primaryKey(),
  url: model.text(),
  // The file provider's id for the upload, kept so the file can be removed
  // from storage when the image is deleted.
  file_id: model.text().nullable(),
  review: model.belongsTo(() => Review, { mappedBy: "images" }),
});
