import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { sdk } from "../../lib/client";
import {
  createReview,
  fileToImagePayload,
  type ReviewImagePayload,
} from "../../lib/reviews";
import { StarRating } from "../../components/star-rating";

const MAX_IMAGES = 5;

/** Sentinel for "no account — just use the typed name". */
const NO_CUSTOMER = "__none__";

type FormState = {
  product_id: string;
  customer_id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
};

const EMPTY_FORM: FormState = {
  product_id: "",
  customer_id: NO_CUSTOMER,
  name: "",
  email: "",
  rating: 5,
  title: "",
  content: "",
};

/**
 * Lets an admin write a review on a customer's behalf — for feedback that came
 * in by email, phone or in person.
 *
 * Pick an existing customer to attribute the review to their account, or leave
 * it unset and type a name for someone with no account.
 */
export const CreateReviewForm = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<ReviewImagePayload[]>([]);
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ["admin-reviews", "products"],
    queryFn: () => sdk.admin.product.list({ limit: 100, fields: "id,title" }),
    enabled: open,
  });

  const { data: customersData } = useQuery({
    queryKey: ["admin-reviews", "customers"],
    queryFn: () =>
      sdk.admin.customer.list({
        limit: 100,
        fields: "id,email,first_name,last_name",
      }),
    enabled: open,
  });

  const hasCustomer = form.customer_id !== NO_CUSTOMER;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setImages([]);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createReview({
        product_id: form.product_id,
        // With an account chosen the backend takes the name and email from it,
        // so the typed values are left out entirely.
        ...(hasCustomer
          ? { customer_id: form.customer_id }
          : {
              name: form.name.trim(),
              email: form.email.trim() || undefined,
            }),
        rating: form.rating,
        title: form.title.trim() || undefined,
        content: form.content.trim(),
        images,
      }),
    onSuccess: () => {
      toast.success("Review added and published");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", "list"] });
      reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add review");
    },
  });

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can attach at most ${MAX_IMAGES} images`);
      return;
    }

    try {
      const payloads = await Promise.all(
        Array.from(fileList).slice(0, room).map(fileToImagePayload)
      );
      setImages((prev) => [...prev, ...payloads]);
    } catch {
      toast.error("Failed to read the selected images");
    }
  };

  const isValid =
    Boolean(form.product_id) &&
    (hasCustomer || form.name.trim().length >= 2) &&
    form.content.trim().length >= 5;

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
        }
      }}
    >
      <Drawer.Trigger asChild>
        <Button size="small" variant="secondary">
          Add review
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add a review</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <Text size="small" className="text-ui-fg-subtle">
            Reviews you add here are published to the storefront right away.
          </Text>

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Product
            </Label>
            <Select
              value={form.product_id}
              onValueChange={(value) => setField("product_id", value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select a product" />
              </Select.Trigger>
              <Select.Content>
                {(productsData?.products ?? []).map((product) => (
                  <Select.Item key={product.id} value={product.id}>
                    {product.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Customer <span className="text-ui-fg-muted">(optional)</span>
            </Label>
            <Select
              value={form.customer_id}
              onValueChange={(value) => setField("customer_id", value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="No account — enter a name" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={NO_CUSTOMER}>
                  No account — enter a name
                </Select.Item>
                {(customersData?.customers ?? []).map((customer) => {
                  const fullName = [customer.first_name, customer.last_name]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <Select.Item key={customer.id} value={customer.id}>
                      {fullName ? `${fullName} · ${customer.email}` : customer.email}
                    </Select.Item>
                  );
                })}
              </Select.Content>
            </Select>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {hasCustomer
                ? "The review will be shown under this customer's account name."
                : "Leave unset to publish the review under a name you type in."}
            </Text>
          </div>

          {!hasCustomer && (
            <>
              <div className="flex flex-col gap-y-2">
                <Label size="small" weight="plus">
                  Customer name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label size="small" weight="plus">
                  Email <span className="text-ui-fg-muted">(optional)</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Rating
            </Label>
            <StarRating
              size="large"
              value={form.rating}
              onChange={(value) => setField("rating", value)}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Title <span className="text-ui-fg-muted">(optional)</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Great quality"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Review
            </Label>
            <Textarea
              rows={5}
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="What did the customer say?"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Photos <span className="text-ui-fg-muted">(optional)</span>
            </Label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
              className="text-sm"
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {images.map((image, index) => (
                  <div key={`${image.filename}-${index}`} className="relative">
                    <img
                      src={image.content}
                      alt={image.filename}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="bg-ui-bg-base absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border text-xs"
                      aria-label={`Remove ${image.filename}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary" size="small">
              Cancel
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            onClick={() => mutate()}
            isLoading={isPending}
            disabled={!isValid}
          >
            Add review
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
