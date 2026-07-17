import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Prompt,
  Table,
  Text,
  Tabs,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  deleteReview,
  listReviews,
  setReviewStatus,
  type AdminReview,
  type ReviewStatus,
} from "../../lib/reviews";
import { StarRating } from "../../components/star-rating";
import { CreateReviewForm } from "./create-review-form";

const PAGE_SIZE = 20;

type StatusFilter = ReviewStatus | "all";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_COLOR: Record<ReviewStatus, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const ReviewRow = ({ review }: { review: AdminReview }) => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-reviews", "list"] });

  const { mutate: moderate, isPending: isModerating } = useMutation({
    mutationFn: (status: ReviewStatus) => setReviewStatus(review.id, status),
    onSuccess: (_data, status) => {
      toast.success(
        status === "approved"
          ? "Review approved — it's now live on the storefront"
          : status === "rejected"
            ? "Review rejected — it stays hidden"
            : "Review moved back to pending"
      );
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update"),
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: () => {
      toast.success("Review deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete"),
  });

  const isBusy = isModerating || isDeleting;

  return (
    <Table.Row>
      <Table.Cell className="align-top">
        <div className="flex flex-col gap-y-1 py-2">
          <Text size="small" weight="plus">
            {review.product_title ?? review.product_id}
          </Text>
          <StarRating value={review.rating} />
          <Text size="xsmall" className="text-ui-fg-subtle">
            {review.name}
            {review.customer_email ?? review.email
              ? ` · ${review.customer_email ?? review.email}`
              : ""}
          </Text>
          <div className="flex flex-wrap items-center gap-x-2">
            <Text size="xsmall" className="text-ui-fg-muted">
              {new Date(review.created_at).toLocaleDateString()}
              {review.source === "admin" ? " · added by admin" : ""}
            </Text>
            <Badge size="2xsmall" color={review.customer_id ? "blue" : "grey"}>
              {review.customer_id ? "Customer account" : "Name only"}
            </Badge>
          </div>
        </div>
      </Table.Cell>

      <Table.Cell className="align-top">
        <div className="flex max-w-md flex-col gap-y-2 py-2">
          {review.title && (
            <Text size="small" weight="plus">
              {review.title}
            </Text>
          )}
          <Text size="small" className="text-ui-fg-subtle whitespace-pre-wrap">
            {review.content}
          </Text>
          {review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {review.images.map((image) => (
                <a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open full size"
                >
                  <img
                    src={image.url}
                    alt=""
                    className="h-16 w-16 rounded object-cover transition-opacity hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </Table.Cell>

      <Table.Cell className="align-top">
        <div className="py-2">
          <Badge size="2xsmall" color={STATUS_COLOR[review.status]}>
            {review.status}
          </Badge>
        </div>
      </Table.Cell>

      <Table.Cell className="align-top">
        <div className="flex flex-wrap items-center justify-end gap-2 py-2">
          {review.status !== "approved" && (
            <Button
              size="small"
              variant="secondary"
              disabled={isBusy}
              onClick={() => moderate("approved")}
            >
              Approve
            </Button>
          )}
          {review.status !== "rejected" && (
            <Button
              size="small"
              variant="secondary"
              disabled={isBusy}
              onClick={() => moderate("rejected")}
            >
              Reject
            </Button>
          )}
          {review.status !== "pending" && (
            <Button
              size="small"
              variant="transparent"
              disabled={isBusy}
              onClick={() => moderate("pending")}
            >
              Undo
            </Button>
          )}
          <Prompt>
            <Prompt.Trigger asChild>
              <Button size="small" variant="danger" disabled={isBusy}>
                Delete
              </Button>
            </Prompt.Trigger>
            <Prompt.Content>
              <Prompt.Header>
                <Prompt.Title>Delete review</Prompt.Title>
                <Prompt.Description>
                  This permanently removes the review and its photos. This
                  can&apos;t be undone.
                </Prompt.Description>
              </Prompt.Header>
              <Prompt.Footer>
                <Prompt.Cancel>Cancel</Prompt.Cancel>
                <Prompt.Action onClick={() => remove()}>Delete</Prompt.Action>
              </Prompt.Footer>
            </Prompt.Content>
          </Prompt>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

/**
 * Moderation queue for product reviews. Storefront submissions land here as
 * "pending" and stay invisible to shoppers until they're approved.
 */
const ReviewsPage = () => {
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", "list", status, page],
    queryFn: () =>
      listReviews({ status, limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
  });

  const reviews = data?.reviews ?? [];
  const count = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Product Reviews</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Approve a review to publish it on the storefront.
          </Text>
        </div>
        <CreateReviewForm />
      </div>

      <div className="px-6 py-4">
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(value as StatusFilter);
            setPage(0);
          }}
        >
          <Tabs.List>
            {STATUS_TABS.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </div>

      <div>
        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Loading reviews…
            </Text>
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              {status === "pending"
                ? "Nothing waiting for review. New submissions show up here."
                : `No ${status === "all" ? "" : status} reviews yet.`}
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product &amp; reviewer</Table.HeaderCell>
                <Table.HeaderCell>Review</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reviews.map((review) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {count > PAGE_SIZE && (
        <div className="flex items-center justify-between px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Page {page + 1} of {pageCount} · {count} reviews
          </Text>
          <div className="flex gap-x-2">
            <Button
              size="small"
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight,
});

export default ReviewsPage;
