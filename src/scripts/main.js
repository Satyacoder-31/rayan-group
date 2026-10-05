import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COMPANY_INFO, LEADERSHIP_TEAM, SERVICES, PROJECTS, CERTIFICATIONS, CLIENTS, CORE_VALUES } from './data.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. LENIS SMOOTH SCROLLING
// ==========================================================================
let lenis = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ==========================================================================
// 2. DESKTOP CUSTOM CURSOR
// ==========================================================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('cursor-dot');
  if (!cursor || !dot || window.innerWidth <= 1024) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Link & Button hover states
  const interactives = document.querySelectorAll('a, button, input, select, textarea, .service-item-row');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Project cards special state
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-project');
      const label = cursor.querySelector('.cursor-label');
      if (label) label.textContent = 'VIEW PROJECT';
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-project');
    });
  });
}

// ==========================================================================
// 3. GLOBAL HEADER & NAVIGATION
// ==========================================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
  const drawerBackdrop = document.querySelector('.mobile-drawer-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Header blur on scroll
  const handleScrollHeader = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader(); // initial check

  // Drawer helpers
  const openDrawer = () => {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileBtn) {
      mobileBtn.classList.add('active');
      mobileBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileBtn) {
      mobileBtn.classList.remove('active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
    // Only reset body overflow if no modal is open
    const anyModalOpen = document.querySelector('.modal-overlay.open');
    if (!anyModalOpen) {
      document.body.style.overflow = '';
    }
  };

  // Mobile drawer trigger
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileDrawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', closeDrawer);
    }

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Also close drawer on ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // Active link highlighter on scroll (both desktop and mobile)
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    mobileLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ==========================================================================
// 4. HERO SECTION ANIMATIONS
// ==========================================================================
function initHeroAnimations() {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.hero-bg-img', 
    { scale: 1.15, filter: 'brightness(0.3) contrast(1.2)' },
    { scale: 1.05, filter: 'brightness(0.65) contrast(1.1)', duration: 2.2 }
  )
  .fromTo('.hero-eyebrow', 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=1.4'
  )
  .fromTo('.hero-headline', 
    { opacity: 0, y: 35 },
    { opacity: 1, y: 0, duration: 1 },
    '-=0.6'
  )
  .fromTo('.hero-description', 
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.6'
  )
  .fromTo('.hero-cta-group', 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.5'
  )
  .fromTo('.hero-card', 
    { opacity: 0, y: 35 },
    { opacity: 1, y: 0, duration: 1 },
    '-=0.8'
  )
  .fromTo('.scroll-indicator', 
    { opacity: 0 },
    { opacity: 1, duration: 0.8 },
    '-=0.4'
  );

  // Parallax on desktop screens
  if (window.innerWidth > 992) {
    gsap.to('.hero-bg-img', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    gsap.to('.hero-content', {
      yPercent: -8,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'center top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }
}

// ==========================================================================
// 5. STATISTICS COUNTER
// ==========================================================================
function initStatisticsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });
}

// ==========================================================================
// 6. INTERACTIVE SERVICES EXPERIENCE
// ==========================================================================
function initServicesInteractive() {
  const serviceRows = document.querySelectorAll('.service-item-row');
  const previewImg = document.getElementById('service-preview-img');
  const previewBadge = document.getElementById('service-preview-badge');
  const previewTitle = document.getElementById('service-preview-title');
  const previewSubtitle = document.getElementById('service-preview-subtitle');
  const previewDesc = document.getElementById('service-preview-desc');
  const previewFeatures = document.getElementById('service-preview-features');
  const previewCta = document.getElementById('service-preview-cta');

  if (!serviceRows.length) return;

  function switchService(index) {
    const service = SERVICES[index];
    if (!service) return;

    // Update active class
    serviceRows.forEach((r, idx) => r.classList.toggle('active', idx === index));

    // Smooth transition
    if (previewImg) {
      previewImg.style.opacity = '0';
      previewImg.style.transform = 'scale(1.04)';
      setTimeout(() => {
        previewImg.src = service.image;
        previewImg.alt = service.title;
        previewImg.style.opacity = '1';
        previewImg.style.transform = 'scale(1)';
      }, 200);
    }

    if (previewBadge) previewBadge.textContent = `SERVICE ${service.id} / 14`;
    if (previewTitle) previewTitle.textContent = service.title;
    if (previewSubtitle) previewSubtitle.textContent = service.subtitle;
    if (previewDesc) previewDesc.textContent = service.description;

    if (previewFeatures) {
      previewFeatures.innerHTML = service.features
        .map((f) => `
          <li class="service-feature-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${f}</span>
          </li>
        `)
        .join('');
    }

    if (previewCta) {
      previewCta.setAttribute('data-service', service.title);
    }
  }

  // Bind clicks and hovers
  serviceRows.forEach((row, idx) => {
    row.addEventListener('click', () => {
      switchService(idx);
      // On mobile & tablets, bring preview into view so user sees updated details
      if (window.innerWidth <= 1024) {
        const previewPanel = document.querySelector('.service-preview-panel');
        if (previewPanel) {
          setTimeout(() => {
            previewPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 80);
        }
      }
    });
    row.addEventListener('mouseenter', () => {
      if (window.innerWidth > 1024) switchService(idx);
    });
  });

  // Service CTA in panel opens quote modal with selected service
  if (previewCta) {
    previewCta.addEventListener('click', () => {
      const serviceName = previewCta.getAttribute('data-service') || '';
      openQuoteModal(serviceName);
    });
  }
}

// ==========================================================================
// 7. FEATURED PROJECTS SHOWCASE & MODAL
// ==========================================================================
function initProjectsShowcase() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Filter tabs
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'block';
          gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Project Modal Logic
  const modalOverlay = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('project-modal-close');
  const modalDiscussBtn = document.getElementById('modal-discuss-btn');

  function openProjectModal(projectId) {
    const prj = PROJECTS.find((p) => p.id === projectId);
    if (!prj || !modalOverlay) return;

    document.getElementById('modal-project-title').textContent = prj.name;
    document.getElementById('modal-project-location').textContent = prj.location;
    document.getElementById('modal-project-category').textContent = prj.category;
    document.getElementById('modal-project-img').src = prj.image;
    document.getElementById('modal-project-img').alt = prj.name;

    document.getElementById('modal-val-client').textContent = prj.client;
    document.getElementById('modal-val-contractor').textContent = prj.mainContractor;
    document.getElementById('modal-val-scope').textContent = prj.scope;
    document.getElementById('modal-val-value').textContent = prj.contractValue;
    document.getElementById('modal-val-timeline').textContent = prj.year;
    document.getElementById('modal-val-description').textContent = prj.description;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-project-id');
      openProjectModal(pid);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProjectModal();
    });
  }

  if (modalDiscussBtn) {
    modalDiscussBtn.addEventListener('click', () => {
      closeProjectModal();
      openQuoteModal();
    });
  }
}

// ==========================================================================
// 8. CERTIFICATION LIGHTBOX
// ==========================================================================
function initCertificationLightbox() {
  const certModal = document.getElementById('cert-modal');
  const certCloseBtn = document.getElementById('cert-modal-close');
  const certViewBtns = document.querySelectorAll('.view-cert-trigger');
  const certLightImg = document.getElementById('cert-modal-img');
  const certLightTitle = document.getElementById('cert-modal-title');
  const certLightMeta = document.getElementById('cert-modal-meta');

  if (!certModal) return;

  function openCert(id) {
    const cert = CERTIFICATIONS.find((c) => c.id === id);
    if (!cert) return;

    if (certLightImg) {
      certLightImg.src = cert.image;
      certLightImg.alt = cert.title;
    }
    if (certLightTitle) certLightTitle.textContent = `${cert.title} — ${cert.standard}`;
    if (certLightMeta) certLightMeta.textContent = `${cert.accreditation} | Scope: ${cert.scope}`;

    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCert() {
    certModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  certViewBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-cert-id');
      openCert(cid);
    });
  });

  if (certCloseBtn) certCloseBtn.addEventListener('click', closeCert);
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) closeCert();
  });
}

// ==========================================================================
// 9. GLOBAL PRESENCE: UAE + INDIA LIVE CLOCKS & HUB TOGGLE
// ==========================================================================
function initPresenceHubs() {
  const hubBtns = document.querySelectorAll('.hub-tab-btn');
  const uaeCard = document.getElementById('hub-card-uae');
  const indiaCard = document.getElementById('hub-card-india');
  const mapPins = document.querySelectorAll('.map-pin');

  function updateClocks() {
    const now = new Date();
    // UAE (GST: UTC+4)
    const uaeTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);

    // India (IST: UTC+5:30)
    const indiaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);

    const uaeClockEl = document.getElementById('uae-clock-time');
    const indiaClockEl = document.getElementById('india-clock-time');

    if (uaeClockEl) uaeClockEl.textContent = `${uaeTime} GST`;
    if (indiaClockEl) indiaClockEl.textContent = `${indiaTime} IST`;
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  function setActiveHub(hub) {
    hubBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-hub') === hub));
    if (uaeCard && indiaCard) {
      if (hub === 'uae') {
        uaeCard.style.display = 'block';
        indiaCard.style.display = 'none';
      } else {
        uaeCard.style.display = 'none';
        indiaCard.style.display = 'block';
      }
    }
  }

  hubBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const hub = btn.getAttribute('data-hub');
      setActiveHub(hub);
    });
  });

  mapPins.forEach((pin) => {
    pin.addEventListener('click', () => {
      const hub = pin.getAttribute('data-hub');
      setActiveHub(hub);
    });
  });
}

// ==========================================================================
// 10. INQUIRY / QUOTE MODAL & FORMS
// ==========================================================================
function openQuoteModal(prefillService = '') {
  // Dismiss mobile drawer if open
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  if (mobileDrawer && mobileDrawer.classList.contains('open')) {
    mobileDrawer.classList.remove('open');
    if (mobileBtn) {
      mobileBtn.classList.remove('active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
  }

  const modal = document.getElementById('quote-modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (prefillService) {
    const select = document.getElementById('quote-service-select');
    if (select) select.value = prefillService;
  }
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a896" stroke-width="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function initForms() {
  const quoteTriggers = document.querySelectorAll('.quote-modal-trigger');
  quoteTriggers.forEach((btn) => btn.addEventListener('click', () => openQuoteModal()));

  const quoteModalClose = document.getElementById('quote-modal-close');
  if (quoteModalClose) quoteModalClose.addEventListener('click', closeQuoteModal);

  const quoteModal = document.getElementById('quote-modal');
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  // Quote Form Submission
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quote-name').value;
      const service = document.getElementById('quote-service-select').value;
      closeQuoteModal();
      showToast(`Thank you, ${name}! Your project inquiry for ${service || 'engineering works'} has been dispatched to Rayan Engineering estimating team.`);
      quoteForm.reset();
    });
  }

  // Page Contact Form Submission
  const contactForm = document.getElementById('main-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      showToast(`Thank you, ${name}! We have received your inquiry. A Rayan Engineering specialist will contact you within 24 hours.`);
      contactForm.reset();
    });
  }

  // ESC key closes all modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuoteModal();
      const prjModal = document.getElementById('project-modal');
      if (prjModal) prjModal.classList.remove('open');
      const certModal = document.getElementById('cert-modal');
      if (certModal) certModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ==========================================================================
// 11. SCROLL REVEALS & MICRO-ANIMATIONS
// ==========================================================================
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  // Staggered reveal for section titles & eyebrows
  const sections = document.querySelectorAll('.section');
  sections.forEach((sec) => {
    const title = sec.querySelector('.section-title');
    const eyebrow = sec.querySelector('.section-eyebrow');
    const subtitle = sec.querySelector('.section-subtitle');

    if (title) {
      gsap.from(title, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
        }
      });
    }

    if (eyebrow) {
      gsap.from(eyebrow, {
        opacity: 0,
        x: -20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: eyebrow,
          start: 'top 88%',
        }
      });
    }

    if (subtitle) {
      gsap.from(subtitle, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: subtitle,
          start: 'top 86%',
        }
      });
    }
  });

  // Statistics cards reveal
  if (document.querySelector('.stats-grid')) {
    gsap.from('.stat-item', {
      opacity: 0,
      y: 40,
      stagger: 0.12,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 82%',
      }
    });
  }

  // Leadership cards reveal
  if (document.querySelector('.leadership-grid')) {
    gsap.from('.leader-card', {
      opacity: 0,
      y: 45,
      stagger: 0.15,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.leadership-grid',
        start: 'top 80%',
      }
    });
  }

  // Projects portfolio cards reveal
  if (document.querySelector('.projects-grid')) {
    gsap.from('.project-card', {
      opacity: 0,
      y: 45,
      stagger: 0.12,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 82%',
      }
    });
  }

  // Why Rayan pillars
  if (document.querySelector('.why-grid')) {
    gsap.from('.why-card', {
      opacity: 0,
      y: 35,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.why-grid',
        start: 'top 82%',
      }
    });
  }

  // Regional presence cards
  if (document.querySelector('.presence-grid')) {
    gsap.from('.presence-grid > div', {
      opacity: 0,
      y: 40,
      stagger: 0.16,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.presence-grid',
        start: 'top 80%',
      }
    });
  }

  // Certifications cards
  if (document.querySelector('.certifications-grid')) {
    gsap.from('.cert-card', {
      opacity: 0,
      y: 40,
      stagger: 0.16,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.certifications-grid',
        start: 'top 80%',
      }
    });
  }
}

// ==========================================================================
// SCROLL-DRIVEN SLIDE-IN & SLIDE-OUT IMAGE ANIMATIONS
// ==========================================================================
function initScrollSlideAnimations() {
  if (prefersReducedMotion) return;

  const isMobile = window.innerWidth <= 768;

  // 1. Primary Full-Width Slide Card in Mid-Page Showcase
  // Slides smoothly in from the right as user scrolls in, locks in center, and slides out to the left as user scrolls past!
  const primaryCard = document.querySelector('.slide-card-primary');
  if (primaryCard) {
    const cardImg = primaryCard.querySelector('.slide-img');
    const xOffset = isMobile ? 8 : 16;

    const tlPrimary = gsap.timeline({
      scrollTrigger: {
        trigger: primaryCard,
        start: 'top 95%',
        end: 'bottom 5%',
        scrub: 1.2,
      }
    });

    // Phase 1 (0% to 50% scroll): SLIDE IN from right
    tlPrimary.fromTo(primaryCard, 
      { xPercent: xOffset, opacity: 0.75, scale: 0.97 },
      { xPercent: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 }
    )
    // Phase 2 (50% to 100% scroll): SLIDE OUT to left
    .to(primaryCard, 
      { xPercent: -xOffset, opacity: 0.75, scale: 0.97, ease: 'none', duration: 1 }
    );

    // Inner image counter-pan for rich cinematic depth
    if (cardImg) {
      gsap.fromTo(cardImg,
        { scale: 1.15, xPercent: -6 },
        {
          scale: 1.15,
          xPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: primaryCard,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          }
        }
      );
    }
  }

  // 2. Dual Split Row in Mid-Page Showcase
  // Left card slides in from left & slides out left; Right card slides in from right & slides out right
  const splitRow = document.querySelector('.scroll-slide-split-row');
  const leftCard = document.querySelector('.slide-card-left');
  const rightCard = document.querySelector('.slide-card-right');

  if (splitRow && leftCard && rightCard) {
    const xSplitOffset = isMobile ? 10 : 22;

    // Left card timeline: slides in from left, then slides out to left
    const tlLeft = gsap.timeline({
      scrollTrigger: {
        trigger: splitRow,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 1.2,
      }
    });

    tlLeft.fromTo(leftCard,
      { xPercent: -xSplitOffset, opacity: 0.7, scale: 0.96 },
      { xPercent: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 }
    )
    .to(leftCard,
      { xPercent: -xSplitOffset, opacity: 0.7, scale: 0.96, ease: 'none', duration: 1 }
    );

    // Right card timeline: slides in from right, then slides out to right
    const tlRight = gsap.timeline({
      scrollTrigger: {
        trigger: splitRow,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 1.2,
      }
    });

    tlRight.fromTo(rightCard,
      { xPercent: xSplitOffset, opacity: 0.7, scale: 0.96 },
      { xPercent: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 }
    )
    .to(rightCard,
      { xPercent: xSplitOffset, opacity: 0.7, scale: 0.96, ease: 'none', duration: 1 }
    );

    // Inner images counter-pan
    const leftImg = leftCard.querySelector('.slide-img');
    const rightImg = rightCard.querySelector('.slide-img');

    if (leftImg) {
      gsap.fromTo(leftImg, { scale: 1.15, xPercent: 6 }, {
        scale: 1.15, xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: splitRow, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    }

    if (rightImg) {
      gsap.fromTo(rightImg, { scale: 1.15, xPercent: -6 }, {
        scale: 1.15, xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: splitRow, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    }
  }

  // 3. About Section Architectural Banner
  // Slides in from left when entering, centers, and slides out to right when scrolling away!
  const aboutBanner = document.querySelector('.about-visual-banner');
  if (aboutBanner) {
    const aboutImg = aboutBanner.querySelector('.about-banner-img');
    const xAboutOffset = isMobile ? 6 : 12;

    const tlAbout = gsap.timeline({
      scrollTrigger: {
        trigger: aboutBanner,
        start: 'top 94%',
        end: 'bottom 6%',
        scrub: 1.2,
      }
    });

    tlAbout.fromTo(aboutBanner,
      { xPercent: -xAboutOffset, opacity: 0.8, scale: 0.97 },
      { xPercent: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 }
    )
    .to(aboutBanner,
      { xPercent: xAboutOffset, opacity: 0.8, scale: 0.97, ease: 'none', duration: 1 }
    );

    if (aboutImg) {
      gsap.fromTo(aboutImg,
        { scale: 1.15, xPercent: 6 },
        { scale: 1.15, xPercent: -6, ease: 'none', scrollTrigger: { trigger: aboutBanner, start: 'top bottom', end: 'bottom top', scrub: 1.5 } }
      );
    }
  }

  // 4. UAE & India Presence Interactive Map Container
  // Slides in from right when scrolling down into view, centers, and slides out to left!
  const presenceMap = document.querySelector('.presence-map-container');
  if (presenceMap) {
    const xMapOffset = isMobile ? 6 : 14;

    const tlMap = gsap.timeline({
      scrollTrigger: {
        trigger: presenceMap,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 1.2,
      }
    });

    tlMap.fromTo(presenceMap,
      { xPercent: xMapOffset, opacity: 0.75, scale: 0.97 },
      { xPercent: 0, opacity: 1, scale: 1, ease: 'none', duration: 1 }
    )
    .to(presenceMap,
      { xPercent: -xMapOffset, opacity: 0.75, scale: 0.97, ease: 'none', duration: 1 }
    );
  }
}

// ==========================================================================
// INITIALIZATION ON DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavigation();
  initHeroAnimations();
  initStatisticsCounter();
  initServicesInteractive();
  initProjectsShowcase();
  initCertificationLightbox();
  initPresenceHubs();
  initForms();
  initScrollAnimations();
  initScrollSlideAnimations();
});
