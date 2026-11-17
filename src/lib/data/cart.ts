"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { BANGLADESH_REGION_ID } from "../constants"
import { getLocale } from "@lib/data/locale-actions"

const safeRevalidateTag = (tag?: string) => {
  if (tag && typeof tag === "string" && tag.trim().length > 0) {
    try {
      revalidateTag(tag)
    } catch {}
  }
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields =
    fields ||
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, +items.original_total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      cache: "no-store",
    })
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      if (cart?.completed_at) {
        await removeCartId()
        return null
      }
      if (cart && (cart.region_id !== BANGLADESH_REGION_ID || cart.currency_code !== "bdt")) {
        await removeCartId()
        return null
      }
      return cart
    })
    .catch(async (err) => {
      console.warn("[retrieveCart] fetch error:", err?.message || err)
      return null
    })
}

export async function getOrSetCart(countryCode: string = "bd", fields?: string) {
  let cart = await retrieveCart(undefined, fields || "id,region_id,currency_code")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (cart && (cart.region_id !== BANGLADESH_REGION_ID || cart.currency_code !== "bdt")) {
    await removeCartId()
    cart = null
  }

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: BANGLADESH_REGION_ID, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    safeRevalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode = "bd",
}: {
  variantId: string
  quantity: number
  countryCode?: string
}) {
  try {
    if (!variantId) {
      throw new Error("Missing variant ID when adding to cart")
    }

    // Fast single roundtrip: Retrieve or create cart including line items to avoid duplicate network requests
    let cart = await getOrSetCart(
      "bd",
      "id,region_id,currency_code,*items.id,*items.variant_id,*items.quantity"
    )

    if (!cart) {
      throw new Error("Error retrieving or creating cart")
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    // Check if variant already exists in cart to prevent duplicate rows in database
    const existingItems =
      cart.items?.filter((item) => item.variant_id === variantId) || []

    let createdLineId: string | undefined
    let allLineIds: string[] = []

    if (existingItems.length > 0) {
      // Variant already in cart: update primary line item with merged total
      const primaryItem = existingItems[0]
      const totalCurrentQty = existingItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotalQty = totalCurrentQty + quantity

      await sdk.store.cart.updateLineItem(
        cart.id,
        primaryItem.id,
        { quantity: newTotalQty },
        {},
        headers
      )

      createdLineId = primaryItem.id
      allLineIds = [primaryItem.id]

      // Clean up any existing duplicate line items from past requests
      for (let i = 1; i < existingItems.length; i++) {
        try {
          await sdk.store.cart.deleteLineItem(cart.id, existingItems[i].id, {}, headers)
        } catch (e) {
          console.warn("Cleaned up duplicate line item:", existingItems[i].id)
        }
      }
    } else {
      // First time adding this variant: create line item
      try {
        const createResp = await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity,
          },
          {},
          headers
        )
        const matched = createResp?.cart?.items?.find((i) => i.variant_id === variantId)
        createdLineId = matched?.id
        allLineIds = matched?.id ? [matched.id] : []
      } catch (err: any) {
        console.warn("createLineItem failed on existing cart, creating fresh cart...", err?.message)
        await removeCartId()
        const locale = await getLocale()
        const freshCartResp = await sdk.store.cart.create(
          { region_id: BANGLADESH_REGION_ID, locale: locale || undefined },
          {},
          headers
        )
        cart = freshCartResp.cart
        await setCartId(cart.id)
        const createResp = await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity,
          },
          {},
          headers
        )
        const matched = createResp?.cart?.items?.find((i) => i.variant_id === variantId)
        createdLineId = matched?.id
        allLineIds = matched?.id ? [matched.id] : []
      }
    }

    try {
      revalidateTag("carts")
      revalidateTag("cart")
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)
    } catch {}

    return {
      success: true,
      cartId: cart.id,
      lineId: createdLineId,
      lineIds: allLineIds,
    }
  } catch (err: any) {
    console.error("addToCart error:", err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      try {
        revalidateTag("carts")
        revalidateTag("cart")
      } catch {}
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string, variantId?: string) {
  try {
    if (!lineId && !variantId) {
      throw new Error("Missing lineItem ID or variant ID when deleting line item")
    }

    const cartId = await getCartId()

    if (!cartId) {
      return { success: true }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    // 1. Fetch current live cart from Medusa with items to accurately locate the real line item ID(s)
    const cart = await retrieveCart(cartId, "id,region_id,currency_code,*items.id,*items.variant_id")
    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: true }
    }

    // 2. Identify all matching item IDs:
    // Matches by exact line item ID OR variant ID (handles optimistic 'opt_' IDs gracefully)
    const matchingItems = cart.items.filter(
      (item) =>
        item.id === lineId ||
        (variantId && item.variant_id === variantId) ||
        (lineId.startsWith("opt_") && variantId && item.variant_id === variantId)
    )

    const targetIds =
      matchingItems.length > 0
        ? matchingItems.map((i) => i.id)
        : !lineId.startsWith("opt_")
        ? [lineId]
        : []

    // 3. Delete all matching line items from Medusa database
    for (const tid of targetIds) {
      try {
        await sdk.store.cart.deleteLineItem(cartId, tid, {}, headers)
      } catch (err: any) {
        console.warn(`[deleteLineItem] Could not delete line item ${tid}:`, err?.message)
      }
    }

    // 4. Force revalidate cache tags so Next.js never serves stale cart
    try {
      revalidateTag("carts")
      revalidateTag("cart")
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)
    } catch {}

    return { success: true }
  } catch (err: any) {
    console.error("deleteLineItem error:", err)
    return { success: false, error: err?.message || String(err) }
  }
}

export type BatchSyncPayload = {
  clearAll?: boolean
  cartId?: string
  desiredItems?: Array<{ variantId: string; quantity: number }>
  deletions?: Array<{ lineId?: string; variantId?: string }>
  updates?: Array<{ lineId: string; quantity: number }>
  additions?: Array<{ variantId: string; quantity: number }>
}

export async function clearEntireCart() {
  try {
    const cartId = await getCartId()
    if (cartId) {
      const headers = {
        ...(await getAuthHeaders()),
      }
      const cart = await retrieveCart(cartId, "id,*items.id")
      if (cart?.items && cart.items.length > 0) {
        for (const item of cart.items) {
          try {
            await sdk.store.cart.deleteLineItem(cartId, item.id, {}, headers)
          } catch (e) {}
        }
      }
    }
    await removeCartId()
    try {
      revalidateTag("carts")
      revalidateTag("cart")
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)
    } catch {}
    return { success: true }
  } catch (err: any) {
    console.error("clearEntireCart error:", err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function batchSyncCart(payload: BatchSyncPayload) {
  try {
    if (payload.clearAll) {
      return await clearEntireCart()
    }

    const cartId = payload.cartId || (await getCartId())
    const headers = {
      ...(await getAuthHeaders()),
    }

    let cart = await getOrSetCart(
      "bd",
      "id,region_id,currency_code,*items.id,*items.variant_id,*items.quantity"
    )

    if (!cart) {
      return { success: false, error: "Cart not found" }
    }

    // 0. Direct reconciliation mode: synchronize cart line items exactly with desiredItems
    if (payload.desiredItems) {
      const desiredMap = new Map<string, number>()
      for (const it of payload.desiredItems) {
        if (it.variantId && it.quantity > 0) {
          desiredMap.set(it.variantId, it.quantity)
        }
      }

      const existingItems = cart.items || []
      const processedVariants = new Set<string>()

      for (const srvItem of existingItems) {
        const vId = srvItem.variant_id
        if (!vId || !desiredMap.has(vId) || processedVariants.has(vId)) {
          try {
            await sdk.store.cart.deleteLineItem(cart.id, srvItem.id, {}, headers)
          } catch (e) {}
        } else {
          processedVariants.add(vId)
          const targetQty = desiredMap.get(vId)!
          if (srvItem.quantity !== targetQty) {
            try {
              await sdk.store.cart.updateLineItem(
                cart.id,
                srvItem.id,
                { quantity: targetQty },
                {},
                headers
              )
              srvItem.quantity = targetQty
            } catch (e) {
              console.warn(`[batchSyncCart] updateLineItem ${srvItem.id} failed:`, e)
            }
          }
        }
      }

      for (const [vId, qty] of desiredMap.entries()) {
        if (!processedVariants.has(vId)) {
          try {
            await sdk.store.cart.createLineItem(
              cart.id,
              { variant_id: vId, quantity: qty },
              {},
              headers
            )
          } catch (e) {
            console.warn(`[batchSyncCart] createLineItem for ${vId} failed:`, e)
          }
        }
      }
    }

    // 1. Process deletions
    if (payload.deletions && payload.deletions.length > 0) {
      const deletedLineIds = new Set<string>()
      const deletePromises: Promise<any>[] = []

      for (const del of payload.deletions) {
        const matching =
          cart.items?.filter(
            (i) =>
              (del.lineId && i.id === del.lineId) ||
              (del.variantId && i.variant_id === del.variantId) ||
              (del.lineId?.startsWith("opt_") &&
                del.variantId &&
                i.variant_id === del.variantId)
          ) || []

        for (const item of matching) {
          if (!deletedLineIds.has(item.id)) {
            deletedLineIds.add(item.id)
            deletePromises.push(
              sdk.store.cart.deleteLineItem(cart.id, item.id, {}, headers).catch((e) => {
                console.warn(`[batchSyncCart] Delete item ${item.id} failed:`, e)
              })
            )
          }
        }
      }

      if (deletePromises.length > 0) {
        await Promise.allSettled(deletePromises)
      }

      if (cart.items) {
        cart.items = cart.items.filter((i) => !deletedLineIds.has(i.id))
      }
    }

    // 2. Process quantity updates
    if (payload.updates && payload.updates.length > 0) {
      for (const upd of payload.updates) {
        if (upd.quantity <= 0) {
          try {
            await sdk.store.cart.deleteLineItem(cart.id, upd.lineId, {}, headers)
            if (cart.items) {
              cart.items = cart.items.filter((i) => i.id !== upd.lineId)
            }
          } catch (e) {}
        } else {
          try {
            await sdk.store.cart.updateLineItem(
              cart.id,
              upd.lineId,
              { quantity: upd.quantity },
              {},
              headers
            )
            const item = cart.items?.find((i) => i.id === upd.lineId)
            if (item) item.quantity = upd.quantity
          } catch (e) {
            console.warn(`[batchSyncCart] Update lineItem ${upd.lineId} failed:`, e)
          }
        }
      }
    }

    // 3. Process additions
    if (payload.additions && payload.additions.length > 0) {
      for (const add of payload.additions) {
        if (!add.variantId || add.quantity <= 0) continue
        const existing = cart.items?.find((i) => i.variant_id === add.variantId)
        if (existing) {
          try {
            await sdk.store.cart.updateLineItem(
              cart.id,
              existing.id,
              { quantity: add.quantity },
              {},
              headers
            )
            existing.quantity = add.quantity
          } catch (e) {
            console.warn(`[batchSyncCart] Update lineItem ${existing.id} failed:`, e)
          }
        } else {
          try {
            const res = await sdk.store.cart.createLineItem(
              cart.id,
              { variant_id: add.variantId, quantity: add.quantity },
              {},
              headers
            )
            if (res?.cart?.items) {
              cart.items = res.cart.items
            }
          } catch (e) {
            console.warn(`[batchSyncCart] Create lineItem for ${add.variantId} failed:`, e)
          }
        }
      }
    }

    // 4. Check if cart is now empty
    let isCartEmpty = false
    const finalCart = await retrieveCart(cart.id, "id,*items.id")
    if (
      finalCart &&
      Array.isArray(finalCart.items) &&
      finalCart.items.length === 0 &&
      payload.deletions &&
      payload.deletions.length > 0
    ) {
      await removeCartId()
      isCartEmpty = true
    }

    try {
      revalidateTag("carts")
      revalidateTag("cart")
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      safeRevalidateTag(fulfillmentCacheTag)
    } catch {}

    return {
      success: true,
      cartId: cart.id,
      items: finalCart?.items || cart.items || [],
      cartDeleted: isCartEmpty,
    }
  } catch (err: any) {
    console.error("batchSyncCart error:", err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    return { success: false, error: "কার্ট পাওয়া যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const updated = await sdk.store.cart.update(
      cartId,
      { promo_codes: codes },
      { fields: "+promotions.*,+discount_total,+subtotal,+total" },
      headers
    )
    const cartCacheTag = await getCacheTag("carts")
    safeRevalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    safeRevalidateTag(fulfillmentCacheTag)

    return {
      success: true,
      cart: updated?.cart
        ? {
            id: updated.cart.id,
            promotions: updated.cart.promotions || [],
            discount_total: updated.cart.discount_total ?? 0,
            subtotal: updated.cart.subtotal ?? 0,
            total: updated.cart.total ?? 0,
          }
        : undefined,
    }
  } catch (error: any) {
    console.error("applyPromotions error:", error?.response?.data || error?.message || error)
    const rawMessage = (
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      ""
    ).toString().toLowerCase()

    let banglaMessage = "প্রোমো কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে সঠিক কোড দিন।"

    if (rawMessage.includes("expired")) {
      banglaMessage = "প্রোমো কোডটির মেয়াদ শেষ হয়ে গেছে।"
    } else if (rawMessage.includes("usage limit") || rawMessage.includes("maximum")) {
      banglaMessage = "প্রোমো কোডটি ব্যবহারের সর্বোচ্চ সীমা শেষ হয়ে গেছে।"
    } else if (rawMessage.includes("minimum") || rawMessage.includes("subtotal")) {
      banglaMessage = "এই কোডটি ব্যবহার করার জন্য নুন্যতম অর্ডারের শর্ত পূরণ হয়নি।"
    }

    return { success: false, error: banglaMessage }
  }
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       safeRevalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   safeRevalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       safeRevalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    const res = await applyPromotions([code])
    if (!res.success) {
      return res.error
    }
    return null
  } catch (e: any) {
    return "প্রোমো কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে সঠিক কোড দিন।"
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  let countryCode = "bd"
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const rawFirstName = ((formData.get("shipping_address.first_name") as string) || "").trim()
    const rawLastName = ((formData.get("shipping_address.last_name") as string) || "").trim()
    let firstName = rawFirstName
    let lastName = rawLastName

    if (!lastName && firstName) {
      const parts = firstName.split(" ")
      if (parts.length > 1) {
        firstName = parts.slice(0, -1).join(" ")
        lastName = parts[parts.length - 1]
      } else {
        lastName = "."
      }
    }

    const phone = ((formData.get("shipping_address.phone") as string) || "").trim()
    let email = ((formData.get("email") as string) || "").trim()
    if (!email) {
      const cleanPhone = phone.replace(/\D/g, "")
      email = cleanPhone ? `${cleanPhone}@purehoneybd.com` : "customer@purehoneybd.com"
    }

    const postalCode = ((formData.get("shipping_address.postal_code") as string) || "").trim() || "1200"
    countryCode = (((formData.get("shipping_address.country_code") as string) || "").trim().toLowerCase()) || "bd"
    const city = ((formData.get("shipping_address.city") as string) || "").trim() || "Dhaka"
    const address1 = ((formData.get("shipping_address.address_1") as string) || "").trim()

    const data = {
      shipping_address: {
        first_name: firstName || "Customer",
        last_name: lastName || ".",
        address_1: address1,
        address_2: "",
        company: (formData.get("shipping_address.company") as string) || "",
        postal_code: postalCode,
        city: city,
        country_code: countryCode,
        province: (formData.get("shipping_address.province") as string) || "",
        phone: phone,
      },
      email: email,
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on" || !sameAsBilling) {
      data.billing_address = data.shipping_address
    } else {
      data.billing_address = {
        first_name: formData.get("billing_address.first_name") || firstName,
        last_name: formData.get("billing_address.last_name") || lastName || ".",
        address_1: formData.get("billing_address.address_1") || address1,
        address_2: "",
        company: formData.get("billing_address.company") || "",
        postal_code: formData.get("billing_address.postal_code") || postalCode,
        city: formData.get("billing_address.city") || city,
        country_code: formData.get("billing_address.country_code") || countryCode,
        province: formData.get("billing_address.province") || "",
        phone: formData.get("billing_address.phone") || phone,
      }
    }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${countryCode}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      safeRevalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    safeRevalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

export async function submitOneStepOrder(previousState: any, formData: FormData) {
  let cartId: string | undefined
  try {
    cartId = await getCartId()
    if (!cartId) {
      throw new Error("আপনার কার্ট পাওয়া যায়নি। অনুগ্রহ করে কার্ট-এ পণ্য যোগ করুন।")
    }

    const desiredRaw = formData.get("desiredItems") as string
    if (desiredRaw) {
      try {
        const desiredItems = JSON.parse(desiredRaw)
        if (Array.isArray(desiredItems) && desiredItems.length > 0) {
          await batchSyncCart({ cartId, desiredItems })
        }
      } catch (e) {
        console.warn("[submitOneStepOrder] desiredItems sync warning:", e)
      }
    }

    const rawFullName = ((formData.get("fullName") || formData.get("shipping_address.first_name") || "") as string).trim()
    if (!rawFullName) {
      throw new Error("অনুগ্রহ করে আপনার নাম লিখুন।")
    }

    let firstName = rawFullName
    let lastName = "."
    const nameParts = rawFullName.split(" ")
    if (nameParts.length > 1) {
      firstName = nameParts.slice(0, -1).join(" ")
      lastName = nameParts[nameParts.length - 1]
    }

    const phone = ((formData.get("phone") || formData.get("shipping_address.phone") || "") as string).trim()
    if (!phone) {
      throw new Error("অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন।")
    }

    const address1 = ((formData.get("address") || formData.get("shipping_address.address_1") || "") as string).trim()
    if (!address1) {
      throw new Error("অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।")
    }

    const city = ((formData.get("city") || formData.get("shipping_address.city") || "") as string).trim() || "ঢাকা"

    let email = ((formData.get("email") || "") as string).trim()
    if (!email) {
      const cleanPhone = phone.replace(/\D/g, "")
      email = cleanPhone ? `${cleanPhone}@purehoneybd.com` : "customer@purehoneybd.com"
    }

    const postalCode = ((formData.get("postal_code") || "") as string).trim() || "1200"
    const countryCode = "bd"

    // 1. Update Address on Cart
    const addressData = {
      first_name: firstName,
      last_name: lastName || ".",
      address_1: address1,
      address_2: "",
      city: city,
      country_code: countryCode,
      postal_code: postalCode,
      phone: phone,
      company: "",
      province: "",
    }

    await updateCart({
      shipping_address: addressData,
      billing_address: addressData,
      email: email,
    })

    // 2. Set Shipping Method if provided
    const shippingMethodId = (formData.get("shippingMethodId") || formData.get("shipping_method_id") || "") as string
    if (shippingMethodId) {
      await setShippingMethod({ cartId, shippingMethodId })
    }

    // 3. Initiate Payment Session (Cash on Delivery)
    const paymentProviderId = ((formData.get("paymentProviderId") || "") as string) || "pp_system_default"
    const cart = await retrieveCart()
    if (cart) {
      const activeSession = cart.payment_collection?.payment_sessions?.find(
        (s: any) => s.status === "pending"
      )
      if (!activeSession || activeSession.provider_id !== paymentProviderId) {
        await initiatePaymentSession(cart, {
          provider_id: paymentProviderId,
        })
      }
    }
  } catch (err: any) {
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err
    }
    return err?.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
  }

  // 4. Complete Order (redirects to confirmation page)
  return await placeOrder(cartId)
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    safeRevalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  safeRevalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  safeRevalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
