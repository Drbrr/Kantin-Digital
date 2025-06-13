let uploadedImageDataUrl = null
class AdminDashboard {
  constructor() {
    this.products = this.loadProducts()
    this.stock = this.loadStock()
    this.orders = this.loadOrders()
    this.currentEditingProduct = null
    this.currentEditingStock = null

    this.init()
  }

  init() {
    // Check authentication
    if (!this.checkAuth()) {
      window.location.href = "admin-login.html"
      return
    }

    // Initialize dashboard
    this.updateDashboardStats()
    this.loadStockTable()
    this.loadProductsTable()
    this.loadReportsTable()
    this.setupEventListeners()
    this.syncWithMenuStock()
  }

  checkAuth() {
    return sessionStorage.getItem("adminAuthenticated") === "true"
  }

  loadProducts() {
    const defaultProducts = {
      food: {
        1: {
          id: 1,
          name: "Nasi Goreng",
          price: 15000,
          description: "Nasi goreng spesial dengan telur dan ayam",
          image: "food-1",
          active: true,
          created: new Date().toISOString(),
        },
        2: {
          id: 2,
          name: "Mie Goreng",
          price: 12000,
          description: "Mie goreng dengan telur dan sayuran",
          image: "food-2",
          active: true,
          created: new Date().toISOString(),
        },
        3: {
          id: 3,
          name: "Ayam Geprek",
          price: 10000,
          description: "Ayam geprek pedas dengan sambal spesial",
          image: "food-3",
          active: true,
          created: new Date().toISOString(),
        },
        4: {
          id: 4,
          name: "Sate Ayam",
          price: 20000,
          description: "Sate ayam dengan bumbu kacang",
          image: "food-4",
          active: true,
          created: new Date().toISOString(),
        },
        5: {
          id: 5,
          name: "Sate Sapi",
          price: 22000,
          description: "Sate sapi dengan bumbu kacang spesial",
          image: "food-5",
          active: true,
          created: new Date().toISOString(),
        },
      },
      drink: {
        1: {
          id: 1,
          name: "Es Teh",
          price: 5000,
          description: "Es teh manis segar",
          image: "drink-1",
          active: true,
          created: new Date().toISOString(),
        },
        2: {
          id: 2,
          name: "Es Jeruk",
          price: 6000,
          description: "Es jeruk segar dengan jeruk pilihan",
          image: "drink-2",
          active: true,
          created: new Date().toISOString(),
        },
        3: {
          id: 3,
          name: "Susu Coklat",
          price: 8000,
          description: "Susu coklat dingin",
          image: "drink-3",
          active: true,
          created: new Date().toISOString(),
        },
        4: {
          id: 4,
          name: "Susu Vanilla",
          price: 8000,
          description: "Susu vanilla dingin",
          image: "drink-4",
          active: true,
          created: new Date().toISOString(),
        },
        5: {
          id: 5,
          name: "Air Mineral",
          price: 4000,
          description: "Air mineral segar",
          image: "drink-5",
          active: true,
          created: new Date().toISOString(),
        },
      },
    }

    const stored = localStorage.getItem("adminProducts")
    return stored ? JSON.parse(stored) : defaultProducts
  }

  loadStock() {
    const defaultStock = {
      food: {
        1: { stock: 20, minStock: 5 },
        2: { stock: 15, minStock: 5 },
        3: { stock: 10, minStock: 3 },
        4: { stock: 8, minStock: 3 },
        5: { stock: 5, minStock: 2 },
      },
      drink: {
        1: { stock: 25, minStock: 10 },
        2: { stock: 20, minStock: 8 },
        3: { stock: 12, minStock: 5 },
        4: { stock: 12, minStock: 5 },
        5: { stock: 30, minStock: 15 },
      },
    }

    const stored = localStorage.getItem("adminStock")
    return stored ? JSON.parse(stored) : defaultStock
  }

  loadOrders() {
    return JSON.parse(localStorage.getItem("orderHistory") || "[]")
  }

  saveProducts() {
    localStorage.setItem("adminProducts", JSON.stringify(this.products))
    this.updateMenuStock()
  }

  saveStock() {
    localStorage.setItem("adminStock", JSON.stringify(this.stock))
    this.updateMenuStock()
  }

  updateMenuStock() {
    // Update the menuStock format for compatibility with existing order system
    const menuStock = { food: {}, drink: {} }

    for (const category in this.products) {
      for (const id in this.products[category]) {
        const product = this.products[category][id]
        const stockInfo = this.stock[category][id] || { stock: 0, minStock: 0 }

        menuStock[category][id] = {
          name: product.name,
          stock: stockInfo.stock,
          initialStock: stockInfo.stock,
          image: product.image,
        }
      }
    }

    localStorage.setItem("menuStock", JSON.stringify(menuStock))
  }

  syncWithMenuStock() {
    // Sync admin stock with menu stock (in case orders were placed)
    const menuStock = JSON.parse(localStorage.getItem("menuStock") || "{}")

    for (const category in menuStock) {
      for (const id in menuStock[category]) {
        if (this.stock[category] && this.stock[category][id]) {
          this.stock[category][id].stock = menuStock[category][id].stock
        }
      }
    }

    this.saveStock()
  }

  updateDashboardStats() {
    let totalStock = 0
    let totalProducts = 0
    let lowStockCount = 0

    for (const category in this.stock) {
      for (const id in this.stock[category]) {
        const stockInfo = this.stock[category][id]
        totalStock += stockInfo.stock

        if (this.products[category][id]?.active) {
          totalProducts++
        }

        if (stockInfo.stock <= stockInfo.minStock) {
          lowStockCount++
        }
      }
    }

    const totalSales = this.orders.length
    const totalRevenue = this.orders.reduce((sum, order) => {
      const orderTotal =
        order.items.reduce((itemSum, item) => itemSum + Number.parseInt(item.price) * item.quantity, 0) -
        (order.discountAmount || 0)
      return sum + orderTotal
    }, 0)

    document.getElementById("totalStock").textContent = totalStock
    document.getElementById("totalProducts").textContent = totalProducts
    document.getElementById("totalSales").textContent = totalSales
    document.getElementById("totalRevenue").textContent = `Rp ${this.formatPrice(totalRevenue)}`
    document.getElementById("lowStockCount").textContent = lowStockCount

    // Today's stats
    const today = new Date().toDateString()
    const todayOrders = this.orders.filter((order) => new Date(order.timestamp).toDateString() === today)

    const todayRevenue = todayOrders.reduce((sum, order) => {
      const orderTotal =
        order.items.reduce((itemSum, item) => itemSum + Number.parseInt(item.price) * item.quantity, 0) -
        (order.discountAmount || 0)
      return sum + orderTotal
    }, 0)

    document.getElementById("todaySales").textContent = todayOrders.length
    document.getElementById("todayRevenue").textContent = `Rp ${this.formatPrice(todayRevenue)}`

    // Top product
    const productSales = {}
    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.category}-${item.id}`
        productSales[key] = (productSales[key] || 0) + item.quantity
      })
    })

    const topProductKey = Object.keys(productSales).reduce(
      (a, b) => (productSales[a] > productSales[b] ? a : b),
      Object.keys(productSales)[0],
    )

    if (topProductKey) {
      const [category, id] = topProductKey.split("-")
      const topProductName = this.products[category]?.[id]?.name || "-"
      document.getElementById("topProduct").textContent = topProductName
    }
  }

  loadStockTable() {
    const tbody = document.getElementById("stockTableBody")
    tbody.innerHTML = ""

    for (const category in this.products) {
      for (const id in this.products[category]) {
        const product = this.products[category][id]
        const stockInfo = this.stock[category][id] || { stock: 0, minStock: 0 }

        if (!product.active) continue

        const row = document.createElement("tr")
        const status = this.getStockStatus(stockInfo.stock, stockInfo.minStock)

        row.innerHTML = `
                    <td>
                    ${
                      product.image.startsWith("data:")
                        ? `<img src="${product.image}" class="menu-item-image" style="width: 60px; height: 60px; border-radius: 8px;" />`
                        : `<div class="menu-item-image ${product.image}" style="width: 60px; height: 60px; border-radius: 8px;"></div>`
                    }
                    </td>
                    <td><strong>${product.name}</strong></td>
                    <td><span class="status-badge ${category === "food" ? "status-active" : "status-low"}">${category === "food" ? "Makanan" : "Minuman"}</span></td>
                    <td>
                        <input type="number" value="${stockInfo.stock}" min="0" 
                               onchange="adminDashboard.updateStockValue('${category}', '${id}', this.value)"
                               style="width: 80px; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 4px;">
                    </td>
                    <td>
                        <input type="number" value="${stockInfo.minStock}" min="0" 
                               onchange="adminDashboard.updateMinStockValue('${category}', '${id}', this.value)"
                               style="width: 80px; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 4px;">
                    </td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="adminDashboard.showStockModal('${category}', '${id}')" title="Resupply">
                            <i class="fas fa-plus"></i>
                        </button>
                    </td>
                `

        tbody.appendChild(row)
      }
    }
  }

  loadProductsTable() {
    const tbody = document.getElementById("productsTableBody")
    tbody.innerHTML = ""

    for (const category in this.products) {
      for (const id in this.products[category]) {
        const product = this.products[category][id]

        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>
                    ${
                      product.image.startsWith("data:")
                        ? `<img src="${product.image}" class="menu-item-image" style="width: 60px; height: 60px; border-radius: 8px;" />`
                        : `<div class="menu-item-image ${product.image}" style="width: 60px; height: 60px; border-radius: 8px;"></div>`
                    }
                    </td>
                    <td><strong>${product.name}</strong></td>
                    <td><span class="status-badge ${category === "food" ? "status-active" : "status-low"}">${category === "food" ? "Makanan" : "Minuman"}</span></td>
                    <td>Rp ${this.formatPrice(product.price)}</td>
                    <td><span class="status-badge ${product.active ? "status-active" : "status-inactive"}">${product.active ? "Aktif" : "Nonaktif"}</span></td>
                    <td>${new Date(product.created).toLocaleDateString("id-ID")}</td>
                    <td>
                        <button class="action-btn edit" onclick="adminDashboard.editProduct('${category}', '${id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ${product.active ? "delete" : "view"}" 
                                onclick="adminDashboard.toggleProductStatus('${category}', '${id}')" 
                                title="${product.active ? "Nonaktifkan" : "Aktifkan"}">
                            <i class="fas fa-${product.active ? "eye-slash" : "eye"}"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminDashboard.deleteProduct('${category}', '${id}')" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `

        tbody.appendChild(row)
      }
    }
  }

  loadReportsTable() {
    const tbody = document.getElementById("reportsTableBody")
    tbody.innerHTML = ""

    if (this.orders.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">Belum ada data penjualan</td></tr>'
      return
    }

    // Show latest 20 orders
    const recentOrders = this.orders.slice(-20).reverse()

    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        const row = document.createElement("tr")
        const orderDate = new Date(order.timestamp).toLocaleString("id-ID")
        const itemTotal = Number.parseInt(item.price) * item.quantity

        row.innerHTML = `
                    <td>${orderDate}</td>
                    <td>${item.name} <small>(${item.quantity}x)</small></td>
                    <td>${item.quantity}</td>
                    <td>Rp ${this.formatPrice(itemTotal)}</td>
                    <td><span class="status-badge status-active">${order.paymentMethod}</span></td>
                `

        tbody.appendChild(row)
      })
    })
  }

  getStockStatus(stock, minStock) {
    if (stock <= 0) {
      return { class: "status-inactive", text: "Habis" }
    } else if (stock <= minStock) {
      return { class: "status-low", text: "Menipis" }
    } else {
      return { class: "status-active", text: "Tersedia" }
    }
  }

  updateStockValue(category, id, value) {
    if (!this.stock[category]) this.stock[category] = {}
    if (!this.stock[category][id]) this.stock[category][id] = { stock: 0, minStock: 0 }

    this.stock[category][id].stock = Number.parseInt(value) || 0
    this.saveStock()
    this.updateDashboardStats()
    this.loadStockTable()
  }

  updateMinStockValue(category, id, value) {
    if (!this.stock[category]) this.stock[category] = {}
    if (!this.stock[category][id]) this.stock[category][id] = { stock: 0, minStock: 0 }

    this.stock[category][id].minStock = Number.parseInt(value) || 0
    this.saveStock()
  }

  showStockModal(category, id) {
    const product = this.products[category][id]
    const stockInfo = this.stock[category][id] || { stock: 0, minStock: 0 }

    document.getElementById("stockProductName").value = product.name
    document.getElementById("currentStock").value = stockInfo.stock
    document.getElementById("addStock").value = ""
    document.getElementById("stockNote").value = ""

    this.currentEditingStock = { category, id }
    document.getElementById("stockModal").classList.add("active")
  }

  closeStockModal() {
    document.getElementById("stockModal").classList.remove("active")
    this.currentEditingStock = null
  }

  showAddProductModal() {
    document.getElementById("productModalTitle").textContent = "Tambah Produk Baru"
    document.getElementById("productForm").reset()
    document.getElementById("imagePreview").style.display = "none"
    this.currentEditingProduct = null
    document.getElementById("productModal").classList.add("active")
  }

  editProduct(category, id) {
    const product = this.products[category][id]

    document.getElementById("productModalTitle").textContent = "Edit Produk"
    document.getElementById("productName").value = product.name
    document.getElementById("productCategory").value = category
    document.getElementById("productPrice").value = product.price
    document.getElementById("productDescription").value = product.description

    const stockInfo = this.stock[category][id] || { stock: 0, minStock: 0 }
    document.getElementById("productStock").value = stockInfo.stock

    // Show current image if exists
    if (product.image) {
      const preview = document.getElementById("imagePreview")
      preview.style.display = "block"
      preview.className = `image-preview menu-item-image ${product.image}`
    }

    this.currentEditingProduct = { category, id }
    document.getElementById("productModal").classList.add("active")
  }

  closeProductModal() {
    document.getElementById("productModal").classList.remove("active")
    document.getElementById("productForm").reset()
    document.getElementById("imagePreview").style.display = "none"
    this.currentEditingProduct = null
  }

  toggleProductStatus(category, id) {
    this.products[category][id].active = !this.products[category][id].active
    this.saveProducts()
    this.loadProductsTable()
    this.updateDashboardStats()

    const status = this.products[category][id].active ? "diaktifkan" : "dinonaktifkan"
    this.showToast(`Produk berhasil ${status}!`)
  }

  deleteProduct(category, id) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.")) {
      delete this.products[category][id]
      delete this.stock[category][id]

      this.saveProducts()
      this.saveStock()
      this.loadProductsTable()
      this.loadStockTable()
      this.updateDashboardStats()

      this.showToast("Produk berhasil dihapus!")
    }
  }

  setupEventListeners() {
    // Product form submission
    document.getElementById("productForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveProduct()
    })

    // Stock form submission
    document.getElementById("stockForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.updateStock()
    })

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active")
      }
    })
  }

  saveProduct() {
    const name = document.getElementById("productName").value
    const category = document.getElementById("productCategory").value
    const price = Number.parseInt(document.getElementById("productPrice").value)
    const description = document.getElementById("productDescription").value
    const stock = Number.parseInt(document.getElementById("productStock").value)

    if (!name || !category || !price || !description) {
      this.showToast("Mohon lengkapi semua field!", "error")
      return
    }

    const saveBtn = document.getElementById("saveProductBtn")
    saveBtn.innerHTML = '<span class="loading">Menyimpan...</span>'
    saveBtn.disabled = true

    setTimeout(() => {
      let productId, productCategory

      if (this.currentEditingProduct) {
        // Edit existing product
        productCategory = this.currentEditingProduct.category
        productId = this.currentEditingProduct.id

        this.products[productCategory][productId] = {
          ...this.products[productCategory][productId],
          name,
          price,
          description,
        }

        // Update category if changed
        if (category !== productCategory) {
          const product = this.products[productCategory][productId]
          const stockInfo = this.stock[productCategory][productId]

          delete this.products[productCategory][productId]
          delete this.stock[productCategory][productId]

          // Find new ID in target category
          const newId = this.getNextId(category)
          product.id = newId

          this.products[category][newId] = product
          this.stock[category][newId] = stockInfo

          productCategory = category
          productId = newId
        }
      } else {
        // Add new product
        productCategory = category
        productId = this.getNextId(category)

        this.products[category][productId] = {
          id: productId,
          name,
          price,
          description,
          image: uploadedImageDataUrl || `${category}-${productId}`,
          active: true,
          created: new Date().toISOString(),
        }
      }

      // Update stock
      if (!this.stock[productCategory]) this.stock[productCategory] = {}
      this.stock[productCategory][productId] = {
        stock: stock,
        minStock: Math.max(1, Math.floor(stock * 0.2)), // 20% of initial stock as minimum
      }

      this.saveProducts()
      this.saveStock()
      this.loadProductsTable()
      this.loadStockTable()
      this.updateDashboardStats()
      this.closeProductModal()

      saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Produk'
      saveBtn.disabled = false

      this.showToast("Produk berhasil disimpan!")
    }, 1000)
  }

  updateStock() {
    if (!this.currentEditingStock) return

    const { category, id } = this.currentEditingStock
    const addStock = Number.parseInt(document.getElementById("addStock").value) || 0
    const note = document.getElementById("stockNote").value

    if (addStock <= 0) {
      this.showToast("Jumlah stok yang ditambahkan harus lebih dari 0!", "error")
      return
    }

    this.stock[category][id].stock += addStock

    // Log resupply activity (could be expanded to a full audit log)
    const resupplyLog = JSON.parse(localStorage.getItem("resupplyLog") || "[]")
    resupplyLog.push({
      productId: id,
      category,
      productName: this.products[category][id].name,
      addedStock: addStock,
      newTotal: this.stock[category][id].stock,
      note,
      timestamp: new Date().toISOString(),
      admin: sessionStorage.getItem("adminUsername"),
    })
    localStorage.setItem("resupplyLog", JSON.stringify(resupplyLog))

    this.saveStock()
    this.loadStockTable()
    this.updateDashboardStats()
    this.closeStockModal()

    this.showToast(`Stok berhasil ditambahkan! (+${addStock})`)
  }

  getNextId(category) {
    const existingIds = Object.keys(this.products[category] || {}).map((id) => Number.parseInt(id))
    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
  }

  saveStockChanges() {
    this.saveStock()
    this.showToast("Perubahan stok berhasil disimpan!")
  }

  resetAllStock() {
    if (confirm("Apakah Anda yakin ingin mereset semua stok ke nilai awal?")) {
      for (const category in this.stock) {
        for (const id in this.stock[category]) {
          // Reset to a reasonable default based on product type
          const defaultStock = category === "food" ? 20 : 30
          this.stock[category][id].stock = defaultStock
        }
      }

      this.saveStock()
      this.loadStockTable()
      this.updateDashboardStats()
      this.showToast("Semua stok berhasil direset!")
    }
  }

  refreshReports() {
    this.orders = this.loadOrders()
    this.loadReportsTable()
    this.updateDashboardStats()
    this.showToast("Laporan berhasil diperbarui!")
  }

  exportReport() {
    if (this.orders.length === 0) {
      this.showToast("Tidak ada data untuk diekspor!", "error")
      return
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Tanggal,Produk,Kategori,Jumlah,Harga Satuan,Total,Pembayaran\n"

    this.orders.forEach((order) => {
      const orderDate = new Date(order.timestamp).toLocaleString("id-ID")

      order.items.forEach((item) => {
        const itemTotal = Number.parseInt(item.price) * item.quantity
        const row = [
          orderDate,
          item.name,
          item.category === "food" ? "Makanan" : "Minuman",
          item.quantity,
          `Rp ${this.formatPrice(item.price)}`,
          `Rp ${this.formatPrice(itemTotal)}`,
          order.paymentMethod,
        ]

        csvContent += row.join(",") + "\n"
      })
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)

    // Trigger download
    link.click()
    document.body.removeChild(link)

    this.showToast("Laporan berhasil diekspor!")
  }

  backupData() {
    const backupData = {
      products: this.products,
      stock: this.stock,
      orders: this.orders,
      resupplyLog: JSON.parse(localStorage.getItem("resupplyLog") || "[]"),
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    }

    const dataStr = JSON.stringify(backupData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `kantin_digital_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    this.showToast("Backup data berhasil diunduh!")
  }

  resetAllData() {
    if (
      confirm(
        "PERINGATAN: Ini akan menghapus SEMUA data termasuk produk, stok, dan riwayat pesanan. Apakah Anda yakin?",
      )
    ) {
      if (confirm("Konfirmasi sekali lagi: Semua data akan hilang dan tidak dapat dikembalikan!")) {
        localStorage.removeItem("adminProducts")
        localStorage.removeItem("adminStock")
        localStorage.removeItem("orderHistory")
        localStorage.removeItem("menuStock")
        localStorage.removeItem("resupplyLog")

        this.showToast("Semua data berhasil direset! Halaman akan dimuat ulang...", "success")

        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    }
  }

  showChangePasswordModal() {
    // This would open a password change modal in a real implementation
    const newPassword = prompt("Masukkan password baru:")
    if (newPassword && newPassword.length >= 6) {
      // In a real app, this would be handled securely on the server
      localStorage.setItem("adminPassword", newPassword)
      this.showToast("Password berhasil diubah!")
    } else if (newPassword) {
      this.showToast("Password minimal 6 karakter!", "error")
    }
  }

  formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    toast.textContent = message
    toast.className = `toast show ${type === "error" ? "error" : ""}`

    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }
}

// Global functions for HTML onclick handlers
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all tabs
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.add("active")
  document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add("active")
}

function logout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    sessionStorage.removeItem("adminAuthenticated")
    sessionStorage.removeItem("adminUsername")
    sessionStorage.removeItem("loginTime")
    window.location.href = "admin-login.html"
  }
}

function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader()

    reader.onload = (e) => {
      uploadedImageDataUrl = e.target.result // ← simpan base64
      const preview = document.getElementById("imagePreview")
      preview.src = uploadedImageDataUrl
      preview.style.display = "block"
      preview.className = "image-preview"
    }

    reader.readAsDataURL(input.files[0])
  }
}

// Initialize dashboard when page loads
let adminDashboard
document.addEventListener("DOMContentLoaded", () => {
  adminDashboard = new AdminDashboard()
})

// Add error toast styles
const style = document.createElement("style")
style.textContent = `
    .toast.error {
        background-color: var(--danger-color);
    }
    .stock-info {
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    .stock-info.out-of-stock {
        color: var(--danger-color);
        font-weight: 600;
    }
`
document.head.appendChild(style)
