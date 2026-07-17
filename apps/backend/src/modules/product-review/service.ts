import { MedusaService } from "@medusajs/framework/utils";

import { Review, ReviewImage } from "./models/review";

class ProductReviewModuleService extends MedusaService({
  Review,
  ReviewImage,
}) {}

export default ProductReviewModuleService;
