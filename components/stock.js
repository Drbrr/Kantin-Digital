// Stock management system for Kantin Digital

// Import or declare showToast and orderItems variables
const showToast = (message, duration = 3000) => {
  alert(message)
}

const orderItems = []

// Initial stock data
const initialStock = {
  food: {
    1: { name: "Nasi Goreng", stock: 20, initialStock: 20 },
    2: { name: "Mie Goreng", stock: 15, initialStock: 15 },
    3: { name: "Ayam Geprek", stock: 10, initialStock: 10 },
    4: { name: "Sate Ayam", stock: 8, initialStock: 8 },
    5: { name: "Sate Sapi", stock: 5, initialStock: 5 },
  },
  drink: {
    1: { name: "Es Teh", stock: 25, initialStock: 25 },
    2: { name: "Es Jeruk", stock: 20, initialStock: 20 },
    3: { name: "Susu Coklat", stock: 12, initialStock: 12 },
    4: { name: "Susu Vanilla", stock: 12, initialStock: 12 },
    5: { name: "Air Mineral", stock: 30, initialStock: 30 },
  },
}

// Initialize stock in localStorage if not exists
function initializeStock() {
  if (!localStorage.getItem("menuStock")) {
    localStorage.setItem("menuStock", JSON.stringify(initialStock))
  }
}

// Get current stock from localStorage
function getStock() {
  return JSON.parse(localStorage.getItem("menuStock") || "{}")
}

// Update stock display for all menu items
function updateStockDisplay() {
  const stock = getStock()
  const menuItems = document.querySelectorAll(".menu-item")

  menuItems.forEach((item) => {
    const id = item.dataset.id
    const category = item.dataset.category
    const stockInfo = stock[category]?.[id]

    if (stockInfo) {
      // Remove any existing stock indicator
      const existingIndicator = item.querySelector(".stock-indicator")
      if (existingIndicator) {
        existingIndicator.remove()
      }

      // Create stock indicator
      const stockIndicator = document.createElement("div")
      stockIndicator.className = "stock-indicator"

      // Set stock status and appearance
      if (stockInfo.stock <= 0) {
        stockIndicator.classList.add("out-of-stock")
        stockIndicator.innerHTML = `<i class="fas fa-times-circle"></i> Habis`

        // Disable add button
        const addButton = item.querySelector(".add-item-btn")
        if (addButton) {
          addButton.disabled = true
          addButton.classList.add("disabled")
        }
      } else if (stockInfo.stock <= 3) {
        stockIndicator.classList.add("low-stock")
        stockIndicator.innerHTML = `<i class="fas fa-exclamation-circle"></i> Stok: ${stockInfo.stock}`
      } else {
        stockIndicator.classList.add("in-stock")
        stockIndicator.innerHTML = `<i class="fas fa-check-circle"></i> Stok: ${stockInfo.stock}`
      }

      // Add stock indicator to menu item
      const menuItemDetails = item.querySelector(".menu-item-details")
      menuItemDetails.appendChild(stockIndicator)
    }
  })
}

// Check if item is in stock and return available quantity
function checkStock(id, category, requestedQuantity) {
  const stock = getStock()
  const itemStock = stock[category]?.[id]?.stock || 0

  if (itemStock <= 0) {
    return 0 // Out of stock
  }

  // Return available quantity (either requested amount or max available)
  return Math.min(requestedQuantity, itemStock)
}

// Update stock when items are added to cart
function updateStockForCart(id, category, quantity) {
  const stock = getStock()

  if (stock[category] && stock[category][id]) {
    stock[category][id].stock -= quantity

    // Ensure stock doesn't go below 0
    if (stock[category][id].stock < 0) {
      stock[category][id].stock = 0
    }

    localStorage.setItem("menuStock", JSON.stringify(stock))
    updateStockDisplay()
    return true
  }

  return false
}

// Return items to stock when removed from cart
function returnItemsToStock(id, category, quantity) {
  const stock = getStock()

  if (stock[category] && stock[category][id]) {
    const initialStock = stock[category][id].initialStock || 0
    stock[category][id].stock += quantity

    // Ensure stock doesn't exceed initial stock
    if (stock[category][id].stock > initialStock) {
      stock[category][id].stock = initialStock
    }

    localStorage.setItem("menuStock", JSON.stringify(stock))
    updateStockDisplay()
    return true
  }

  return false
}

// Reset all stock to initial values
function resetStock() {
  const stock = getStock()

  // Reset each item to its initial stock
  for (const category in stock) {
    for (const id in stock[category]) {
      stock[category][id].stock = stock[category][id].initialStock
    }
  }

  localStorage.setItem("menuStock", JSON.stringify(stock))
  updateStockDisplay()
  showToast("Stok berhasil direset!")
}

// Initialize stock when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeStock()
  updateStockDisplay()

  // Override the original addToCart function to check stock
  window.originalAddToCart = window.addToCart
  window.addToCart = (button) => {
    const menuItem = button.closest(".menu-item")
    const id = menuItem.dataset.id
    const name = menuItem.dataset.name
    const category = menuItem.dataset.category
    const quantityInput = menuItem.querySelector(".quantity-input")
    const requestedQuantity = Number.parseInt(quantityInput.value)

    // Check available stock
    const availableQuantity = checkStock(id, category, requestedQuantity)

    if (availableQuantity <= 0) {
      showToast(`${name} habis stok!`, 2000)
      return
    }

    if (availableQuantity < requestedQuantity) {
      showToast(`Hanya tersedia ${availableQuantity} ${name}`, 2000)
      quantityInput.value = availableQuantity
    }

    // Update stock
    updateStockForCart(id, category, availableQuantity)

    // Call original function with adjusted quantity
    const originalQuantity = quantityInput.value
    quantityInput.value = availableQuantity
    window.originalAddToCart(button)
    quantityInput.value = originalQuantity
  }

  // Override removeItem to return stock
  window.originalRemoveItem = window.removeItem
  window.removeItem = (index) => {
    const removedItem = orderItems[index]

    // Return items to stock
    returnItemsToStock(removedItem.id, removedItem.category, removedItem.quantity)

    // Call original function
    window.originalRemoveItem(index)
  }

  // Override clearCart to return all items to stock
  window.originalClearCart = window.clearCart
  window.clearCart = () => {
    // Return all items to stock
    orderItems.forEach((item) => {
      returnItemsToStock(item.id, item.category, item.quantity)
    })

    // Call original function
    window.originalClearCart()
  }
})
