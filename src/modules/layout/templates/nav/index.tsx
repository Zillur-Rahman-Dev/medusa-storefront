import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import HeaderSearch from "@modules/layout/components/header-search"
import CategoryBar from "@modules/layout/components/category-bar"
import MoreMenu from "@modules/layout/components/more-menu"
import { User, ShoppingCart } from "lucide-react"

// Header Visibility Controls (Set true to re-enable anytime in the future)
const SHOW_ANNOUNCEMENT_BAR = false
const SHOW_CATEGORY_BAR = false

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 transition-colors duration-300 shadow-sm">
      {/* 1. Top Announcement Bar (Toggled off for compact header, can be re-enabled) */}
      {SHOW_ANNOUNCEMENT_BAR && <AnnouncementBar />}

      {/* 2. Main Header (Compact 64px Modern Header) */}
      <header className="relative h-16 mx-auto border-b transition-colors duration-300 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
        <nav className="content-container flex items-center justify-between w-full h-full gap-2 sm:gap-4 text-sm">
          {/* Left: Mobile Menu + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-full flex items-center md:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 group tracking-tight"
              data-testid="nav-store-link"
            >
              <span className="text-2xl sm:text-3xl">🍯</span>
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
                  PURE<span className="text-amber-500">HONEY</span>
                </span>
                <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
                  ১০০% খাঁটি প্রাকৃতিক মধু
                </span>
              </div>
            </LocalizedClientLink>
          </div>

          {/* Center: Compact Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs sm:max-w-sm mx-auto">
            <HeaderSearch />
          </div>

          {/* Right: Theme, Account, Cart, More Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 justify-end">
            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Account Icon */}
            <LocalizedClientLink
              className="flex flex-col items-center justify-center p-1 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              <User className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
              <span className="text-[11px] font-semibold mt-0.5 leading-tight">অ্যাকাউন্ট</span>
            </LocalizedClientLink>

            {/* Cart Button with Cart count badge */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex flex-col items-center justify-center p-1 rounded-xl text-zinc-700 dark:text-zinc-200 relative"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
                  <span className="text-[11px] font-semibold mt-0.5 leading-tight">শপিং ব্যাগ</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {/* More Menu (Dropdown matching reference image: About Us, Faqs, Call Us, WhatsApp) */}
            <MoreMenu />
          </div>
        </nav>
      </header>

      {/* 3. Mobile Search Row (visible on mobile only) */}
      <div className="md:hidden px-4 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <HeaderSearch />
      </div>

      {/* 4. Category Navigation Bar (Toggled off, categories are featured on Homepage) */}
      {SHOW_CATEGORY_BAR && <CategoryBar />}
    </div>
  )
}
