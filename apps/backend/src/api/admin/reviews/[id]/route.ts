import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review";
import {
  REVIEW_STATUSES,
  type ReviewStatus,
} from "../../../../modules/product-review/models/review";
import type ProductReviewModuleService from "../../../../modules/product-review/service";
import { deleteReviewWorkflow } from "../../../../workflows/delete-review";
import { moderateReviewWorkflow } from "../../../../workflows/moderate-review";

const isReviewStatus = (value: unknown): value is ReviewStatus =>
  typeof value === "string" && REVIEW_STATUSES.includes(value as ReviewStatus);

/**
 * Moderates a single review: approve it (it becomes visible on the storefront),
 * reject it (it stays hidden), or move it back to pending.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const reviewId = req.params.id;
  const body = (req.body ?? {}) as Record<string, unknown>;

  const status = body.status;
  if (!isReviewStatus(status)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `status must be one of ${REVIEW_STATUSES.join(", ")}`
    );
  }

  const moderationNote =
    typeof body.moderation_note === "string" && body.moderation_note.trim()
      ? body.moderation_note.trim().slice(0, 1000)
      : null;

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE);

  // Throws NOT_FOUND if the review doesn't exist.
  await reviewService.retrieveReview(reviewId);

  const { result } = await moderateReviewWorkflow(req.scope).run({
    input: { id: reviewId, status, moderation_note: moderationNote },
  });

  res.json({ review: result });
};

/**
 * Permanently deletes a review, its image records, and the uploaded files
 * behind them.
 */
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const reviewId = req.params.id;

  const reviewService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE);

  await reviewService.retrieveReview(reviewId);

  await deleteReviewWorkflow(req.scope).run({ input: { id: reviewId } });

  res.json({ id: reviewId, object: "review", deleted: true });
};
