import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review";
import { REVIEW_STATUSES } from "../../../modules/product-review/models/review";
import {
  customerDisplayName,
  validateReviewFields,
  validateReviewImages,
} from "../../../modules/product-review/shared";
import type ProductReviewModuleService from "../../../modules/product-review/service";
import { createReviewWorkflow } from "../../../workflows/create-review";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Lists reviews for the admin moderation queue, optionally filtered by status
 * or product. Unlike the store route this returns pending and rejected reviews
 * too — that's the whole point of the queue.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE);
  const query = req.query as Record<string, unknown>;

  const filters: Record<string, unknown> = {};

  if (typeof query.status === "string" && query.status !== "all") {
    if (!REVIEW_STATUSES.includes(query.status as never)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `status must be one of ${REVIEW_STATUSES.join(", ")}`
      );
    }
    filters.status = query.status;
  }

  if (typeof query.product_id === "string" && query.product_id) {
    filters.product_id = query.product_id;
  }

  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;
  const offset =
    Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;

  const [reviews, count] = await reviewService.listAndCountReviews(filters, {
    relations: ["images"],
    order: { created_at: "DESC" },
    skip: offset,
    take: limit,
  });

  const graphQuery = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Product titles and customer accounts live in other modules, so each set is
  // fetched in one go and stitched onto the reviews for display.
  const productIds = Array.from(new Set(reviews.map((r) => r.product_id)));
  const titlesById = new Map<string, string>();

  if (productIds.length) {
    const { data: products } = await graphQuery.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail"],
      filters: { id: productIds },
    });
    for (const product of products) {
      titlesById.set(product.id, product.title);
    }
  }

  const customerIds = Array.from(
    new Set(
      reviews
        .map((r) => r.customer_id)
        .filter((id): id is string => Boolean(id))
    )
  );
  const customerEmailById = new Map<string, string | null>();

  if (customerIds.length) {
    const { data: customers } = await graphQuery.graph({
      entity: "customer",
      fields: ["id", "email"],
      filters: { id: customerIds },
    });
    for (const customer of customers) {
      customerEmailById.set(customer.id, customer.email ?? null);
    }
  }

  res.json({
    reviews: reviews.map((review) => ({
      ...review,
      product_title: titlesById.get(review.product_id) ?? null,
      customer_email: review.customer_id
        ? (customerEmailById.get(review.customer_id) ?? null)
        : null,
    })),
    count,
    limit,
    offset,
  });
};

/**
 * Creates a review from the admin dashboard, for a chosen product.
 *
 * Pass `customer_id` to attribute the review to a real customer account — the
 * name and email are then taken from that account. Otherwise pass a `name` and
 * the review is attributed to that name alone, with no account behind it.
 *
 * These are approved immediately: an admin writing the review *is* the approval.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const productId = typeof body.product_id === "string" ? body.product_id : "";
  if (!productId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "product_id is required"
    );
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id: productId },
  });

  if (!products.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id ${productId} was not found`
    );
  }

  const customerId =
    typeof body.customer_id === "string" && body.customer_id
      ? body.customer_id
      : null;

  let customer: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null = null;

  if (customerId) {
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "email"],
      filters: { id: customerId },
    });

    customer = customers[0] ?? null;
    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Customer with id ${customerId} was not found`
      );
    }
  }

  // With a customer chosen the identity comes from their account; without one
  // the admin must supply a name, and an email is optional.
  const fields = validateReviewFields(body, {
    requireEmail: false,
    requireName: !customer,
  });
  const images = validateReviewImages(body.images);

  const { result: review } = await createReviewWorkflow(req.scope).run({
    input: {
      ...fields,
      ...(customer
        ? {
            name: customerDisplayName(customer),
            email: customer.email ?? null,
          }
        : {}),
      product_id: productId,
      customer_id: customer?.id ?? null,
      // An admin writing the review is itself the approval.
      status: "approved",
      source: "admin",
      images,
    },
  });

  res.status(201).json({ review });
};
