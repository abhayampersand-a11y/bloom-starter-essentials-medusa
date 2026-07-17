import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createProductReview,
  listProductReviews,
  type CreateReviewPayload,
  type ReviewListResponse,
} from "@/lib/data/reviews"
import { queryKeys } from "@/lib/utils/query-keys"

export const useProductReviews = ({
  productId,
  limit = 10,
  offset = 0,
  enabled = true,
}: {
  productId: string
  limit?: number
  offset?: number
  enabled?: boolean
}) =>
  useQuery<ReviewListResponse>({
    queryKey: queryKeys.reviews.forProduct(productId, limit, offset),
    queryFn: () => listProductReviews({ productId, limit, offset }),
    enabled: enabled && Boolean(productId),
  })

export const useCreateProductReview = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      createProductReview({ productId, payload }),
    onSuccess: () => {
      // The new review is pending, so the list won't change yet — but refetching
      // keeps the page correct if an admin approved something in the meantime.
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
    },
  })
}
