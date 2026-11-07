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
import { PhoneCall, User } from "lucide-react"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 transition-colors duration-300 shadow-sm">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Header (GhorerBazar 3-Column Layout) */}
      <header className="relative h-20 mx-auto border-b transition-colors duration-300 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
        <nav className="content-container flex items-center justify-between w-full h-full gap-4 text-sm">
          {/* Left: Mobile Menu + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-full flex items-center md:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 group tracking-tight"
              data-testid="nav-store-link"
            >
              <span className="text-3xl">🍯</span>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
                  PURE<span className="text-amber-500">HONEY</span>
                </span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
                  ১০০% খাঁটি প্রাকৃতিক মধু
                </span>
              </div>
            </LocalizedClientLink>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-auto">
            <HeaderSearch />
          </div>

          {/* Right: Hotline, Account, Theme, Cart */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 justify-end">
            {/* Hotline Phone Widget (Desktop) */}
            <a
              href="tel:+8801700000000"
              className="hidden lg:flex items-center gap-2 p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <div className="text-[10px] text-zinc-400">হটলাইন কল</div>
                <div className="font-bold text-zinc-800 dark:text-zinc-100">+৮৮০ ১৭১১-XXXXXX</div>
              </div>
            </a>

            {/* Theme Toggle (Black & White Switcher) */}
            <ThemeToggle />

            {/* Account Icon */}
            <LocalizedClientLink
              className="p-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              href="/account"
              data-testid="nav-account-link"
            >
              <User className="w-4 h-4" />
              <span className="hidden xl:inline">অ্যাকাউন্ট</span>
            </LocalizedClientLink>

            {/* Cart Button */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-zinc-700 dark:text-zinc-200 font-medium flex gap-2 items-center"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  কার্ট (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* 3. Mobile Search Row (visible on mobile only) */}
      <div className="md:hidden px-4 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <HeaderSearch />
      </div>

      {/* 4. Category Navigation Bar (GhorerBazar Horizontal Strip) */}
      <CategoryBar />
    </div>
  )
}
