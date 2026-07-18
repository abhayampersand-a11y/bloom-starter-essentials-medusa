import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminProductType,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { DisplayImageForm } from "../components/display-image-form";
import { sdk } from "../lib/client";

/** Product type detail page: manage the storefront display image (metadata.image_url). */
const TypeDisplayImageWidget = ({
  data,
}: DetailWidgetProps<AdminProductType>) => (
  <DisplayImageForm
    subject={`type "${data.value}"`}
    metadata={data.metadata}
    onSave={async (metadata) => {
      await sdk.admin.productType.update(data.id, {
        value: data.value,
        metadata,
      });
    }}
  />
);

export const config = defineWidgetConfig({
  zone: "product_type.details.after",
});

export default TypeDisplayImageWidget;
