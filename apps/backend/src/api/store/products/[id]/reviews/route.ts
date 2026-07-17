import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review";
import {
  customerDisplayName,
  validateReviewFields,
  validateReviewImages,
} from "../../../../../modules/product-review/shared";
import type ProductReviewModuleService from "../../../../../modules/product-review/service";
import { createReviewWorkflow } from "../../../../../workflows/create-review";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const parsePagination = (query: Record<string, unknown>) => {
  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);

  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;
  const offset =
    Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;

  return { limit, offset };
};

/**
 * Lists the *approved* reviews for a product. Pending and rejected reviews are
 * never exposed to the storefront.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const productId = req.params.id;
  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE);

  const { limit, offset } = parsePagination(
    req.query as Record<string, unknown>
  );

  const [reviews, count] = await reviewService.listAndCountReviews(
    { product_id: productId, status: "approved" },
    {
      relations: ["images"],
      order: { created_at: "DESC" },
      skip: offset,
      take: limit,
    }
  );

  // Rating breakdown is computed over every approved review, not just the
  // current page, so the summary stays stable while paging.
  const approved = await reviewService.listReviews(
    { product_id: productId, status: "approved" },
    { select: ["rating"] }
  );

  const distribution: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  for (const review of approved) {
    const key = String(review.rating);
    if (key in distribution) {
      distribution[key] += 1;
    }
  }

  const average = approved.length
    ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length
    : 0;

  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      title: review.title,
      content: review.content,
      created_at: review.created_at,
      images: (review.images ?? []).map((image) => ({
        id: image.id,
        url: image.url,
      })),
    })),
    count,
    limit,
    offset,
    summary: {
      average_rating: Number(average.toFixed(2)),
      total: approved.length,
      distribution,
    },
  });
};

/**
 * Submits a review for a product. Requires a signed-in customer: the route is
 * behind `authenticate("customer")`, and the reviewer's name and email are read
 * from their account rather than the request body, so they can't be spoofed.
 *
 * The review is stored as `pending` and only becomes visible once an admin
 * approves it.
 */
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const productId = req.params.id;
  const body = (req.body ?? {}) as Record<string, unknown>;

  const customerId = req.auth_context?.actor_id;
  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You must be signed in to write a review"
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

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "first_name", "last_name", "email"],
    filters: { id: customerId },
  });

  const customer = customers[0];
  if (!customer) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You must be signed in to write a review"
    );
  }

  const fields = validateReviewFields(body, {
    requireEmail: false,
    requireName: false,
  });
  const images = validateReviewImages(body.images);

  const { result: review } = await createReviewWorkflow(req.scope).run({
    input: {
      ...fields,
      name: customerDisplayName(customer),
      email: customer.email ?? null,
      product_id: productId,
      customer_id: customerId,
      status: "pending",
      source: "storefront",
      images,
    },
  });

  res.status(201).json({
    review: {
      id: review.id,
      status: review.status,
    },
    message:
      "Thanks! Your review has been submitted and will appear once it's approved.",
  });
};
