import * as DialogPrimitive from "@radix-ui/react-dialog"

import { Button } from "@/components/ui/button"
import { BUTTON_LABEL } from "@/lib/constants/account-ui"

type DeleteAddressDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

/** Confirms removing a saved address — a delete with no undo. */
const DeleteAddressDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteAddressDialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 border border-neutral-200 bg-white p-6">
          <DialogPrimitive.Title className="font-display text-base uppercase tracking-[0.1em] text-neutral-900">
            Delete Address
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="pt-4 text-sm text-neutral-600">
            This removes the address from your account. Orders already placed
            keep the address they were shipped to.
          </DialogPrimitive.Description>

          <div className="flex items-center gap-4 pt-8">
            <Button
              type="button"
              variant="secondary"
              size="fit"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className={BUTTON_LABEL}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="fit"
              onClick={onConfirm}
              disabled={isDeleting}
              className={BUTTON_LABEL}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default DeleteAddressDialog
