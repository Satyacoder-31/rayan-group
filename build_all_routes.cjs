const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

// Common IR subnav configuration
const irSubnav = (activeHref) => [
  { label: 'Overview', href: '/investors/', active: activeHref === '/investors/' },
  { label: 'Financial Results', href: '/investors/financial-results/', active: activeHref === '/investors/financial-results/' },
  { label: 'Annual Reports', href: '/investors/annual-reports/', active: activeHref === '/investors/annual-reports/' },
  { label: 'Presentations', href: '/investors/presentations/', active: activeHref === '/investors/presentations/' },
  { label: 'Shareholders', href: '/investors/shareholder-information/', active: activeHref === '/investors/shareholder-information/' },
  { label: 'Governance', href: '/investors/corporate-governance/', active: activeHref === '/investors/corporate-governance/' },
  { label: 'Stock Quote', href: '/investors/stock-information/', active: activeHref === '/investors/stock-information/' },
  { label: 'IR Calendar', href: '/investors/financial-calendar/', active: activeHref === '/investors/financial-calendar/' },
];

// Common Business subnav configuration
const businessSubnav = (activeHref) => [
  { label: 'All Companies', href: '/business/', active: activeHref === '/business/' },
  { label: 'Rayan Engineering', href: '/business/engineering/', active: activeHref === '/business/engineering/' },
  { label: 'Rayan Energy', href: '/business/energy/', active: activeHref === '/business/energy/' },
  { label: 'Ashaz Engineering (India)', href: '/about/#india-hub', active: false },
  { label: 'Rayan Properties (Upcoming)', href: '/contact/', active: false },
];

console.log('Building all routes...');

// Helper to write an HTML page
function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Created: ${relativePath}`);
}

// ============================================================================
// 1. HOME PAGE (index.html)
// ============================================================================
const homeHeroHtml = `
  <section class="hero-slideshow-wrap" aria-label="Cinematic Slideshow">
    <!-- Slide 1: Civil & High-Rise EPC -->
    <div class="hero-slide-item active">
      <img src="/assets/images/hero/hero-1-skyline.jpg" alt="Civil Construction & Skyline" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>ENGINEERING</span> • <span>ENERGY</span> • <span>INFRASTRUCTURE</span>
        </div>
        <h1 class="hero-giant-title">BUILDING WHAT MOVES THE WORLD</h1>
        <p class="hero-lead-text">
          A multinational engineering, energy, and infrastructure conglomerate executing landmark projects across the UAE, South Asia, and high-growth regional hubs.
        </p>
        <div class="hero-actions-row">
          <a href="/business/" class="btn-enterprise-primary">
            <span>EXPLORE OUR BUSINESS</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/projects/" class="btn-enterprise-secondary">
            <span>DISCOVER OUR PROJECTS</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 2: High-Rise & Civil -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-1-skyline.jpg" alt="Commercial Skyscraper" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>CIVIL CONSTRUCTION</span> • <span>HIGH-RISE EPC</span>
        </div>
        <h1 class="hero-giant-title">PRECISION AT SCALE ACROSS UAE &amp; SOUTH ASIA</h1>
        <p class="hero-lead-text">
          From turnkey commercial developments to structural frameworks, delivering 500+ executed projects with unwavering engineering rigor.
        </p>
        <div class="hero-actions-row">
          <a href="/business/engineering/" class="btn-enterprise-primary">
            <span>CIVIL &amp; EPC CAPABILITIES</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/about/" class="btn-enterprise-secondary">
            <span>OUR HERITAGE</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 3: Energy Facilities -->
    <div class="hero-slide-item">
      <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Refinery Plant" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>ENERGY</span> • <span>ONSHORE &amp; OFFSHORE EPC</span>
        </div>
        <h1 class="hero-giant-title">POWERING CRITICAL ENERGY INFRASTRUCTURE</h1>
        <p class="hero-lead-text">
          Strategic pipeline corridors, hydrocarbon process plants, and refinery maintenance delivered to strict ISO 45001 zero-harm standards.
        </p>
        <div class="hero-actions-row">
          <a href="/business/energy/" class="btn-enterprise-primary">
            <span>ENERGY DIVISION</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/sustainability/" class="btn-enterprise-secondary">
            <span>HSE &amp; ESG DISCLOSURES</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 4: Heavy Infrastructure -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-infrastructure-cranes.jpg" alt="Civil Corridors" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>HEAVY INFRASTRUCTURE</span> • <span>TRANSPORTATION</span>
        </div>
        <h1 class="hero-giant-title">CONNECTING GLOBAL COMMERCE &amp; CITIES</h1>
        <p class="hero-lead-text">
          Constructing major highway networks, grade-separated bridges, utility corridors, and heavy logistics facilities.
        </p>
        <div class="hero-actions-row">
          <a href="/business/infrastructure/" class="btn-enterprise-primary">
            <span>INFRASTRUCTURE WORKS</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/projects/" class="btn-enterprise-secondary">
            <span>PROJECT PORTFOLIO</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 5: Dual Hub UAE & India -->
    <div class="hero-slide-item">
      <img src="/assets/images/about/india-hub.jpg" alt="Dual Hub UAE India" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>DUAL-MARKET PRESENCE</span> • <span>UAE &amp; INDIA</span>
        </div>
        <h1 class="hero-giant-title">TWO CONTINENTS. ONE UNIFIED VISION.</h1>
        <p class="hero-lead-text">
          Bridging Abu Dhabi's capital execution and mega-developments with India's vast engineering talent and regional infrastructure footprint.
        </p>
        <div class="hero-actions-row">
          <a href="/about/" class="btn-enterprise-primary">
            <span>WHO WE ARE</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/investors/" class="btn-enterprise-secondary">
            <span>INVESTOR RELATIONS</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="hero-controls-bar">
      <div class="hero-controls-inner">
        <div class="hero-arrows-group">
          <button type="button" class="hero-arrow-btn hero-arrow-prev" aria-label="Previous slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button type="button" class="hero-arrow-btn hero-arrow-next" aria-label="Next slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
`;

const homeContent = `
  <!-- ==========================================================================
       SECTION 2: COMPANY INTRODUCTION EDITORIAL
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">GROUP OVERVIEW</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #fff; text-transform: uppercase;">ENGINEERING A BETTER FUTURE AT SCALE.</h2>
        </div>
        <div>
          <p style="font-size: 1.1rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.5rem;">
            Rayan Group is an international engineering, energy, and construction conglomerate operating across the United Arab Emirates, South Asia, and the broader Middle East.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            Guided by technical precision and fiduciary discipline, our specialized operating companies handle megaprojects from initial feasibility, structural design, and heavy EPC execution to lifecycle facility management and energy systems.
          </p>
          <a href="/about/" class="mega-cat-explore" style="font-size: 0.9rem;">READ OUR FULL STORY →</a>
        </div>
      </div>

      <!-- Statistics Row with Animated Counters -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 5.5rem; padding-top: 3.5rem; border-top: 1px solid rgba(255,255,255,0.08);">
        <div>
          <div style="font-family: var(--font-heading); font-size: clamp(2.5rem, 4.5vw, 4.25rem); font-weight: 800; color: #fff; line-height: 1;" data-counter-target="50" data-counter-suffix="+">50+</div>
          <div style="font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0099e6; margin-top: 0.5rem;">YEARS HERITAGE</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Combined leadership execution</div>
        </div>
        <div>
          <div style="font-family: var(--font-heading); font-size: clamp(2.5rem, 4.5vw, 4.25rem); font-weight: 800; color: #fff; line-height: 1;" data-counter-target="30" data-counter-suffix="+">30+</div>
          <div style="font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0099e6; margin-top: 0.5rem;">GLOBAL REACH</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Countries with project partnerships</div>
        </div>
        <div>
          <div style="font-family: var(--font-heading); font-size: clamp(2.5rem, 4.5vw, 4.25rem); font-weight: 800; color: #fff; line-height: 1;" data-counter-target="500" data-counter-suffix="+">500+</div>
          <div style="font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0099e6; margin-top: 0.5rem;">PROJECTS DELIVERED</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Commercial, industrial &amp; energy</div>
        </div>
        <div>
          <div style="font-family: var(--font-heading); font-size: clamp(2.5rem, 4.5vw, 4.25rem); font-weight: 800; color: #fff; line-height: 1;" data-counter-target="10000" data-counter-suffix="+">10,000+</div>
          <div style="font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #0099e6; margin-top: 0.5rem;">PROFESSIONALS</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Engineers, technicians &amp; operators</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION: GROUP COMPANIES & BUSINESS UNITS (NMDC-STYLE SLIDESHOW CARD)
       ========================================================================== -->
  <section class="business-units-section" id="companies" aria-label="Group Companies and Business Units">
    <div class="container">
      <div class="business-units-header">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-cyan, #0099e6); display: block; margin-bottom: 0.5rem;">CONGLOMERATE SUBSIDIARIES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; text-transform: uppercase; line-height: 1.15; margin: 0 0 0.85rem;">GROUP COMPANIES &amp; DIVISIONS</h2>
        <p style="font-size: 1.05rem; line-height: 1.65; color: #cbd5e1; max-width: 660px; margin: 0 auto;">
          An integrated ecosystem of specialized civil engineering, energy facilities, South Asia infrastructure, and premier properties operating under unified governance.
        </p>
      </div>

      <div class="bu-card-container">
        <div class="bu-card">
          <div class="bu-top-bar">
            <span class="bu-top-label">BUSINESS UNITS</span>
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em;">RAYAN ENTERPRISE MATRIX</span>
          </div>

          <!-- Slides Viewport -->
          <div class="bu-slides-viewport" role="region" aria-live="polite">
            <!-- Slide 0: Rayan Group -->
            <div class="bu-slide active" data-slide="0">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-group-white.png" alt="Rayan Group" width="240" height="70">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Group</h3>
                  <span class="bu-badge bu-badge-holding">PARENT HOLDING</span>
                </div>
                <p class="bu-company-desc">
                  The premier multinational holding conglomerate orchestrating landmark civil engineering, critical energy infrastructure, and regional capital ventures. Headquartered in Abu Dhabi with expanding multinational corridors, Rayan Group unites specialized divisions under rigorous engineering precision and fiduciary stewardship.
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
                <img src="/assets/logos/rayan-engineering-white.png" alt="Rayan Engineering" width="240" height="75">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Engineering &amp; Contracting</h3>
                  <span class="bu-badge bu-badge-active">CIVIL &amp; GENERAL CONTRACTING</span>
                </div>
                <p class="bu-company-desc">
                  The flagship engineering enterprise executing turnkey building construction, high-rise commercial towers, luxury residential estates, and complex industrial complexes across the UAE. With 500+ executed projects and 50+ years of combined leadership heritage, Rayan Engineering sets benchmarks in structural excellence.
                </p>
                <a href="/business/engineering/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Visit Engineering Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 2: Rayan Energy -->
            <div class="bu-slide" data-slide="2">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-energy-white.png" alt="Rayan Energy" width="240" height="75">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Energy</h3>
                  <span class="bu-badge bu-badge-active">OIL, GAS &amp; PROCESS FACILITIES</span>
                </div>
                <p class="bu-company-desc">
                  Powering mission-critical energy infrastructure through onshore and process EPC services, strategic hydrocarbon pipeline corridors, petrochemical process plants, and refinery turnaround execution. Operating to uncompromised ISO 45001 and ISO 14001 zero-harm standards across regional energy corridors.
                </p>
                <a href="/business/energy/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Visit Energy Division</span>
                </a>
              </div>
            </div>

            <!-- Slide 3: Ashaz Engineering (India) -->
            <div class="bu-slide" data-slide="3">
              <div class="bu-logo-col">
                <img src="/assets/logos/ashaz-engineering-white.png" alt="Ashaz Engineering (India)" width="200" height="150">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Ashaz Engineering (India)</h3>
                  <span class="bu-badge bu-badge-india">SOUTH ASIA REGIONAL HUB</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's strategic South Asia engineering and regional contracting arm based in Bettiah and New Delhi. Ashaz Engineering delivers heavy civil works, structural fabrication, industrial infrastructure, and technical contracting, combining deep regional talent with international engineering standards.
                </p>
                <a href="/about/#india-hub" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Explore Ashaz Regional Hub</span>
                </a>
              </div>
            </div>

            <!-- Slide 4: Rayan Properties -->
            <div class="bu-slide" data-slide="4">
              <div class="bu-logo-col">
                <img src="/assets/logos/rayan-properties-white.png" alt="Rayan Properties" width="240" height="72">
              </div>
              <div class="bu-info-col">
                <div class="bu-title-row">
                  <h3 class="bu-company-title">Rayan Properties</h3>
                  <span class="bu-badge bu-badge-upcoming">UPCOMING DIVISION</span>
                </div>
                <p class="bu-company-desc">
                  Rayan Group's upcoming premier real estate development enterprise. Curating ultra-luxury waterfront estates, master-planned residential communities, architectural landmark high-rises, and prime commercial destinations across high-growth UAE and international metropolitan locations.
                </p>
                <a href="/contact/" class="bu-action-link">
                  <span class="bu-action-box">↗</span>
                  <span>Upcoming Division • Register Interest</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Bottom Selector Pills Row (NMDC Style) -->
          <div class="bu-pills-row" role="tablist" aria-label="Company Selector Tabs">
            <button type="button" class="bu-pill active" data-index="0" role="tab" aria-selected="true" aria-controls="slide-0">
              <span class="bu-pill-slash" style="color: #0099e6;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Group</span>
                <span class="bu-pill-subtag">Parent Holding</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="1" role="tab" aria-selected="false" aria-controls="slide-1">
              <span class="bu-pill-slash" style="color: #00c7b3;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Engineering</span>
                <span class="bu-pill-subtag">Civil &amp; EPC</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="2" role="tab" aria-selected="false" aria-controls="slide-2">
              <span class="bu-pill-slash" style="color: #00ad61;">/</span>
              <div>
                <span class="bu-pill-label">Rayan Energy</span>
                <span class="bu-pill-subtag">Oil, Gas &amp; Energy</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="3" role="tab" aria-selected="false" aria-controls="slide-3">
              <span class="bu-pill-slash" style="color: #14949b;">/</span>
              <div>
                <span class="bu-pill-label">Ashaz Engineering</span>
                <span class="bu-pill-subtag">India Regional Hub</span>
              </div>
            </button>

            <button type="button" class="bu-pill" data-index="4" role="tab" aria-selected="false" aria-controls="slide-4">
              <span class="bu-pill-slash" style="color: #f59e0b;">/</span>
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

  <!-- ==========================================================================
       SECTION 3: WHAT WE DO (5 Large Business Panels)
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #050b14; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">OUR BUSINESS AREAS</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: #fff; text-transform: uppercase;">WHAT WE DO</h2>
        </div>
        <a href="/business/" class="btn-enterprise-secondary" style="padding: 0.75rem 1.75rem;">VIEW ALL DIVISIONS →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">
        <!-- Card 1: Rayan Engineering -->
        <a href="/business/engineering/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/01-engineering.jpg" alt="Civil Engineering" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">01</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">CIVIL &amp; GENERAL CONTRACTING</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN ENGINEERING</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Turnkey high-rise commercial structures, residential developments, and industrial facilities.</p>
          </div>
        </a>

        <!-- Card 2: Rayan Energy -->
        <a href="/business/energy/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy Facilities" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">02</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #00c7b3; text-transform: uppercase; margin-bottom: 0.35rem;">OIL, GAS &amp; PROCESS PLANTS</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN ENERGY</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Onshore and process EPC energy facilities, pipeline corridors, and petrochemical turnaround services.</p>
          </div>
        </a>

        <!-- Card 3: Ashaz Engineering (India) -->
        <a href="/about/#india-hub" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/about/india-hub.jpg" alt="Ashaz Engineering" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">03</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #14949b; text-transform: uppercase; margin-bottom: 0.35rem;">SOUTH ASIA REGIONAL HUB</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">ASHAZ ENGINEERING</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Heavy civil infrastructure, structural steel fabrication, and engineering talent based in Bihar and Delhi.</p>
          </div>
        </a>

        <!-- Card 4: Rayan Properties -->
        <a href="/contact/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Rayan Properties" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">04</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #f59e0b; text-transform: uppercase; margin-bottom: 0.35rem;">UPCOMING REAL ESTATE</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.55rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN PROPERTIES</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Curating ultra-luxury residential master communities and signature destinations across high-growth markets.</p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 4: PROJECTS THAT DEFINE OUR SCALE
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">SELECTED PORTFOLIO</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: #fff; text-transform: uppercase;">PROJECTS THAT DEFINE OUR SCALE</h2>
        </div>
        <a href="/projects/" class="btn-enterprise-primary">VIEW COMPLETE PORTFOLIO →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem;">
        <!-- Project 1: Waldorf Astoria -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Luxury Renovation" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AED 92.5M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">5-STAR HOSPITALITY / RAK</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Waldorf Astoria Hotel Luxury Renovation</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">5-Star ultra-luxury hospitality overhaul, presidential suites refurbishment, and grand lobby fit-out.</p>
            <a href="/projects/waldorf-astoria-renovation-rak/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 2: Palm Jumeirah Estate -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Palm Jumeirah Luxury Estate" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase;">AED 115.0M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">COASTAL RESIDENTIAL / DUBAI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Palm Jumeirah Luxury Waterfront Estate</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Ultra-luxury coastal villa construction, bespoke Italian marble, structural works, and panoramic glazing.</p>
            <a href="/projects/palm-jumeirah-rec-estate/" style="font-size: 0.825rem; font-weight: 700; color: #10b981; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 3: C2 Towers Al Bateen -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/c2-towers-al-bateen.jpg" alt="C2 Towers Al Bateen" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AED 142.8M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">HIGH-RISE / ABU DHABI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">C2 Towers Twin High-Rise Development</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Twin 22-story luxury waterfront residential towers architectural gypsum, vaulted ceilings, and turnkey fit-out.</p>
            <a href="/projects/c2-towers-al-bateen/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 4: Edge Group REMAYA -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/edge-group-remaya.jpg" alt="Edge Group REMAYA" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">AED 78.4M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">DEFENSE / ABU DHABI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Edge Group - REMAYA Tactical Complex</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Specialized defense training facilities, ballistic partitions, heavy engineering, and architectural fit-out.</p>
            <a href="/projects/edge-group-remaya/" style="font-size: 0.825rem; font-weight: 700; color: #c5a059; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 5: Luxury Island Infinity Pool -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Luxury Island Infinity Pool" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AED 46.2M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">AQUATIC &amp; RESORT / ABU DHABI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Luxury Island Oceanfront Infinity Pool &amp; Deck</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Cantilevered structural concrete pool engineering, horizon overflow waterfalls, and coastal leisure landscaping.</p>
            <a href="/projects/luxury-island-infinity-pool/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 6: Roxy Cinemas Dubai Hills -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg" alt="Roxy Cinemas VIP Auditoriums" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase;">AED 38.6M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">ENTERTAINMENT / DUBAI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Roxy Cinemas VIP Auditoriums - Dubai Hills</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Acoustic sound isolation engineering, VIP cinema auditorium fit-out, and multi-tier stadium seating.</p>
            <a href="/projects/roxy-cinema-dubai-hills-mall/" style="font-size: 0.825rem; font-weight: 700; color: #10b981; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 5: INVESTOR RELATIONS SNAPSHOT (NMDC IR Style)
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #050b14; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">CAPITAL MARKETS</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: #fff; text-transform: uppercase;">INVESTOR DASHBOARD</h2>
        </div>
        <div style="display: flex; gap: 1rem;">
          <a href="/investors/annual-reports/" class="btn-enterprise-secondary" style="padding: 0.75rem 1.75rem;">ANNUAL REPORTS</a>
          <a href="/investors/" class="btn-enterprise-primary" style="padding: 0.75rem 1.75rem;">IR HUB →</a>
        </div>
      </div>

      <div class="ir-dashboard-grid">
        <div class="ir-stat-card">
          <div class="ir-stat-header">
            <span class="ir-stat-label">Market Capitalization</span>
            <span class="ir-stat-trend">ADX: RYNG</span>
          </div>
          <div class="ir-stat-value">AED 4.25B</div>
          <div class="ir-stat-subtext">Abu Dhabi Securities Exchange listed</div>
        </div>

        <div class="ir-stat-card">
          <div class="ir-stat-header">
            <span class="ir-stat-label">FY2024 Revenue</span>
            <span class="ir-stat-trend">+24.2% YoY</span>
          </div>
          <div class="ir-stat-value">AED 1.82B</div>
          <div class="ir-stat-subtext">Diversified multinational delivery</div>
        </div>

        <div class="ir-stat-card">
          <div class="ir-stat-header">
            <span class="ir-stat-label">Group EBITDA</span>
            <span class="ir-stat-trend">+28.7% YoY</span>
          </div>
          <div class="ir-stat-value">AED 385.2M</div>
          <div class="ir-stat-subtext">21.1% EBITDA operating margin</div>
        </div>

        <div class="ir-stat-card">
          <div class="ir-stat-header">
            <span class="ir-stat-label">Active Order Backlog</span>
            <span class="ir-stat-trend">Multi-Year</span>
          </div>
          <div class="ir-stat-value">AED 4.65B</div>
          <div class="ir-stat-subtext">Secured pipeline in UAE &amp; South Asia</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 6: SUSTAINABILITY & ESG COMMITMENT
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981; display: block; margin-bottom: 0.85rem;">ESG &amp; DECARBONIZATION</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.5rem); font-weight: 800; color: #fff; line-height: 1.1; text-transform: uppercase; margin-bottom: 1.5rem;">SUSTAINABILITY AT OUR CORE.</h2>
          <p style="font-size: 1rem; color: #cbd5e1; line-height: 1.65; margin-bottom: 1.5rem;">
            Rayan Group is committed to environmental stewardship, decarbonization across construction sites, biodiversity protection, and an uncompromised zero-harm workforce safety culture.
          </p>
          <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
            <div>
              <div style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: #10b981;">30%</div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">CARBON REDUCTION TARGET</div>
            </div>
            <div>
              <div style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 800; color: #0099e6;">100%</div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">RESPONSIBLE HSE COMPLIANCE</div>
            </div>
          </div>
          <a href="/sustainability/" class="btn-enterprise-primary">DISCOVER ESG STRATEGY →</a>
        </div>
        <div>
          <img src="/assets/images/sustainability/renewable-energy.jpg" alt="Renewable Energy" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 7: CORPORATE NEWSROOM
       ========================================================================== -->
  <section class="section" style="padding: 7rem 0; background: #050b14;">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">CORPORATE COMMUNICATIONS</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; color: #fff; text-transform: uppercase;">LATEST ANNOUNCEMENTS</h2>
        </div>
        <a href="/news/" class="btn-enterprise-secondary">VISIT NEWSROOM →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
        <!-- News 1 -->
        <article style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 200px; overflow: hidden;">
            <img src="/assets/images/business/01-engineering.jpg" alt="Commercial EPC contract" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">PRESS RELEASE • MAR 04, 2025</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Awarded Landmark AED 450M EPC High-Rise &amp; Infrastructure Contract</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Securing major commercial high-rise construction and civil engineering delivery across Abu Dhabi.</p>
            <a href="/news/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">READ FULL RELEASE →</a>
          </div>
        </article>

        <!-- News 2 -->
        <article style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 200px; overflow: hidden;">
            <img src="/assets/images/investors/corporate-financial-tower.jpg" alt="Record Financials" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">FINANCIAL • FEB 18, 2025</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Reports Record FY2024 Revenue Surpassing AED 1.82 Billion</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Strong 24.2% top-line growth driven by civil infrastructure, turnkey engineering, and energy EPC.</p>
            <a href="/news/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">READ FULL RELEASE →</a>
          </div>
        </article>

        <!-- News 3 -->
        <article style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 200px; overflow: hidden;">
            <img src="/assets/images/sustainability/iso-45001.jpg" alt="Triple ISO" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">CORPORATE • JAN 25, 2025</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Successfully Renews Global Triple ISO Quality &amp; Safety Certifications</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Achieving 100% compliance across ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 audits.</p>
            <a href="/news/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">READ FULL RELEASE →</a>
          </div>
        </article>
      </div>
    </div>
  </section>
`;

createRoute('index.html', {
  title: 'Rayan Group — Multinational Engineering, Energy & Infrastructure Conglomerate',
  description: 'Rayan Group is a premier multinational engineering, energy, civil construction, and infrastructure conglomerate operating across the UAE and South Asia.',
  activePath: '/',
  heroHtml: homeHeroHtml,
  content: homeContent
});

console.log('Homepage generated successfully.');
