import { sendGetRequest, sendPostRequest } from "@/lib/data/custom"

export type ReviewImage = {
  id: string
  url: string
}

export type Review = {
  id: string
  name: string
  rating: number
  title: string | null
  content: string
  created_at: string
  images: ReviewImage[]
}

export type ReviewSummary = {
  average_rating: number
  total: number
  /** Count of approved reviews keyed by rating, "1" through "5". */
  distribution: Record<string, number>
}

export type ReviewListResponse = {
  reviews: Review[]
  count: number
  limit: number
  offset: number
  summary: ReviewSummary
}

export type ReviewImagePayload = {
  filename: string
  mime_type: string
  /** Data URL or bare base64 string. */
  content: string
}

/**
 * The reviewer's name and email are taken from the signed-in customer's account
 * by the backend, so they aren't part of the payload.
 */
export type CreateReviewPayload = {
  rating: number
  title?: string
  content: string
  images: ReviewImagePayload[]
}

export type CreateReviewResponse = {
  review: { id: string; status: string }
  message: string
}

/**
 * Lists the approved reviews for a product. Pending reviews are never returned
 * by the API, so anything here is safe to render.
 */
export const listProductReviews = async ({
  productId,
  limit = 10,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number
}): Promise<ReviewListResponse> =>
  sendGetRequest<ReviewListResponse>(`/store/products/${productId}/reviews`, {
    query: { limit, offset },
  })

/**
 * Submits a review. Requires a signed-in customer, and it won't appear on the
 * product page until an admin approves it.
 */
export const createProductReview = async ({
  productId,
  payload,
}: {
  productId: string
  payload: CreateReviewPayload
}): Promise<CreateReviewResponse> =>
  sendPostRequest<CreateReviewResponse>(
    `/store/products/${productId}/reviews`,
    { body: payload }
  )

export const MAX_REVIEW_IMAGES = 5
export const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Reads a browser File into the base64 payload the review API expects.
 */
export const fileToReviewImage = (file: File): Promise<ReviewImagePayload> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        filename: file.name,
        mime_type: file.type,
        content: String(reader.result),
      })
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
