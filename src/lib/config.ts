import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const DEFAULT_BACKEND_URL = "https://medusa-backend-wqbd.onrender.com"
const DEFAULT_PUBLISHABLE_KEY = "pk_7e30dad7c14c016a217270007219f9842426b3ee72e0577f4ce7f4d8fb8ecde5"

const rawBackend =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const MEDUSA_BACKEND_URL =
  rawBackend && !rawBackend.includes("localhost")
    ? rawBackend
    : DEFAULT_BACKEND_URL

const PUBLISHABLE_KEY =
  (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.length > 20)
    ? process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    : DEFAULT_PUBLISHABLE_KEY

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
