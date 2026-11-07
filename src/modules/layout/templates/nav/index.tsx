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

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 transition-colors duration-300">
      <AnnouncementBar />
      <header className="relative h-16 mx-auto border-b transition-colors duration-300 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
        <nav className="content-container flex items-center justify-between w-full h-full text-sm">
          {/* Left: Mobile Menu + Navigation Links */}
          <div className="flex-1 basis-0 h-full flex items-center gap-4">
            <div className="h-full flex items-center">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>

            <div className="hidden medium:flex items-center gap-6 font-medium text-zinc-600 dark:text-zinc-300">
              <LocalizedClientLink
                href="/"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                হোম
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                সকল পণ্য
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/about"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                আমাদের সম্পর্কে
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/contact"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                যোগাযোগ
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 group tracking-tight"
              data-testid="nav-store-link"
            >
              <span className="text-2xl">🍯</span>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                PURE<span className="text-amber-600 dark:text-amber-400">HONEY</span>
              </span>
            </LocalizedClientLink>
          </div>

          {/* Right: Theme Switcher, Account, Cart */}
          <div className="flex items-center gap-x-4 sm:gap-x-5 h-full flex-1 basis-0 justify-end">
            {/* Theme Toggle (Black & White Switcher) */}
            <ThemeToggle />

            <div className="hidden small:flex items-center gap-x-4 h-full">
              <LocalizedClientLink
                className="text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                অ্যাকাউন্ট
              </LocalizedClientLink>
            </div>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-zinc-700 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-amber-400 font-medium flex gap-2 items-center"
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
    </div>
  )
}
