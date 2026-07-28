/* =========================================================
   BRITISH PROPOLIS TOILI - PRODUCT GALLERY & SWIPER INITIALIZER
   Auto-populates bpregular, bpbiru, bphijau images
   Initializes Swiper Carousels & GLightbox Lightbox
   ======================================================== */

const GALLERY_IMAGES = [
  { src: 'assets/images/bpregular/1.png', title: 'British Propolis Reguler - Tampilan Utama', category: 'Reguler' },
  { src: 'assets/images/bpregular/2.png', title: 'British Propolis Reguler - Kemasan Kemasan Dus & Botol', category: 'Reguler' },
  { src: 'assets/images/bpregular/3.png', title: 'British Propolis Reguler - Penetes Propolis Premium', category: 'Reguler' },

  { src: 'assets/images/bpbiru/1.png', title: 'Paket Hemat 3 Botol - Pilihan Keluarga', category: 'Paket Hemat' },
  { src: 'assets/images/bpbiru/2.png', title: 'Paket Hemat - Box Bundling', category: 'Paket Hemat' },
  { src: 'assets/images/bpbiru/3.png', title: 'Ekstrak Propolis Inggris Murni', category: 'Paket Hemat' },
  { src: 'assets/images/bpbiru/4.png', title: 'Segel Kemewahan Gold Seal British Propolis', category: 'Paket Hemat' },
  { src: 'assets/images/bpbiru/5.png', title: 'Stok Suplemen Imun Keluarga', category: 'Paket Hemat' },

  { src: 'assets/images/bphijau/1.png', title: 'British Propolis Green - Formula Anak Usia 1-12 Tahun', category: 'Green Kids' },
  { src: 'assets/images/bphijau/2.png', title: 'British Propolis Green - Botol & Box Kemasan Anak', category: 'Green Kids' },
  { src: 'assets/images/bphijau/3.png', title: 'BP Green - Meningkatkan Imun & Nafsu Makan Anak', category: 'Green Kids' },
  { src: 'assets/images/bphijau/4.png', title: 'Aman & Lembut untuk Anak-anak', category: 'Green Kids' },
  { src: 'assets/images/bphijau/5.png', title: 'BP Green Kids Bundling Special', category: 'Green Kids' }
];

document.addEventListener('DOMContentLoaded', () => {
  const galleryWrapper = document.getElementById('gallery-wrapper');

  if (galleryWrapper) {
    let slidesHtml = '';
    GALLERY_IMAGES.forEach(item => {
      slidesHtml += `
        <div class="swiper-slide">
          <div class="gallery-card hover-lift">
            <a href="${item.src}" class="glightbox" data-gallery="product-gallery" data-title="${item.title}">
              <img src="${item.src}" alt="${item.title}" class="gallery-img" loading="lazy">
              <div style="padding: 16px;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #14833B; text-transform: uppercase;">${item.category}</span>
                <h4 style="font-size: 0.95rem; font-weight: 600; color: #222; margin-top: 4px;">${item.title}</h4>
              </div>
            </a>
          </div>
        </div>
      `;
    });
    galleryWrapper.innerHTML = slidesHtml;
  }

  // Initialize Swiper for Gallery Slider
  if (typeof Swiper !== 'undefined') {
    new Swiper('.gallery-slider-container', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination-gallery',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next-gallery',
        prevEl: '.swiper-button-prev-gallery',
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1200: { slidesPerView: 4 }
      }
    });

    // Initialize Swiper for Testimonials
    new Swiper('.testimonial-slider-container', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination-testimonial',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      }
    });
  }

  // Initialize GLightbox
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      zoomable: true
    });
  }
});
