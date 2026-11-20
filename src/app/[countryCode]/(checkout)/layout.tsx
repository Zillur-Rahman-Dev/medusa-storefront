import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/store"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 flex-1 basis-0"
            data-testid="back-to-store-link"
          >
            <ChevronDown className="rotate-90 text-zinc-600" size={16} />
            <span className="mt-px txt-compact-plus font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
              শপে ফিরুন
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-amber-600 hover:text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5"
            data-testid="store-link"
          >
            <span className="text-xl">🍯</span> PURE HONEY
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
