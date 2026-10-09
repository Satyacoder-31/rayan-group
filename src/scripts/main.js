import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GROUP_INFO, GROUP_COMPANIES, LEADERSHIP_TEAM, FEATURED_PROJECTS, FINANCIAL_HIGHLIGHTS, CORPORATE_NEWS, CAREER_OPPORTUNITIES, MEDIA_GALLERY } from './data.js';
import { initLiveAssistanceChat } from './live-chat.js';
import { applyLiveOverrides } from './live-overrides.js';

gsap.registerPlugin(ScrollTrigger);

// Ensure viewport resets to top on initial load and refresh
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('pageshow', () => {
  window.scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }
});

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

    lenis.scrollTo(0, { immediate: true });

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
    if (href && (href === currentPath || (href !== '/' && currentPath.startsWith(href)) || (href === '/news/' && currentPath.startsWith('/media')))) {
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
  { title: "Business Companies Overview", category: "Business / Conglomerate", url: "/business/" },
  { title: "Rayan Engineering & Contracting", category: "Business / Civil & EPC", url: "/business/engineering/" },
  { title: "Rayan Energy", category: "Business / Energy EPC", url: "/business/energy/" },
  { title: "Ashaz Engineering (India)", category: "Business / South Asia Hub", url: "/business/ashaz/" },
  { title: "Rayan Properties (Upcoming)", category: "Business / Luxury Real Estate", url: "/business/properties/" },
  { title: "Mr. Arshad Alam Shaikh — Founder & Chairman, Rayan Group (UAE & India)", category: "Leadership / Founder & Chairman", url: "/leadership/#profiles" },
  { title: "Chairman's Message — Mr. Arshad Alam Shaikh", category: "Leadership / Executive Address", url: "/leadership/#chairman-message" },
  { title: "Mrs. Sadaf Fatma — Chief Executive Officer (CEO), Rayan Group (UAE & India)", category: "Leadership / CEO", url: "/leadership/#profiles" },
  { title: "CEO's Message — Mrs. Sadaf Fatma", category: "Leadership / Executive Address", url: "/leadership/#ceo-message" },
  { title: "Eng. Bakhteyar Alam — Chief Operating Officer (COO)", category: "Leadership / COO", url: "/leadership/#profiles" },
  { title: "Mr. Khalid Umar — Director, Ashaz Engineering", category: "Leadership / Director", url: "/business/ashaz/#board" },
  { title: "Project Portfolio Showcase", category: "Projects", url: "/projects/" },
  { title: "Waldorf Astoria Hotel Luxury Renovation", category: "Projects / Hospitality", url: "/projects/waldorf-astoria-renovation-rak/" },
  { title: "Palm Jumeirah Luxury Waterfront Estate", category: "Projects / Residential", url: "/projects/palm-jumeirah-rec-estate/" },
  { title: "C2 Towers Development, Al Bateen", category: "Projects / High-Rise", url: "/projects/c2-towers-al-bateen/" },
  { title: "Edge Group - REMAYA Tactical Complex", category: "Projects / Defense", url: "/projects/edge-group-remaya/" },
  { title: "Dubai Police Academy Tactical Facility", category: "Projects / Civic", url: "/projects/dubai-police-academy/" },
  { title: "Roxy Cinemas VIP Auditoriums - Dubai Hills", category: "Projects / Entertainment", url: "/projects/roxy-cinema-dubai-hills-mall/" },
  { title: "Luxury Island Oceanfront Infinity Pool", category: "Projects / Aquatic", url: "/projects/luxury-island-infinity-pool/" },
  { title: "Luxury Island Marble & Stone Works", category: "Projects / Masonry", url: "/projects/luxury-island-marble-works/" },
  { title: "Max Fashion Anchor Store - Al Wahda Mall", category: "Projects / Retail", url: "/projects/max-fashion-al-wahda-mall/" },
  { title: "Al Lisaili Luxury Villa Development", category: "Projects / Residential", url: "/projects/al-lisaili-villa/" },
  { title: "Al Qua School Educational Infrastructure", category: "Projects / Infrastructure", url: "/projects/al-qua-school-infrastructure/" },
  { title: "Chipotle Mexican Grill - MBZ Mall", category: "Projects / F&B", url: "/projects/chipotle-mbz-mall/" },
  { title: "Andina Restaurant & Lounge, Dubai Marina", category: "Projects / Hospitality", url: "/projects/andina-restaurant-marina/" },
  { title: "The Noodle House - City Walk Dubai", category: "Projects / Hospitality", url: "/projects/the-noodle-house-city-walk/" },
  { title: "CRC Corporate Offices - Marina Palace", category: "Projects / Commercial", url: "/projects/crc-office-marina-palace/" },
  { title: "Dubai Silicon Oasis Luxury Residence", category: "Projects / Residential", url: "/projects/silicon-oasis-residence/" },
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
// 5. ANIMATED STATISTICS COUNTERS (Increasing Count-Up Animation)
// ==========================================================================
function initStatisticsCounters() {
  const statsElements = document.querySelectorAll('[data-counter-target]');
  if (!statsElements.length) return;

  // Set initial 0 value for smooth ramp-up
  statsElements.forEach(el => {
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    el.textContent = `${prefix}${(0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        obs.unobserve(el);

        const target = parseFloat(el.getAttribute('data-counter-target'));
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
        const customDuration = parseInt(el.getAttribute('data-counter-duration'), 10);

        let duration = 1800;
        if (!isNaN(customDuration) && customDuration > 0) {
          duration = customDuration;
        } else if (target <= 5) {
          duration = 1200;
        } else if (target <= 20) {
          duration = 1500;
        } else {
          duration = 1800;
        }

        const start = 0;
        const startTime = performance.now();
        el.classList.add('counter-animating');

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Smooth easeOutCubic curve
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = start + (target - start) * easeProgress;

          const displayVal = decimals > 0 
            ? current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
            : Math.round(current).toLocaleString();

          el.textContent = `${prefix}${displayVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            const finalVal = decimals > 0 
              ? target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
              : Math.round(target).toLocaleString();
            el.textContent = `${prefix}${finalVal}${suffix}`;
            el.classList.remove('counter-animating');
            el.classList.add('counter-finished');
          }
        }

        requestAnimationFrame(updateCounter);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

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
  // Project category filters & Live search
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-editorial-card');
  const searchInput = document.getElementById('projectSearchInput');
  const counterEl = document.getElementById('projectCounter');

  let activeFilter = 'all';
  let searchQuery = '';

  function updateProjectDisplay() {
    let visibleCount = 0;
    projectCards.forEach(card => {
      const cat = card.getAttribute('data-project-cat') || '';
      const title = (card.getAttribute('data-project-title') || '').toLowerCase();
      const client = (card.getAttribute('data-project-client') || '').toLowerCase();
      const loc = (card.getAttribute('data-project-loc') || '').toLowerCase();
      const text = card.textContent.toLowerCase();

      const matchesCategory = activeFilter === 'all' || cat === activeFilter;
      const matchesSearch = !searchQuery || title.includes(searchQuery) || client.includes(searchQuery) || loc.includes(searchQuery) || text.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (counterEl) {
      counterEl.textContent = `DISPLAYING ${visibleCount} OF ${projectCards.length} EXECUTED ASSETS`;
    }
  }

  if (projectFilterBtns.length && projectCards.length) {
    projectFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        projectFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        updateProjectDisplay();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateProjectDisplay();
    });
  }

  // Media & Project Gallery Lightbox
  const mediaCards = document.querySelectorAll('.media-thumb-card');
  const lightboxModal = document.querySelector('.lightbox-modal');

  if (mediaCards.length && lightboxModal) {
    const lbImg = lightboxModal.querySelector('.lightbox-img');
    const lbCaption = lightboxModal.querySelector('.lightbox-caption-text');
    const lbClose = lightboxModal.querySelector('.lightbox-close');

    mediaCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const caption = card.querySelector('.media-card-title')?.textContent || img?.alt || '';
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
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('open')) {
        lightboxModal.classList.remove('open');
      }
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
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
// THEME SWITCHER (Light Mode / Dark Mode)
// ==========================================================================
function initThemeToggle() {
  const toggleButtons = document.querySelectorAll('.btn-theme-toggle');
  if (!toggleButtons.length) return;

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('rayan_theme', theme);
    } catch (e) {
      console.warn('LocalStorage unavailable for theme storage:', e);
    }
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getCurrentTheme();
      const nextTheme = current === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  });
}

// ==========================================================================
// GLOBAL SITE PRELOADER (Brand Intro with Progress Bar)
// ==========================================================================
function initPreloader() {
  const preloader = document.getElementById('site-preloader');
  if (!preloader) return;

  const fill = document.getElementById('preloader-fill');
  const percent = document.getElementById('preloader-percent');
  const status = document.getElementById('preloader-status');

  let currentPercent = 0;
  const duration = 1100; // 1.1s smooth luxurious brand animation
  const startTime = performance.now();
  let animationDone = false;

  function finishPreloader() {
    if (animationDone) return;
    animationDone = true;

    if (fill) fill.style.width = '100%';
    if (percent) percent.textContent = '100%';
    if (status) status.textContent = 'EXPERIENCE READY';

    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }

    setTimeout(() => {
      preloader.classList.add('preloader-done');
      document.body.classList.remove('preloader-active');
      window.scrollTo(0, 0);
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      ScrollTrigger.refresh();
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 700);
    }, 180);
  }

  function frame(currentTime) {
    if (animationDone) return;
    const elapsed = currentTime - startTime;
    currentPercent = Math.min(100, Math.floor((elapsed / duration) * 100));

    if (fill) fill.style.width = currentPercent + '%';
    if (percent) percent.textContent = currentPercent + '%';

    if (status) {
      if (currentPercent < 35) {
        status.textContent = 'CONNECTING GLOBAL HUBS...';
      } else if (currentPercent < 75) {
        status.textContent = 'LOADING INFRASTRUCTURE PORTFOLIO...';
      } else {
        status.textContent = 'FINALIZING ASSETS...';
      }
    }

    if (currentPercent < 100) {
      requestAnimationFrame(frame);
    } else {
      finishPreloader();
    }
  }

  requestAnimationFrame(frame);

  // Allow clicking anywhere to skip
  preloader.addEventListener('click', finishPreloader);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      finishPreloader();
    }
  });

  // Safety fallback
  setTimeout(finishPreloader, 2200);
}

// ==========================================================================
// 12. NMDC-STYLE BUSINESS UNITS SLIDESHOW CARD
// ==========================================================================
function initBusinessUnitsSlider() {
  const container = document.querySelector('.business-units-section');
  if (!container) return;

  const slides = container.querySelectorAll('.bu-slide');
  const pills = container.querySelectorAll('.bu-pill');
  if (!slides.length || !pills.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideInterval = 5500; // 5.5s autoplay

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    pills.forEach((pill, i) => {
      if (i === currentIndex) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, slideInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Pill click handlers
  pills.forEach((pill, idx) => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(idx);
      startAutoplay(); // Reset interval on interaction
    });
  });

  // Pause on hover / focus
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);
  container.addEventListener('focusin', stopAutoplay);
  container.addEventListener('focusout', startAutoplay);

  // Keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      startAutoplay();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      startAutoplay();
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
      startAutoplay();
    }
  }, { passive: true });

  // Initialize first slide and start autoplay
  goToSlide(0);
  startAutoplay();
}

// ==========================================================================
// 13. LUXURY INTERACTIVE CUSTOM CURSOR
// ==========================================================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  // Only activate on mouse-capable desktop devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth <= 1024) {
    cursor.style.display = 'none';
    dot.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    if (!isVisible) {
      isVisible = true;
      cursor.style.opacity = '1';
      dot.style.opacity = '1';
    }
  }, { passive: true });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Link & Button hover states
  const interactives = document.querySelectorAll('a, button, input, select, textarea, .bu-pill, .division-card, .project-card, .project-editorial-card, .btn-enterprise-primary, .btn-enterprise-secondary');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Project cards special state
  const projectCards = document.querySelectorAll('.project-card, .project-editorial-card');
  projectCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-project');
      const label = cursor.querySelector('.cursor-label');
      if (label) label.textContent = 'EXPLORE';
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-project');
    });
  });
}

// ==========================================================================
// 14. GSAP SCROLL & REVEAL ANIMATIONS
// ==========================================================================
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  // Staggered reveal for section titles & subtitles
  document.querySelectorAll('.section, .page-hero, .business-units-section').forEach((sec) => {
    const title = sec.querySelector('.section-title, .bu-section-title, h2');
    const eyebrow = sec.querySelector('.section-eyebrow, .bu-eyebrow, .bu-top-label');
    const desc = sec.querySelector('.section-subtitle, .bu-section-desc');

    if (title) {
      gsap.from(title, {
        opacity: 0,
        y: 35,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 88%',
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
          start: 'top 90%',
        }
      });
    }

    if (desc) {
      gsap.from(desc, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: desc,
          start: 'top 88%',
        }
      });
    }
  });

  // Division and operating company cards reveal
  if (document.querySelector('.division-card')) {
    gsap.from('.division-card', {
      opacity: 0,
      y: 40,
      stagger: 0.12,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.division-card',
        start: 'top 85%',
      }
    });
  }

  // Project cards reveal
  if (document.querySelector('.project-card, .project-editorial-card')) {
    gsap.from('.project-card, .project-editorial-card', {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.project-card, .project-editorial-card',
        start: 'top 85%',
      }
    });
  }

  // Bu Card reveal
  const buCard = document.querySelector('.bu-card');
  if (buCard) {
    gsap.from(buCard, {
      opacity: 0,
      y: 45,
      scale: 0.98,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: buCard,
        start: 'top 88%',
      }
    });
  }
}

// ==========================================================================
// ASSISTANCE WIDGET & QUICK SUPPORT HUB
// ==========================================================================
function initAssistanceWidget() {
  const triggerBtn = document.getElementById('assistance-trigger-btn');
  const card = document.getElementById('assistance-card');
  const closeBtn = document.getElementById('assistance-close-btn');
  if (!triggerBtn || !card) return;

  function openAssistance() {
    card.classList.add('active');
    triggerBtn.setAttribute('aria-expanded', 'true');
    triggerBtn.classList.add('is-open');
  }

  function closeAssistance() {
    card.classList.remove('active');
    triggerBtn.setAttribute('aria-expanded', 'false');
    triggerBtn.classList.remove('is-open');
  }

  function toggleAssistance() {
    if (card.classList.contains('active')) {
      closeAssistance();
    } else {
      openAssistance();
    }
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAssistance();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAssistance();
    });
  }

  const chatCloseBtn = document.getElementById('chat-close-btn');
  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAssistance();
    });
  }

  document.addEventListener('click', (e) => {
    if (!card.contains(e.target) && !triggerBtn.contains(e.target)) {
      closeAssistance();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && card.classList.contains('active')) {
      closeAssistance();
    }
  });

  // Initialize live assistance interactive chat controller
  initLiveAssistanceChat();
}

// Start preloader as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader);
} else {
  initPreloader();
}

// ==========================================================================
// DOM READY INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }

  initCustomCursor();
  initThemeToggle();
  initHeader();
  initMobileNavigation();
  initSearchModal();
  initHeroSlideshow();
  initBusinessUnitsSlider();
  initStatisticsCounters();
  initInvestorTables();
  initFilterTabs();
  initForms();
  initBackToTop();
  initScrollAnimations();
  initAssistanceWidget();
  applyLiveOverrides();

  // Discreet keyboard shortcut for Corporate Admin Panel (Ctrl + Shift + A)
  // Admin panel is hidden from public navigation per security requirements
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = '/admin/';
    }
  });

  // Triple-click on footer copyright to navigate to admin panel
  const footerCopy = document.querySelector('.footer-copyright, .footer-bottom-copy');
  if (footerCopy) {
    let clickCount = 0;
    let clickTimer = null;
    footerCopy.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        window.location.href = '/admin/';
      }
      clickTimer = setTimeout(() => { clickCount = 0; }, 600);
    });
  }
});

// Window load safety check to guarantee viewport is anchored to top
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }
  ScrollTrigger.refresh();
});




