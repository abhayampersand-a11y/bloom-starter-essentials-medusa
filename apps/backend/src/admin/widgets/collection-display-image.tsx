import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminCollection,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { DisplayImageForm } from "../components/display-image-form";
import { sdk } from "../lib/client";

/** Collection detail page: manage the storefront display image (metadata.image_url). */
const CollectionDisplayImageWidget = ({
  data,
}: DetailWidgetProps<AdminCollection>) => (
  <DisplayImageForm
    subject={`collection "${data.title}"`}
    metadata={data.metadata}
    onSave={async (metadata) => {
      await sdk.admin.productCollection.update(data.id, { metadata });
    }}
  />
);

export const config = defineWidgetConfig({
  zone: "product_collection.details.after",
});

export default CollectionDisplayImageWidget;
