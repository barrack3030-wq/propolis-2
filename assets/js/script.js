/* =========================================================
   BRITISH PROPOLIS TOILI - MAIN SCRIPT
   Header glass effect, navigation scroll, mobile sidebar, AOS
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');

    let currentSection = '';
    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + section.offsetHeight) currentSection = section.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) link.classList.add('active');
    });
  });

  if (navMenu && !navMenu.querySelector('a[href="blog.html"]')) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="blog.html" class="nav-link">Blog</a>';
    navMenu.appendChild(li);
  }

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');
    });
    navMenu.addEventListener('click', e => {
      if (e.target.closest('.nav-link')) {
        navMenu.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (typeof AOS !== 'undefined') AOS.init({duration:800,easing:'ease-in-out',once:true,offset:100});
});
