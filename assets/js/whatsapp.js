/* =========================================================
   BRITISH PROPOLIS TOILI - WHATSAPP INTEGRATION
   Direct Order & Customer Service Messaging via WhatsApp
   Target Number: 085242167429 (6285242167429)
   ======================================================== */

const WA_NUMBER = '6285242167429';

function checkoutWhatsApp() {
  const cart = getCart();
  const items = Object.values(cart);

  if (items.length === 0) {
    showToast('Keranjang Anda masih kosong. Silakan pilih produk terlebih dahulu.');
    return;
  }

  // Ask for optional customer details
  const name = prompt('Masukkan Nama Lengkap Anda (opsional):') || '-';
  const address = prompt('Masukkan Alamat Pengiriman (opsional):') || '-';

  let message = `Halo British Propolis Toili,\n\nSaya ingin memesan:\n`;

  items.forEach(item => {
    const prod = PRODUCTS[item.id];
    if (prod) {
      const subtotal = prod.price * item.qty;
      message += `• ${prod.name} x${item.qty} - ${formatRupiah(subtotal)}\n`;
    }
  });

  const total = getCartTotal();
  message += `\n*Total Harga: ${formatRupiah(total)}*\n\n`;
  message += `Nama Pembeli: ${name}\n`;
  message += `Alamat Pengiriman: ${address}\n\n`;
  message += `Mohon informasi rekening pembayaran & estimasi pengiriman. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;

  window.open(waUrl, '_blank');
}

function quickOrderWhatsApp(productId) {
  const prod = PRODUCTS[productId];
  if (!prod) return;

  let message = `Halo British Propolis Toili,\n\nSaya tertarik untuk memesan:\n`;
  message += `• ${prod.name} (1 Botol - ${formatRupiah(prod.price)})\n\n`;
  message += `Mohon informasi cara pemesanan dan ketersediaan stok. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;

  window.open(waUrl, '_blank');
}

function sendContactWhatsApp(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('contact-name');
  const msgInput = document.getElementById('contact-message');

  const name = nameInput ? nameInput.value.trim() : 'Pelanggan';
  const userMsg = msgInput ? msgInput.value.trim() : 'Saya berminat untuk bertanya tentang British Propolis.';

  let message = `Halo British Propolis Toili,\n\nSaya ${name}.\n`;
  message += `Pesan / Pertanyaan:\n"${userMsg}"\n\n`;
  message += `Mohon bantuannya. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;

  window.open(waUrl, '_blank');
}
