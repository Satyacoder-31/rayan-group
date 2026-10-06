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
  { label: 'All Divisions', href: '/business/', active: activeHref === '/business/' },
  { label: 'Civil & EPC', href: '/business/engineering/', active: activeHref === '/business/engineering/' },
  { label: 'Marine & Offshore', href: '/business/marine/', active: activeHref === '/business/marine/' },
  { label: 'Infrastructure', href: '/business/infrastructure/', active: activeHref === '/business/infrastructure/' },
  { label: 'Energy & Oil/Gas', href: '/business/energy/', active: activeHref === '/business/energy/' },
  { label: 'Heavy Logistics', href: '/business/logistics/', active: activeHref === '/business/logistics/' },
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
    <!-- Slide 1: Marine & Offshore -->
    <div class="hero-slide-item active">
      <img src="/assets/images/business/marine-offshore-port.jpg" alt="Marine Dredging" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>ENGINEERING</span> • <span>INNOVATION</span> • <span>GLOBAL IMPACT</span>
        </div>
        <h1 class="hero-giant-title">BUILDING WHAT MOVES THE WORLD</h1>
        <p class="hero-lead-text">
          A multinational engineering, marine, and energy conglomerate executing landmark infrastructure across the UAE, South Asia, and international maritime corridors.
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
        <div class="hero-slide-counter">
          <span class="hero-counter-current">01</span>
          <div class="hero-progress-line"><div class="hero-progress-fill"></div></div>
          <span class="hero-counter-total">05</span>
        </div>
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
            Rayan Group is an international engineering, marine, and construction conglomerate operating across the United Arab Emirates, South Asia, and the broader Middle East.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            Guided by technical precision and fiduciary discipline, our multi-disciplinary divisions handle megaprojects from initial feasibility, structural design, and marine dredging to heavy EPC execution and lifecycle facility management.
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
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Commercial, industrial &amp; marine</div>
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

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
        <!-- Card 1: Engineering -->
        <a href="/business/engineering/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/01-engineering.jpg" alt="Civil Engineering" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">01</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">EPC &amp; CIVIL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">ENGINEERING &amp; CONSTRUCTION</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Turnkey high-rise commercial structures, residential developments, and industrial facilities.</p>
          </div>
        </a>

        <!-- Card 2: Marine -->
        <a href="/business/marine/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/marine-offshore-port.jpg" alt="Marine Dredging" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">02</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">OFFSHORE &amp; PORTS</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">MARINE &amp; COASTAL WORKS</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Deep-sea dredging, breakwaters, port terminals, and artificial island reclamation.</p>
          </div>
        </a>

        <!-- Card 3: Energy -->
        <a href="/business/energy/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Energy Refineries" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">03</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">OIL &amp; GAS</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">ENERGY &amp; OFFSHORE EPC</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Upstream and downstream facilities, pipelines, and refinery maintenance to ISO 45001.</p>
          </div>
        </a>

        <!-- Card 4: Infrastructure -->
        <a href="/business/infrastructure/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/03-infrastructure.jpg" alt="Infrastructure" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">04</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">CIVIL CORRIDORS</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">INFRASTRUCTURE &amp; UTILITIES</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Heavy transport corridors, grade-separated bridges, and district cooling pipelines.</p>
          </div>
        </a>

        <!-- Card 5: Heavy Logistics -->
        <a href="/business/logistics/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/05-logistics.jpg" alt="Logistics Fleet" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">05</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #0099e6; text-transform: uppercase; margin-bottom: 0.35rem;">FLEET &amp; VESSELS</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.65rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">HEAVY FLEET LOGISTICS</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">180+ cranes, heavy modular transports, and maritime support vessels.</p>
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
        <!-- Project 1 -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/al-wahda-mall.jpg" alt="Al Wahda Mall" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AED 371.2M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">COMMERCIAL / ABU DHABI</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Al Wahda Mall Commercial &amp; Structural Development</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Civil engineering, foundation reinforcement, luxury tiling, and precision architectural finishes for Max &amp; HLN Technical.</p>
            <a href="/projects/al-wahda-mall/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 2 -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/ghantoot-palace.jpg" alt="Ghantoot Palace" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">AED 185.0M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">ROYAL INTERIORS / GHANTOOT</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Ghantoot Royal Private Estate &amp; Fit-Out</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Bespoke ornamental gypsum fabrication, vaulted ceilings, and refined hand-crafted architectural finishes.</p>
            <a href="/projects/ghantoot-palace/" style="font-size: 0.825rem; font-weight: 700; color: #c5a059; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>READ CASE STUDY</span><span>→</span>
            </a>
          </div>
        </article>

        <!-- Project 3 -->
        <article class="project-card" style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 260px; overflow: hidden; position: relative;">
            <img src="/assets/images/business/marine-offshore-port.jpg" alt="Maritime Berths" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">AED 420.0M</span>
          </div>
          <div style="padding: 2rem;">
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem;">MARINE / ABU DHABI PORT</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 0.75rem;">Arabian Gulf Coastal Industrial Berth</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.5rem;">Channel deepening to -14m CD, 1.2M m³ reclamation, heavy quay walls, and industrial vessel berthing.</p>
            <a href="/business/marine/" style="font-size: 0.825rem; font-weight: 700; color: #0099e6; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>EXPLORE MARINE WORKS</span><span>→</span>
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
            Rayan Group is committed to environmental stewardship, decarbonization across construction sites, marine biodiversity protection, and an uncompromised zero-harm workforce safety culture.
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
            <img src="/assets/images/business/marine-offshore-port.jpg" alt="Offshore contract" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">PRESS RELEASE • MAR 04, 2025</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Expands Maritime &amp; Offshore Fleet with Major Coastal Contract</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Securing AED 420M coastal contract in Abu Dhabi, deploying state-of-the-art dredging vessels.</p>
            <a href="/news/rayan-group-expands-offshore-portfolio/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">READ FULL RELEASE →</a>
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
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Strong 24.2% top-line growth driven by civil infrastructure, energy EPC, and maritime execution.</p>
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
  title: 'Rayan Group — Multinational Engineering, Marine & Infrastructure Conglomerate',
  description: 'Rayan Group is a premier multinational engineering, marine dredging, civil construction, and energy infrastructure conglomerate operating across the UAE and South Asia.',
  activePath: '/',
  heroHtml: homeHeroHtml,
  content: homeContent
});

console.log('Homepage generated successfully.');
