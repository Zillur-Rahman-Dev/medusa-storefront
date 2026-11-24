import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import HeaderSearch from "@modules/layout/components/header-search"
import CategoryBar from "@modules/layout/components/category-bar"
import MoreMenu from "@modules/layout/components/more-menu"

// Header Visibility Controls (Set true to re-enable anytime in the future)
const SHOW_ANNOUNCEMENT_BAR = false
const SHOW_CATEGORY_BAR = false

export default async function Nav() {

  return (
    <div className="sticky top-0 inset-x-0 z-50 transition-colors duration-300 shadow-sm">
      {/* 1. Top Announcement Bar (Toggled off for compact header, can be re-enabled) */}
      {SHOW_ANNOUNCEMENT_BAR && <AnnouncementBar />}

      {/* 2. Main Header (Clean 3-Column: Menu Left, Logo Center, Theme Right) */}
      <header className="relative h-16 mx-auto border-b transition-colors duration-300 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
        <nav className="content-container flex items-center justify-between w-full h-full gap-2 sm:gap-4 text-sm">
          {/* Left: Menu Icon Only (No text, replaces raw 'Menu' text) */}
          <div className="flex items-center justify-start shrink-0 min-w-[40px] sm:min-w-[60px]">
            <MoreMenu />
          </div>

          {/* Middle: Brand Logo (Centered) */}
          <div className="flex items-center justify-center flex-1">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 group tracking-tight"
              data-testid="nav-store-link"
            >
              <span className="text-2xl sm:text-3xl">🍯</span>
              <div className="text-center sm:text-left">
                <span className="text-lg sm:text-xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
                  PURE<span className="text-amber-500">HONEY</span>
                </span>
                <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
                  ১০০% খাঁটি প্রাকৃতিক মধু
                </span>
              </div>
            </LocalizedClientLink>
          </div>

          {/* Right: Theme Toggle (Dark / Light) */}
          <div className="flex items-center justify-end shrink-0 min-w-[40px] sm:min-w-[60px] gap-2">
            <div className="hidden lg:flex w-56">
              <HeaderSearch />
            </div>
            <ThemeToggle />
          </div>

          {/* CartDropdown Portal Mounting (Keeps floating cart widget & drawer active without header buttons) */}
          <Suspense fallback={null}>
            <CartButton />
          </Suspense>
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
