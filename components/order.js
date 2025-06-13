// Global variables and state management
let orderItems = []
let paymentMethod = ""
let discountAmount = 0
let menuStock = {}
let adminProducts = {}
let qrTimer = null
let currentTabIndex = 0

// Initialize the application
function initializeApp() {
  console.log("Initializing Kantin Digital App...")

  // Load data from localStorage
  loadAppData()

  // Setup event listeners
  setupEventListeners()

  // Initialize UI components
  initializeUI()

  // Setup tab functionality
  setupTabs()

  // Initialize menu
  initializeMenu()

  // Update displays
  updateOrderSummary()
  updatePaymentDisplay()
  updateCartCount()

  console.log("App initialized successfully")
}

// Load application data from localStorage
function loadAppData() {
  orderItems = JSON.parse(localStorage.getItem("orderItems") || "[]")
  paymentMethod = localStorage.getItem("paymentMethod") || ""
  discountAmount = Number.parseInt(localStorage.getItem("discountAmount") || "0")
  menuStock = JSON.parse(localStorage.getItem("menuStock") || "{}")
  adminProducts = JSON.parse(localStorage.getItem("adminProducts") || "{}")
}

// Setup all event listeners
function setupEventListeners() {
  // Tab navigation
  setupTabEventListeners()

  // Payment method selection
  setupPaymentEventListeners()

  // Cart and order management
  setupCartEventListeners()

  // Search functionality
  setupSearchEventListeners()

  // Modal event listeners
  setupModalEventListeners()

  // Discount functionality
  setupDiscountEventListeners()
}

// Setup tab event listeners
function setupTabEventListeners() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const nextTabBtn = document.getElementById("next-tab")
  const prevTabBtn = document.getElementById("prev-tab")

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      showTab(index)
    })
  })

  if (nextTabBtn) {
    nextTabBtn.addEventListener("click", () => {
      if (currentTabIndex < tabButtons.length - 1) {
        showTab(currentTabIndex + 1)
      }
    })
  }

  if (prevTabBtn) {
    prevTabBtn.addEventListener("click", () => {
      if (currentTabIndex > 0) {
        showTab(currentTabIndex - 1)
      }
    })
  }
}

// Setup payment event listeners
function setupPaymentEventListeners() {
  const paymentOptions = document.querySelectorAll('input[name="payment"]')

  paymentOptions.forEach((option) => {
    // Set checked state based on stored payment method
    if (option.value === paymentMethod) {
      option.checked = true
    }

    option.addEventListener("change", function () {
      if (this.checked) {
        // If this option is being checked, handle selection
        handlePaymentSelection(this.value)
      }
    })

    // Add click event to handle deselection
    option.parentElement.addEventListener("click", function (e) {
      const radioInput = this.querySelector('input[type="radio"]')

      // If the radio is already checked, uncheck it
      if (radioInput.checked && e.target !== radioInput) {
        radioInput.checked = false
        handlePaymentDeselection()
      }
    })
  })
}

// Handle payment method selection
function handlePaymentSelection(method) {
  paymentMethod = method
  localStorage.setItem("paymentMethod", paymentMethod)
  updatePaymentDisplay()
  checkConfirmButton()
  showToast(`Metode pembayaran dipilih: ${method}`)
}

// Handle payment method deselection
function handlePaymentDeselection() {
  paymentMethod = ""
  localStorage.removeItem("paymentMethod")
  updatePaymentDisplay()
  checkConfirmButton()
  showToast("Metode pembayaran dibatalkan")
}

// Setup cart event listeners
function setupCartEventListeners() {
  const clearCartBtn = document.getElementById("clear-cart")
  const confirmOrderBtn = document.getElementById("confirm-order")
  const mobileCartBtn = document.getElementById("mobile-cart-btn")

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (orderItems.length > 0) {
        showModal("clear-cart-modal")
      }
    })
  }

  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", () => {
      if (orderItems.length > 0 && paymentMethod) {
        confirmOrder()
      } else {
        if (orderItems.length === 0) {
          showToast("Silakan pilih menu terlebih dahulu!")
        } else if (!paymentMethod) {
          showToast("Silakan pilih metode pembayaran!")
          showTab(2) // Show payment tab
        }
      }
    })
  }

  if (mobileCartBtn) {
    mobileCartBtn.addEventListener("click", () => {
      const orderSummary = document.getElementById("order-summary")
      if (orderSummary) {
        orderSummary.classList.toggle("show-mobile")
      }
    })
  }
}

// Setup search event listeners
function setupSearchEventListeners() {
  const searchInput = document.getElementById("search-input")
  const clearSearchBtn = document.getElementById("clear-search")

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim()

      if (searchTerm) {
        clearSearchBtn.style.display = "block"
      } else {
        clearSearchBtn.style.display = "none"
      }

      filterMenuItems(searchTerm)
    })
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = ""
      clearSearchBtn.style.display = "none"
      showAllMenuItems()
    })
  }
}

// Setup modal event listeners
function setupModalEventListeners() {
  // History modal
  const showHistoryBtn = document.getElementById("show-history")
  const closeHistoryBtn = document.getElementById("close-history")

  if (showHistoryBtn) {
    showHistoryBtn.addEventListener("click", showHistoryModal)
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", () => hideModal("history-modal"))
  }

  // Confirm modal
  const closeConfirmBtn = document.getElementById("close-confirm")
  const cancelConfirmBtn = document.getElementById("cancel-confirm")
  const proceedConfirmBtn = document.getElementById("proceed-confirm")

  if (closeConfirmBtn) {
    closeConfirmBtn.addEventListener("click", () => hideModal("confirm-modal"))
  }

  if (cancelConfirmBtn) {
    cancelConfirmBtn.addEventListener("click", () => hideModal("confirm-modal"))
  }

  if (proceedConfirmBtn) {
    proceedConfirmBtn.addEventListener("click", confirmOrder)
  }

  // Clear cart modal
  const closeClearCartBtn = document.getElementById("close-clear-cart")
  const cancelClearBtn = document.getElementById("cancel-clear")
  const proceedClearBtn = document.getElementById("proceed-clear")

  if (closeClearCartBtn) {
    closeClearCartBtn.addEventListener("click", () => hideModal("clear-cart-modal"))
  }

  if (cancelClearBtn) {
    cancelClearBtn.addEventListener("click", () => hideModal("clear-cart-modal"))
  }

  if (proceedClearBtn) {
    proceedClearBtn.addEventListener("click", clearCart)
  }

  // About modal
  const aboutLink = document.getElementById("about-link")
  const closeAboutBtn = document.getElementById("close-about")

  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault()
      showModal("about-modal")
    })
  }

  if (closeAboutBtn) {
    closeAboutBtn.addEventListener("click", () => hideModal("about-modal"))
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (event.target === modal) {
        hideModal(modal.id)
      }
    })
  })
}

// Setup discount event listeners
function setupDiscountEventListeners() {
  const applyDiscountBtn = document.getElementById("apply-discount")

  if (applyDiscountBtn) {
    applyDiscountBtn.addEventListener("click", applyDiscount)
  }
}

// Initialize UI components
function initializeUI() {
  // Check URL parameters for initial tab
  const urlParams = new URLSearchParams(window.location.search)
  const initialTab = urlParams.get("tab")

  if (initialTab === "drink") {
    showTab(1)
  } else if (initialTab === "payment") {
    showTab(2)
  } else {
    showTab(0)
  }

  // Handle item addition from URL
  const itemToAdd = urlParams.get("addItem")
  const categoryToAdd = urlParams.get("category")

  if (itemToAdd && categoryToAdd) {
    setTimeout(() => {
      addItemFromURL(itemToAdd, categoryToAdd)
    }, 500)
  }
}

// Setup tab functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  // Ensure we have the elements
  if (tabButtons.length === 0 || tabContents.length === 0) {
    console.error("Tab elements not found")
    return
  }

  // Initialize first tab as active
  showTab(0)
}

// Show specific tab
function showTab(index) {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const nextTabBtn = document.getElementById("next-tab")
  const prevTabBtn = document.getElementById("prev-tab")

  // Remove active class from all tabs
  tabButtons.forEach((btn) => btn.classList.remove("active"))
  tabContents.forEach((content) => content.classList.remove("active"))

  // Add active class to selected tab
  if (tabButtons[index]) {
    tabButtons[index].classList.add("active")
  }

  if (tabContents[index]) {
    tabContents[index].classList.add("active")
  }

  currentTabIndex = index

  // Update navigation buttons
  if (prevTabBtn) {
    prevTabBtn.style.visibility = index === 0 ? "hidden" : "visible"
  }

  if (nextTabBtn) {
    nextTabBtn.style.visibility = index === tabButtons.length - 1 ? "hidden" : "visible"
  }
}

// Initialize menu with products
function initializeMenu() {
  const foodContainer = document.getElementById("food-items")
  const drinkContainer = document.getElementById("drink-items")

  if (!foodContainer || !drinkContainer) return

  // Clear existing items
  foodContainer.innerHTML = ""
  drinkContainer.innerHTML = ""

  // Load products from admin or use default
  if (adminProducts.food) {
    Object.values(adminProducts.food).forEach((product) => {
      if (product.active) {
        createMenuItemElement(product, "food", foodContainer)
      }
    })
  } else {
    // Create default food items
    createDefaultMenuItems()
  }

  if (adminProducts.drink) {
    Object.values(adminProducts.drink).forEach((product) => {
      if (product.active) {
        createMenuItemElement(product, "drink", drinkContainer)
      }
    })
  }

  // Setup menu event listeners
  setupMenuEventListeners()
}

// Create default menu items if no admin products
function createDefaultMenuItems() {
  const defaultFoodItems = [
    {
      id: "1",
      name: "Nasi Goreng",
      price: "15000",
      description: "Nasi goreng spesial dengan telur dan ayam",
      image: "food-1",
      active: true,
    },
    {
      id: "2",
      name: "Mie Goreng",
      price: "12000",
      description: "Mie goreng dengan telur dan sayuran",
      image: "food-2",
      active: true,
    },
    {
      id: "3",
      name: "Ayam Geprek",
      price: "10000",
      description: "Ayam geprek pedas dengan sambal spesial",
      image: "food-3",
      active: true,
    },
    {
      id: "4",
      name: "Sate Ayam",
      price: "20000",
      description: "Sate ayam dengan bumbu kacang",
      image: "food-4",
      active: true,
    },
    {
      id: "5",
      name: "Sate Sapi",
      price: "22000",
      description: "Sate sapi dengan bumbu kacang spesial",
      image: "food-5",
      active: true,
    },
  ]

  const defaultDrinkItems = [
    {
      id: "1",
      name: "Es Teh",
      price: "5000",
      description: "Es teh manis segar",
      image: "drink-1",
      active: true,
    },
    {
      id: "2",
      name: "Es Jeruk",
      price: "6000",
      description: "Es jeruk segar dengan jeruk pilihan",
      image: "drink-2",
      active: true,
    },
    {
      id: "3",
      name: "Susu Coklat",
      price: "8000",
      description: "Susu coklat dingin",
      image: "drink-3",
      active: true,
    },
    {
      id: "4",
      name: "Susu Vanilla",
      price: "8000",
      description: "Susu vanilla dingin",
      image: "drink-4",
      active: true,
    },
    {
      id: "5",
      name: "Air Mineral",
      price: "4000",
      description: "Air mineral segar",
      image: "drink-5",
      active: true,
    },
  ]

  const foodContainer = document.getElementById("food-items")
  const drinkContainer = document.getElementById("drink-items")

  defaultFoodItems.forEach((item) => {
    createMenuItemElement(item, "food", foodContainer)
  })

  defaultDrinkItems.forEach((item) => {
    createMenuItemElement(item, "drink", drinkContainer)
  })
}

// Create menu item element
function createMenuItemElement(product, category, container) {
  if (!container) return

  const stockInfo =
    menuStock[category] && menuStock[category][product.id] ? menuStock[category][product.id] : { stock: 10 } // Default stock

  const isOutOfStock = stockInfo.stock <= 0

  const menuItem = document.createElement("div")
  menuItem.className = "menu-item"
  menuItem.dataset.id = product.id
  menuItem.dataset.name = product.name
  menuItem.dataset.price = product.price
  menuItem.dataset.category = category

  menuItem.innerHTML = `
        ${
          product.image.startsWith("data:")
            ? `<img src="${product.image}" class="menu-item-image" style="width: 120px; height: 120px; border-radius: 8px;">`
            : `<div class="menu-item-image ${product.image}"></div>`
        }
        <div class="menu-item-details">
            <h3>${product.name}</h3>
            <p class="menu-item-price">Rp ${formatPrice(product.price)}</p>
            <p class="menu-item-description">${product.description}</p>
            <p class="stock-info ${isOutOfStock ? "out-of-stock" : ""}">
                ${isOutOfStock ? "Out of Stock" : `Stok: ${stockInfo.stock}`}
            </p>
            <div class="quantity-control" ${isOutOfStock ? 'style="display: none;"' : ""}>
                <button class="quantity-btn minus">-</button>
                <input type="number" class="quantity-input" value="1" min="1" max="${Math.min(stockInfo.stock, 10)}" />
                <button class="quantity-btn plus">+</button>
            </div>
        </div>
        <button class="btn btn-primary add-item-btn" ${
          isOutOfStock ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ""
        }>
            <i class="fas fa-plus"></i> ${isOutOfStock ? "Habis" : "Tambah"}
        </button>
    `

  container.appendChild(menuItem)
}

// Setup menu event listeners
function setupMenuEventListeners() {
  // Quantity controls
  const quantityBtns = document.querySelectorAll(".quantity-btn")
  quantityBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.parentElement.querySelector(".quantity-input")
      const maxStock = Number.parseInt(input.getAttribute("max"))
      let value = Number.parseInt(input.value)

      if (this.classList.contains("plus")) {
        value = Math.min(value + 1, maxStock)
      } else if (this.classList.contains("minus")) {
        value = Math.max(value - 1, 1)
      }

      input.value = value
    })
  })

  // Add item buttons
  const addButtons = document.querySelectorAll(".add-item-btn")
  addButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.disabled) return

      const menuItem = this.closest(".menu-item")
      const id = menuItem.dataset.id
      const name = menuItem.dataset.name
      const price = menuItem.dataset.price
      const category = menuItem.dataset.category
      const quantityInput = menuItem.querySelector(".quantity-input")
      const quantity = Number.parseInt(quantityInput.value)

      addItemToCart(id, name, price, category, quantity)

      // Reset quantity input
      quantityInput.value = 1
    })
  })
}

// Add item to cart
function addItemToCart(id, name, price, category, quantity) {
  // Check stock
  const currentStock = menuStock[category] && menuStock[category][id] ? menuStock[category][id].stock : 10

  if (currentStock < quantity) {
    showToast(`Stok tidak mencukupi! Tersisa ${currentStock} item`)
    return
  }

  // Check if item already exists
  const existingItemIndex = orderItems.findIndex((item) => item.id === id && item.category === category)

  if (existingItemIndex !== -1) {
    const newQuantity = orderItems[existingItemIndex].quantity + quantity
    if (newQuantity > currentStock) {
      showToast(`Stok tidak mencukupi! Maksimal ${currentStock - orderItems[existingItemIndex].quantity} item lagi`)
      return
    }
    orderItems[existingItemIndex].quantity = newQuantity
  } else {
    orderItems.push({ id, name, price, category, quantity })
  }

  // Update stock
  updateStock(category, id, -quantity)

  // Save to localStorage
  localStorage.setItem("orderItems", JSON.stringify(orderItems))

  // Show notification
  showToast(`${name} ditambahkan ke pesanan!`)

  // Update UI
  updateOrderSummary()
  updateCartCount()
  checkConfirmButton()

  // Update QR code if QRIS is selected
  if (paymentMethod === "QRIS") {
    const totalPrice = calculateTotalPrice()
    if (totalPrice > 0) {
      generateQRCodeForPayment()
    }
  }

  // Refresh menu
  initializeMenu()
}

// Update stock
function updateStock(category, id, change) {
  if (!menuStock[category]) menuStock[category] = {}
  if (!menuStock[category][id]) menuStock[category][id] = { stock: 10 }

  menuStock[category][id].stock += change

  // Also update admin stock
  const adminStock = JSON.parse(localStorage.getItem("adminStock") || "{}")
  if (!adminStock[category]) adminStock[category] = {}
  if (!adminStock[category][id]) adminStock[category][id] = { stock: 10, minStock: 0 }

  adminStock[category][id].stock += change

  localStorage.setItem("menuStock", JSON.stringify(menuStock))
  localStorage.setItem("adminStock", JSON.stringify(adminStock))
}

// Calculate total price
function calculateTotalPrice() {
  const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
  return subtotal - discountAmount
}

// Update order summary
function updateOrderSummary() {
  const orderItemsContainer = document.getElementById("order-items")
  const subtotalElement = document.getElementById("subtotal")
  const discountRow = document.getElementById("discount-row")
  const discountAmountElement = document.getElementById("discount-amount")
  const totalPriceElement = document.getElementById("total-price")

  if (!orderItemsContainer) return

  // Clear current items
  orderItemsContainer.innerHTML = ""

  if (orderItems.length === 0) {
    orderItemsContainer.innerHTML = '<p class="empty-order">Belum Ada Pesanan</p>'
    if (subtotalElement) subtotalElement.textContent = "Rp 0"
    if (totalPriceElement) totalPriceElement.textContent = "Rp 0"
    if (discountRow) discountRow.style.display = "none"
    return
  }

  let subtotal = 0

  // Add each item to display
  orderItems.forEach((item, index) => {
    const price = Number.parseInt(item.price)
    const itemTotal = price * item.quantity
    subtotal += itemTotal

    const itemElement = document.createElement("div")
    itemElement.className = "order-item"
    itemElement.innerHTML = `
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">Rp ${formatPrice(price)} x ${item.quantity}</div>
            </div>
            <div class="order-item-total">Rp ${formatPrice(itemTotal)}</div>
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `
    orderItemsContainer.appendChild(itemElement)
  })

  // Update subtotal
  if (subtotalElement) {
    subtotalElement.textContent = `Rp ${formatPrice(subtotal)}`
  }

  // Update discount
  if (discountAmount > 0 && discountRow && discountAmountElement) {
    discountRow.style.display = "flex"
    discountAmountElement.textContent = `-Rp ${formatPrice(discountAmount)}`
  } else if (discountRow) {
    discountRow.style.display = "none"
  }

  // Update total
  const totalPrice = subtotal - discountAmount
  if (totalPriceElement) {
    totalPriceElement.textContent = `Rp ${formatPrice(totalPrice)}`
  }

  // Add remove button event listeners
  const removeButtons = document.querySelectorAll(".remove-item")
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const index = Number.parseInt(this.dataset.index)
      removeItemFromCart(index)
    })
  })
}

// Remove item from cart
function removeItemFromCart(index) {
  const removedItem = orderItems[index]

  // Restore stock
  updateStock(removedItem.category, removedItem.id, removedItem.quantity)

  // Remove from array
  orderItems.splice(index, 1)
  localStorage.setItem("orderItems", JSON.stringify(orderItems))

  showToast(`${removedItem.name} dihapus dari pesanan!`)

  // Update UI
  updateOrderSummary()
  updateCartCount()
  checkConfirmButton()

  // Update QR code if QRIS is selected
  if (paymentMethod === "QRIS") {
    const totalPrice = calculateTotalPrice()
    if (totalPrice > 0) {
      generateQRCodeForPayment()
    }
  }

  initializeMenu()
}

// Update payment display
function updatePaymentDisplay() {
  const paymentDisplay = document.getElementById("selected-payment")
  if (paymentDisplay) {
    paymentDisplay.textContent = paymentMethod || "Belum Memilih"
  }
}

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cart-count")
  const mobileCartCount = document.getElementById("mobile-cart-count")
  const mobileCartBtn = document.getElementById("mobile-cart-btn")

  const totalItems = orderItems.reduce((total, item) => total + item.quantity, 0)

  if (cartCount) cartCount.textContent = totalItems
  if (mobileCartCount) mobileCartCount.textContent = totalItems

  if (mobileCartBtn) {
    mobileCartBtn.style.display = totalItems > 0 ? "flex" : "none"
  }
}

// Check confirm button state
function checkConfirmButton() {
  const confirmBtn = document.getElementById("confirm-order")
  if (confirmBtn) {
    confirmBtn.disabled = !(orderItems.length > 0 && paymentMethod)
  }
}

// Apply discount
function applyDiscount() {
  const discountCodeInput = document.getElementById("discount-code")
  const discountMessage = document.getElementById("discount-message")

  if (!discountCodeInput || !discountMessage) return

  const code = discountCodeInput.value.trim().toUpperCase()

  if (code === "DISKON10") {
    const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
    discountAmount = Math.round(subtotal * 0.1)
    localStorage.setItem("discountAmount", discountAmount.toString())

    discountMessage.textContent = "Diskon 10% berhasil diterapkan!"
    discountMessage.style.color = "green"
    showToast("Kode promo berhasil diterapkan!")

    updateOrderSummary()

    if (paymentMethod === "QRIS") {
      generateQRCodeForPayment()
    }
  } else if (code === "DISKON20") {
    const subtotal = orderItems.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
    discountAmount = Math.round(subtotal * 0.2)
    localStorage.setItem("discountAmount", discountAmount.toString())

    discountMessage.textContent = "Diskon 20% berhasil diterapkan!"
    discountMessage.style.color = "green"
    showToast("Kode promo berhasil diterapkan!")

    updateOrderSummary()

    if (paymentMethod === "QRIS") {
      generateQRCodeForPayment()
    }
  } else {
    discountMessage.textContent = "Kode promo tidak valid."
    discountMessage.style.color = "red"
  }
}

// Confirm order
function confirmOrder() {
  if (orderItems.length === 0) {
    showToast("Silakan pilih menu terlebih dahulu!")
    return
  }

  if (!paymentMethod) {
    showToast("Silakan pilih metode pembayaran!")
    showTab(2) // Show payment tab
    return
  }

  if (paymentMethod === "QRIS") {
    // Show QR payment modal instead of redirecting
    showQRPaymentModal()
  } else {
    // For cash payments, proceed normally
    showModal("confirm-modal")
  }
}

// Show QR Payment Modal
function showQRPaymentModal() {
  const qrModal = document.getElementById("qr-payment-modal")
  if (!qrModal) return

  // Populate order summary in QR modal
  populateQROrderSummary()

  // Show modal
  qrModal.style.display = "block"

  // Generate QR code
  generateQRCodeForPayment()

  // Setup modal event listeners
  setupQRModalEventListeners()
}

// Populate QR order summary
function populateQROrderSummary() {
  const qrOrderItems = document.getElementById("qr-order-items")
  const qrSubtotal = document.getElementById("qr-subtotal")
  const qrDiscountRow = document.getElementById("qr-discount-row")
  const qrDiscountAmount = document.getElementById("qr-discount-amount")
  const qrFinalAmount = document.getElementById("qr-final-amount")

  if (!qrOrderItems) return

  // Clear previous items
  qrOrderItems.innerHTML = ""

  let subtotal = 0

  // Add each item
  orderItems.forEach((item) => {
    const price = Number.parseInt(item.price)
    const itemTotal = price * item.quantity
    subtotal += itemTotal

    const itemElement = document.createElement("div")
    itemElement.className = "qr-order-item"
    itemElement.innerHTML = `
      <div class="qr-item-details">
        <span class="qr-item-name">${item.name}</span>
        <span class="qr-item-quantity">x${item.quantity}</span>
      </div>
      <span class="qr-item-total">Rp ${formatPrice(itemTotal)}</span>
    `
    qrOrderItems.appendChild(itemElement)
  })

  // Update totals
  if (qrSubtotal) qrSubtotal.textContent = `Rp ${formatPrice(subtotal)}`

  if (discountAmount > 0 && qrDiscountRow && qrDiscountAmount) {
    qrDiscountRow.style.display = "flex"
    qrDiscountAmount.textContent = `-Rp ${formatPrice(discountAmount)}`
  } else if (qrDiscountRow) {
    qrDiscountRow.style.display = "none"
  }

  const finalTotal = subtotal - discountAmount
  if (qrFinalAmount) qrFinalAmount.textContent = `Rp ${formatPrice(finalTotal)}`
}

// Generate QR Code for payment
function generateQRCodeForPayment() {
  const qrContainer = document.getElementById("qr-code-container")
  const qrAmountElement = document.getElementById("qr-amount")

  if (!qrContainer || !qrAmountElement) return

  const totalPrice = calculateTotalPrice()

  // Show loading
  qrContainer.innerHTML = `
    <div class="qr-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Generating QR Code...</p>
    </div>
  `

  // Update amount display
  qrAmountElement.textContent = `Rp ${formatPrice(totalPrice)}`

  // Generate QR code data
  const qrData = {
    merchant: "Kantin Digital",
    amount: totalPrice,
    currency: "IDR",
    timestamp: new Date().toISOString(),
    orderId: `KD${Date.now()}`,
    items: orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  }

  const qrString = JSON.stringify(qrData)

  // Generate QR code
  setTimeout(() => {
    if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
      // Create a canvas element
      const canvas = document.createElement("canvas")

      window.QRCode.toCanvas(
        canvas,
        qrString,
        {
          width: 250,
          height: 250,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M",
          type: "image/png",
          quality: 0.92,
          rendererOpts: {
            quality: 0.92,
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error)
            generateFallbackQRForPayment(qrData)
          } else {
            qrContainer.innerHTML = ""
            canvas.style.borderRadius = "12px"
            canvas.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)"
            canvas.style.backgroundColor = "#FFFFFF"
            qrContainer.appendChild(canvas)
          }
        },
      )
    } else {
      generateFallbackQRForPayment(qrData)
    }

    startQRPaymentTimer()
  }, 500)
}

// Generate fallback QR for payment
function generateFallbackQRForPayment(data) {
  const qrContainer = document.getElementById("qr-code-container")
  if (!qrContainer) return

  qrContainer.innerHTML = `
    <div class="fallback-qr payment-qr">
      <div class="qr-pattern">
        <div class="qr-modules">
          <!-- Top-left finder pattern -->
          <div class="finder-pattern tl">
            <div class="finder-outer"></div>
            <div class="finder-inner"></div>
          </div>
          <!-- Top-right finder pattern -->
          <div class="finder-pattern tr">
            <div class="finder-outer"></div>
            <div class="finder-inner"></div>
          </div>
          <!-- Bottom-left finder pattern -->
          <div class="finder-pattern bl">
            <div class="finder-outer"></div>
            <div class="finder-inner"></div>
          </div>
          <!-- Data modules -->
          <div class="data-modules">
            <div class="module-row">
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
            </div>
            <div class="module-row">
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
            </div>
            <div class="module-row">
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
            </div>
            <div class="module-row">
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
              <span class="module light"></span>
              <span class="module light"></span>
              <span class="module dark"></span>
            </div>
          </div>
        </div>
      </div>
      <p style="margin-top: 15px; font-size: 14px; color: #666; font-weight: 600;">
        Order ID: ${data.orderId}
      </p>
      <p style="font-size: 12px; color: #999;">
        Total: Rp ${formatPrice(data.amount)}
      </p>
    </div>
  `
}

// Start QR payment timer
function startQRPaymentTimer() {
  const timerElement = document.getElementById("qr-timer")
  if (!timerElement) return

  let qrTimeLeft = 300 // 5 minutes

  // Clear existing timer
  if (qrTimer) {
    clearInterval(qrTimer)
  }

  // Reset timer display
  timerElement.textContent = "5:00"
  timerElement.style.color = "var(--primary-color)"

  qrTimer = setInterval(() => {
    qrTimeLeft--

    const minutes = Math.floor(qrTimeLeft / 60)
    const seconds = qrTimeLeft % 60

    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

    if (qrTimeLeft <= 60) {
      timerElement.style.color = "var(--warning-color)"
    }

    if (qrTimeLeft <= 0) {
      clearInterval(qrTimer)
      timerElement.textContent = "Expired"
      timerElement.style.color = "var(--danger-color)"

      // Show refresh message
      const qrContainer = document.getElementById("qr-code-container")
      if (qrContainer) {
        qrContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--danger-color);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h4>QR Code Expired</h4>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Silakan refresh untuk mendapatkan QR code baru</p>
          </div>
        `
      }
    }
  }, 1000)
}

// Setup QR modal event listeners
function setupQRModalEventListeners() {
  const closeQRBtn = document.getElementById("close-qr-payment")
  const refreshQRBtn = document.getElementById("refresh-qr")
  const paymentSuccessBtn = document.getElementById("payment-success")

  if (closeQRBtn) {
    closeQRBtn.onclick = () => {
      hideModal("qr-payment-modal")
      if (qrTimer) {
        clearInterval(qrTimer)
        qrTimer = null
      }
    }
  }

  if (refreshQRBtn) {
    refreshQRBtn.onclick = () => {
      generateQRCodeForPayment()
      showToast("QR Code berhasil di-refresh!")
    }
  }

  if (paymentSuccessBtn) {
    paymentSuccessBtn.onclick = () => {
      processOrder()
      hideModal("qr-payment-modal")
      if (qrTimer) {
        clearInterval(qrTimer)
        qrTimer = null
      }
    }
  }
}

// Process order (for both QRIS and CASH)
function processOrder() {
  // Save order to history
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")
  const newOrder = {
    items: [...orderItems],
    paymentMethod: paymentMethod,
    discountAmount: discountAmount,
    timestamp: new Date().toISOString(),
    orderId: `KD${Date.now()}`,
  }
  orderHistory.push(newOrder)
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory))

  // Save order time
  localStorage.setItem("orderTime", new Date().toISOString())

  // Show success message
  showToast("Pesanan berhasil dikonfirmasi!")

  // Redirect to confirmation page
  setTimeout(() => {
    window.location.href = "confirmation.html"
  }, 1000)
}

// Clear cart
function clearCart() {
  // Restore stock for items in cart
  orderItems.forEach((item) => {
    updateStock(item.category, item.id, item.quantity)
  })

  orderItems = []
  localStorage.setItem("orderItems", JSON.stringify(orderItems))

  discountAmount = 0
  localStorage.setItem("discountAmount", "0")

  updateOrderSummary()
  updateCartCount()
  checkConfirmButton()
  initializeMenu()
  ;("0")

  updateOrderSummary()
  updateCartCount()
  checkConfirmButton()
  initializeMenu()

  hideModal("clear-cart-modal")
  showToast("Keranjang berhasil dikosongkan!")
}

// Show history modal
function showHistoryModal() {
  const historyModal = document.getElementById("history-modal")
  const historyList = document.getElementById("history-list")

  if (!historyModal || !historyList) return

  // Get order history from localStorage
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

  // Clear previous content
  historyList.innerHTML = ""

  if (orderHistory.length === 0) {
    historyList.innerHTML = '<p class="text-center">Belum ada riwayat pesanan.</p>'
  } else {
    // Display order history
    orderHistory.forEach((order, index) => {
      const orderDate = new Date(order.timestamp).toLocaleString("id-ID")
      const subtotal = order.items.reduce((sum, item) => sum + Number.parseInt(item.price) * item.quantity, 0)
      const totalPrice = subtotal - (order.discountAmount || 0)

      const orderElement = document.createElement("div")
      orderElement.className = "history-item"

      let itemsHtml = ""
      order.items.forEach((item) => {
        itemsHtml += `
                    <div class="history-item-detail">
                        <span>${item.name} x${item.quantity}</span>
                        <span>Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</span>
                    </div>
                `
      })

      orderElement.innerHTML = `
                <div class="history-item-header">
                    <h4>Pesanan #${orderHistory.length - index}</h4>
                    <span>${orderDate}</span>
                </div>
                <div class="history-item-content">
                    ${itemsHtml}
                </div>
                <div class="history-item-footer">
                    <span>Total: Rp ${formatPrice(totalPrice)}</span>
                    <span>Pembayaran: ${order.paymentMethod}</span>
                </div>
                <button class="btn btn-sm btn-outline reorder-btn" data-index="${index}">
                    <i class="fas fa-redo"></i> Pesan Lagi
                </button>
            `

      historyList.appendChild(orderElement)
    })

    // Add reorder button event listeners
    const reorderButtons = document.querySelectorAll(".reorder-btn")
    reorderButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = Number.parseInt(this.dataset.index)
        reorderFromHistory(index, orderHistory)
      })
    })
  }

  showModal("history-modal")
}

// Reorder from history
function reorderFromHistory(index, orderHistory) {
  const order = orderHistory[index]

  // Check stock availability
  let canReorder = true
  const unavailableItems = []

  for (const item of order.items) {
    const currentStock =
      menuStock[item.category] && menuStock[item.category][item.id] ? menuStock[item.category][item.id].stock : 0

    if (currentStock < item.quantity) {
      canReorder = false
      unavailableItems.push(`${item.name} (tersisa ${currentStock})`)
    }
  }

  if (!canReorder) {
    showToast(`Tidak dapat memesan ulang. Stok tidak mencukupi: ${unavailableItems.join(", ")}`)
    return
  }

  // Set current order to this past order
  localStorage.setItem("orderItems", JSON.stringify(order.items))
  localStorage.setItem("paymentMethod", order.paymentMethod)

  // Update stock
  order.items.forEach((item) => {
    updateStock(item.category, item.id, -item.quantity)
  })

  // Reload data and update UI
  loadAppData()
  updateOrderSummary()
  updateCartCount()
  checkConfirmButton()
  initializeMenu()

  showToast("Pesanan ditambahkan ke keranjang!")
  hideModal("history-modal")
}

// Filter menu items
function filterMenuItems(searchTerm) {
  const foodItems = document.querySelectorAll("#food-items .menu-item")
  const drinkItems = document.querySelectorAll("#drink-items .menu-item")
  ;[...foodItems, ...drinkItems].forEach((item) => {
    const name = item.dataset.name.toLowerCase()
    if (name.includes(searchTerm)) {
      item.style.display = "grid"
    } else {
      item.style.display = "none"
    }
  })
}

// Show all menu items
function showAllMenuItems() {
  const allItems = document.querySelectorAll(".menu-item")
  allItems.forEach((item) => {
    item.style.display = "grid"
  })
}

// Add item from URL parameters
function addItemFromURL(itemId, category) {
  const menuItems = document.querySelectorAll(".menu-item")
  for (const item of menuItems) {
    if (item.dataset.id === itemId && item.dataset.category === category) {
      const quantityInput = item.querySelector(".quantity-input")
      quantityInput.value = 1
      const addButton = item.querySelector(".add-item-btn")
      addButton.click()
      break
    }
  }
}

// Modal management functions
function showModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
  }
}

// Utility functions
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function showToast(message) {
  const toast = document.getElementById("toast")
  if (toast) {
    toast.textContent = message
    toast.classList.add("show")
    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }
}

// Refresh menu when page gains focus
window.addEventListener("focus", () => {
  loadAppData()
  initializeMenu()
})

// Make functions globally available for HTML onclick handlers
window.showTab = showTab
window.refreshQRCode = generateQRCodeForPayment
window.showToast = showToast
window.formatPrice = formatPrice

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeApp,
    showTab,
    generateQRCodeForPayment,
    refreshQRCode: generateQRCodeForPayment,
    showToast,
    formatPrice,
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Global functions for HTML onclick handlers
function selectPayment(method) {
  // This function is called from HTML onclick
  console.log("Payment method selected:", method)

  // Get stored payment method
  const storedPayment = localStorage.getItem("paymentMethod") || ""

  if (storedPayment === method) {
    // If clicking the same method, unselect it
    document.getElementById(method.toLowerCase()).checked = false
    localStorage.removeItem("paymentMethod")

    // Update payment display
    document.getElementById("selected-payment").textContent = "Belum Memilih"

    // Check confirm button state
    const orderItems = JSON.parse(localStorage.getItem("orderItems") || "[]")
    document.getElementById("confirm-order").disabled = !(orderItems.length > 0)

    showToast("Metode pembayaran dibatalkan")
  } else {
    // Select the new payment method
    localStorage.setItem("paymentMethod", method)

    // Update payment display
    document.getElementById("selected-payment").textContent = method

    // Check confirm button state
    const orderItems = JSON.parse(localStorage.getItem("orderItems") || "[]")
    document.getElementById("confirm-order").disabled = !(orderItems.length > 0)

    showToast(`Metode pembayaran diubah ke ${method}`)
  }
}

let qrTimerInterval

function startQRTimer() {
  const timerElement = document.getElementById("qr-timer")
  let qrTimeLeft = 300 // 5 minutes in seconds

  // Clear existing timer
  if (qrTimerInterval) {
    clearInterval(qrTimerInterval)
  }

  // Reset timer display
  timerElement.textContent = "5:00"
  timerElement.style.color = "var(--primary-color)"

  qrTimerInterval = setInterval(() => {
    qrTimeLeft--

    const minutes = Math.floor(qrTimeLeft / 60)
    const seconds = qrTimeLeft % 60

    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

    if (qrTimeLeft <= 0) {
      clearInterval(qrTimerInterval)
      timerElement.textContent = "Expired"
    }
  }, 1000)
}
