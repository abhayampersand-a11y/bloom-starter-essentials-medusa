import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui";
import { useRef, useState } from "react";
import { sdk } from "../lib/client";

type DisplayImageFormProps = {
  /** What the image belongs to, e.g. `category "Men"` — used in helper copy. */
  subject: string;
  /** Current metadata of the entity; `image_url` is read from and written to it. */
  metadata: Record<string, unknown> | null | undefined;
  /** Persists the merged metadata (existing metadata + new image_url). */
  onSave: (metadata: Record<string, unknown>) => Promise<void>;
};

/**
 * Shared admin widget body: shows the entity's storefront display image
 * (stored in `metadata.image_url`), lets you upload a new file or paste a
 * URL, and saves it back. Used on category, collection, tag and type pages.
 */
export const DisplayImageForm = ({
  subject,
  metadata,
  onSave,
}: DisplayImageFormProps) => {
  const stored =
    typeof metadata?.image_url === "string" ? (metadata.image_url as string) : "";
  const [url, setUrl] = useState(stored);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { files } = await sdk.admin.upload.create({ files: [file] });
      const uploaded = files?.[0]?.url;
      if (!uploaded) {
        throw new Error("Upload returned no file URL");
      }
      setUrl(uploaded);
      toast.success("Image uploaded — click Save to apply it");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...(metadata ?? {}), image_url: url.trim() });
      toast.success("Display image saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save display image"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = url.trim() !== stored;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Display Image</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!isDirty || isUploading}
        >
          Save
        </Button>
      </div>
      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          Shown on the storefront for the {subject} (banners, menus and
          featured sections). Upload a file or paste an image URL.
        </Text>

        {url ? (
          <img
            src={url}
            alt={`Display image for ${subject}`}
            className="h-40 w-full rounded-md border object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed">
            <Text size="small" className="text-ui-fg-muted">
              No image set
            </Text>
          </div>
        )}

        <div className="flex items-center gap-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          <Button
            size="small"
            variant="secondary"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>
          {url && (
            <Button
              size="small"
              variant="transparent"
              className="text-ui-fg-error"
              onClick={() => setUrl("")}
            >
              Remove
            </Button>
          )}
        </div>

        <Input
          size="small"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…/image.jpg"
        />
      </div>
    </Container>
  );
};
