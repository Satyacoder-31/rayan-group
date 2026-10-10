const fs = require('fs');
const path = require('path');
const { wrapPage, ensureDir, renderBusinessUnitsSection } = require('./build_multipage_site.cjs');

function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Created: ${relativePath}`);
}

// ============================================================================
// 1. HERO SLIDESHOW (High-Impact Engineering, Energy & Infrastructure Slides)
// ============================================================================
const homeHeroHtml = `
  <section class="hero-slideshow-wrap" aria-label="Cinematic Slideshow">
    <!-- Slide 1: Landmark Conglomerate Vision (Burj Khalifa & Downtown Dubai Night Skyline) -->
    <div class="hero-slide-item active">
      <img src="/assets/images/hero/hero-burj-downtown.jpg" alt="Downtown Dubai Skyline &amp; Burj Khalifa" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>ENGINEERING</span> • <span>ENERGY</span> • <span>INFRASTRUCTURE</span>
        </div>
        <h1 class="hero-giant-title">BUILDING WHAT MOVES THE WORLD</h1>
        <p class="hero-lead-text">
          A premier multinational engineering, energy, infrastructure, and property development conglomerate executing landmark projects across the UAE and South Asia.
        </p>
        <div class="hero-actions-row">
          <a href="/proposal/" class="btn-enterprise-primary">
            <span>REQUEST A PROPOSAL</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/projects/" class="btn-enterprise-secondary">
            <span>EXPLORE OUR PROJECTS</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 2: Architectural Innovation & Future Engineering (Museum of the Future & Emirates Towers) -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-museum-future.jpg" alt="Museum of the Future &amp; Emirates Towers" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>ARCHITECTURAL INNOVATION</span> • <span>FUTURE ENGINEERING</span>
        </div>
        <h1 class="hero-giant-title">ICONIC LANDMARKS &amp; VISIONARY STRUCTURES</h1>
        <p class="hero-lead-text">
          Engineering monumental civic landmarks, complex structural geometry, luxury hospitality overhauls, and next-generation architectural transformations across the UAE.
        </p>
        <div class="hero-actions-row">
          <a href="/services/" class="btn-enterprise-primary">
            <span>OUR SERVICES</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/projects/" class="btn-enterprise-secondary">
            <span>LANDMARK PROJECTS</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 3: Capital Energy & Process Infrastructure (Abu Dhabi Etihad Towers & Corniche Waterfront) -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-etihad-abu-dhabi.jpg" alt="Abu Dhabi Etihad Towers &amp; Waterfront" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>CAPITAL HEADQUARTERS</span> • <span>ENERGY &amp; PROCESS EPC</span>
        </div>
        <h1 class="hero-giant-title">CRITICAL ENERGY &amp; PROCESS INFRASTRUCTURE</h1>
        <p class="hero-lead-text">
          From the UAE capital to regional energy corridors: strategic hydrocarbon transport pipelines, process facilities, storage tank farms, and refinery turnaround execution to strict ISO 45001 standards.
        </p>
        <div class="hero-actions-row">
          <a href="/business/energy/" class="btn-enterprise-primary">
            <span>ENERGY DIVISION</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/sustainability/" class="btn-enterprise-secondary">
            <span>HSE COMMITMENT</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 4: Civil Infrastructure & Heavy Transportation (Sheikh Zayed Road Highway & Transit Arteries) -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-sheikh-zayed-corridor.jpg" alt="Sheikh Zayed Road Arterial Infrastructure" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>CIVIL INFRASTRUCTURE</span> • <span>TRANSPORTATION NETWORKS</span>
        </div>
        <h1 class="hero-giant-title">ARTERIAL HIGHWAYS, TRANSIT &amp; HEAVY CIVIL WORKS</h1>
        <p class="hero-lead-text">
          Express highway corridors, runway civil works, complex utility bridges, deep municipal networks, and arterial paving delivered with uncompromised engineering precision.
        </p>
        <div class="hero-actions-row">
          <a href="/business/infrastructure/" class="btn-enterprise-primary">
            <span>INFRASTRUCTURE WORKS</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/proposal/" class="btn-enterprise-secondary">
            <span>TENDER PROPOSALS</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Slide 5: Luxury Interior Fit-Out & Facilities Management (Dubai Marina Waterfront & Towers) -->
    <div class="hero-slide-item">
      <img src="/assets/images/hero/hero-dubai-marina.jpg" alt="Dubai Marina Skyline &amp; Waterfront" class="hero-slide-bg-img">
      <div class="hero-slide-gradient"></div>
      <div class="hero-slide-container">
        <div class="hero-eyebrow-badge">
          <span>INTERIOR FIT-OUT</span> • <span>FACILITIES MANAGEMENT</span>
        </div>
        <h1 class="hero-giant-title">BESPOKE INTERIOR FIT-OUT &amp; COASTAL ASSETS</h1>
        <p class="hero-lead-text">
          Turnkey commercial interiors, bespoke architectural joinery, high-end residential towers, and premier facilities management (FM &amp; AMC) preserving prestige properties 24/7 across the UAE.
        </p>
        <div class="hero-actions-row">
          <a href="/services/" class="btn-enterprise-primary">
            <span>INTERIOR &amp; FM SCOPE</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/procurement/" class="btn-enterprise-secondary">
            <span>VENDOR ENLISTMENT</span>
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

// ============================================================================
// 2. HOMEPAGE CONTENT (Structured Multi-Entity Flow)
// ============================================================================
const homeContent = `
  <!-- ==========================================================================
       SECTION 1: INTERACTIVE OPERATING COMPANIES CARD SLIDESHOW (NMDC Pattern)
       Placed prominently at the start per user specification
       ========================================================================== -->
  ${renderBusinessUnitsSection()}

  <!-- ==========================================================================
       SECTION 2: WHO WE ARE (Dual-Hub Presence & Executive Heritage)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">CORPORATE PROFILE</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; line-height: 1.15; color: #fff; text-transform: uppercase;">
            ENGINEERING EXCELLENCE AT MULTINATIONAL SCALE.
          </h2>
        </div>
        <div>
          <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
            Rayan Group is a premier private engineering, critical energy, infrastructure, and property development conglomerate operating across the United Arab Emirates and South Asia.
          </p>
          <p style="font-size: 0.95rem; line-height: 1.7; color: #94a3b8; margin-bottom: 2rem;">
            With headquarters in Abu Dhabi (Mussafah M-36) and regional operations in Dubai and India (Ashaz Engineering), we combine over 50 years of executive engineering heritage with heavy equipment fleets and triple ISO certifications to deliver high-complexity megaprojects on accelerated schedules.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/about/" class="btn-enterprise-primary" style="font-size: 0.85rem; padding: 0.75rem 1.75rem;">EXPLORE ABOUT RAYAN →</a>
            <a href="/leadership/" class="btn-enterprise-secondary" style="font-size: 0.85rem; padding: 0.75rem 1.75rem;">EXECUTIVE LEADERSHIP</a>
          </div>
        </div>
      </div>

      <!-- Verified Statistics Row (Increasing Animated Counters: 18+, 16, 4) -->
      <div class="stats-counter-grid">
        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="18" data-counter-suffix="+" data-counter-duration="1500">18+</span>
          </div>
          <div class="stat-counter-label">YEARS HERITAGE</div>
          <div class="stat-counter-desc">Proven industry track record since 2008</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="16" data-counter-duration="1500">16</span>
          </div>
          <div class="stat-counter-label">VERIFIED PROJECTS</div>
          <div class="stat-counter-desc">Landmark hospitality, retail &amp; towers</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val" data-counter-target="4" data-counter-duration="1200">4</span>
          </div>
          <div class="stat-counter-label">OPERATING ENTITIES</div>
          <div class="stat-counter-desc">Engineering, Energy, Ashaz India, Properties</div>
        </div>

        <div class="stat-counter-card">
          <div class="stat-counter-number-wrap">
            <span class="stat-counter-val stat-counter-text-badge">TRIPLE</span>
          </div>
          <div class="stat-counter-label" style="color: #10b981;">ISO ACCREDITED</div>
          <div class="stat-counter-desc">ISO 9001 / 14001 / 45001</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 3: OPERATING SUBSIDIARIES (4 Core Conglomerate Companies)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">SPECIALIZED HORSEPOWER</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase;">OPERATING SUBSIDIARIES</h2>
        </div>
        <a href="/business/" class="btn-enterprise-secondary" style="padding: 0.75rem 1.75rem;">ALL OPERATING COMPANIES →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">
        <!-- Company 1: Rayan Engineering -->
        <a href="/business/engineering/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/01-engineering.jpg" alt="Rayan Engineering & Contracting" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">01</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #00c7b3; text-transform: uppercase; margin-bottom: 0.35rem;">CIVIL &amp; INTERIORS EPC</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN ENGINEERING</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Turnkey high-rise towers, luxury hospitality overhauls, retail precincts, interior fit-outs, and commercial structures.</p>
          </div>
        </a>

        <!-- Company 2: Rayan Energy -->
        <a href="/business/energy/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/business/energy-refinery-complex.jpg" alt="Rayan Energy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">02</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #10b981; text-transform: uppercase; margin-bottom: 0.35rem;">ELECTRICAL &amp; MECHANICAL EPC</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN ENERGY</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Heavy electrical substations, industrial power systems, process mechanical plants, pipeline corridors, and turnaround maintenance.</p>
          </div>
        </a>

        <!-- Company 3: Ashaz Engineering (India) -->
        <a href="/business/ashaz/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/about/india-hub.jpg" alt="Ashaz Engineering (India)" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">03</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #00c7b3; text-transform: uppercase; margin-bottom: 0.35rem;">SOUTH ASIA REGIONAL HUB</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">ASHAZ ENGINEERING (INDIA)</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Heavy civil contracting, structural steel fabrication, industrial workshops, and South Asia project execution.</p>
          </div>
        </a>

        <!-- Company 4: Rayan Properties (Upcoming) -->
        <a href="/business/properties/" class="division-card" style="position: relative; border-radius: 12px; overflow: hidden; height: 420px; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.08);">
          <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Rayan Properties" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="card-zoom-img">
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,17,30,0.95) 0%, rgba(7,17,30,0.4) 60%, transparent 100%); padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end;">
            <span style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 900; color: rgba(255,255,255,0.3); display: block;">04</span>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #f59e0b; text-transform: uppercase; margin-bottom: 0.35rem;">UPCOMING DEVELOPMENT DIVISION</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0.5rem;">RAYAN PROPERTIES</h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">Ultra-luxury waterfront estates, master-planned residential communities, and landmark metropolitan developments.</p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 4: CORE CAPABILITIES (Turnkey Solutions Matrix)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">INTEGRATED CAPABILITIES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">WHAT WE DELIVER</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          End-to-end engineering horsepower from deep foundations and civil towers to critical mechanical energy execution and South Asia industrial infrastructure.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🏗️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Turnkey Civil &amp; Building EPC</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Managing complete building construction lifecycles from deep piling to post-tensioned superstructure, envelope glazing, and MEP handover.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚙️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">South Asia Engineering &amp; Fabrication</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Heavy civil engineering, structural steel fabrication, industrial workshops, and South Asia project execution via Ashaz Engineering.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🛢️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Energy Facilities &amp; Pipelines</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Cross-country hydrocarbon pipelines, refinery turnaround contracting, pressure vessels, and tank farms to strict ASME &amp; API codes.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🛣️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Highway &amp; Utility Corridors</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Arterial road construction, deep stormwater drainage trunks, large-scale interlock paving (35,000+ sqm), and earthmoving grading.</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🎯</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Defense &amp; Special Acoustic Works</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">Specialized defense tactical shooting complexes (EDGE Group REMAYA) and STC-rated acoustic cinema VIP auditoriums (Roxy Cinemas).</p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🚜</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Heavy Plant &amp; Crane Fleets</h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">High-capacity mobile and crawler cranes up to 750 tonnes, multi-axle modular hydraulic transport, and central Mussafah maintenance workshops.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 5: FEATURED PROJECTS (16 Verified Real Case Studies)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">SIGNATURE TRACK RECORD</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase;">FEATURED PROJECTS</h2>
        </div>
        <a href="/projects/" class="btn-enterprise-primary">VIEW ALL 16 CASE STUDIES →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
        <!-- Project 1 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Renovation" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">HOSPITALITY</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">BROCK CONSTRUCTION PARTNERSHIP</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">Waldorf Astoria Hotel Luxury Renovation</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Full-scope 5-star hospitality refurbishment, presidential suites, acoustic ceiling isolation, and luxury finishes in Ras Al Khaimah.</p>
            <a href="/projects/waldorf-astoria-renovation-rak/" style="color: #0099e6; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <!-- Project 2 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Palm Jumeirah Luxury Estate" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #10b981;">COASTAL RESIDENTIAL</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">PALM JUMEIRAH, DUBAI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">Palm Jumeirah Ultra-Luxury Waterfront Estate</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Private waterfront estate civil engineering, structural works, imported Italian marble fit-out, and coastal perimeter retaining.</p>
            <a href="/projects/palm-jumeirah-rec-estate/" style="color: #10b981; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <!-- Project 3 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/c2-towers-al-bateen.jpg" alt="C2 Towers Al Bateen" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">HIGH-RISE EPC</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">AL BATEEN, ABU DHABI</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">C2 Towers Twin High-Rise Development</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Twin 22-story luxury waterfront residential development featuring architectural gypsum, post-tensioned slabs, and turnkey fit-out.</p>
            <a href="/projects/c2-towers-al-bateen/" style="color: #0099e6; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <!-- Project 4 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/edge-group-remaya.jpg" alt="EDGE Group REMAYA" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #c5a059;">DEFENSE &amp; SECURITY</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">EDGE GROUP TACTICAL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">EDGE Group REMAYA Tactical Complex</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Specialized defense tactical shooting complex incorporating high-density ballistic partitions and specialized structural engineering.</p>
            <a href="/projects/edge-group-remaya/" style="color: #c5a059; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <!-- Project 5 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Luxury Island Infinity Pool" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #0099e6;">AQUATIC RESORT</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">PRIVATE ISLAND, UAE</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">Luxury Island 50m Oceanfront Cantilevered Pool</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Cantilevered structural concrete pool engineering extending over coastal waters, horizon overflow waterfalls, and architectural landscaping.</p>
            <a href="/projects/luxury-island-infinity-pool/" style="color: #0099e6; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>

        <!-- Project 6 -->
        <article style="background: #0c1828; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 240px; overflow: hidden; position: relative;">
            <img src="/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg" alt="Roxy Cinemas Dubai Hills" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(7,17,30,0.85); backdrop-filter: blur(8px); padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #10b981;">RETAIL ENTERTAINMENT</span>
          </div>
          <div style="padding: 2rem;">
            <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">DUBAI HILLS MALL (EMAAR)</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">Roxy Cinemas VIP Auditoriums - Dubai Hills</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin-bottom: 1.25rem;">Acoustic sound isolation engineering, VIP cinema auditorium fit-out, and multi-tier stadium seating in premier regional destination.</p>
            <a href="/projects/roxy-cinema-dubai-hills-mall/" style="color: #10b981; font-size: 0.825rem; font-weight: 700; text-decoration: none;">EXPLORE CASE STUDY →</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 6: GLOBAL PRESENCE (Dual Strategic Hubs)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.85rem;">DUAL-HUB REACH</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.25rem;">
            STRATEGIC PRESENCE ACROSS UAE &amp; INDIA
          </h2>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
            Rayan Group unites corporate capital governance and megaproject execution from Abu Dhabi and Dubai with deep engineering fabrication capacity at Ashaz Engineering in India.
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="background: #0c1828; border-left: 3px solid #0099e6; padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0;">
              <strong style="color: #fff; font-size: 1.05rem; display: block;">Abu Dhabi Global Headquarters</strong>
              <span style="color: #94a3b8; font-size: 0.85rem;">Plot No. 42, Mussafah M-36 Industrial Area, Abu Dhabi, UAE • Central Executive Office &amp; Fleet Depot</span>
            </div>
            <div style="background: #0c1828; border-left: 3px solid #10b981; padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0;">
              <strong style="color: #fff; font-size: 1.05rem; display: block;">Dubai Commercial Operations</strong>
              <span style="color: #94a3b8; font-size: 0.85rem;">Commercial Project Sites &amp; Regional Coordination across Palm Jumeirah, Dubai Hills &amp; Silicon Oasis</span>
            </div>
            <div style="background: #0c1828; border-left: 3px solid #c5a059; padding: 1.25rem 1.5rem; border-radius: 0 8px 8px 0;">
              <strong style="color: #fff; font-size: 1.05rem; display: block;">South Asia Regional Hub (Ashaz Engineering)</strong>
              <span style="color: #94a3b8; font-size: 0.85rem;">Bettiah, Bihar &amp; New Delhi, India • Heavy Structural Steel Fabrication &amp; Engineering Center</span>
            </div>
          </div>
        </div>

        <div>
          <img src="/assets/images/about/global-presence.jpg" alt="Global Operations Map" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 45px rgba(0,0,0,0.5);">
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 7: CLIENTS, PARTNERS & ACCREDITATIONS (Asian Sky & New Way Pattern)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 750px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">TRUSTED PARTNERSHIPS</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem;">CLIENTS &amp; STRATEGIC PARTNERS</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Collaborating with premier developers, tier-one main contractors, hospitality groups, and defense entities across verified delivered projects.
        </p>
      </div>

      <!-- Verified Clients & Strategic Partners Dossier Grid -->
      <div class="partner-dossier-grid">
        <!-- 1. Brock Construction -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-partner">Strategic Partner</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">Brock Construction</h3>
            <p class="partner-entity-role">Tier-1 Main Contracting &amp; Civil Engineering Partner</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Waldorf Astoria Luxury Hotel Overhaul (RAK)</span>
            </span>
          </div>
        </div>

        <!-- 2. Dubai Hills Mall (Emaar) -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-developer">Master Developer</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">Dubai Hills Mall (Emaar)</h3>
            <p class="partner-entity-role">Master Developer &amp; Premier Retail Megaproject</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Roxy Cinemas VIP Auditoriums &amp; Acoustic Fit-Out</span>
            </span>
          </div>
        </div>

        <!-- 3. Hilton / Waldorf Astoria -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-hospitality">5-Star Hospitality</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">Hilton / Waldorf Astoria</h3>
            <p class="partner-entity-role">Luxury Global Hospitality &amp; Resort Operator</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Presidential Suites &amp; Grand Ballroom Refurbishment</span>
            </span>
          </div>
        </div>

        <!-- 4. Al Wahda Mall -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-retail">Commercial Asset</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">Al Wahda Mall</h3>
            <p class="partner-entity-role">Line Investments Commercial Destination (Abu Dhabi)</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Max Fashion Mega Anchor Store Engineering</span>
            </span>
          </div>
        </div>

        <!-- 5. EDGE Group (REMAYA) -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-defense">Defense &amp; Tactical</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">EDGE Group (REMAYA)</h3>
            <p class="partner-entity-role">UAE Sovereign Defense Technology &amp; Tactical Group</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>REMAYA Specialized Ballistic Shooting Complex</span>
            </span>
          </div>
        </div>

        <!-- 6. Dubai Police Academy -->
        <div class="partner-dossier-card">
          <div class="partner-card-header">
            <div class="partner-icon-capsule">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 22h16"/><path d="M12 2v20"/><path d="M2 18h20"/><path d="m19 9-7-7-7 7"/>
              </svg>
            </div>
            <span class="partner-type-badge partner-badge-gov">Government Civic</span>
          </div>
          <div class="partner-card-body">
            <h3 class="partner-entity-name">Dubai Police Academy</h3>
            <p class="partner-entity-role">Government Institutional Law Enforcement Complex</p>
          </div>
          <div class="partner-card-footer">
            <span class="partner-verified-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Specialized Tactical Facility &amp; Infrastructure</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Verified ISO Certifications Banner -->
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2rem 2.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">INTERNATIONAL ACCREDITATIONS</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin: 0.25rem 0;">CERTIFIED QUALITY, SAFETY &amp; ENVIRONMENTAL STANDARDS</h4>
        </div>
        <div class="iso-badge-row">
          <div class="iso-badge-item">
            <span class="iso-icon"></span>
            <span>ISO 9001:2015 (Quality)</span>
          </div>
          <div class="iso-badge-item">
            <span class="iso-icon"></span>
            <span>ISO 14001:2015 (Environment)</span>
          </div>
          <div class="iso-badge-item">
            <span class="iso-icon"></span>
            <span>ISO 45001:2018 (Safety)</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 8: HSE & SUSTAINABILITY (Zero-Harm Commitment)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981; display: block; margin-bottom: 0.85rem;">QHSE ZERO-HARM PHILOSOPHY</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase; line-height: 1.15; margin-bottom: 1.25rem;">
            SAFETY IS NON-NEGOTIABLE.
          </h2>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.7; margin-bottom: 1.25rem;">
            At Rayan Group, operational excellence begins with protecting our workforce and the surrounding environment. Every construction site, regional yard, and industrial fabrication facility operates under our certified zero-harm safety mandate.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; color: #94a3b8; margin-bottom: 2rem;">
            <li style="display: flex; gap: 0.6rem; align-items: center;"><span style="color: #10b981; font-weight: 700;">✓</span> Full-time NEBOSH-certified safety managers on all sites</li>
            <li style="display: flex; gap: 0.6rem; align-items: center;"><span style="color: #10b981; font-weight: 700;">✓</span> Universal Stop-Work Authority granted to every team member</li>
            <li style="display: flex; gap: 0.6rem; align-items: center;"><span style="color: #10b981; font-weight: 700;">✓</span> Daily safety toolboxes and rigorous permit-to-work systems</li>
          </ul>
          <a href="/sustainability/" class="btn-enterprise-primary">VIEW SUSTAINABILITY &amp; HSE →</a>
        </div>
        <div>
          <img src="/assets/images/sustainability/iso-45001.jpg" alt="Zero-Harm Safety Culture" style="width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 45px rgba(0,0,0,0.5);">
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 9: CAREERS & TALENT POOL (EthosEnergy / Khansaheb Pattern)
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: clamp(2rem, 4vw, 3.5rem); display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">CAREERS &amp; HUMAN CAPITAL</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3vw, 2.5rem); font-weight: 800; color: #fff; margin-bottom: 1rem;">BUILD YOUR FUTURE WITH RAYAN GROUP</h2>
          <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.75rem;">
            Join our multidisciplinary engineering teams across the UAE and India. We provide merit-driven career advancement, hands-on exposure to signature megaprojects, and world-class safety training.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/careers/#apply" class="btn-enterprise-primary" style="padding: 0.85rem 1.85rem;">SUBMIT YOUR CV →</a>
            <a href="/careers/" class="btn-enterprise-secondary" style="padding: 0.85rem 1.85rem;">EXPLORE DISCIPLINES</a>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.75rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 1rem;">ACTIVE TALENT DISCIPLINES</h4>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.85rem; color: #cbd5e1;">
            <li style="display: flex; justify-content: space-between;"><span>• Civil &amp; Structural Engineers</span><span style="color: #0099e6;">UAE &amp; India</span></li>
            <li style="display: flex; justify-content: space-between;"><span>• Heavy Steel Fabrication Engineers</span><span style="color: #0099e6;">India Regional Hub</span></li>
            <li style="display: flex; justify-content: space-between;"><span>• Energy Piping &amp; Quality Inspectors</span><span style="color: #0099e6;">UAE &amp; India</span></li>
            <li style="display: flex; justify-content: space-between;"><span>• Heavy Crane Operators &amp; Riggers</span><span style="color: #0099e6;">Abu Dhabi</span></li>
            <li style="display: flex; justify-content: space-between;"><span>• NEBOSH-Certified HSE Officers</span><span style="color: #0099e6;">All Yards</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 10: BUSINESS ENQUIRY CTA BANNER (Action Strip)
       ========================================================================== -->
  <section class="section" style="padding: 4.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div class="action-cta-banner">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.35rem;">ENGAGE WITH OUR COMMERCIAL TEAM</span>
          <h3 style="font-family: var(--font-heading); font-size: clamp(1.6rem, 2.8vw, 2.4rem); font-weight: 800; color: #fff; margin: 0;">READY TO START YOUR PROJECT?</h3>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; max-width: 600px;">
            Submit your project parameters, BOQ tender documents, or prequalification inquiries. Our technical estimating directors will respond within 48 business hours.
          </p>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/proposal/" class="btn-enterprise-primary" style="padding: 1rem 2.25rem;">REQUEST A PROPOSAL</a>
          <a href="/procurement/" class="btn-enterprise-secondary" style="padding: 1rem 2rem;">SUPPLIERS PORTAL</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       SECTION 11: LATEST NEWSROOM ANNOUNCEMENTS
       ========================================================================== -->
  <section class="section" style="padding: 6rem 0; background: var(--bg-dark);">
    <div class="container">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 3.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: block; margin-bottom: 0.5rem;">CORPORATE MEDIA</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: #fff; text-transform: uppercase;">LATEST ANNOUNCEMENTS</h2>
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
            <span style="font-size: 0.72rem; font-weight: 700; color: #0099e6; text-transform: uppercase;">PRESS RELEASE • CONTRACT AWARD</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Awarded Major Turnkey Commercial &amp; Infrastructure EPC Works</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Securing major commercial high-rise construction and civil engineering delivery across Abu Dhabi.</p>
            <a href="/news/rayan-group-expands-offshore-portfolio/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">READ FULL RELEASE →</a>
          </div>
        </article>

        <!-- News 2 -->
        <article style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 200px; overflow: hidden;">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Handover" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">PROJECT HANDOVER</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Successful Handover: Waldorf Astoria Luxury Hospitality Overhaul in RAK</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Full-scope interior fit-out, acoustic MEP reconfiguration, and luxury guestroom modernization delivered with Brock Construction.</p>
            <a href="/projects/waldorf-astoria-renovation-rak/" style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-decoration: none;">VIEW CASE STUDY →</a>
          </div>
        </article>

        <!-- News 3 -->
        <article style="background: #0c1828; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div style="height: 200px; overflow: hidden;">
            <img src="/assets/images/sustainability/iso-45001.jpg" alt="Triple ISO" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #c5a059; text-transform: uppercase;">QHSE AUDIT RENEWAL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0 1rem; line-height: 1.35;">Rayan Group Successfully Renews Global Triple ISO Quality &amp; Safety Certifications</h3>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">Achieving 100% compliance across ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 audits across all construction yards.</p>
            <a href="/sustainability/" style="font-size: 0.8rem; font-weight: 700; color: #0099e6; text-decoration: none;">VIEW HSE CERTIFICATIONS →</a>
          </div>
        </article>
      </div>
    </div>
  </section>
`;

createRoute('index.html', {
  title: 'Rayan Group — Multinational Engineering, Energy & Infrastructure Conglomerate',
  description: 'Rayan Group is a premier multinational engineering, critical energy EPC, civil infrastructure, and properties conglomerate operating across the UAE and South Asia.',
  activePath: '/',
  heroHtml: homeHeroHtml,
  content: homeContent
});

console.log('Homepage regenerated successfully with complete 12-section flow!');
