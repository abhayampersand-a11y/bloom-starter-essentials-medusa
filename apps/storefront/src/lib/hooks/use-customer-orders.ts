import { useQuery } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"

export const useCustomerOrders = () => {
  return useQuery({
    queryKey: queryKeys.customer.orders(),
    queryFn: async () => {
      const { orders } = await sdk.store.order.list()
      return orders
    },
    retry: false,
  })
}
