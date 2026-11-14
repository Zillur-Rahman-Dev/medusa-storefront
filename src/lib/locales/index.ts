import { bn } from "./bn"
import { en } from "./en"
import { TranslationSchema } from "./types"

/**
 * Feature Flag: Keep language toggle hidden right now.
 * When you upgrade to paid VPS/Render and want bilingual UI, set to true.
 */
export const SHOW_LANG_TOGGLE = false

/**
 * Active Locale: Defaulted and locked to pure Bengali right now.
 */
export const CURRENT_LOCALE: "bn" | "en" = "bn"

export function getDictionary(locale: "bn" | "en" = CURRENT_LOCALE): TranslationSchema {
  if (locale === "en") {
    // Return en, but gracefully fallback to bn for any empty strings
    return new Proxy(en, {
      get(target, prop: keyof TranslationSchema) {
        const enSection = target[prop]
        const bnSection = bn[prop]
        if (typeof enSection === "object" && enSection !== null) {
          return new Proxy(enSection, {
            get(subTarget: any, subProp: string) {
              const val = subTarget[subProp]
              return val && val.trim() ? val : (bnSection as any)?.[subProp] || ""
            },
          })
        }
        return enSection
      },
    })
  }

  return bn
}

export const t = getDictionary(CURRENT_LOCALE)
