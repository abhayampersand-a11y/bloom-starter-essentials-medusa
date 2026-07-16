import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "../lib/client";

const COLOR_OPTION_TITLES = ["color", "colour"];
const DEFAULT_HEX = "#cccccc";
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Widget shown on the product detail page in the admin dashboard.
 * Lets you pick a colour code (hex) for every value of the product's
 * "Color" option. Codes are stored in `product.metadata.color_hex`
 * as { [valueName]: "#rrggbb" } and read by the storefront to render
 * colour swatches.
 */
const ProductColorCodesWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const colorOption = useMemo(
    () =>
      data.options?.find((o) =>
        COLOR_OPTION_TITLES.includes(o.title?.toLowerCase() ?? "")
      ),
    [data.options]
  );

  const storedHexMap = useMemo(() => {
    const stored = data.metadata?.color_hex;
    return stored && typeof stored === "object"
      ? (stored as Record<string, string>)
      : {};
  }, [data.metadata]);

  const initialColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of colorOption?.values ?? []) {
      map[v.value] = storedHexMap[v.value] ?? DEFAULT_HEX;
    }
    return map;
  }, [colorOption, storedHexMap]);

  const [colors, setColors] = useState<Record<string, string>>(initialColors);
  const [isSaving, setIsSaving] = useState(false);

  // Re-sync when the product data refreshes (e.g. after adding a new value)
  useEffect(() => {
    setColors(initialColors);
  }, [initialColors]);

  if (!colorOption || !(colorOption.values ?? []).length) {
    return null;
  }

  const setColor = (value: string, hex: string) => {
    setColors((prev) => ({ ...prev, [value]: hex }));
  };

  const hasInvalidHex = Object.values(colors).some(
    (hex) => !HEX_PATTERN.test(hex)
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await sdk.admin.product.update(data.id, {
        metadata: {
          ...data.metadata,
          color_hex: colors,
        },
      });
      toast.success("Colour codes saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save colour codes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Colour Codes</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={hasInvalidHex}
        >
          Save
        </Button>
      </div>
      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          Pick a colour code for each &quot;{colorOption.title}&quot; value.
          The storefront uses these to render colour swatches.
        </Text>
        {(colorOption.values ?? []).map((v) => {
          const hex = colors[v.value] ?? DEFAULT_HEX;
          const isValid = HEX_PATTERN.test(hex);
          return (
            <div key={v.id} className="flex items-center gap-x-3">
              <label className="w-28 truncate text-sm" title={v.value}>
                {v.value}
              </label>
              {/* Native colour picker */}
              <input
                type="color"
                value={isValid ? hex : DEFAULT_HEX}
                onChange={(e) => setColor(v.value, e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0"
                aria-label={`Pick colour for ${v.value}`}
              />
              {/* Hex code, editable by hand too */}
              <Input
                size="small"
                value={hex}
                onChange={(e) => setColor(v.value, e.target.value.trim())}
                placeholder="#rrggbb"
                aria-invalid={!isValid}
                className="w-28"
              />
              {!isValid && (
                <Text size="xsmall" className="text-ui-fg-error">
                  Use #rrggbb
                </Text>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductColorCodesWidget;
