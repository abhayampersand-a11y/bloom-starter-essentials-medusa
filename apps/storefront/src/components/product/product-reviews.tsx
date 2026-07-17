import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/product/star-rating"
import { ReviewForm } from "@/components/product/review-form"
import { useProductReviews } from "@/lib/hooks/use-reviews"
import { useCustomer } from "@/lib/hooks/use-customer"
import type { Review, ReviewSummary } from "@/lib/data/reviews"

const PAGE_SIZE = 5

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const RatingBreakdown = ({ summary }: { summary: ReviewSummary }) => (
  <div className="flex flex-col gap-1.5">
    {[5, 4, 3, 2, 1].map((star) => {
      const count = summary.distribution[String(star)] ?? 0
      const percent = summary.total ? (count / summary.total) * 100 : 0

      return (
        <div key={star} className="flex items-center gap-3 text-sm">
          <span className="w-12 shrink-0 text-neutral-700">{star} star</span>
          <div className="h-2 flex-1 bg-neutral-200">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-neutral-600">
            {count}
          </span>
        </div>
      )
    })}
  </div>
)

const ReviewCard = ({ review }: { review: Review }) => (
  <article className="border-b border-neutral-200 py-6 last:border-b-0">
    <div className="flex items-center gap-3 mb-2">
      <StarRating value={review.rating} />
      <span className="text-sm font-medium text-neutral-900">
        {review.name}
      </span>
      <span className="text-sm text-neutral-500">
        {formatDate(review.created_at)}
      </span>
    </div>

    {review.title && (
      <h4 className="text-base font-semibold text-neutral-900 mb-1">
        {review.title}
      </h4>
    )}

    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
      {review.content}
    </p>

    {review.images.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {review.images.map((image) => (
          <a
            key={image.id}
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src={image.url}
              alt={`Photo from ${review.name}'s review`}
              loading="lazy"
              className="h-24 w-24 object-cover border border-neutral-200 transition-opacity hover:opacity-80"
            />
          </a>
        ))}
      </div>
    )}
  </article>
)

/**
 * Review section for the product page: rating summary, the approved reviews,
 * and the submission form.
 *
 * Only signed-in customers can write a review, so visitors get a sign-in prompt
 * that returns them here afterwards.
 */
export const ProductReviews = ({
  productId,
  countryCode,
}: {
  productId: string
  countryCode: string
}) => {
  const [page, setPage] = useState(0)
  const [isWriting, setIsWriting] = useState(false)

  const location = useLocation()
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer()

  const { data, isLoading, isError } = useProductReviews({
    productId,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })

  const customerName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() ||
      customer.email?.split("@")[0] ||
      "Customer"
    : ""

  const reviews = data?.reviews ?? []
  const summary = data?.summary
  const count = data?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <section className="content-container py-16 border-t border-neutral-200">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h2 className="text-3xl font-display font-semibold text-neutral-900 tracking-tight">
          Customer Reviews
        </h2>
        {!isWriting && !isLoadingCustomer && customer && (
          <Button size="fit" variant="secondary" onClick={() => setIsWriting(true)}>
            Write a review
          </Button>
        )}
      </div>

      {!isLoadingCustomer && !customer && (
        <div className="mb-10 border border-neutral-200 bg-neutral-50 p-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-neutral-700">
            Sign in to write a review for this product.
          </p>
          <Link
            to="/$countryCode/auth"
            params={{ countryCode }}
            search={{ redirect: location.pathname }}
            className="inline-flex items-center justify-center border border-zinc-900 bg-white px-4 py-2 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Sign in
          </Link>
        </div>
      )}

      {isWriting && customer && (
        <div className="mb-10">
          <ReviewForm
            productId={productId}
            customerName={customerName}
            onCancel={() => setIsWriting(false)}
          />
        </div>
      )}

      {isError ? (
        <p className="text-sm text-neutral-600">
          We couldn&apos;t load reviews right now. Please try again later.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-600">Loading reviews…</p>
      ) : !summary?.total ? (
        <p className="text-sm text-neutral-600">
          No reviews yet. Be the first to share your thoughts on this product.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-neutral-900">
                {summary.average_rating.toFixed(1)}
              </span>
              <span className="text-neutral-500">out of 5</span>
            </div>
            <StarRating
              size="medium"
              value={Math.round(summary.average_rating)}
              className="mt-2"
            />
            <p className="text-sm text-neutral-600 mt-2 mb-6">
              Based on {summary.total} review{summary.total === 1 ? "" : "s"}
            </p>
            <RatingBreakdown summary={summary} />
          </div>

          <div className="lg:col-span-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {count > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-6">
                <span className="text-sm text-neutral-600">
                  Page {page + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="fit"
                    variant="secondary"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="fit"
                    variant="secondary"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
