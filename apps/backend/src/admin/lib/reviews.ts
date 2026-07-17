import { sdk } from "./client";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type AdminReviewImage = {
  id: string;
  url: string;
};

export type AdminReview = {
  id: string;
  product_id: string;
  product_title: string | null;
  /** Set when the review is attributed to a real customer account. */
  customer_id: string | null;
  customer_email: string | null;
  name: string;
  email: string | null;
  rating: number;
  title: string | null;
  content: string;
  status: ReviewStatus;
  source: "storefront" | "admin";
  moderation_note: string | null;
  created_at: string;
  images: AdminReviewImage[];
};

export type AdminReviewListResponse = {
  reviews: AdminReview[];
  count: number;
  limit: number;
  offset: number;
};

export type ReviewImagePayload = {
  filename: string;
  mime_type: string;
  content: string;
};

export const listReviews = (params: {
  status: ReviewStatus | "all";
  limit: number;
  offset: number;
}) =>
  sdk.client.fetch<AdminReviewListResponse>("/admin/reviews", {
    method: "GET",
    query: params,
  });

export const setReviewStatus = (id: string, status: ReviewStatus) =>
  sdk.client.fetch<{ review: AdminReview }>(`/admin/reviews/${id}`, {
    method: "POST",
    body: { status },
  });

export const deleteReview = (id: string) =>
  sdk.client.fetch<{ id: string; deleted: boolean }>(`/admin/reviews/${id}`, {
    method: "DELETE",
  });

export const createReview = (body: {
  product_id: string;
  /** Attribute the review to a real customer account. */
  customer_id?: string;
  /** Used only when no customer is chosen. */
  name?: string;
  email?: string;
  rating: number;
  title?: string;
  content: string;
  images: ReviewImagePayload[];
}) =>
  sdk.client.fetch<{ review: AdminReview }>("/admin/reviews", {
    method: "POST",
    body,
  });

/**
 * Reads a browser File into the base64 payload the review API expects.
 */
export const fileToImagePayload = (file: File): Promise<ReviewImagePayload> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        filename: file.name,
        mime_type: file.type,
        content: String(reader.result),
      });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
