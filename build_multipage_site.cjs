const fs = require('fs');
const path = require('path');

// Helper to ensure directory exists
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 0. Shared Global Preloader (Brand Intro & Loading Progress Bar)
function renderPreloader() {
  return `
  <!-- ==========================================================================
       GLOBAL PRELOADER (Brand Intro & Loading Progress Bar)
       ========================================================================== -->
  <div id="site-preloader" class="site-preloader" aria-hidden="true">
    <div class="preloader-inner">
      <div class="preloader-logo-wrap">
        <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="preloader-logo logo-theme-dark" width="280" height="80">
        <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="preloader-logo logo-theme-light" width="280" height="80">
      </div>
      <div class="preloader-tagline">ENGINEERING • ENERGY • INFRASTRUCTURE</div>
      <div class="preloader-progress-wrap">
        <div class="preloader-progress-bar">
          <div class="preloader-progress-fill" id="preloader-fill"></div>
        </div>
        <div class="preloader-progress-meta">
          <span class="preloader-status-text" id="preloader-status">INITIALIZING SYSTEMS...</span>
          <span class="preloader-percentage" id="preloader-percent">0%</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

// 1. Shared Header Template
function renderHeader(activePath = '/') {
  return `
  <!-- ==========================================================================
       GLOBAL ENTERPRISE HEADER
       ========================================================================== -->
  <header class="site-header" role="banner">
    <!-- Top Bar -->
    <div class="header-top-bar container">
      <div class="header-top-left">
        <span class="header-hub-badge">
          <span class="header-live-dot" aria-hidden="true"></span>
          <span class="header-hub-text"><strong>DUAL-HUB:</strong> UAE 🇦🇪 &amp; INDIA 🇮🇳 • ISO 9001:2015 | 14001:2015 | 45001:2018</span>
        </span>
      </div>
      <div class="header-top-right">
        <!-- Official Connected Social Media Channels -->
        <div class="header-social-strip" aria-label="Official Social Channels">
          <a href="https://www.linkedin.com/company/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="header-social-btn btn-social-linkedin" title="LinkedIn: rayangroupinc" aria-label="Follow Rayan Group on LinkedIn">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z"/></svg>
          </a>
          <a href="https://www.youtube.com/@rayangroupinc" target="_blank" rel="noopener noreferrer" class="header-social-btn btn-social-youtube" title="YouTube: @rayangroupinc" aria-label="Subscribe to Rayan Group on YouTube">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42c-.87.23-1.54.91-1.76 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.87.9 1.54 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3-5.2 3Z"/></svg>
          </a>
          <a href="https://x.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="header-social-btn btn-social-x" title="X (Twitter): @rayangroupinc" aria-label="Follow Rayan Group on X">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.facebook.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="header-social-btn btn-social-facebook" title="Facebook: @rayangroupinc" aria-label="Follow Rayan Group on Facebook">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12Z"/></svg>
          </a>
          <a href="https://www.instagram.com/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="header-social-btn btn-social-instagram" title="Instagram: @rayangroupinc" aria-label="Follow Rayan Group on Instagram">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
          </a>
        </div>
        <span class="header-top-divider" aria-hidden="true"></span>
        <a href="/procurement/" class="header-top-link">Suppliers Portal</a>
        <a href="/billing/" class="header-top-link">Billing Desk</a>
        <a href="/news/" class="header-top-link">News &amp; Media</a>
        <span class="header-top-divider" aria-hidden="true"></span>
        <button type="button" class="lang-switch-btn" aria-label="Language selector">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.3rem;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>EN | العربية</span>
        </button>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="header-main-nav container">
      <a href="/" class="brand-logo-wrap" aria-label="Rayan Group Home">
        <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="brand-logo-img logo-theme-dark" width="176" height="50">
        <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="brand-logo-img logo-theme-light" width="176" height="50">
      </a>

      <!-- Desktop Primary Navigation -->
      <nav class="desktop-nav" role="navigation" aria-label="Primary Navigation">
        <ul class="main-nav-links">
          <!-- ABOUT -->
          <li class="nav-item ${activePath.startsWith('/about') || activePath.startsWith('/leadership') ? 'active' : ''}">
            <a href="/about/" class="nav-link">
              <span>About</span>
              <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu-panel">
              <div class="mega-grid">
                <div class="mega-intro-col">
                  <span class="mega-cat-badge">CORPORATE PROFILE</span>
                  <h3 class="mega-cat-title">WHO WE ARE</h3>
                  <p class="mega-cat-desc">A multinational engineering, infrastructure and energy conglomerate delivering excellence across the UAE and South Asia.</p>
                  <a href="/about/" class="mega-cat-explore">Explore About Group →</a>
                </div>
                <div class="mega-links-grid">
                  <a href="/about/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Who We Are</span><span>→</span></div>
                    <div class="mega-link-desc">Group history, core values, dual-hub presence, and 50+ years combined leadership heritage.</div>
                  </a>
                  <a href="/leadership/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Executive Leadership</span><span>→</span></div>
                    <div class="mega-link-desc">Board of Directors, Executive Committee, and corporate governance.</div>
                  </a>
                  <a href="/about/#timeline" class="mega-sub-link">
                    <div class="mega-link-title"><span>Corporate Timeline</span><span>→</span></div>
                    <div class="mega-link-desc">Milestones from 2021 founding to multinational expansion.</div>
                  </a>
                  <a href="/news/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Corporate Newsroom</span><span>→</span></div>
                    <div class="mega-link-desc">Latest press releases, executive announcements &amp; project updates.</div>
                  </a>
                </div>
                <div class="mega-featured-card">
                  <img src="/assets/images/about/overview.jpg" alt="Rayan Group Headquarters" class="mega-featured-img">
                  <div class="mega-featured-overlay">
                    <span class="mega-featured-tag">LEADERSHIP HERITAGE</span>
                    <h4 class="mega-featured-title">50+ Years Combined Engineering Heritage</h4>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- BUSINESSES -->
          <li class="nav-item ${activePath.startsWith('/business') ? 'active' : ''}">
            <a href="/business/" class="nav-link">
              <span>Businesses</span>
              <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu-panel" style="min-width: 920px;">
              <div class="mega-grid">
                <div class="mega-intro-col">
                  <span class="mega-cat-badge">OPERATING SUBSIDIARIES</span>
                  <h3 class="mega-cat-title">OUR COMPANIES</h3>
                  <p class="mega-cat-desc">Integrated engineering horsepower across civil contracting, critical energy EPC, South Asia industrial fabrication, and premier property development.</p>
                  <a href="/business/" class="mega-cat-explore">All Operating Companies →</a>
                </div>
                <div class="mega-links-grid" style="grid-template-columns: 1fr 1fr;">
                  <a href="/business/engineering/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Rayan Engineering</span><span>→</span></div>
                    <div class="mega-link-desc">Flagship civil EPC, high-rise towers, luxury hospitality &amp; industrial complexes.</div>
                  </a>
                  <a href="/business/energy/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Rayan Energy</span><span>→</span></div>
                    <div class="mega-link-desc">Mission-critical energy facilities, hydrocarbon pipelines &amp; process plants.</div>
                  </a>
                  <a href="/business/ashaz/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Ashaz Engineering (India)</span><span>→</span></div>
                    <div class="mega-link-desc">South Asia regional engineering hub, heavy structural fabrication &amp; industrial works.</div>
                  </a>
                  <a href="/business/properties/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Rayan Properties <span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); border-radius: 999px; padding: 0.15rem 0.5rem; margin-left: 0.4rem; vertical-align: middle;">UPCOMING</span></span><span>→</span></div>
                    <div class="mega-link-desc">Premier luxury waterfront estates, residential master plans &amp; commercial towers.</div>
                  </a>
                </div>
                <div class="mega-featured-card">
                  <img src="/assets/images/business/01-engineering.jpg" alt="Rayan Group Companies" class="mega-featured-img">
                  <div class="mega-featured-overlay">
                    <span class="mega-featured-tag">CONGLOMERATE ECOSYSTEM</span>
                    <h4 class="mega-featured-title">Operating Subsidiaries Across the UAE &amp; South Asia</h4>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- PROJECTS -->
          <li class="nav-item ${activePath.startsWith('/projects') ? 'active' : ''}">
            <a href="/projects/" class="nav-link">
              <span>Projects</span>
              <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu-panel">
              <div class="mega-grid">
                <div class="mega-intro-col">
                  <span class="mega-cat-badge">VERIFIED PORTFOLIO</span>
                  <h3 class="mega-cat-title">OUR PROJECTS</h3>
                  <p class="mega-cat-desc">A proven track record of landmark commercial, luxury hospitality, waterfront residential, and civic megaprojects.</p>
                  <a href="/projects/" class="mega-cat-explore">View All 16 Projects →</a>
                </div>
                <div class="mega-links-grid">
                  <a href="/projects/waldorf-astoria-renovation-rak/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Waldorf Astoria Luxury Overhaul</span><span>→</span></div>
                    <div class="mega-link-desc">5-star luxury hospitality renovation in Ras Al Khaimah.</div>
                  </a>
                  <a href="/projects/palm-jumeirah-rec-estate/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Palm Jumeirah Waterfront Estate</span><span>→</span></div>
                    <div class="mega-link-desc">Bespoke ultra-luxury private coastal residential estate.</div>
                  </a>
                  <a href="/projects/c2-towers-al-bateen/" class="mega-sub-link">
                    <div class="mega-link-title"><span>C2 Towers Twin High-Rise</span><span>→</span></div>
                    <div class="mega-link-desc">Twin 22-story luxury waterfront residential development.</div>
                  </a>
                  <a href="/projects/edge-group-remaya/" class="mega-sub-link">
                    <div class="mega-link-title"><span>EDGE Group REMAYA Complex</span><span>→</span></div>
                    <div class="mega-link-desc">Specialized defense tactical shooting complex &amp; ballistic works.</div>
                  </a>
                  <a href="/projects/luxury-island-infinity-pool/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Luxury Island Oceanfront Pool</span><span>→</span></div>
                    <div class="mega-link-desc">Cantilevered concrete pool engineering &amp; coastal landscaping.</div>
                  </a>
                  <a href="/projects/roxy-cinema-dubai-hills-mall/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Roxy Cinemas Dubai Hills Mall</span><span>→</span></div>
                    <div class="mega-link-desc">Acoustic isolation engineering &amp; VIP auditorium fit-out.</div>
                  </a>
                </div>
                <div class="mega-featured-card">
                  <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Luxury Renovation" class="mega-featured-img">
                  <div class="mega-featured-overlay">
                    <span class="mega-featured-tag">FLAGSHIP SHOWCASE</span>
                    <h4 class="mega-featured-title">Signature Deliveries Across UAE &amp; Region</h4>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- SUSTAINABILITY -->
          <li class="nav-item ${activePath.startsWith('/sustainability') ? 'active' : ''}">
            <a href="/sustainability/" class="nav-link">
              <span>Sustainability</span>
            </a>
          </li>

          <!-- PORTALS (PROPOSAL, PROCUREMENT, BILLING, DIRECTORY) -->
          <li class="nav-item ${activePath.startsWith('/proposal') || activePath.startsWith('/procurement') || activePath.startsWith('/billing') ? 'active' : ''}">
            <a href="/proposal/" class="nav-link">
              <span>Portals</span>
              <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu-panel">
              <div class="mega-grid">
                <div class="mega-intro-col">
                  <span class="mega-cat-badge">CLIENT &amp; VENDOR PORTAL</span>
                  <h3 class="mega-cat-title">ENTERPRISE PORTALS</h3>
                  <p class="mega-cat-desc">Streamlined corporate workflows for tenders, vendor prequalification, and accounts status verification.</p>
                  <a href="/proposal/" class="mega-cat-explore">Submit a Proposal Request →</a>
                </div>
                <div class="mega-links-grid">
                  <a href="/proposal/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Request a Proposal (RFP)</span><span>→</span></div>
                    <div class="mega-link-desc">Submit your project tender, BOQ specifications, or scope details for quotation.</div>
                  </a>
                  <a href="/procurement/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Suppliers &amp; Procurement</span><span>→</span></div>
                    <div class="mega-link-desc">Vendor registration, prequalification criteria, documentation checklist &amp; AVL onboarding.</div>
                  </a>
                  <a href="/billing/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Billing &amp; Accounts Desk</span><span>→</span></div>
                    <div class="mega-link-desc">Invoice status verification, vendor billing assistance, PO queries &amp; accounts contacts.</div>
                  </a>
                  <a href="/contact/" class="mega-sub-link">
                    <div class="mega-link-title"><span>Global Office Directory</span><span>→</span></div>
                    <div class="mega-link-desc">Direct telephone and email contact points across Abu Dhabi, Dubai, and India.</div>
                  </a>
                </div>
                <div class="mega-featured-card">
                  <img src="/assets/images/about/overview.jpg" alt="Enterprise Portals" class="mega-featured-img">
                  <div class="mega-featured-overlay">
                    <span class="mega-featured-tag">DIRECT WORKFLOWS</span>
                    <h4 class="mega-featured-title">Fast-Track Tender &amp; Vendor Engagement</h4>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <!-- CAREERS -->
          <li class="nav-item ${activePath.startsWith('/careers') ? 'active' : ''}">
            <a href="/careers/" class="nav-link">
              <span>Careers</span>
            </a>
          </li>

          <!-- CONTACT -->
          <li class="nav-item ${activePath.startsWith('/contact') ? 'active' : ''}">
            <a href="/contact/" class="nav-link">
              <span>Contact</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Action Buttons -->
      <div class="header-actions">
        <!-- Theme Mode Switcher -->
        <button type="button" class="btn-theme-toggle" aria-label="Toggle light and dark theme" title="Toggle Theme (Light/Dark)">
          <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button type="button" class="btn-search-trigger" aria-label="Open global search" title="Search (Ctrl+K)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span class="search-key-badge" aria-hidden="true">Ctrl K</span>
        </button>
        <a href="/proposal/" class="btn-enterprise-primary btn-header-cta">
          <span>REQUEST A PROPOSAL</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <!-- Mobile Menu Hamburger Button -->
        <button type="button" class="btn-mobile-menu-toggle" aria-label="Toggle mobile navigation menu" aria-expanded="false" aria-controls="mobileNavDrawer">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>
      </div>
    </div>
  </header>
  `;
}

// 1.1 Full-Screen Mobile Drawer Renderer
function renderMobileDrawer(activePath = '/') {
  return `
  <!-- Full-Screen Enterprise Mobile Navigation Drawer -->
  <div class="mobile-nav-drawer" id="mobileNavDrawer" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="mobile-drawer-header">
      <a href="/" class="mobile-drawer-brand" aria-label="Rayan Group Home">
        <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="logo-theme-dark" width="160" height="46">
        <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="logo-theme-light" width="160" height="46">
      </a>
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <button type="button" class="btn-theme-toggle mobile-theme-btn" aria-label="Toggle light and dark theme" title="Toggle Theme (Light/Dark)">
          <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button type="button" class="mobile-drawer-close" aria-label="Close navigation menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="mobile-drawer-ticker" style="justify-content: center;">
      <div class="mobile-hub-text" style="display: inline-flex; align-items: center; gap: 0.45rem;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #0099e6;"></span>
        DUAL-HUB: UAE 🇦🇪 &amp; INDIA 🇮🇳 • ISO 9001/14001/45001
      </div>
    </div>

    <div class="mobile-drawer-body">
      <nav class="mobile-nav-menu" role="navigation">
        <!-- ABOUT -->
        <div class="mobile-nav-group ${activePath.startsWith('/about') || activePath.startsWith('/leadership') ? 'active' : ''}">
          <button type="button" class="mobile-group-header" aria-expanded="false">
            <span>ABOUT RAYAN</span>
            <svg class="mobile-group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="mobile-group-links">
            <a href="/about/" class="mobile-sublink ${activePath === '/about/' ? 'active' : ''}">Who We Are &amp; History</a>
            <a href="/leadership/" class="mobile-sublink ${activePath === '/leadership/' ? 'active' : ''}">Executive Leadership &amp; Board</a>
            <a href="/about/#timeline" class="mobile-sublink">Corporate Timeline</a>
            <a href="/sustainability/" class="mobile-sublink">HSE &amp; ESG Strategy</a>
          </div>
        </div>

        <!-- BUSINESSES -->
        <div class="mobile-nav-group ${activePath.startsWith('/business') ? 'active' : ''}">
          <button type="button" class="mobile-group-header" aria-expanded="false">
            <span>BUSINESSES &amp; SUBSIDIARIES</span>
            <svg class="mobile-group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="mobile-group-links">
            <a href="/business/" class="mobile-sublink ${activePath === '/business/' ? 'active' : ''}">All Operating Companies</a>
            <a href="/business/engineering/" class="mobile-sublink ${activePath === '/business/engineering/' ? 'active' : ''}">Rayan Engineering</a>
            <a href="/business/energy/" class="mobile-sublink ${activePath === '/business/energy/' ? 'active' : ''}">Rayan Energy</a>
            <a href="/business/ashaz/" class="mobile-sublink ${activePath === '/business/ashaz/' ? 'active' : ''}">Ashaz Engineering (India)</a>
            <a href="/business/properties/" class="mobile-sublink ${activePath === '/business/properties/' ? 'active' : ''}">Rayan Properties (Upcoming)</a>
          </div>
        </div>

        <!-- PROJECTS -->
        <div class="mobile-nav-group ${activePath.startsWith('/projects') ? 'active' : ''}">
          <button type="button" class="mobile-group-header" aria-expanded="false">
            <span>PROJECTS</span>
            <svg class="mobile-group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="mobile-group-links">
            <a href="/projects/" class="mobile-sublink ${activePath === '/projects/' ? 'active' : ''}">All 16 Projects Showcase</a>
            <a href="/projects/waldorf-astoria-renovation-rak/" class="mobile-sublink">Waldorf Astoria Luxury Overhaul</a>
            <a href="/projects/palm-jumeirah-rec-estate/" class="mobile-sublink">Palm Jumeirah Waterfront Estate</a>
            <a href="/projects/c2-towers-al-bateen/" class="mobile-sublink">C2 Towers Al Bateen</a>
            <a href="/projects/edge-group-remaya/" class="mobile-sublink">EDGE Group REMAYA Complex</a>
            <a href="/projects/luxury-island-infinity-pool/" class="mobile-sublink">Luxury Island Infinity Pool</a>
            <a href="/projects/roxy-cinema-dubai-hills-mall/" class="mobile-sublink">Roxy Cinemas Dubai Hills</a>
          </div>
        </div>

        <!-- BUSINESS SERVICES -->
        <div class="mobile-nav-group ${activePath.startsWith('/proposal') || activePath.startsWith('/procurement') || activePath.startsWith('/billing') ? 'active' : ''}">
          <button type="button" class="mobile-group-header" aria-expanded="false">
            <span>BUSINESS SERVICES</span>
            <svg class="mobile-group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="mobile-group-links">
            <a href="/proposal/" class="mobile-sublink ${activePath === '/proposal/' ? 'active' : ''}">Request a Proposal (RFP)</a>
            <a href="/procurement/" class="mobile-sublink ${activePath === '/procurement/' ? 'active' : ''}">Suppliers &amp; Procurement Portal</a>
            <a href="/billing/" class="mobile-sublink ${activePath === '/billing/' ? 'active' : ''}">Billing &amp; Accounts Desk</a>
          </div>
        </div>

        <!-- DIRECT LINKS -->
        <a href="/sustainability/" class="mobile-direct-navlink ${activePath === '/sustainability/' ? 'active' : ''}">
          <span>SUSTAINABILITY &amp; HSE</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/careers/" class="mobile-direct-navlink ${activePath === '/careers/' ? 'active' : ''}">
          <span>CAREERS &amp; TALENT POOL</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/news/" class="mobile-direct-navlink ${activePath === '/news/' ? 'active' : ''}">
          <span>CORPORATE NEWSROOM</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/contact/" class="mobile-direct-navlink ${activePath === '/contact/' ? 'active' : ''}">
          <span>GLOBAL CONTACT</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </nav>

      <!-- Official Connected Social Channels in Mobile Drawer -->
      <div class="mobile-drawer-socials">
        <span class="mobile-socials-label">CONNECT WITH RAYAN GROUP</span>
        <div class="mobile-socials-grid">
          <a href="https://www.linkedin.com/company/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="mob-social-card mob-card-linkedin">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z"/></svg>
            <div class="mob-social-meta">
              <span class="mob-social-title">LinkedIn</span>
              <span class="mob-social-handle">@rayangroupinc</span>
            </div>
            <span class="mob-social-arrow">↗</span>
          </a>
          <a href="https://www.youtube.com/@rayangroupinc" target="_blank" rel="noopener noreferrer" class="mob-social-card mob-card-youtube">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42c-.87.23-1.54.91-1.76 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.87.9 1.54 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3-5.2 3Z"/></svg>
            <div class="mob-social-meta">
              <span class="mob-social-title">YouTube</span>
              <span class="mob-social-handle">@rayangroupinc</span>
            </div>
            <span class="mob-social-arrow">↗</span>
          </a>
          <a href="https://x.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="mob-social-card mob-card-x">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <div class="mob-social-meta">
              <span class="mob-social-title">X (Twitter)</span>
              <span class="mob-social-handle">@rayangroupinc</span>
            </div>
            <span class="mob-social-arrow">↗</span>
          </a>
          <a href="https://www.facebook.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="mob-social-card mob-card-facebook">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12Z"/></svg>
            <div class="mob-social-meta">
              <span class="mob-social-title">Facebook</span>
              <span class="mob-social-handle">@rayangroupinc</span>
            </div>
            <span class="mob-social-arrow">↗</span>
          </a>
          <a href="https://www.instagram.com/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="mob-social-card mob-card-instagram">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
            <div class="mob-social-meta">
              <span class="mob-social-title">Instagram</span>
              <span class="mob-social-handle">@rayangroupinc</span>
            </div>
            <span class="mob-social-arrow">↗</span>
          </a>
        </div>
      </div>

      <div class="mobile-drawer-footer">
        <a href="/proposal/" class="btn-enterprise-primary mobile-btn-full" style="justify-content: center;">
          <span>REQUEST A PROPOSAL →</span>
        </a>
        <div class="mobile-drawer-contact-block" style="margin-top: 1rem; font-size: 0.78rem; color: #94a3b8; line-height: 1.5;">
          <div><strong>Corporate HQ:</strong> +971-25654497</div>
          <div><strong>Inquiries:</strong> info@rayan-group.com</div>
          <div>Mussafah M-36, Abu Dhabi, UAE</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

// 2. Shared Search Modal
function renderSearchModal() {
  return `
  <!-- ==========================================================================
       GLOBAL SEARCH MODAL
       ========================================================================== -->
  <div class="search-modal-backdrop" role="dialog" aria-modal="true" aria-label="Global Search">
    <div class="search-modal-container">
      <div class="search-modal-header">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0099e6" stroke-width="2.2" style="margin-right: 0.75rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" class="search-modal-input" placeholder="Search pages, reports, projects, financials..." aria-label="Search site">
        <button type="button" class="search-modal-close" aria-label="Close search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="search-modal-body">
        <div class="search-results-list">
          <!-- Dynamically populated via main.js -->
        </div>
      </div>
    </div>
  </div>
  `;
}

// 3. Shared Enterprise Footer
function renderFooter() {
  return `
  <!-- ==========================================================================
       GLOBAL ENTERPRISE FOOTER
       ========================================================================== -->
  <footer class="enterprise-footer" role="contentinfo">
    <div class="container">
      <!-- High Impact Call to Action Banner -->
      <div class="footer-cta-banner">
        <div class="footer-cta-text-wrap">
          <span class="footer-cta-badge">PARTNER WITH RAYAN GROUP</span>
          <h2 class="footer-cta-title">LET'S BUILD THE FUTURE TOGETHER.</h2>
          <p class="footer-cta-desc">Collaborating with governmental authorities, major developers, and energy leaders across the UAE, India, and global markets.</p>
        </div>
        <div class="footer-cta-actions">
          <a href="/proposal/" class="btn-enterprise-primary btn-cta-main">
            <span>REQUEST A PROPOSAL</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/contact/" class="btn-enterprise-secondary btn-cta-sub">
            <span>TALK TO OUR TEAM</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>

      <!-- 5 Balanced Structured Columns -->
      <div class="footer-cols-grid">
        <!-- Col 1: Brand & Conglomerate Mission -->
        <div class="footer-col-brand">
          <a href="/" aria-label="Rayan Group Home" class="footer-brand-logo-link">
            <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" class="footer-brand-logo logo-theme-dark" width="180" height="50">
            <img src="/assets/logos/rayan-group.png" alt="Rayan Group" class="footer-brand-logo logo-theme-light" width="180" height="50">
          </a>
          <p class="footer-brand-bio">
            A premier private engineering, critical energy EPC, South Asia infrastructure, and real estate development conglomerate executing landmark projects across the UAE and South Asia.
          </p>
          <div class="footer-hub-pill">
            <span class="footer-hub-dot"></span>
            <span>DUAL-HUB: UAE 🇦🇪 &bull; INDIA 🇮🇳</span>
          </div>
          <!-- Official Connected Social Channels -->
          <div class="footer-social-wrapper">
            <span class="footer-social-title">OFFICIAL CHANNELS</span>
            <div class="footer-social-strip">
              <a href="https://www.linkedin.com/company/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="footer-social-btn btn-social-linkedin" title="LinkedIn: rayangroupinc" aria-label="Rayan Group LinkedIn">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z"/></svg>
              </a>
              <a href="https://www.youtube.com/@rayangroupinc" target="_blank" rel="noopener noreferrer" class="footer-social-btn btn-social-youtube" title="YouTube: @rayangroupinc" aria-label="Rayan Group YouTube">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42c-.87.23-1.54.91-1.76 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.87.9 1.54 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15V9l5.2 3-5.2 3Z"/></svg>
              </a>
              <a href="https://x.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="footer-social-btn btn-social-x" title="X (Twitter): @rayangroupinc" aria-label="Rayan Group X (Twitter)">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.facebook.com/rayangroupinc" target="_blank" rel="noopener noreferrer" class="footer-social-btn btn-social-facebook" title="Facebook: @rayangroupinc" aria-label="Rayan Group Facebook">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12Z"/></svg>
              </a>
              <a href="https://www.instagram.com/rayangroupinc/" target="_blank" rel="noopener noreferrer" class="footer-social-btn btn-social-instagram" title="Instagram: @rayangroupinc" aria-label="Rayan Group Instagram">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Col 2: Corporate -->
        <div class="footer-col-nav">
          <h4 class="footer-col-title">CORPORATE</h4>
          <ul class="footer-links-list">
            <li><a href="/about/" class="footer-link">Who We Are</a></li>
            <li><a href="/leadership/" class="footer-link">Executive Governance</a></li>
            <li><a href="/about/#timeline" class="footer-link">Corporate Heritage</a></li>
            <li><a href="/sustainability/" class="footer-link">Sustainability &amp; HSE</a></li>
            <li><a href="/news/" class="footer-link">Press &amp; Media</a></li>
            <li><a href="/contact/" class="footer-link">Global Offices</a></li>
          </ul>
        </div>

        <!-- Col 3: Businesses -->
        <div class="footer-col-nav">
          <h4 class="footer-col-title">BUSINESSES</h4>
          <ul class="footer-links-list">
            <li><a href="/business/engineering/" class="footer-link">Rayan Engineering</a></li>
            <li><a href="/business/energy/" class="footer-link">Rayan Energy</a></li>
            <li><a href="/business/ashaz/" class="footer-link">Ashaz Engineering (India)</a></li>
            <li><a href="/business/properties/" class="footer-link">Rayan Properties (Upcoming)</a></li>
            <li><a href="/business/" class="footer-link">All Operating Companies</a></li>
          </ul>
        </div>

        <!-- Col 4: Services & Portals -->
        <div class="footer-col-nav">
          <h4 class="footer-col-title">PORTALS &amp; TENDERS</h4>
          <ul class="footer-links-list">
            <li><a href="/proposal/" class="footer-link">Request a Proposal (RFP)</a></li>
            <li><a href="/procurement/" class="footer-link">Suppliers &amp; Procurement</a></li>
            <li><a href="/billing/" class="footer-link">Billing &amp; Accounts Desk</a></li>
            <li><a href="/procurement/#prequalification" class="footer-link">Vendor Registration</a></li>
            <li><a href="/procurement/#code-of-conduct" class="footer-link">Supplier Code of Conduct</a></li>
            <li><a href="/careers/" class="footer-link">Careers &amp; Talent Pool</a></li>
          </ul>
        </div>

        <!-- Col 5: Global Hubs & Accreditations -->
        <div class="footer-col-contact">
          <h4 class="footer-col-title">HUBS &amp; ACCREDITATIONS</h4>
          <div class="footer-hub-card">
            <span class="footer-hub-label">UAE CORPORATE HQ</span>
            <p class="footer-hub-text">Plot No. 42, Mussafah M-36, Abu Dhabi, United Arab Emirates</p>
            <div class="footer-hub-contact">
              <span>T: +971-25654497</span> &bull; <span>E: info@rayan-group.com</span>
            </div>
          </div>
          <div class="footer-hub-card">
            <span class="footer-hub-label">INDIA REGIONAL HUB</span>
            <p class="footer-hub-text">Bettiah, West Champaran, Bihar - 845438</p>
            <div class="footer-hub-contact">
              <span>E: ashaz@rayan-group.com</span>
            </div>
          </div>
          <div class="footer-iso-strip">
            <span class="footer-iso-tag tag-iso-quality">ISO 9001:2015</span>
            <span class="footer-iso-tag tag-iso-env">ISO 14001:2015</span>
            <span class="footer-iso-tag tag-iso-safety">ISO 45001:2018</span>
          </div>
        </div>
      </div>

      <!-- Bottom Legal Row -->
      <div class="footer-bottom-bar">
        <div class="footer-copy-text">
          &copy; ${new Date().getFullYear()} Rayan Group. Registered in United Arab Emirates &amp; India. All rights reserved.
        </div>
        <div class="footer-legal-links">
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms &amp; Conditions</a>
          <a href="/cookies/">Cookie Policy</a>
          <a href="/disclaimer/">Disclaimer</a>
          <a href="/sitemap/">Sitemap</a>
        </div>
        <button type="button" class="back-to-top-btn" aria-label="Scroll to top of page" onclick="window.scrollTo({top:0,behavior:'smooth'})">
          <span>BACK TO TOP</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      </div>
    </div>
  </footer>
  `;
}

// Floating Assistance & Support Hub Component (WhatsApp, Direct Call, RFP & Email)
function renderAssistanceWidget() {
  return `
  <!-- ==========================================================================
       FLOATING ASSISTANCE WIDGET & QUICK SUPPORT HUB (Bottom-Right)
       ========================================================================== -->
  <aside class="assistance-widget-container" id="assistance-widget" aria-label="Customer Assistance and Support">
    <!-- Assistance Flyout Card -->
    <div class="assistance-card" id="assistance-card" role="dialog" aria-modal="false" aria-labelledby="assistance-card-title">
      <div class="assistance-card-header">
        <div class="assistance-header-left">
          <div class="assistance-status-dot"></div>
          <div>
            <h4 class="assistance-header-title" id="assistance-card-title">Corporate Assistance</h4>
            <span class="assistance-header-sub">Online &bull; Rayan Group Executive Desk</span>
          </div>
        </div>
        <button type="button" class="assistance-close-btn" id="assistance-close-btn" aria-label="Close Assistance Menu">&times;</button>
      </div>

      <div class="assistance-card-body">
        <p class="assistance-welcome-text">
          Welcome to Rayan Group. How can our engineering and contracting team assist you today?
        </p>

        <div class="assistance-options-list">
          <!-- Option 1: WhatsApp Instant Assistance -->
          <a href="https://wa.me/97125654497?text=Hello%20Rayan%20Group,%20I%20would%20like%20assistance%20regarding%20your%20engineering%20and%20contracting%20services." target="_blank" rel="noopener noreferrer" class="assistance-option-item opt-whatsapp">
            <div class="assistance-opt-icon opt-icon-whatsapp">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.982-1.398A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-2.955.829.837-2.894-.214-.326A8.163 8.163 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.522 0 8.2 3.679 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z"/>
              </svg>
            </div>
            <div class="assistance-opt-text">
              <span class="assistance-opt-title">Chat on WhatsApp</span>
              <span class="assistance-opt-desc">+971 2 565 4497 &bull; Instant Support Desk</span>
            </div>
            <span class="assistance-opt-arrow">&rarr;</span>
          </a>

          <!-- Option 2: Direct Call -->
          <a href="tel:+97125654497" class="assistance-option-item opt-call">
            <div class="assistance-opt-icon opt-icon-call">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div class="assistance-opt-text">
              <span class="assistance-opt-title">Call Corporate HQ</span>
              <span class="assistance-opt-desc">+971-25654497 (Abu Dhabi, UAE)</span>
            </div>
            <span class="assistance-opt-arrow">&rarr;</span>
          </a>

          <!-- Option 3: Request Project Proposal (RFP) -->
          <a href="/proposal/" class="assistance-option-item opt-proposal">
            <div class="assistance-opt-icon opt-icon-proposal">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="assistance-opt-text">
              <span class="assistance-opt-title">Submit Tender / RFP</span>
              <span class="assistance-opt-desc">Fast turnkey feasibility &amp; quotation</span>
            </div>
            <span class="assistance-opt-arrow">&rarr;</span>
          </a>

          <!-- Option 4: Corporate Email -->
          <a href="mailto:info@rayan-group.com" class="assistance-option-item opt-email">
            <div class="assistance-opt-icon opt-icon-email">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="assistance-opt-text">
              <span class="assistance-opt-title">Email Executive Desk</span>
              <span class="assistance-opt-desc">info@rayan-group.com</span>
            </div>
            <span class="assistance-opt-arrow">&rarr;</span>
          </a>
        </div>

        <!-- Quick Topic Chips -->
        <div class="assistance-chips-section">
          <span class="assistance-chips-title">Direct Topics:</span>
          <div class="assistance-chips-list">
            <a href="https://wa.me/97125654497?text=Hello%20Rayan%20Group,%20I%20have%20an%20inquiry%20regarding%20Civil%20%26%20Interiors%20EPC." target="_blank" rel="noopener noreferrer" class="assistance-chip">Civil &amp; Interiors</a>
            <a href="https://wa.me/97125654497?text=Hello%20Rayan%20Group,%20I%20have%20an%20inquiry%20regarding%20Electrical%20%26%20Mechanical%20EPC." target="_blank" rel="noopener noreferrer" class="assistance-chip">Electrical &amp; Mechanical</a>
            <a href="https://wa.me/97125654497?text=Hello%20Rayan%20Group,%20I%20would%20like%20to%20request%20a%20tender%20proposal." target="_blank" rel="noopener noreferrer" class="assistance-chip">Tender Proposal</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Trigger Button (Bottom-Right, Green WhatsApp / Chat Bubble) -->
    <button type="button" class="assistance-trigger-btn" id="assistance-trigger-btn" aria-label="Open Assistance and Support" aria-expanded="false">
      <span class="assistance-pulse-ring"></span>
      <span class="assistance-icon-default" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.982-1.398A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.155-.494-4.423-1.341l-.317-.213-2.955.829.837-2.894-.214-.326A8.163 8.163 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.522 0 8.2 3.679 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z"/>
        </svg>
      </span>
      <span class="assistance-icon-close" aria-hidden="true">&times;</span>
      <span class="assistance-badge-label">Assistance</span>
    </button>
  </aside>
  `;
}

// 4. HTML Page Wrapper
function wrapPage({ title, description, activePath, content, heroHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Rayan Group</title>
  <meta name="title" content="${title} | Rayan Group">
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Meta -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title} | Rayan Group">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="/assets/images/hero/hero-1-skyline.jpg">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/rayan-symbol.svg">

  <!-- Zero-FOUT Theme Script -->
  <script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('rayan_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
      } catch (e) {}
    })();
  </script>

  <!-- Google Fonts Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Core Stylesheet -->
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body class="preloader-active page-${activePath.replace(/[^a-z0-9]/gi, '-')}">
  ${renderPreloader()}
  ${renderHeader(activePath)}
  ${renderMobileDrawer(activePath)}
  ${renderSearchModal()}

  <main id="main-content">
    ${heroHtml}
    ${content}
  </main>

  ${renderFooter()}
  ${renderAssistanceWidget()}

  <!-- Interactive Custom Cursor Elements -->
  <div id="custom-cursor" aria-hidden="true"><span class="cursor-label"></span></div>
  <div id="cursor-dot" aria-hidden="true"></div>

  <!-- Main JavaScript Bundle -->
  <script type="module" src="/src/scripts/main.js"></script>
</body>
</html>
`;
}

// 5. Page Hero Component Generator for Inner Pages
function renderPageHero({ category, title, description, breadcrumb, bgImage, subnav = [] }) {
  const breadcrumbHtml = breadcrumb.map((b, idx) => {
    if (idx === breadcrumb.length - 1) {
      return `<span>${b.label}</span>`;
    }
    return `<a href="${b.href}">${b.label}</a><span class="page-breadcrumb-separator">/</span>`;
  }).join('');

  const subnavHtml = subnav.length > 0 ? `
    <div class="page-subnav-bar">
      ${subnav.map(tab => `
        <a href="${tab.href}" class="subnav-tab-link ${tab.active ? 'active' : ''}">${tab.label}</a>
      `).join('')}
    </div>
  ` : '';

  return `
  <section class="page-hero">
    <img src="${bgImage}" alt="${title}" class="page-hero-bg" loading="eager">
    <div class="page-hero-overlay"></div>
    <div class="container page-hero-content">
      <nav class="page-breadcrumb" aria-label="Breadcrumb">
        ${breadcrumbHtml}
      </nav>
      <span class="page-category-tag">${category}</span>
      <h1 class="page-hero-title">${title}</h1>
      <p class="page-hero-desc">${description}</p>
      ${subnavHtml}
    </div>
  </section>
  `;
}

// Helper to render stylized division wing symbol in navigation pills
function renderPillSymbol(upperColor, lowerColor, isGroup = false) {
  const upperClass = isGroup ? 'sym-upper sym-upper-group' : 'sym-upper';
  return `<span class="bu-pill-symbol" aria-hidden="true"><svg viewBox="0 0 43 37" width="22" height="19" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="${upperClass}" d="M 20.75 19.67 L 28.79 29.09 C 32.19 32.89 33.42 35.32 41.25 34.39 C 39.74 32.28 33.28 25.46 32.49 24.15 L 33.00 23.66 C 33.27 23.44 33.27 23.48 33.55 23.28 C 33.92 23.02 34.25 22.74 34.56 22.46 C 40.31 17.23 39.38 8.61 33.70 4.23 C 30.05 1.42 26.15 1.83 20.88 1.83 C 15.73 1.83 10.55 1.89 5.41 1.82 C 5.77 2.60 7.93 5.11 8.59 5.70 C 13.11 9.73 19.92 6.70 27.52 7.86 C 31.11 8.41 33.89 12.38 31.80 16.49 C 29.73 20.56 25.76 19.20 20.75 19.67" fill="${upperColor}" fill-rule="evenodd"/><path class="sym-lower" d="M 29.40 34.44 L 14.32 16.69 L 25.76 16.67 C 25.27 15.68 22.88 13.08 22.20 12.51 C 20.64 11.22 19.06 10.72 16.53 10.72 C 11.91 10.72 5.72 10.38 1.29 10.77 C 1.47 11.32 6.32 16.69 7.04 17.59 L 19.17 31.60 C 21.84 34.60 24.52 34.55 29.40 34.44" fill="${lowerColor}" fill-rule="evenodd"/></svg></span>`;
}

// 6. NMDC-Style Interactive Operating Companies Slideshow Card (Home & Business)
function renderBusinessUnitsSection() {
  return `
  <!-- ==========================================================================
       NMDC-STYLE BUSINESS UNITS SLIDESHOW CARD (5 Operating Entities)
       ========================================================================== -->
  <section class="business-units-section" id="group-companies" aria-label="Group Companies and Operating Subsidiaries">
    <div class="container">
      <div class="business-units-header">
        <span class="bu-top-label" style="justify-content: center; margin-bottom: 0.65rem;">CONGLOMERATE SUBSIDIARIES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; text-transform: uppercase; line-height: 1.15; margin: 0 0 0.85rem;">OPERATING COMPANIES &amp; SUBSIDIARIES</h2>
        <p style="font-size: 1.05rem; line-height: 1.65; color: #cbd5e1; max-width: 680px; margin: 0 auto;">
          An integrated ecosystem of specialized civil contracting, critical energy facilities, South Asia engineering fabrication, and premier property developments operating under unified corporate governance.
        </p>
      </div>

      <div class="bu-card-container">
        <div class="bu-card">
          <div class="bu-top-bar">
            <span class="bu-top-label">BUSINESS UNITS</span>
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">RAYAN ENTERPRISE MATRIX</span>
          </div>

          <div class="bu-slides-viewport" role="region" aria-live="polite">
            <!-- Slide 0: Rayan Group -->
            <div class="bu-slide active" data-slide="0">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" width="240" height="70" loading="eager">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Group</h3>
                </div>
                <p class="bu-company-desc">
                  The premier multinational conglomerate orchestrating landmark civil engineering, critical energy infrastructure, and regional capital ventures. Headquartered in the United Arab Emirates with expanding multinational corridors, Rayan Group unites specialized operating subsidiaries under rigorous engineering precision and fiduciary stewardship.
                </p>
                <a href="/about/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Explore Group Overview</span>
                </a>
              </div>
            </div>

            <!-- Slide 1: Rayan Engineering -->
            <div class="bu-slide" data-slide="1">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-engineering-white.png" alt="Rayan Engineering" width="240" height="75" loading="lazy">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Engineering &amp; Contracting</h3>
                  <span class="bu-badge" style="background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.35);">CIVIL &amp; INTERIORS EPC</span>
                </div>
                <p class="bu-company-desc">
                  The flagship engineering enterprise executing turnkey building construction, high-rise commercial towers, luxury residential estates, precision electrical works, and complex industrial complexes across the UAE. With 50+ years of combined executive heritage, Rayan Engineering sets benchmarks in structural durability and on-schedule execution.
                </p>
                <a href="/business/engineering/" class="bu-action-link" style="border-color: rgba(249, 115, 22, 0.4); color: #f97316;">
                  <span class="bu-action-box" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">↗</span>
                  <span>Visit Engineering Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 2: Rayan Energy -->
            <div class="bu-slide" data-slide="2">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-energy-white.png" alt="Rayan Energy" width="240" height="75" loading="lazy">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Energy</h3>
                  <span class="bu-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35);">ELECTRICAL &amp; MECHANICAL EPC</span>
                </div>
                <p class="bu-company-desc">
                  Powering mission-critical industrial and energy facilities through turnkey electrical and mechanical EPC services, high-voltage substations, process mechanical works, piping networks, and turnaround execution to strict ISO 45001 safety benchmarks.
                </p>
                <a href="/business/energy/" class="bu-action-link" style="border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
                  <span class="bu-action-box" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">↗</span>
                  <span>Visit Energy Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 3: Ashaz Engineering (India) -->
            <div class="bu-slide" data-slide="3">
              <div class="bu-logo-col">
                <img src="/assets/logos/ashaz-engineering-white.png" alt="Ashaz Engineering (India)" width="200" height="150" loading="lazy">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Ashaz Engineering (India)</h3>
                  <span class="bu-badge bu-badge-india">SOUTH ASIA REGIONAL HUB</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's strategic South Asia engineering and regional contracting arm based in Bettiah and New Delhi. Ashaz Engineering delivers heavy civil works, structural steel fabrication, industrial infrastructure, and technical contracting across the Indian subcontinent.
                </p>
                <a href="/business/ashaz/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Explore Ashaz Regional Hub</span>
                </a>
              </div>
            </div>

            <!-- Slide 4: Rayan Properties (Upcoming) -->
            <div class="bu-slide" data-slide="4">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-properties-white.png" alt="Rayan Properties" width="240" height="75" loading="lazy">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Properties</h3>
                  <span class="bu-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35);">UPCOMING PROPERTY VENTURES</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's upcoming premier real estate development enterprise, curating luxury residential communities, waterfront estates, commercial assets, and visionary architectural master-plans across the United Arab Emirates.
                </p>
                <a href="/business/properties/" class="bu-action-link" style="border-color: rgba(36, 140, 145, 0.4); color: #2dd4bf;">
                  <span class="bu-action-box" style="background: rgba(36, 140, 145, 0.15); color: #2dd4bf;">↗</span>
                  <span>Explore Upcoming Properties</span>
                </a>
              </div>
            </div>
          </div>

          <!-- NMDC-Style Interactive Navigation Pills -->
          <div class="bu-pills-row" role="tablist" aria-label="Select Operating Company">
            <button type="button" class="bu-pill active" data-pill="0" role="tab" aria-selected="true">
              ${renderPillSymbol('#cbd5e1', '#0099e6', true)}
              <div>
                <span class="bu-pill-label">Rayan Group</span>
              </div>
            </button>
            <button type="button" class="bu-pill" data-pill="1" role="tab" aria-selected="false">
              ${renderPillSymbol('#c2410c', '#f97316')}
              <div>
                <span class="bu-pill-label">Rayan Engineering</span>
                <span class="bu-pill-subtag" style="color: #f97316;">Civil &amp; Interiors EPC</span>
              </div>
            </button>
            <button type="button" class="bu-pill" data-pill="2" role="tab" aria-selected="false">
              ${renderPillSymbol('#15803d', '#22c55e')}
              <div>
                <span class="bu-pill-label">Rayan Energy</span>
                <span class="bu-pill-subtag" style="color: #10b981;">Electrical &amp; Mechanical EPC</span>
              </div>
            </button>
            <button type="button" class="bu-pill" data-pill="3" role="tab" aria-selected="false">
              ${renderPillSymbol('#0f766e', '#00c7b3')}
              <div>
                <span class="bu-pill-label">Ashaz Engineering</span>
                <span class="bu-pill-subtag">India Regional Hub</span>
              </div>
            </button>
            <button type="button" class="bu-pill" data-pill="4" role="tab" aria-selected="false">
              ${renderPillSymbol('#cbd5e1', '#248c91')}
              <div>
                <span class="bu-pill-label">Rayan Properties</span>
                <span class="bu-pill-subtag" style="color: #fbbf24;">Upcoming</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `;
}

module.exports = {
  wrapPage,
  renderPageHero,
  renderBusinessUnitsSection,
  ensureDir
};
console.log('Template system configured.');

