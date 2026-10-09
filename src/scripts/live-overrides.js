// ============================================================================
// RAYAN GROUP — LIVE SITE CONTENT OVERRIDES ENGINE
// Hydrates the live website with real-time modifications made via Admin Portal
// ============================================================================

export function getSiteOverrides() {
  try {
    const raw = localStorage.getItem('rayan_site_overrides');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveSiteOverrides(data) {
  try {
    localStorage.setItem('rayan_site_overrides', JSON.stringify(data));
    // Notify open tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rayan_site_sync_channel');
      bc.postMessage({ type: 'SITE_CONTENT_UPDATED', data });
    }
  } catch (e) {
    console.error('Failed to save site overrides', e);
  }
}

export function applyLiveOverrides() {
  const overrides = getSiteOverrides();
  if (!overrides) return;

  // 1. Group Identity & Taglines
  if (overrides.groupInfo) {
    const g = overrides.groupInfo;
    if (g.tagline) {
      document.querySelectorAll('.preloader-tagline, .hero-lead-text, .site-tagline').forEach(el => {
        if (el.classList.contains('preloader-tagline')) el.textContent = g.tagline;
      });
    }

    if (g.subTagline) {
      document.querySelectorAll('.hero-eyebrow-badge, .site-subtagline').forEach(el => {
        if (!el.closest('.hero-slide-item:not(:first-child)')) {
          el.innerHTML = g.subTagline.split('•').map(s => `<span>${s.trim()}</span>`).join(' • ');
        }
      });
    }

    // Phone numbers across site
    if (g.headquarters?.uae?.phone) {
      const cleanPhone = g.headquarters.uae.phone.replace(/[^0-9+]/g, '');
      document.querySelectorAll('a[href^="tel:+971"], .hq-uae-phone-text').forEach(a => {
        if (a.tagName === 'A') a.setAttribute('href', `tel:${cleanPhone}`);
        const desc = a.querySelector('.assistance-opt-desc');
        if (desc) desc.textContent = `${g.headquarters.uae.phone} (Abu Dhabi, UAE)`;
        else if (a.classList.contains('hq-uae-phone-text')) a.textContent = g.headquarters.uae.phone;
      });
    }

    if (g.headquarters?.india?.phone) {
      const cleanIndPhone = g.headquarters.india.phone.replace(/[^0-9+]/g, '');
      document.querySelectorAll('a[href^="tel:+91"], .hq-ind-phone-text').forEach(a => {
        if (a.tagName === 'A') a.setAttribute('href', `tel:${cleanIndPhone}`);
        const desc = a.querySelector('.assistance-opt-desc');
        if (desc) desc.textContent = `${g.headquarters.india.phone} (Ashaz Engineering)`;
        else if (a.classList.contains('hq-ind-phone-text')) a.textContent = g.headquarters.india.phone;
      });
    }

    // Emails
    if (g.headquarters?.uae?.email) {
      document.querySelectorAll('a[href^="mailto:rayan@rayan-group.com"], a.opt-email').forEach(a => {
        a.setAttribute('href', `mailto:${g.headquarters.uae.email}`);
        const desc = a.querySelector('.assistance-opt-desc');
        if (desc) desc.textContent = g.headquarters.uae.email;
        else if (!a.querySelector('*')) a.textContent = g.headquarters.uae.email;
      });
    }

    // Addresses
    if (g.headquarters?.uae?.address) {
      document.querySelectorAll('.uae-address-text').forEach(el => {
        el.textContent = g.headquarters.uae.address;
      });
    }
    if (g.headquarters?.india?.address) {
      document.querySelectorAll('.india-address-text').forEach(el => {
        el.textContent = g.headquarters.india.address;
      });
    }

    // Vision & Mission
    if (g.vision) {
      document.querySelectorAll('.corporate-vision-text').forEach(el => { el.textContent = g.vision; });
    }
    if (g.mission) {
      document.querySelectorAll('.corporate-mission-text').forEach(el => { el.textContent = g.mission; });
    }

    // Chairman & CEO Messages
    if (g.chairmanMessage) {
      const cm = document.getElementById('chairman-message-text');
      if (cm) cm.textContent = g.chairmanMessage;
    }
    if (g.ceoMessage) {
      const cm = document.getElementById('ceo-message-text');
      if (cm) cm.textContent = g.ceoMessage;
    }

    // Social Media Links
    if (g.socials) {
      if (g.socials.linkedin) document.querySelectorAll('.btn-social-linkedin, a[href*="linkedin.com"]').forEach(a => a.href = g.socials.linkedin);
      if (g.socials.instagram) document.querySelectorAll('.btn-social-instagram, a[href*="instagram.com"]').forEach(a => a.href = g.socials.instagram);
      if (g.socials.facebook) document.querySelectorAll('.btn-social-facebook, a[href*="facebook.com"]').forEach(a => a.href = g.socials.facebook);
      if (g.socials.twitter) document.querySelectorAll('.btn-social-x, a[href*="x.com"]').forEach(a => a.href = g.socials.twitter);
      if (g.socials.youtube) document.querySelectorAll('.btn-social-youtube, a[href*="youtube.com"]').forEach(a => a.href = g.socials.youtube);
    }
  }

  // 2. Hero Slideshow
  if (Array.isArray(overrides.heroSlides)) {
    const slides = document.querySelectorAll('.hero-slideshow-wrap .hero-slide-item');
    overrides.heroSlides.forEach((slideData, idx) => {
      const slide = slides[idx];
      if (!slide) return;
      if (slideData.eyebrow) {
        const eye = slide.querySelector('.hero-eyebrow-badge');
        if (eye) eye.innerHTML = slideData.eyebrow;
      }
      if (slideData.title) {
        const title = slide.querySelector('.hero-giant-title');
        if (title) title.textContent = slideData.title;
      }
      if (slideData.leadText) {
        const lead = slide.querySelector('.hero-lead-text');
        if (lead) lead.textContent = slideData.leadText;
      }
      if (slideData.btn1Text) {
        const btn1 = slide.querySelector('.hero-actions-row .btn-enterprise-primary span');
        if (btn1) btn1.textContent = slideData.btn1Text;
      }
      if (slideData.btn1Link) {
        const btn1 = slide.querySelector('.hero-actions-row .btn-enterprise-primary');
        if (btn1) btn1.setAttribute('href', slideData.btn1Link);
      }
      if (slideData.btn2Text) {
        const btn2 = slide.querySelector('.hero-actions-row .btn-enterprise-secondary span');
        if (btn2) btn2.textContent = slideData.btn2Text;
        else {
          const btn2Direct = slide.querySelector('.hero-actions-row .btn-enterprise-secondary');
          if (btn2Direct) btn2Direct.textContent = slideData.btn2Text;
        }
      }
      if (slideData.btn2Link) {
        const btn2 = slide.querySelector('.hero-actions-row .btn-enterprise-secondary');
        if (btn2) btn2.setAttribute('href', slideData.btn2Link);
      }
    });
  }

  // 3. Institutional Statistics
  if (overrides.stats) {
    const s = overrides.stats;
    document.querySelectorAll('.stat-counter-card').forEach(card => {
      const label = card.querySelector('.stat-counter-label')?.textContent?.trim()?.toUpperCase() || '';
      const valEl = card.querySelector('.stat-counter-val');
      const descEl = card.querySelector('.stat-counter-desc');
      if (!valEl) return;

      if (label.includes('YEARS') && s.heritageYears) {
        valEl.textContent = s.heritageYears;
        if (descEl && s.heritageDesc) descEl.textContent = s.heritageDesc;
      } else if (label.includes('PROJECTS') && s.verifiedProjects) {
        valEl.textContent = s.verifiedProjects;
        if (descEl && s.projectsDesc) descEl.textContent = s.projectsDesc;
      } else if (label.includes('ENTITIES') && s.operatingEntities) {
        valEl.textContent = s.operatingEntities;
        if (descEl && s.entitiesDesc) descEl.textContent = s.entitiesDesc;
      } else if (label.includes('ACCREDITED') && s.isoBadge) {
        valEl.textContent = s.isoBadge;
        if (descEl && s.isoDesc) descEl.textContent = s.isoDesc;
      }
    });
  }

  // 4. Operating Companies & Subsidiaries
  if (Array.isArray(overrides.companies)) {
    overrides.companies.forEach((comp, idx) => {
      // In NMDC slider
      const buSlide = document.querySelector(`.bu-slide[data-slide="${idx}"]`);
      if (buSlide) {
        const title = buSlide.querySelector('.bu-company-title');
        if (title && comp.name) title.textContent = comp.name;
        const desc = buSlide.querySelector('.bu-company-desc');
        if (desc && comp.description) desc.textContent = comp.description;
        const badge = buSlide.querySelector('.bu-badge');
        if (badge && comp.sector) badge.textContent = comp.sector;
      }
      // In division card grid
      const divCards = document.querySelectorAll('.division-card');
      if (divCards[idx]) {
        const cardTitle = divCards[idx].querySelector('h3');
        if (cardTitle && comp.name) cardTitle.textContent = comp.name.toUpperCase();
        const cardDesc = divCards[idx].querySelector('p');
        if (cardDesc && comp.headline) cardDesc.textContent = comp.headline;
      }
    });
  }

  // 5. Stock / ADX ticker
  if (overrides.financialTicker || overrides.financials) {
    const t = overrides.financialTicker || {};
    const g = overrides.groupInfo || {};
    const price = t.price || g.stockPrice;
    const change = t.change || g.stockChange;
    const changePct = t.changePercent || g.stockChangePercent;
    const curr = t.currency || g.currency || 'AED';

    const tickerPrice = document.querySelector('.ticker-price');
    if (tickerPrice && price) tickerPrice.textContent = `${price} ${curr}`;
    const tickerChange = document.querySelector('.ticker-change');
    if (tickerChange && change) tickerChange.textContent = `${change} (${changePct})`;
  }

  // 6. Assistance Widget Config
  if (overrides.widgetSettings) {
    const w = overrides.widgetSettings;
    const welcomeBubble = document.getElementById('welcome-msg-text');
    if (welcomeBubble && w.welcomeText) {
      welcomeBubble.textContent = w.welcomeText;
    }
    const statusPill = document.querySelector('.assistance-header-status-pill');
    if (statusPill && w.deskStatus) {
      statusPill.innerHTML = `<span class="header-live-dot" aria-hidden="true"></span> ${w.deskStatus.toUpperCase()}`;
    }
  }
}

// Listen for updates across tabs
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const bc = new BroadcastChannel('rayan_site_sync_channel');
    bc.onmessage = (event) => {
      if (event.data?.type === 'SITE_CONTENT_UPDATED') {
        applyLiveOverrides();
      }
    };
  } catch (e) {}
}
