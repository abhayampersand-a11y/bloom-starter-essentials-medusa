import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { PRODUCT_REVIEW_MODULE } from "../modules/product-review";
import type { ReviewStatus } from "../modules/product-review/models/review";
import type ProductReviewModuleService from "../modules/product-review/service";

export type ModerateReviewWorkflowInput = {
  id: string;
  status: ReviewStatus;
  moderation_note: string | null;
};

const moderateReviewStep = createStep(
  "moderate-review",
  async (input: ModerateReviewWorkflowInput, { container }) => {
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);

    // Kept so the compensation can restore the previous decision.
    const previous = await service.retrieveReview(input.id);

    const review = await service.updateReviews({
      id: input.id,
      status: input.status,
      moderation_note: input.moderation_note,
      moderated_at: new Date(),
    });

    return new StepResponse(review, {
      id: previous.id,
      status: previous.status,
      moderation_note: previous.moderation_note,
      moderated_at: previous.moderated_at,
    });
  },
  async (previous, { container }) => {
    if (!previous) {
      return;
    }
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);
    await service.updateReviews(previous);
  }
);

/**
 * Approves, rejects, or re-queues a review. Approving is what makes a review
 * visible on the storefront.
 */
export const moderateReviewWorkflow = createWorkflow(
  "moderate-review",
  (input: ModerateReviewWorkflowInput) => {
    const review = moderateReviewStep(input);
    return new WorkflowResponse(review);
  }
);
