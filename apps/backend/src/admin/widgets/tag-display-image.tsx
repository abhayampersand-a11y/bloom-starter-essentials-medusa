import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminProductTag,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { DisplayImageForm } from "../components/display-image-form";
import { sdk } from "../lib/client";

/** Product tag detail page: manage the storefront display image (metadata.image_url). */
const TagDisplayImageWidget = ({
  data,
}: DetailWidgetProps<AdminProductTag>) => (
  <DisplayImageForm
    subject={`tag "${data.value}"`}
    metadata={data.metadata}
    onSave={async (metadata) => {
      await sdk.admin.productTag.update(data.id, {
        value: data.value,
        metadata,
      });
    }}
  />
);

export const config = defineWidgetConfig({
  zone: "product_tag.details.after",
});

export default TagDisplayImageWidget;
