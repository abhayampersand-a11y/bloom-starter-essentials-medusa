import * as Dialog from "@radix-ui/react-dialog"
import { XMark } from "@medusajs/icons"

const SIZE_ROWS = [
  { size: "XS", chest: '31–33"', waist: '24–26"', hips: '34–36"' },
  { size: "S", chest: '34–36"', waist: '27–29"', hips: '37–39"' },
  { size: "M", chest: '37–39"', waist: '30–32"', hips: '40–42"' },
  { size: "L", chest: '40–42"', waist: '33–35"', hips: '43–45"' },
]

export const SizeGuideModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-[11px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors">
        Size Guide
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-8 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Dialog.Title className="font-editorial text-2xl text-neutral-900">
                Size Guide
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-neutral-600">
                Measurements are body measurements, not garment dimensions. If
                you are between sizes, we recommend sizing up.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close size guide"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <XMark className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                <th className="py-3 font-medium">Size</th>
                <th className="py-3 font-medium">Chest</th>
                <th className="py-3 font-medium">Waist</th>
                <th className="py-3 font-medium">Hips</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map((row) => (
                <tr key={row.size} className="border-b border-neutral-100">
                  <td className="py-3 font-medium text-neutral-900">
                    {row.size}
                  </td>
                  <td className="py-3 text-neutral-700">{row.chest}</td>
                  <td className="py-3 text-neutral-700">{row.waist}</td>
                  <td className="py-3 text-neutral-700">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
