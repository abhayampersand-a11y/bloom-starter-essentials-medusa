import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows";

import { PRODUCT_REVIEW_MODULE } from "../modules/product-review";
import type { ReviewStatus } from "../modules/product-review/models/review";
import type ProductReviewModuleService from "../modules/product-review/service";

export type CreateReviewWorkflowInput = {
  product_id: string;
  customer_id: string | null;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  content: string;
  status: ReviewStatus;
  source: "storefront" | "admin";
  images: {
    filename: string;
    mime_type: string;
    /** Raw base64, without the data URL prefix. */
    content: string;
  }[];
};

type CreateReviewStepInput = Omit<CreateReviewWorkflowInput, "images"> & {
  moderated_at: Date | null;
};

const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewStepInput, { container }) => {
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);
    const review = await service.createReviews(input);
    return new StepResponse(review, review.id);
  },
  async (reviewId, { container }) => {
    if (!reviewId) {
      return;
    }
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);
    await service.deleteReviews(reviewId);
  }
);

type CreateReviewImagesStepInput = {
  url: string;
  file_id: string | null;
  review_id: string;
}[];

const createReviewImagesStep = createStep(
  "create-review-images",
  async (input: CreateReviewImagesStepInput, { container }) => {
    if (!input.length) {
      return new StepResponse([], []);
    }
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);
    const images = await service.createReviewImages(input);
    return new StepResponse(
      images,
      images.map((image) => image.id)
    );
  },
  async (imageIds, { container }) => {
    if (!imageIds?.length) {
      return;
    }
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);
    await service.deleteReviewImages(imageIds);
  }
);

/**
 * Creates a review and attaches any uploaded images to it.
 *
 * Running this as a workflow means a failure partway through rolls the earlier
 * steps back — most usefully, images already pushed to storage are removed if
 * the review itself can't be saved, instead of being orphaned there.
 */
export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewWorkflowInput) => {
    const uploaded = when(
      input,
      (data) => data.images.length > 0
    ).then(() =>
      uploadFilesWorkflow.runAsStep({
        input: {
          files: transform(input, (data) =>
            data.images.map((image) => ({
              filename: image.filename,
              mimeType: image.mime_type,
              content: image.content,
              access: "public" as const,
            }))
          ),
        },
      })
    );

    const review = createReviewStep(
      transform(input, (data) => ({
        product_id: data.product_id,
        customer_id: data.customer_id,
        name: data.name,
        email: data.email,
        rating: data.rating,
        title: data.title,
        content: data.content,
        status: data.status,
        source: data.source,
        // Admin-authored reviews are published on creation, so they count as
        // moderated the moment they exist.
        moderated_at: data.source === "admin" ? new Date() : null,
      }))
    );

    createReviewImagesStep(
      transform({ uploaded, review }, (data) =>
        (data.uploaded ?? []).map((file) => ({
          url: file.url,
          file_id: file.id ?? null,
          review_id: data.review.id,
        }))
      )
    );

    return new WorkflowResponse(review);
  }
);
