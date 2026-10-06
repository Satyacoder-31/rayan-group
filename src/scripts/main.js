import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GROUP_INFO, GROUP_COMPANIES, LEADERSHIP_TEAM, FEATURED_PROJECTS, FINANCIAL_HIGHLIGHTS, CORPORATE_NEWS, CAREER_OPPORTUNITIES, MEDIA_GALLERY } from './data.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. LENIS SMOOTH SCROLLING
// ==========================================================================
let lenis = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  try {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
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
  } catch (err) {
    console.warn('Lenis initialization bypassed:', err);
  }
}

// ==========================================================================
// 2. HEADER SCROLL & STOCK TICKER
// ==========================================================================
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Highlight active nav link based on current pathname
  const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav-link, .mega-sub-link, .footer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (href !== '/' && currentPath.startsWith(href)))) {
      link.classList.add('active');
    }
  });
}

// ==========================================================================
// 3. GLOBAL SEARCH MODAL
// ==========================================================================
const SITE_INDEX = [
  { title: "Rayan Group — Home", category: "Global Enterprise", url: "/" },
  { title: "Who We Are & History", category: "About Us", url: "/about/" },
  { title: "Executive Leadership & Board", category: "Governance", url: "/leadership/" },
  { title: "Business Divisions Overview", category: "Business Areas", url: "/business/" },
  { title: "Engineering & Contracting L.L.C", category: "Business / Civil & EPC", url: "/business/engineering/" },
  { title: "Marine & Coastal Operations", category: "Business / Marine", url: "/business/marine/" },
  { title: "Infrastructure & Heavy Civil", category: "Business / Infrastructure", url: "/business/infrastructure/" },
  { title: "Energy & Offshore Works", category: "Business / Oil & Gas", url: "/business/energy/" },
  { title: "Heavy Logistics & Fleet Services", category: "Business / Logistics", url: "/business/logistics/" },
  { title: "Project Portfolio Showcase", category: "Projects", url: "/projects/" },
  { title: "Al Wahda Mall Development", category: "Projects / Commercial", url: "/projects/al-wahda-mall/" },
  { title: "Ghantoot Royal Private Estate", category: "Projects / Interiors", url: "/projects/ghantoot-palace/" },
  { title: "Yas Mall Retail Engineering", category: "Projects / Retail", url: "/projects/yas-mall/" },
  { title: "Sustainability & Net-Zero ESG", category: "Sustainability", url: "/sustainability/" },
  { title: "Investor Relations Dashboard", category: "Investors", url: "/investors/" },
  { title: "Financial Results & Statements", category: "Investors / Financials", url: "/investors/financial-results/" },
  { title: "Annual Reports Archive", category: "Investors / Disclosures", url: "/investors/annual-reports/" },
  { title: "Investor Presentations & Decks", category: "Investors / Presentations", url: "/investors/presentations/" },
  { title: "Shareholder Information & Capital", category: "Investors / Capital", url: "/investors/shareholder-information/" },
  { title: "Corporate Governance Charters", category: "Investors / Governance", url: "/investors/corporate-governance/" },
  { title: "Stock Information (ADX: RYNG)", category: "Investors / Stock", url: "/investors/stock-information/" },
  { title: "Financial Calendar & Events", category: "Investors / Calendar", url: "/investors/financial-calendar/" },
  { title: "Corporate Newsroom & Press Releases", category: "Media & News", url: "/news/" },
  { title: "Rayan Expands Offshore Fleet", category: "News Article", url: "/news/rayan-group-expands-offshore-portfolio/" },
  { title: "Careers & Global Talent", category: "Careers", url: "/careers/" },
  { title: "Media Gallery & Photography", category: "Media", url: "/media/" },
  { title: "Global Contact Center & Offices", category: "Contact", url: "/contact/" },
  { title: "Corporate Privacy Policy", category: "Legal", url: "/privacy/" },
  { title: "Terms & Conditions", category: "Legal", url: "/terms/" }
];

function initSearchModal() {
  const triggerBtns = document.querySelectorAll('.btn-search-trigger, [data-search-trigger]');
  const modal = document.querySelector('.search-modal-backdrop');
  if (!modal) return;

  const closeBtn = modal.querySelector('.search-modal-close');
  const input = modal.querySelector('.search-modal-input');
  const resultsContainer = modal.querySelector('.search-results-list');

  const openSearch = () => {
    modal.classList.add('open');
    if (input) {
      input.value = '';
      input.focus();
      renderSearchResults('');
    }
  };

  const closeSearch = () => {
    modal.classList.remove('open');
  };

  triggerBtns.forEach(btn => btn.addEventListener('click', openSearch));
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeSearch();
    }
  });

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    const cleanQ = query.trim().toLowerCase();
    const matches = cleanQ
      ? SITE_INDEX.filter(item => item.title.toLowerCase().includes(cleanQ) || item.category.toLowerCase().includes(cleanQ))
      : SITE_INDEX.slice(0, 8);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 1.5rem; color: #94a3b8; text-align: center;">No corporate disclosures or pages found matching "<strong>${query}</strong>"</div>`;
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <a href="${m.url}" class="search-result-item">
        <div class="search-result-crumb">${m.category}</div>
        <div class="search-result-title">${m.title}</div>
      </a>
    `).join('');
  }

  if (input) {
    input.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }
}

// ==========================================================================
// 4. HERO SLIDESHOW (Homepage)
// ==========================================================================
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide-item');
  if (!slides || slides.length === 0) return;

  const currentCounter = document.querySelector('.hero-counter-current');
  const totalCounter = document.querySelector('.hero-counter-total');
  const progressBar = document.querySelector('.hero-progress-fill');
  const prevBtn = document.querySelector('.hero-arrow-prev');
  const nextBtn = document.querySelector('.hero-arrow-next');

  let currentIndex = 0;
  const totalSlides = slides.length;
  const slideDuration = 4500;
  let slideTimer = null;
  let progressInterval = null;
  let progressStart = Date.now();

  if (totalCounter) {
    totalCounter.textContent = `0${totalSlides}`;
  }

  function showSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    currentIndex = index;
    if (currentCounter) {
      currentCounter.textContent = `0${index + 1}`;
    }
    resetProgress();
  }

  function nextSlide() {
    showSlide((currentIndex + 1) % totalSlides);
  }

  function prevSlide() {
    showSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }

  function resetProgress() {
    clearInterval(progressInterval);
    clearTimeout(slideTimer);

    if (progressBar) {
      progressBar.style.width = '0%';
    }
    progressStart = Date.now();

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const pct = Math.min(100, (elapsed / slideDuration) * 100);
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }
    }, 50);

    slideTimer = setTimeout(() => {
      nextSlide();
    }, slideDuration);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  showSlide(0);
}

// ==========================================================================
// 5. ANIMATED STATISTICS COUNTERS
// ==========================================================================
function initStatisticsCounters() {
  const statsElements = document.querySelectorAll('[data-counter-target]');
  if (!statsElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-counter-target'));
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
        let start = 0;
        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = start + (target - start) * easeProgress;
          el.textContent = `${prefix}${current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  statsElements.forEach(el => observer.observe(el));
}

// ==========================================================================
// 6. INVESTOR DATA TABLES (Search & Filter & Downloads)
// ==========================================================================
function initInvestorTables() {
  // Table live search
  const searchInputs = document.querySelectorAll('.ir-table-search input');
  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const table = e.target.closest('.ir-table-wrapper')?.querySelector('tbody');
      if (!table) return;
      table.querySelectorAll('tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });

  // Document download triggers
  document.querySelectorAll('.doc-download-btn, [data-doc-download]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docName = btn.getAttribute('data-doc-name') || btn.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || 'Document';
      showToast(`Initiating download for "${docName.trim()}" (PDF)...`);
    });
  });
}

// ==========================================================================
// 7. PROJECT & MEDIA FILTERS
// ==========================================================================
function initFilterTabs() {
  // Project category filters
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-editorial-card, [data-project-cat]');

  if (projectFilterBtns.length && projectCards.length) {
    projectFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        projectFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';

        projectCards.forEach(card => {
          const cat = card.getAttribute('data-project-cat');
          if (filter === 'all' || cat === filter) {
            card.style.display = '';
            gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35 });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Media Gallery Lightbox
  const mediaCards = document.querySelectorAll('.media-thumb-card');
  const lightboxModal = document.querySelector('.lightbox-modal');

  if (mediaCards.length && lightboxModal) {
    const lbImg = lightboxModal.querySelector('.lightbox-img');
    const lbCaption = lightboxModal.querySelector('.lightbox-caption-text');
    const lbClose = lightboxModal.querySelector('.lightbox-close');

    mediaCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const caption = card.querySelector('.media-card-title')?.textContent || '';
        if (lbImg && img) lbImg.src = img.src;
        if (lbCaption) lbCaption.textContent = caption;
        lightboxModal.classList.add('open');
      });
    });

    if (lbClose) {
      lbClose.addEventListener('click', () => lightboxModal.classList.remove('open'));
    }
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove('open');
    });
  }
}

// ==========================================================================
// 8. FORMS & TOAST NOTIFICATION
// ==========================================================================
function initForms() {
  document.querySelectorAll('form[data-enterprise-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredInputs = form.querySelectorAll('[required]');
      let valid = true;

      requiredInputs.forEach(inp => {
        if (!inp.value.trim()) {
          valid = false;
          inp.style.borderColor = '#ef4444';
        } else {
          inp.style.borderColor = '';
        }
      });

      if (!valid) {
        showToast('Please complete all required fields.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'TRANSMITTING...';
      }

      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'TRANSMITTED SUCCESSFULLY';
        }
        showToast('Your inquiry has been successfully received by Rayan Group Corporate Secretariat. We will respond within 24 hours.', 'success');
      }, 900);
    });
  });
}

function showToast(message, type = 'info') {
  let toast = document.getElementById('enterprise-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'enterprise-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      background: #091728;
      border: 1px solid rgba(0, 153, 230, 0.4);
      color: #fff;
      padding: 1rem 1.75rem;
      border-radius: 8px;
      font-family: var(--font-heading);
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
      transform: translateY(30px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 440px;
      line-height: 1.4;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.borderColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : 'rgba(0, 153, 230, 0.5)';
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(30px)';
  }, 4200);
}

// Back to Top button
function initBackToTop() {
  const btn = document.querySelector('.back-to-top-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ==========================================================================
// 9. MOBILE DRAWER NAVIGATION
// ==========================================================================
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.btn-mobile-menu-toggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  // Accordion submenus inside mobile drawer
  drawer.querySelectorAll('.mobile-group-header').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.closest('.mobile-nav-group');
      const isOpen = group.classList.contains('active');
      drawer.querySelectorAll('.mobile-nav-group').forEach(g => {
        if (g !== group) g.classList.remove('active');
      });
      group.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  // Close drawer on clicking any navigation link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// ==========================================================================
// DOM READY INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNavigation();
  initSearchModal();
  initHeroSlideshow();
  initStatisticsCounters();
  initInvestorTables();
  initFilterTabs();
  initForms();
  initBackToTop();
});

