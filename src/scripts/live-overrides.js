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
    if ('BroadcastChannel' in window) {
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

  // 1. Group info
  if (overrides.groupInfo) {
    const g = overrides.groupInfo;
    if (g.tagline) {
      document.querySelectorAll('.preloader-tagline, .hero-lead-text').forEach(el => {
        if (el.classList.contains('preloader-tagline')) el.textContent = g.tagline;
      });
    }

    // Phone updates
    if (g.headquarters?.uae?.phone) {
      document.querySelectorAll('a[href^="tel:+971"]').forEach(a => {
        a.setAttribute('href', `tel:${g.headquarters.uae.phone.replace(/[^0-9+]/g, '')}`);
        const desc = a.querySelector('.assistance-opt-desc');
        if (desc) desc.textContent = `${g.headquarters.uae.phone} (Abu Dhabi, UAE)`;
      });
    }
    if (g.headquarters?.india?.phone) {
      document.querySelectorAll('a[href^="tel:+91"]').forEach(a => {
        a.setAttribute('href', `tel:${g.headquarters.india.phone.replace(/[^0-9+]/g, '')}`);
        const desc = a.querySelector('.assistance-opt-desc');
        if (desc) desc.textContent = `${g.headquarters.india.phone} (Ashaz Engineering)`;
      });
    }

    // Email updates
    if (g.headquarters?.uae?.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        if (a.getAttribute('href').includes('rayan@rayan-group.com') || a.classList.contains('opt-email')) {
          a.setAttribute('href', `mailto:${g.headquarters.uae.email}`);
          const desc = a.querySelector('.assistance-opt-desc');
          if (desc) desc.textContent = g.headquarters.uae.email;
        }
      });
    }
  }

  // 2. Stock / ADX ticker
  if (overrides.financialTicker) {
    const t = overrides.financialTicker;
    const tickerPrice = document.querySelector('.ticker-price');
    if (tickerPrice && t.price) tickerPrice.textContent = `${t.price} ${t.currency || 'AED'}`;
    const tickerChange = document.querySelector('.ticker-change');
    if (tickerChange && t.change) tickerChange.textContent = `${t.change} (${t.changePercent})`;
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
