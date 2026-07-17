import { MedusaError } from "@medusajs/framework/utils";

export const MAX_IMAGES_PER_REVIEW = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export type ReviewImageInput = {
  filename: string;
  mime_type: string;
  /** Raw base64 (data URL prefix is stripped by the caller). */
  content: string;
};

const badRequest = (message: string): MedusaError =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message);

/**
 * Pulls the base64 payload out of a value that may be either a bare base64
 * string or a `data:image/png;base64,...` data URL.
 */
const stripDataUrlPrefix = (content: string): string => {
  const match = content.match(/^data:[^;]+;base64,(.*)$/s);
  return match ? match[1] : content;
};

/**
 * Validates the `images` field of an incoming review payload. Returns the
 * normalised images ready to hand to `uploadReviewImages`.
 */
export const validateReviewImages = (raw: unknown): ReviewImageInput[] => {
  if (raw === undefined || raw === null) {
    return [];
  }

  if (!Array.isArray(raw)) {
    throw badRequest("images must be an array");
  }

  if (raw.length > MAX_IMAGES_PER_REVIEW) {
    throw badRequest(
      `A review can have at most ${MAX_IMAGES_PER_REVIEW} images`
    );
  }

  return raw.map((image, index) => {
    if (typeof image !== "object" || image === null) {
      throw badRequest(`images[${index}] must be an object`);
    }

    const { filename, mime_type: mimeType, content } = image as Record<
      string,
      unknown
    >;

    if (typeof mimeType !== "string" || !ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      throw badRequest(
        `images[${index}].mime_type must be one of ${ALLOWED_IMAGE_MIME_TYPES.join(
          ", "
        )}`
      );
    }

    if (typeof content !== "string" || !content.length) {
      throw badRequest(`images[${index}].content is required`);
    }

    const base64 = stripDataUrlPrefix(content);

    // Every 4 base64 chars encode 3 bytes; close enough to reject oversized
    // uploads before they reach the file provider.
    const approximateBytes = Math.floor((base64.length * 3) / 4);
    if (approximateBytes > MAX_IMAGE_BYTES) {
      throw badRequest(
        `images[${index}] is larger than ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`
      );
    }

    return {
      filename:
        typeof filename === "string" && filename.trim().length
          ? filename.trim()
          : `review-image-${index}`,
      mime_type: mimeType,
      content: base64,
    };
  });
};

type ReviewFields = {
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  content: string;
};

/**
 * Builds the name shown next to a review for a real customer account.
 */
export const customerDisplayName = (customer: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string => {
  const fullName = [customer.first_name, customer.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  // Accounts created through OTP sign-in may have no name yet; the local part of
  // the email reads better publicly than the whole address.
  const emailLocalPart = customer.email?.split("@")[0]?.trim();
  return emailLocalPart || "Customer";
};

/**
 * Validates the human-authored fields shared by the store and admin create
 * routes.
 *
 * `requireName`/`requireEmail` are false where the identity comes from
 * elsewhere: storefront reviews read both from the signed-in account, and admin
 * reviews may name a walk-in customer who has no email.
 */
export const validateReviewFields = (
  body: Record<string, unknown>,
  {
    requireEmail,
    requireName = true,
  }: { requireEmail: boolean; requireName?: boolean }
): ReviewFields => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (requireName && (name.length < 2 || name.length > 100)) {
    throw badRequest("name must be between 2 and 100 characters");
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  if (requireEmail && !rawEmail) {
    throw badRequest("email is required");
  }
  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw badRequest("email must be a valid email address");
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw badRequest("rating must be an integer between 1 and 5");
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 5 || content.length > 4000) {
    throw badRequest("content must be between 5 and 4000 characters");
  }

  const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
  if (rawTitle.length > 150) {
    throw badRequest("title must be at most 150 characters");
  }

  return {
    name,
    email: rawEmail || null,
    rating,
    title: rawTitle || null,
    content,
  };
};
