import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StarRating } from "@/components/product/star-rating"
import { useCreateProductReview } from "@/lib/hooks/use-reviews"
import {
  fileToReviewImage,
  MAX_REVIEW_IMAGES,
  MAX_REVIEW_IMAGE_BYTES,
  type ReviewImagePayload,
} from "@/lib/data/reviews"

type ReviewFormProps = {
  productId: string
  /** Shown so the reviewer knows which name their review will appear under. */
  customerName: string
  onCancel: () => void
}

type Draft = {
  rating: number
  title: string
  content: string
}

const EMPTY_DRAFT: Draft = {
  rating: 5,
  title: "",
  content: "",
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/**
 * Review submission form. On success the review is queued for admin approval
 * rather than appearing straight away, so the form says so explicitly.
 */
export const ReviewForm = ({
  productId,
  customerName,
  onCancel,
}: ReviewFormProps) => {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [images, setImages] = useState<ReviewImagePayload[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending, error } = useCreateProductReview(productId)

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const handleFiles = async (fileList: FileList | null) => {
    setFileError(null)
    if (!fileList?.length) {
      return
    }

    const room = MAX_REVIEW_IMAGES - images.length
    if (room <= 0) {
      setFileError(`You can add up to ${MAX_REVIEW_IMAGES} photos.`)
      return
    }

    const selected = Array.from(fileList).slice(0, room)

    const tooLarge = selected.find((file) => file.size > MAX_REVIEW_IMAGE_BYTES)
    if (tooLarge) {
      setFileError(`"${tooLarge.name}" is larger than 5MB.`)
      return
    }

    const wrongType = selected.find((file) => !ACCEPTED_TYPES.includes(file.type))
    if (wrongType) {
      setFileError(`"${wrongType.name}" isn't a supported image type.`)
      return
    }

    try {
      const payloads = await Promise.all(selected.map(fileToReviewImage))
      setImages((prev) => [...prev, ...payloads])
    } catch {
      setFileError("We couldn't read those photos. Please try again.")
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    mutate(
      {
        rating: draft.rating,
        title: draft.title.trim() || undefined,
        content: draft.content.trim(),
        images,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          setDraft(EMPTY_DRAFT)
          setImages([])
        },
      }
    )
  }

  if (submitted) {
    return (
      <div className="border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Thanks for your review!
        </h3>
        <p className="text-sm text-neutral-700 mb-6">
          It&apos;s been sent to our team for approval and will appear here once
          it&apos;s been checked.
        </p>
        <Button size="fit" variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </div>
    )
  }

  const isValid = draft.content.trim().length >= 5

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 p-6 md:p-8 flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Write a review
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Reviews are checked by our team before they appear on this page.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-900">
          Your rating
        </label>
        <StarRating
          size="large"
          value={draft.rating}
          onChange={(value) => setField("rating", value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-900">
          Posting as
        </label>
        <p className="text-sm text-neutral-700">{customerName}</p>
        <p className="text-xs text-neutral-500">
          Your review is published under your account name. Your email is never
          shown publicly.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-title" className="text-sm font-medium text-neutral-900">
          Title <span className="text-neutral-500 font-normal">(optional)</span>
        </label>
        <Input
          id="review-title"
          value={draft.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Love the fit"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-content" className="text-sm font-medium text-neutral-900">
          Your review
        </label>
        <textarea
          id="review-content"
          rows={5}
          value={draft.content}
          onChange={(e) => setField("content", e.target.value)}
          placeholder="What did you like or dislike about this product?"
          required
          className="appearance-none shadow-none outline-none focus:outline-none border border-zinc-200 rounded-none text-base font-medium text-zinc-900 px-4 py-2 w-full bg-white placeholder:text-zinc-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-photos" className="text-sm font-medium text-neutral-900">
          Add photos{" "}
          <span className="text-neutral-500 font-normal">
            (optional, up to {MAX_REVIEW_IMAGES})
          </span>
        </label>
        <input
          id="review-photos"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ""
          }}
          className="text-sm text-neutral-700 file:mr-3 file:border file:border-zinc-900 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-100"
        />
        {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((image, index) => (
              <div key={`${image.filename}-${index}`} className="relative">
                <img
                  src={image.content}
                  alt={image.filename}
                  className="h-20 w-20 object-cover border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  aria-label={`Remove ${image.filename}`}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm leading-none text-neutral-700 hover:bg-neutral-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-600">
          {error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="fit" disabled={!isValid || isPending}>
          {isPending ? "Submitting…" : "Submit review"}
        </Button>
        <Button type="button" size="fit" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
