import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { IFileModuleService, Logger } from "@medusajs/framework/types";

import { PRODUCT_REVIEW_MODULE } from "../modules/product-review";
import type ProductReviewModuleService from "../modules/product-review/service";

export type DeleteReviewWorkflowInput = {
  id: string;
};

/**
 * Deletes a review together with its images.
 *
 * The images go first: removing the review while its images still point at it
 * leaves them orphaned and the ORM rejects the delete.
 *
 * This step is deliberately not compensated. It runs last and a rollback would
 * have to resurrect rows the database has already dropped; if it fails, nothing
 * before it has changed anyway.
 */
const deleteReviewStep = createStep(
  "delete-review",
  async (input: DeleteReviewWorkflowInput, { container }) => {
    const service: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE);

    const review = await service.retrieveReview(input.id, {
      relations: ["images"],
    });

    const images = review.images ?? [];
    const fileIds = images
      .map((image) => image.file_id)
      .filter((fileId): fileId is string => Boolean(fileId));

    if (images.length) {
      await service.deleteReviewImages(images.map((image) => image.id));
    }

    await service.deleteReviews(input.id);

    return new StepResponse({ id: input.id, file_ids: fileIds });
  }
);

/**
 * Removes the uploaded files from storage once the review rows are gone.
 * Failures here are logged rather than thrown: an orphaned file is a much
 * smaller problem than a review that can't be deleted.
 */
const deleteReviewFilesStep = createStep(
  "delete-review-files",
  async (input: { file_ids: string[] }, { container }) => {
    if (!input.file_ids.length) {
      return new StepResponse(void 0);
    }

    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    try {
      const fileService: IFileModuleService = container.resolve(Modules.FILE);
      await fileService.deleteFiles(input.file_ids);
    } catch (error) {
      logger.warn(
        `Review deleted, but removing its files failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    return new StepResponse(void 0);
  }
);

export const deleteReviewWorkflow = createWorkflow(
  "delete-review",
  (input: DeleteReviewWorkflowInput) => {
    const deleted = deleteReviewStep(input);
    deleteReviewFilesStep({ file_ids: deleted.file_ids });
    return new WorkflowResponse(deleted);
  }
);
