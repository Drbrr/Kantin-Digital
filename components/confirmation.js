// Confirmation page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Load and display order confirmation
  loadOrderConfirmation()

  // Setup event listeners
  setupEventListeners()

  // Setup modals
  setupModals()

  // Clear order data after displaying
  setTimeout(() => {
    clearOrderData()
  }, 1000)
})

// Load order confirmation data
function loadOrderConfirmation() {
  try {
    // Get order data from localStorage
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")
    const lastOrder = orderHistory[orderHistory.length - 1]

    if (!lastOrder) {
      // No order found, redirect to home
      showToast("Tidak ada data pesanan ditemukan")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
      return
    }

    // Display order details
    displayOrderDetails(lastOrder)

    // Show QRIS success animation if payment method is QRIS
    if (lastOrder.paymentMethod === "QRIS") {
      showQRISSuccessAnimation()
    }
  } catch (error) {
    console.error("Error loading order confirmation:", error)
    showToast("Terjadi kesalahan saat memuat konfirmasi pesanan")
  }
}

// Display order details
function displayOrderDetails(order) {
  // Display order ID
  const orderIdDisplay = document.getElementById("order-id-display")
  if (orderIdDisplay && order.orderId) {
    orderIdDisplay.textContent = order.orderId
  }

  // Display order items
  const confirmationItems = document.getElementById("confirmation-items")
  if (confirmationItems) {
    confirmationItems.innerHTML = ""

    order.items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "confirmation-item"
      itemElement.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
                <span class="item-price">Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</span>
            `
      confirmationItems.appendChild(itemElement)
    })
  }

  // Calculate and display totals
  const subtotal = order.items.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
  const discountAmount = order.discountAmount || 0
  const total = subtotal - discountAmount

  // Update summary
  updateElement("confirmation-subtotal", `Rp ${formatPrice(subtotal)}`)
  updateElement("confirmation-total", `Rp ${formatPrice(total)}`)

  // Show discount if applicable
  if (discountAmount > 0) {
    const discountRow = document.getElementById("confirmation-discount-row")
    const discountElement = document.getElementById("confirmation-discount")
    if (discountRow && discountElement) {
      discountRow.style.display = "flex"
      discountElement.textContent = `-Rp ${formatPrice(discountAmount)}`
    }
  }

  // Display payment method with badge styling
  const paymentMethodElement = document.getElementById("confirmation-payment-method")
  if (paymentMethodElement) {
    paymentMethodElement.textContent = order.paymentMethod
    paymentMethodElement.className = `payment-method-badge ${order.paymentMethod.toLowerCase()}`
  }

  // Display order time
  const orderTime = new Date(order.timestamp)
  updateElement(
    "confirmation-time",
    orderTime.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  )

  // Store order data for printing
  window.currentOrder = order
}

// Show QRIS success animation
function showQRISSuccessAnimation() {
  const qrisInfo = document.getElementById("qris-payment-info").style.display = "none";
  if (qrisInfo) {
    qrisInfo.style.display = "block"

    // Trigger animation
    setTimeout(() => {
      qrisInfo.classList.add("animate-in")
    }, 500)
  }
}

// Setup event listeners
function setupEventListeners() {
  // Print receipt button
  const printBtn = document.getElementById("print-receipt")
  if (printBtn) {
    printBtn.addEventListener("click", printReceipt)
  }

  // Order again button
  const orderAgainBtn = document.getElementById("order-again")
  if (orderAgainBtn) {
    orderAgainBtn.addEventListener("click", orderAgain)
  }

  // Show history button
  const showHistoryBtn = document.getElementById("show-history")
  if (showHistoryBtn) {
    showHistoryBtn.addEventListener("click", showOrderHistory)
  }
}

// Setup modals
function setupModals() {
  // About modal
  const aboutLink = document.getElementById("about-link")
  const aboutModal = document.getElementById("about-modal")
  const closeAboutBtn = document.getElementById("close-about")

  if (aboutLink && aboutModal && closeAboutBtn) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault()
      aboutModal.style.display = "block"
    })

    closeAboutBtn.addEventListener("click", () => {
      aboutModal.style.display = "none"
    })
  }

  // History modal
  const historyModal = document.getElementById("history-modal")
  const closeHistoryBtn = document.getElementById("close-history")

  if (closeHistoryBtn && historyModal) {
    closeHistoryBtn.addEventListener("click", () => {
      historyModal.style.display = "none"
    })
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })
}

// Print receipt function
function printReceipt() {
  if (!window.currentOrder) {
    showToast("Data pesanan tidak tersedia untuk dicetak")
    return
  }

  const order = window.currentOrder

  // Populate print template
  populatePrintTemplate(order)

  // Create print window
  const printWindow = window.open("", "_blank")
  const printContent = document.getElementById("print-template").innerHTML

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Pesanan - Kantin Digital</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    padding: 20px;
                    background: white;
                }
                .print-receipt {
                    max-width: 300px;
                    margin: 0 auto;
                    background: white;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .print-header h1 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                .print-subtitle {
                    font-size: 10px;
                    margin: 5px 0;
                }
                .print-date, .print-order-id {
                    font-size: 12px;
                    margin: 2px 0;
                }
                h2 {
                    text-align: center;
                    font-size: 14px;
                    margin: 15px 0;
                }
                hr {
                    border: none;
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                .print-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    font-size: 12px;
                }
                .print-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                    font-size: 12px;
                }
                .print-total {
                    font-weight: bold;
                    font-size: 14px;
                    border-top: 1px solid #000;
                    padding-top: 5px;
                    margin-top: 5px;
                }
                .print-payment {
                    margin: 10px 0;
                    font-size: 12px;
                }
                .print-footer {
                    text-align: center;
                    margin-top: 15px;
                }
                .print-thank-you {
                    font-weight: bold;
                    font-size: 12px;
                    margin: 10px 0;
                }
                .print-contact, .print-time {
                    font-size: 10px;
                    margin: 5px 0;
                }
                @media print {
                    body { margin: 0; padding: 10px; }
                    .print-receipt { max-width: none; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `)

  printWindow.document.close()

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)

  showToast("Struk sedang dicetak...")
}

// Populate print template
function populatePrintTemplate(order) {
  // Set current date and time
  const now = new Date()
  updateElement("print-date", now.toLocaleString("id-ID"))
  updateElement("print-current-time", now.toLocaleString("id-ID"))

  // Set order ID
  if (order.orderId) {
    updateElement("print-order-id", order.orderId)
  }

  // Populate items
  const printItems = document.getElementById("print-items")
  if (printItems) {
    printItems.innerHTML = ""

    order.items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "print-item"
      itemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>Rp ${formatPrice(Number.parseInt(item.price) * item.quantity)}</span>
            `
      printItems.appendChild(itemElement)
    })
  }

  // Calculate totals
  const subtotal = order.items.reduce((total, item) => total + Number.parseInt(item.price) * item.quantity, 0)
  const discountAmount = order.discountAmount || 0
  const total = subtotal - discountAmount

  // Update print summary
  updateElement("print-subtotal", `Rp ${formatPrice(subtotal)}`)
  updateElement("print-total", `Rp ${formatPrice(total)}`)
  updateElement("print-payment-method", order.paymentMethod)

  // Show discount in print if applicable
  if (discountAmount > 0) {
    const printDiscountRow = document.getElementById("print-discount-row")
    if (printDiscountRow) {
      printDiscountRow.style.display = "flex"
      updateElement("print-discount", `-Rp ${formatPrice(discountAmount)}`)
    }
  }
}

// Order again function
function orderAgain() {
  if (!window.currentOrder) {
    showToast("Data pesanan tidak tersedia")
    return
  }

  // Store current order items for reordering
  const orderItems = window.currentOrder.items
  localStorage.setItem("reorderItems", JSON.stringify(orderItems))

  showToast("Mengarahkan ke halaman pemesanan...")

  // Redirect to order page with reorder flag
  setTimeout(() => {
    window.location.href = "order.html?reorder=true"
  }, 1000)
}

// Show order history
function showOrderHistory() {
  const historyModal = document.getElementById("history-modal")
  const historyList = document.getElementById("history-list")

  if (!historyModal || !historyList) return

  // Get order history
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]")

  // Clear previous content
  historyList.innerHTML = ""

  if (orderHistory.length === 0) {
    historyList.innerHTML = '<p class="text-center">Belum ada riwayat pesanan.</p>'
  } else {
    // Display order history (reverse order to show latest first)
    orderHistory.reverse().forEach((order, index) => {
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
                ${order.orderId ? `<div class="order-id-small">Order ID: ${order.orderId}</div>` : ""}
            `

      historyList.appendChild(orderElement)
    })
  }

  historyModal.style.display = "block"
}

// Clear order data after confirmation
function clearOrderData() {
  // Clear temporary order data but keep history
  localStorage.removeItem("orderItems")
  localStorage.removeItem("paymentMethod")
  localStorage.removeItem("discountAmount")
  localStorage.removeItem("orderTime")
}

// Utility functions
function updateElement(id, content) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = content
  }
}

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

// Handle reorder functionality from URL parameters
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("reorder") === "true") {
    const reorderItems = JSON.parse(localStorage.getItem("reorderItems") || "[]")
    if (reorderItems.length > 0) {
      localStorage.setItem("orderItems", JSON.stringify(reorderItems))
      localStorage.removeItem("reorderItems")
    }
  }
})
