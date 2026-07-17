import { useQuery } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"

/**
 * The signed-in customer's orders, newest first.
 *
 * `fulfillments` and `items` aren't on the list response by default, but the
 * account needs both: the status badge is derived from the fulfilments, and the
 * rows show stacked item thumbnails.
 */
export const useCustomerOrders = () => {
  return useQuery({
    queryKey: queryKeys.customer.orders(),
    queryFn: async () => {
      const { orders } = await sdk.store.order.list({
        fields: "*items,*fulfillments",
        order: "-created_at",
      })
      return orders
    },
    retry: false,
  })
}
