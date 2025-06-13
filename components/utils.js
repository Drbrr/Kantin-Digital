// Format price with thousand separators
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Show toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, duration)
}
