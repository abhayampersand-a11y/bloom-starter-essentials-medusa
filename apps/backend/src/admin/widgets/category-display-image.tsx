import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminProductCategory,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { DisplayImageForm } from "../components/display-image-form";
import { sdk } from "../lib/client";

/** Category detail page: manage the storefront display image (metadata.image_url). */
const CategoryDisplayImageWidget = ({
  data,
}: DetailWidgetProps<AdminProductCategory>) => (
  <DisplayImageForm
    subject={`category "${data.name}"`}
    metadata={data.metadata}
    onSave={async (metadata) => {
      await sdk.admin.productCategory.update(data.id, { metadata });
    }}
  />
);

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default CategoryDisplayImageWidget;
