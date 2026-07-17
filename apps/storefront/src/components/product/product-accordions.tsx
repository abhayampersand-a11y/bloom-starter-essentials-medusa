import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "@medusajs/icons"

interface AccordionItem {
  id: string
  title: string
  content: string | React.ReactNode
}

interface ProductAccordionsProps {
  items?: AccordionItem[]
  /** Product copy shown in the description panel */
  description?: string | null
}

const fixedItems: AccordionItem[] = [
  {
    id: "fabric",
    title: "Fabric & Care",
    content: (
      <div className="space-y-2">
        <p>
          <strong className="font-medium">Composition:</strong> 78% Recycled
          Polyester, 22% Elastane
        </p>
        <p>
          <strong className="font-medium">Care:</strong> Machine wash cold,
          gentle cycle. Tumble dry low. Do not bleach or iron.
        </p>
        <p className="text-neutral-600">
          Made with sustainable materials that feel good and do good.
        </p>
      </div>
    ),
  },
  {
    id: "sustainability",
    title: "Sustainability",
    content: (
      <div className="space-y-2">
        <p>
          Produced in a family-run atelier that pays a certified living wage and
          runs on renewable energy.
        </p>
        <p>
          Cut to order to limit surplus, and shipped in recycled, plastic-free
          packaging.
        </p>
      </div>
    ),
  },
]

export const ProductAccordions = ({
  items,
  description,
}: ProductAccordionsProps) => {
  const resolvedItems =
    items ??
    [
      description
        ? {
            id: "description",
            title: "Product Description",
            content: description,
          }
        : null,
      ...fixedItems,
    ].filter((item): item is AccordionItem => item !== null)

  return (
    <Accordion.Root
      type="multiple"
      defaultValue={[resolvedItems[0]?.id ?? ""]}
      className="w-full border-t border-neutral-200"
    >
      {resolvedItems.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="border-b border-neutral-200"
        >
          <Accordion.Trigger className="flex items-center justify-between w-full py-5 text-left group cursor-pointer">
            <span className="text-[11px] font-medium text-neutral-900 uppercase tracking-[0.15em]">
              {item.title}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-close">
            <div className="pb-6 text-sm text-neutral-700 leading-relaxed">
              {typeof item.content === "string" ? <p>{item.content}</p> : item.content}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
