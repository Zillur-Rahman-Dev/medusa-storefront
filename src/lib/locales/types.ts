export type TranslationSchema = {
  nav: {
    home: string
    store: string
    about: string
    contact: string
    searchPlaceholder: string
    cart: string
    account: string
    menu: string
  }
  cart: {
    title: string
    item: string
    quantity: string
    price: string
    total: string
    emptyTitle: string
    emptyMessage: string
    exploreProducts: string
    alreadyHaveAccount: string
    signInPrompt: string
    signInButton: string
    summaryTitle: string
    subtotal: string
    shipping: string
    totalPayable: string
    goToCheckout: string
    removeItem: string
  }
  product: {
    addToCart: string
    addedToCart: string
    adding: string
    orderNow: string
    ordering: string
    selectVariant: string
    outOfStock: string
    descriptionTitle: string
    specificationsTitle: string
    healthBenefits: string
    usageInstructions: string
  }
  checkout: {
    title: string
    deliveryAddress: string
    deliveryArea: string
    paymentMethod: string
    confirmOrder: string
    processingOrder: string
    cashOnDelivery: string
  }
  globalPolicies: {
    codNote: string
    returnPolicy: string
    deliveryNote: string
    hotline: string
    supportPhone: string
  }
}
