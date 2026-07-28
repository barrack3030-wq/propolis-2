/* =========================================================
   BRITISH PROPOLIS TOILI - SHOPPING CART SYSTEM
   Handles Cart Persistence, Drawer, Quantities, Total
   ======================================================== */

const PRODUCTS = {
  'regular': {
    id: 'regular',
    name: 'British Propolis Reguler',
    variant: 'Untuk Dewasa (Isi 6 ml)',
    price: 250000,
    image: 'assets/images/bpregular/1.png'
  },
  'green': {
    id: 'green',
    name: 'British Propolis Green',
    variant: 'For Kids (Usia 1–12 Tahun)',
    price: 250000,
    image: 'assets/images/bphijau/1.png'
  },
  'paket': {
    id: 'paket',
    name: 'Paket Hemat 3 Botol',
    variant: 'Keluarga Sehat Ekonomis',
    price: 650000,
    image: 'assets/images/bpbiru/1.png'
  }
};

const CART_KEY = 'bp_toili_cart_v1';

function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(productId, qty = 1) {
  if (!PRODUCTS[productId]) return;
  const cart = getCart();
  if (cart[productId]) {
    cart[productId].qty += qty;
  } else {
    cart[productId] = {
      id: productId,
      qty: qty
    };
  }
  saveCart(cart);
  showToast(`Berhasil menambahkan ${PRODUCTS[productId].name} ke keranjang!`);
  openCartDrawer();
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  if (!cart[productId]) return;
  cart[productId].qty += delta;
  if (cart[productId].qty <= 0) {
    delete cart[productId];
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  if (cart[productId]) {
    delete cart[productId];
    saveCart(cart);
    showToast('Produk dihapus dari keranjang.');
  }
}

function clearCart() {
  saveCart({});
  showToast('Keranjang telah dikosongkan.');
}

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

function getCartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((total, item) => total + item.qty, 0);
}

function getCartTotal() {
  const cart = getCart();
  return Object.values(cart).reduce((total, item) => {
    const prod = PRODUCTS[item.id];
    return total + (prod ? prod.price * item.qty : 0);
  }, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCartDrawer() {
  const cartItemsContainer = document.getElementById('cart-drawer-items');
  const cartTotalElement = document.getElementById('cart-drawer-total');
  
  if (!cartItemsContainer || !cartTotalElement) return;

  const cart = getCart();
  const items = Object.values(cart);

  if (items.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px auto; color: #9CA3AF;">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p style="font-weight: 600; font-size: 1.05rem; color: #374151;">Keranjang Anda Masih Kosong</p>
        <p style="font-size: 0.85rem; color: #6B7280; margin-top: 4px;">Pilih produk kesehatan British Propolis terbaik Anda.</p>
      </div>
    `;
    cartTotalElement.textContent = formatRupiah(0);
    return;
  }

  let html = '';
  items.forEach(item => {
    const prod = PRODUCTS[item.id];
    if (!prod) return;
    const subtotal = prod.price * item.qty;

    html += `
      <div class="cart-item">
        <img src="${prod.image}" alt="${prod.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${prod.name}</div>
          <div class="cart-item-price">${formatRupiah(prod.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateCartQuantity('${prod.id}', -1)">-</button>
            <span style="font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${prod.id}', 1)">+</button>
            <span style="margin-left: auto; font-weight: 700; color: #14833B; font-size: 0.9rem;">${formatRupiah(subtotal)}</span>
            <button onclick="removeFromCart('${prod.id}')" style="background:none; border:none; color:#EF4444; cursor:pointer; margin-left: 8px;" title="Hapus">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = html;
  cartTotalElement.textContent = formatRupiah(getCartTotal());
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartDrawer();
});
