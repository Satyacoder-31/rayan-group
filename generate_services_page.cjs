const fs = require('fs');
const path = require('path');
const { wrapPage, renderPageHero, ensureDir } = require('./build_multipage_site.cjs');

function createRoute(relativePath, { title, description, activePath, heroHtml, content }) {
  const fullPath = path.join(__dirname, relativePath);
  ensureDir(fullPath);
  const html = wrapPage({ title, description, activePath, heroHtml, content });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`Generated services route: ${relativePath}`);
}

const servicesSubnav = [
  { label: 'All Services', href: '/services/', active: true },
  { label: 'Interior Fit-Out', href: '#interior-work', active: false },
  { label: 'Civil Infrastructure', href: '#civil-infrastructure', active: false },
  { label: 'Facilities Management & AMC', href: '#facilities-management', active: false },
  { label: 'AMC Packages', href: '#fm-amc-packages', active: false },
  { label: 'HVAC & Duct Cleaning', href: '#fm-hvac', active: false },
  { label: 'Plumbing & Power', href: '#fm-plumbing-electrical', active: false },
  { label: 'Emergency Dispatch (24/7)', href: '#fm-emergency', active: false },
  { label: 'Directory Matrix', href: '#service-directory', active: false },
  { label: 'Book Consultation / RFP', href: '#consultation', active: false }
];

const servicesHeroHtml = renderPageHero({
  category: 'COMPREHENSIVE CAPABILITIES',
  title: 'OUR SERVICES',
  description: 'Integrated engineering excellence and property lifecycle preservation: luxury interior fit-out, custom joinery, heavy civil engineering, highway networks, deep municipal utilities, and premier Facilities Management (FM) with 24/7 Annual Maintenance Contracts (AMC) across the UAE and South Asia.',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/' }
  ],
  bgImage: '/assets/services/02-building-maintenance.jpg',
  subnav: servicesSubnav
});

const servicesContent = `
  <!-- ==========================================================================
       0. STICKY QUICK ANCHOR SUBNAV
       ========================================================================== -->
  <div class="services-quick-bar" aria-label="Service Category Quick Links">
    <div class="container">
      <div class="services-quick-inner">
        <a href="#interior-work" class="service-pill-link active">✨ Interior Design &amp; Fit-Out (Flagship)</a>
        <a href="#scope-pillars" class="service-pill-link">📐 6 Interior Scope Pillars</a>
        <a href="#civil-infrastructure" class="service-pill-link" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.1);">🏗️ Civil &amp; Heavy Infrastructure (Major)</a>
        <a href="#civil-pillars" class="service-pill-link">🛣️ 9 Civil Scope Disciplines</a>
        <a href="#facilities-management" class="service-pill-link" style="color: #34d399; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.1);">🛠️ Facilities Management &amp; AMC (Division 03)</a>
        <a href="#fm-emergency" class="service-pill-link" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.12);">🚨 24/7 Rapid Emergency Dispatch</a>
        <a href="#fm-amc-packages" class="service-pill-link">📋 4 AMC Package Tiers</a>
        <a href="#fm-disciplines" class="service-pill-link">❄️ 8 FM Service Disciplines</a>
        <a href="#fm-specialist" class="service-pill-link">🎨 Specialized Trades &amp; Handyman</a>
        <a href="#fm-renovations" class="service-pill-link">🔨 Renovation Showcase</a>
        <a href="#service-directory" class="service-pill-link">📁 Unified Master Directory</a>
        <a href="#interior-portfolio" class="service-pill-link">🏆 Completed Projects</a>
        <a href="#faq" class="service-pill-link">❓ FAQ</a>
        <a href="#consultation" class="service-pill-link" style="background: rgba(0, 153, 230, 0.25); color: #38bdf8; border-color: rgba(0, 153, 230, 0.5);">📅 Request Consultation / RFP</a>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       1. FLAGSHIP SPOTLIGHT: INTERIOR WORK & TURNKEY FIT-OUT
       ========================================================================== -->
  <section class="section" id="interior-work" style="padding: 5.5rem 0 4rem; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div class="flagship-spotlight">
        <div style="display: grid; grid-template-columns: 1.25fr 0.85fr; gap: 3.5rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(0, 153, 230, 0.12); border: 1px solid rgba(0, 153, 230, 0.3); border-radius: 999px; padding: 0.35rem 1rem; margin-bottom: 1.25rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #0099e6; display: inline-block;"></span>
              <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #38bdf8;">DIVISION 01 — LUXURY ARCHITECTURAL INTERIORS</span>
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: clamp(2.2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.25rem;">
              LUXURY INTERIOR DESIGN &amp; TURNKEY FIT-OUT CONTRACTING
            </h2>
            
            <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
              Benchmarked against the pinnacle standards of the Dubai luxury market (referencing Indigo Living interior design standards), Rayan Group provides complete turnkey sovereignty: combining refined aesthetics with licensed Class-A general contracting execution.
            </p>
            
            <p style="font-size: 0.95rem; line-height: 1.65; color: #94a3b8; margin-bottom: 2rem;">
              From 2D space layouts, mood boards, and photorealistic 3D renders to authority permitting, in-house bespoke joinery, heavy civil modifications, MEP coordination, and white-glove styling handover.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="#consultation" class="btn-enterprise-primary" style="padding: 0.9rem 2rem;">BOOK DESIGN CONSULTATION →</a>
              <a href="#scope-pillars" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">EXPLORE INTERIOR SCOPE ↓</a>
              <a href="#civil-infrastructure" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem; border-color: rgba(245,158,11,0.5); color: #fbbf24;">VIEW CIVIL INFRASTRUCTURE →</a>
            </div>
          </div>

          <!-- Highlight Capability Matrix -->
          <div style="background: rgba(7, 17, 30, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; backdrop-filter: blur(10px);">
            <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              Key Interior Turnkey Metrics
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">CONTRACTING SCOPE</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #0099e6;">100%</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Design-to-Build</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">IN-HOUSE MILLWORK</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #f59e0b;">BESPOKE</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Custom Joinery Shop</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">QUALITY STANDARDS</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #10b981;">ISO</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">9001 / 14001 / 45001</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">PERMITS &amp; LICENSING</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #38bdf8;">CLASS-A</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">DM, DMT &amp; Civil Defense</span>
              </div>
            </div>

            <div style="background: rgba(0, 153, 230, 0.08); border: 1px solid rgba(0, 153, 230, 0.2); border-radius: 10px; padding: 1rem; font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
              <strong style="color: #38bdf8;">Interior Scope Benchmark:</strong> Covering luxury residential villas, 5-star hospitality overhauls (Waldorf Astoria RAK), corporate headquarters, bespoke joinery packages, and fast-track property staging.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       2. THE 6 CORE INTERIOR SCOPE PILLARS
       ========================================================================== -->
  <section class="section" id="scope-pillars" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6; display: inline-flex; align-items: center; gap: 0.5rem;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #0099e6; display: inline-block;"></span>
          INTERIOR CONTRACTING DISCIPLINES
        </span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.4vw, 2.85rem); font-weight: 800; color: #fff; margin-top: 0.5rem; text-transform: uppercase; line-height: 1.2;">
          INTERIOR WORK SCOPE OF SERVICES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.6;">
          Definitive technical disciplines, design frameworks, bespoke millwork, and turnkey deliverables executed across luxury environments.
        </p>
      </div>

      <div class="interior-scope-grid">
        <!-- 1. Residential Interior Design -->
        <div class="interior-card" id="residential">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/al-lisaili-villa.jpg" alt="Residential Interior Design - Luxury Villa" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">RESIDENTIAL EXCELLENCE</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 01</span>
            <h3 class="interior-card-title">Residential Interior Design</h3>
            <p class="interior-card-desc">
              Tailored luxury residential interiors creating cohesive, opulent living spaces designed around client lifestyles, family wellness, and architectural elegance.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Complete home and apartment interior design</strong> for luxury villas, penthouses, and residences</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Living room, bedroom and dining room interiors</strong> with tailored acoustic zoning and mood layering</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Space planning and furniture layouts</strong> optimizing spatial flow, natural daylighting, and circulation</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Colour schemes, materials and finishes</strong> featuring hand-selected marble, natural veneers, and luxury textiles</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Curtains, rugs, lighting and decorative accessories</strong> custom-made to exact room proportions</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Integration of existing furniture</strong> with bespoke new contemporary pieces for curated continuity</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Villas • Penthouses • Apartments</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 2. Commercial Interior Design -->
        <div class="interior-card" id="commercial">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/al-quoz-office.jpg" alt="Commercial Interior Design - Executive Office" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">COMMERCIAL &amp; WORKSPACES</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 02</span>
            <h3 class="interior-card-title">Commercial Interior Design</h3>
            <p class="interior-card-desc">
              Strategic workplace engineering and commercial environments that elevate corporate prestige, foster employee productivity, and embody brand identity.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Corporate offices and workspaces</strong> with ergonomic planning and BREEAM/LEED efficiency</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Reception areas and waiting lounges</strong> creating powerful, memorable corporate first impressions</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Meeting rooms and conference spaces</strong> integrated with AV cabling, acoustic baffles, and smart glass</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furniture selection and placement</strong> prioritizing commercial contract durability and ergonomics</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Functional layouts and professional finishes</strong> balancing open collaboration with acoustic privacy</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Commercial space styling</strong> including corporate branding, biophilic accents, and architectural signage</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">HQs • Tech Hubs • Financial Centers</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 3. Hospitality Interior Design -->
        <div class="interior-card" id="hospitality">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Hospitality Interior Design - 5-Star Hotel Renovation" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">5-STAR HOSPITALITY</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 03</span>
            <h3 class="interior-card-title">Hospitality Interior Design</h3>
            <p class="interior-card-desc">
              Immersive, high-traffic experiential interiors for world-class hotels, resorts, boutique lounges, and flagship restaurants.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Hotel rooms and suites</strong> engineered for 5-star acoustic comfort, luxury relaxation, and durability</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Hotel lobbies and lounges</strong> featuring soaring grand atriums, feature walls, and signature lighting</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Guest reception and common areas</strong> with optimized circulation and premium concierge portals</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furniture, lighting and decorative elements</strong> adhering to international hotel brand standards</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Guest-focused layouts and visual styling</strong> curating memorable photo-worthy guest touchpoints</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Restaurants, bars &amp; cafes fit-out</strong> (The Noodle House, Chipotle MBZ, Andina Lounge)</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Hotels • Resorts • Restaurants • Lounges</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 4. Renovation and Interior Execution -->
        <div class="interior-card" id="renovation">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/04-renovation-remodeling.jpg" alt="Renovation and Interior Execution" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">TURNKEY RENOVATION</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 04</span>
            <h3 class="interior-card-title">Renovation &amp; Interior Execution</h3>
            <p class="interior-card-desc">
              Comprehensive structural overhaul and cosmetic modernization of aging or shell-and-core properties delivered with pinpoint precision.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Kitchen and bathroom renovations</strong> with luxury cabinetry, waterproofing, and designer sanitaryware</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Flooring and wall finishes</strong> (large-format Italian porcelain, hardwood parquetry, micro-cement)</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Joinery and fitted interior elements</strong> integrated flush into existing architecture</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Material and finish selection</strong> with comprehensive mock-ups and tactile finish sample boards</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Space planning and renovation concepts</strong> reimagining flow and eliminating outdated layout bottlenecks</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Project coordination from design through execution</strong> with on-site QA/QC engineers and safety supervisors</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Complete Remodeling • MEP Upgrades</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 5. Custom Furniture and Joinery -->
        <div class="interior-card" id="custom-joinery">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/luxury-island-marble-works.jpg" alt="Custom Furniture and Joinery Fabrication" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">BESPOKE FABRICATION</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 05</span>
            <h3 class="interior-card-title">Custom Furniture &amp; Joinery</h3>
            <p class="interior-card-desc">
              In-house bespoke millwork shop and artisanal craftsmen fabricating one-of-a-kind furniture, dressing suites, and architectural woodwork.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Custom furniture design and development</strong> engineered from client sketches to millimeter perfection</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furniture in tailored sizes, materials and finishes</strong> (exotic walnuts, brass inlays, bookmatched veneers)</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Wardrobes and storage solutions</strong> featuring concealed LED lighting, velvet organizers, and glass doors</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Bespoke furniture packages</strong> tailored for entire luxury developments and private penthouses</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furniture selection aligned with overall concept</strong> ensuring harmonic balance across all architectural planes</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>CNC precision cutting and hand-finished craft</strong> backed by structural durability guarantees</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Custom Millwork • Walk-in Closets • FF&amp;E</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 6. Property Styling and Furnishing -->
        <div class="interior-card" id="property-styling">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Property Styling and Furnishing Staging" class="interior-card-img" loading="lazy">
            <span class="interior-card-badge">TURNKEY STAGING</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num">INTERIOR SCOPE 06</span>
            <h3 class="interior-card-title">Property Styling &amp; Furnishing</h3>
            <p class="interior-card-desc">
              Fast-track turnkey furnishing and high-end property staging engineered to maximize asset valuation, rental yields, and buyer emotional connection.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furnishing vacant apartments and villas</strong> with ready-to-move curated luxury collections</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Property staging for sale or rental</strong> dramatically reducing days-on-market and commanding top-tier pricing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Furniture and accessories selection</strong> curated by seasoned interior stylists</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Decorative styling and final setup</strong> including art hanging, luxury bedding dressing, and tabletop styling</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Preparing properties for photography and viewings</strong> ensuring cinematic marketing collateral</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Turnkey handover in as fast as 7-14 days</strong> for pre-selected luxury staging packages</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Staging for Resale • Holiday Homes • Penthouses</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       3. MAJOR DIVISION 02: CIVIL ENGINEERING & HEAVY INFRASTRUCTURE (AL GEEMI REFERENCE)
       ========================================================================== -->
  <section class="section" id="civil-infrastructure" style="padding: 5.5rem 0 4rem; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div class="civil-spotlight">
        <div style="display: grid; grid-template-columns: 1.25fr 0.85fr; gap: 3.5rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 999px; padding: 0.35rem 1rem; margin-bottom: 1.25rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
              <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fbbf24;">DIVISION 02 — HEAVY INFRASTRUCTURE &amp; PUBLIC WORKS</span>
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: clamp(2.2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.25rem;">
              CIVIL ENGINEERING &amp; HEAVY INFRASTRUCTURE CONTRACTING
            </h2>
            
            <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
              Benchmarked against premier UAE infrastructure contractors (referencing Al Geemi Contracting Infrastructure &amp; Heavy Civil scope), Rayan Group executes large-scale transportation networks, highways, bridges, deep stormwater drainage, municipal sewerage, water pipelines, and substation civil works.
            </p>
            
            <p style="font-size: 0.95rem; line-height: 1.65; color: #94a3b8; margin-bottom: 2rem;">
              Backed by our own fleet of heavy earthmoving machinery, asphalt paving equipment, trenching technology, and certified engineers accredited under Abu Dhabi Department of Municipalities and Transport (DMT), Integrated Transport Centre (ITC), Musanada, and Dubai RTA standards.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="#consultation" class="btn-enterprise-primary" style="padding: 0.9rem 2rem; background: #f59e0b; border-color: #f59e0b; color: #000; font-weight: 800;">SUBMIT INFRASTRUCTURE RFP →</a>
              <a href="#civil-pillars" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">DETAILED CIVIL SCOPE ↓</a>
              <a href="#civil-plant" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">HEAVY PLANT &amp; FLEET ↓</a>
            </div>
          </div>

          <!-- Highlight Heavy Civil Capability Matrix -->
          <div style="background: rgba(7, 17, 30, 0.75); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; padding: 2rem; backdrop-filter: blur(10px);">
            <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              Civil Contracting Metrics
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">HEAVY FLEET ASSETS</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #f59e0b;">50+</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Owned Heavy Machines</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">CIVIL CLASSIFICATION</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #10b981;">CLASS 1</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Infrastructure Contracting</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">HSE TRACK RECORD</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #0099e6;">ZERO</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Lost Time Incidents (LTI)</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">UTILITIES CAPABILITY</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #a855f7;">DEEP</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Microtunneling &amp; Mains</span>
              </div>
            </div>

            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 1rem; font-size: 0.8rem; color: #cbd5e1; line-height: 1.5;">
              <strong style="color: #fbbf24;">Regulatory Alignment:</strong> Fully compliant with Abu Dhabi DMT, ITC, Musanada, ADDC, Dubai RTA, and DEWA specifications for all municipal and master community infrastructures.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       4. THE 9 CORE CIVIL & HEAVY INFRASTRUCTURE SCOPE PILLARS
       ========================================================================== -->
  <section class="section" id="civil-pillars" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 840px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f59e0b; display: inline-flex; align-items: center; gap: 0.5rem;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
          TRANSPORTATION, UTILITIES &amp; CIVIL STRUCTURES
        </span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.4vw, 2.85rem); font-weight: 800; color: #fff; margin-top: 0.5rem; text-transform: uppercase; line-height: 1.2;">
          CIVIL ENGINEERING &amp; INFRASTRUCTURE SCOPE
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.6;">
          Organized breakdown of Rayan Group's heavy civil execution capabilities across 9 critical public works and utility domains.
        </p>
      </div>

      <div class="interior-scope-grid">
        <!-- 1. Roads, Highways & Internal Roads -->
        <div class="interior-card" id="civil-roads">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/03-civil-engineering.jpg" alt="Roads and Highways Construction" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">HIGHWAYS &amp; ROADS</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 01</span>
            <h3 class="interior-card-title">Roads, Highways &amp; Internal Roads</h3>
            <p class="interior-card-desc">
              Turnkey arterial highways, dual carriageways, industrial corridors, and master community internal road infrastructure built to international heavy-load standards.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Main roads and highway construction</strong> including multi-lane expressways and interchanges</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Internal roads for master residential developments</strong>, industrial cities &amp; commercial zones</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Road foundations, sub-grade stabilization</strong>, aggregate base course, and high-performance asphalt pavement</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Road rehabilitation, asphalt milling</strong>, deep pavement rejuvenation, and geometric improvements</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Thermoplastic road markings, regulatory signage</strong>, cat eyes, and associated road furniture</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Expressways • Pavements • Interchanges</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 2. Airports & Airfields -->
        <div class="interior-card" id="civil-airports">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/hero/hero-infrastructure-cranes.jpg" alt="Airports and Airfields Civil Infrastructure" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">AVIATION &amp; AIRFIELDS</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 02</span>
            <h3 class="interior-card-title">Airports &amp; Airfield Infrastructure</h3>
            <p class="interior-card-desc">
              Specialized civil works and ultra-heavy load-bearing pavement infrastructure for civil airports, defense airbases, and private aviation airstrips.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Airport and airfield civil infrastructure</strong> development and ground engineering</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Runway and taxiway civil works</strong> with high-friction Marshall / Superpave polymer-modified asphalt</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Airfield pavement, aircraft parking aprons</strong>, and heavy access service roads</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Mass ground preparation, earthworks</strong>, drainage swales, and airfield security perimeter fencing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Aviation utility trenching &amp; airfield lighting (AGL)</strong> civil duct bank integration</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Runways • Taxiways • Aprons</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 3. Bridges & Civil Structures -->
        <div class="interior-card" id="civil-bridges">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/business/03-infrastructure.jpg" alt="Bridges and Civil Structures Engineering" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">BRIDGES &amp; STRUCTURES</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 03</span>
            <h3 class="interior-card-title">Bridges &amp; Civil Structures</h3>
            <p class="interior-card-desc">
              Monumental reinforced concrete bridge engineering, flyovers, pedestrian underpasses, and transportation viaducts built for multi-decade durability.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Bridge construction, flyovers</strong>, and grade-separated road interchange structures</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Deep pile foundations, pile caps</strong>, reinforced concrete piers, and abutment walls</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Pre-stressed &amp; post-tensioned bridge decks</strong>, elastomeric bearings, and expansion joints</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Road connections, approach ramps</strong>, Mechanically Stabilized Earth (MSE) retaining walls</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Precast concrete box culverts</strong>, underground animal crossings, and pedestrian underpasses</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Flyovers • Piling • Culverts</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 4. Drainage Systems -->
        <div class="interior-card" id="civil-drainage">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/01-building-construction.jpg" alt="Stormwater Drainage Systems" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">STORMWATER &amp; DRAINAGE</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 04</span>
            <h3 class="interior-card-title">Stormwater Drainage Systems</h3>
            <p class="interior-card-desc">
              Resilient stormwater management networks, flood mitigation basins, and deep drainage pipelines shielding municipal and residential assets from torrential rains.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Municipal stormwater drainage networks</strong> and high-capacity trunk mains</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Underground micro-tunneling</strong> and trenchless pipe jacking infrastructure</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Reinforced concrete pipelines, perforated soakaway fields</strong>, and attenuation basins</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Surface water management, gully chambers</strong>, oil interceptors, and silt traps</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Flood defense infrastructure</strong> for highways, logistics hubs, and urban master plans</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Stormwater Mains • Flood Defense</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 5. Sewerage Works & Pumping Stations -->
        <div class="interior-card" id="civil-sewerage">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/05-mep-services.jpg" alt="Sewerage Works and Pumping Stations" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">SEWERAGE &amp; PUMPING</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 05</span>
            <h3 class="interior-card-title">Sewerage Works &amp; Pumping Stations</h3>
            <p class="interior-card-desc">
              Turnkey gravity sewerage collection networks, deep wastewater pipelines, and civil execution of heavy lift pumping station facilities.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Sewerage network construction</strong> conforming to ADSSC and Dubai Municipality regulations</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Underground wastewater pipelines</strong> (Vitrified Clay, GRP, and HDPE pressure mains)</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Deep sewage pumping station civil works</strong>, wet wells, valve chambers &amp; generator houses</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Epoxy-lined precast concrete manholes</strong>, drop connections, and odor bio-filtration chambers</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Utility connections and bypass pumping</strong> during brownfield live-network tie-ins</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Wastewater Mains • Wet Wells</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 6. Water Distribution Networks -->
        <div class="interior-card" id="civil-water">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/03-civil-engineering.jpg" alt="Water Distribution Networks" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">POTABLE WATER NETWORKS</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 06</span>
            <h3 class="interior-card-title">Water Distribution Networks</h3>
            <p class="interior-card-desc">
              Strategic potable water transmission pipelines, pressure management infrastructure, and residential community distribution grids.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Water supply pipeline networks</strong> compliant with ADDC, AADC and DEWA authorities</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>High-diameter transmission infrastructure</strong> in Ductile Iron (DI) and electrofusion HDPE</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Trench excavation, pipe bedding, hydrostatic testing</strong>, and pipeline sterilization</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Reinforced concrete valve chambers</strong>, flow meter chambers, and air release stations</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Thrust blocks, pipeline tie-ins</strong>, and pressure-reducing valve (PRV) stations</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Ductile Iron • HDPE • PRV Vaults</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 7. Electrical Distribution & Substations -->
        <div class="interior-card" id="civil-electrical">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/11-electrical-works.jpg" alt="Electrical Distribution and Substations Civil Works" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">POWER &amp; SUBSTATIONS</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 07</span>
            <h3 class="interior-card-title">Electrical Distribution &amp; Substations</h3>
            <p class="interior-card-desc">
              Civil engineering infrastructure supporting regional electrical distribution, high-voltage substations, and underground cable corridors.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Electrical distribution infrastructure</strong> civil corridors for MV/LV underground cables</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>11kV, 33kV and 132kV primary substation civil construction</strong> and equipment buildings</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Heavy transformer concrete equipment plinths</strong>, oil containment pits, and blast barrier walls</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Precast cable trenching, concrete duct banks</strong>, road crossings, and draw pits</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Earthing grid civil installation</strong> and utility coordination supporting power distribution</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">11kV/33kV Substations • Cable Corridors</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 8. Landscaping, Farms & Forests -->
        <div class="interior-card" id="civil-landscaping">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/al-qua-school-infrastructure.jpg" alt="Landscaping, Farms and Forestry Development" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">LANDSCAPING &amp; EXTERNAL</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 08</span>
            <h3 class="interior-card-title">Landscaping, Farms &amp; Forests</h3>
            <p class="interior-card-desc">
              Large-scale site grading, public realm green spaces, agricultural earthworks, and automated irrigation networks along major infrastructure corridors.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Landscape development, mass grading</strong>, and extensive site preparation earthworks</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Green spaces, public parks, urban plazas</strong>, and outdoor recreational community realms</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Planting of indigenous flora, mature date palms</strong>, and automated smart drip irrigation</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Farm and forestry-related development works</strong>, soil conditioning &amp; shelterbelt berms</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Environmental landscaping around highways</strong> and sound-dampening soil barriers</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Public Parks • Farms • Irrigation</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>

        <!-- 9. Road Furniture & Supporting Infrastructure -->
        <div class="interior-card" id="civil-safety">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/03-civil-engineering.jpg" alt="Road Furniture and Traffic Safety Infrastructure" class="interior-card-img" loading="lazy">
            <span class="civil-scope-badge">TRAFFIC SAFETY &amp; FURNITURE</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #f59e0b;">CIVIL SCOPE 09</span>
            <h3 class="interior-card-title">Road Furniture &amp; Safety Infrastructure</h3>
            <p class="interior-card-desc">
              Highway life safety systems, overhead directional gantries, crash barriers, and roadside assets compliant with UAE Federal and DMT specifications.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Road signs, overhead cantilever gantries</strong>, and illuminated traffic directional signs</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Galvanized steel safety barriers, W-beam guardrails</strong>, and high-containment concrete barriers</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Roadside fixtures, high-mast lighting foundations</strong>, and speed-attenuation crash cushions</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Pedestrian fencing, tactile walking pavers</strong>, and integrated bicycle corridor dividers</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Associated safety civil works</strong> for major highways, bypasses, and urban boulevards</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Sign Gantries • Guardrails • Barriers</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Scope →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       5. SUSTAINABLE INFRASTRUCTURE & RESOURCE CONSERVATION
       ========================================================================== -->
  <section class="section" id="civil-sustainability" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;" class="intro-grid-responsive">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            ENVIRONMENTALLY CONSCIOUS ENGINEERING
          </span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(1.9rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; line-height: 1.2; text-transform: uppercase; margin-bottom: 1.25rem;">
            SUSTAINABLE INFRASTRUCTURE DELIVERY
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
            Rayan Group integrates environmental sustainability across every phase of civil construction. Aligned with the UAE Net Zero 2050 charter and Estidama Pearl Infrastructure Rating System, we deploy low-carbon construction methods and resource-efficient engineering.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 0.85rem;">
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; color: #cbd5e1; font-size: 0.9rem;">
              <span style="color: #10b981; font-weight: bold;">✔</span>
              <span><strong>Recycled Crushed Aggregates:</strong> Utilizing recycled concrete pavement and slag in sub-base foundations to minimize quarry extraction.</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; color: #cbd5e1; font-size: 0.9rem;">
              <span style="color: #10b981; font-weight: bold;">✔</span>
              <span><strong>Warm-Mix Asphalt Technologies:</strong> Lowering asphalt production temperatures by 30°C to significantly reduce carbon emissions.</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; color: #cbd5e1; font-size: 0.9rem;">
              <span style="color: #10b981; font-weight: bold;">✔</span>
              <span><strong>Solar-Powered Road Infrastructure:</strong> Photovoltaic LED street lighting and autonomous solar-powered warning gantries.</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; color: #cbd5e1; font-size: 0.9rem;">
              <span style="color: #10b981; font-weight: bold;">✔</span>
              <span><strong>Treated Sewage Effluent (TSE) Irrigation:</strong> 100% recycled water utilization for civil compaction and landscape maintenance.</span>
            </li>
          </ul>
          <a href="/sustainability/" class="btn-enterprise-primary" style="background: #10b981; border-color: #10b981; color: #000; font-weight: 800;">EXPLORE ESG &amp; NET ZERO →</a>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 18px; padding: 2.5rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #fff; font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase;">
            Environmental Mitigation Pillars
          </h3>
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 1.25rem;">
              <h4 style="color: #10b981; font-size: 0.95rem; margin-bottom: 0.35rem;">Zero Landfill Diversion Target</h4>
              <p style="color: #94a3b8; font-size: 0.825rem; line-height: 1.5; margin: 0;">Over 85% of asphalt millings, excavation spoil, and construction rubble processed and reused as engineered fill on adjacent packages.</p>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 1.25rem;">
              <h4 style="color: #10b981; font-size: 0.95rem; margin-bottom: 0.35rem;">Dust &amp; Noise Abatement</h4>
              <p style="color: #94a3b8; font-size: 0.825rem; line-height: 1.5; margin: 0;">Continuous air-quality monitoring, automated misting canons, acoustic baffling on plant generators, and low-decibel hydraulic breakers.</p>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 1.25rem;">
              <h4 style="color: #10b981; font-size: 0.95rem; margin-bottom: 0.35rem;">Groundwater &amp; Marine Protection</h4>
              <p style="color: #94a3b8; font-size: 0.825rem; line-height: 1.5; margin: 0;">Silt curtains for coastal works, closed-loop dewatering settlement basins, and hydrocarbon containment bunding across all refueling depots.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       6. HEAVY PLANT & EQUIPMENT FLEET
       ========================================================================== -->
  <section class="section" id="civil-plant" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f59e0b;">EXECUTION MACHINERY HORSEPOWER</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          HEAVY CONSTRUCTION PLANT &amp; EQUIPMENT FLEET
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Rayan Group commands an extensive fleet of modern, GPS-guided heavy civil construction machinery ensuring rapid project mobilization and schedule certainty.
        </p>
      </div>

      <div class="civil-plant-grid">
        <div class="civil-plant-card">
          <div style="font-size: 2rem; margin-bottom: 0.85rem;">🚜</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Heavy Earthmoving Fleet</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.55; margin-bottom: 1rem;">Caterpillar 349/336 heavy excavators, Komatsu D8/D9 crawler bulldozers, 966 wheel loaders, and high-tonnage articulated dumpers.</p>
          <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 700;">Owned Machinery: 20+ Units</span>
        </div>

        <div class="civil-plant-card">
          <div style="font-size: 2rem; margin-bottom: 0.85rem;">🛣️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Asphalt Paving &amp; Compaction</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.55; margin-bottom: 1rem;">Vogele Super 1900/2100 asphalt pavers with laser-leveling screeds, Hamm tandem vibration rollers, and multi-wheel pneumatic rollers.</p>
          <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 700;">Precision Tolerances: &lt;3mm</span>
        </div>

        <div class="civil-plant-card">
          <div style="font-size: 2rem; margin-bottom: 0.85rem;">📏</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Grading &amp; Rock Trenching</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.55; margin-bottom: 1rem;">CAT 14M/16M motor graders equipped with 3D GPS Topcon guidance systems, Vermeer continuous rock trenchers, and hydraulic hammers.</p>
          <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 700;">3D GPS Laser Guidance</span>
        </div>

        <div class="civil-plant-card">
          <div style="font-size: 2rem; margin-bottom: 0.85rem;">🚚</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Logistics &amp; Support Fleets</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.55; margin-bottom: 1rem;">Mercedes-Benz Actros 8x4 tipper fleet, potable water tankers, low-bed heavy equipment transporters, and mobile mechanical maintenance vans.</p>
          <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 700;">Rapid 24/7 Field Support</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       7. QHSE MANAGEMENT SYSTEM & CERTIFICATIONS
       ========================================================================== -->
  <section class="section" id="civil-qhse" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">SAFETY &amp; QUALITY ASSURANCE</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3.2vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          QUALITY, HEALTH, SAFETY &amp; ENVIRONMENT (QHSE)
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Our civil infrastructure operations function under an Integrated Management System certified to international standards.
        </p>
      </div>

      <div class="qhse-badge-grid">
        <div class="qhse-card">
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">CERTIFIED STANDARD</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; font-weight: 800; margin-bottom: 0.5rem;">ISO 9001:2015</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Quality Management System ensuring strict compliance with client specifications, material testing, and zero-defect handovers.</p>
        </div>

        <div class="qhse-card">
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">CERTIFIED STANDARD</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; font-weight: 800; margin-bottom: 0.5rem;">ISO 14001:2015</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Environmental Management System protecting surrounding biodiversity, controlling dust/noise, and maximizing material recycling.</p>
        </div>

        <div class="qhse-card">
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">CERTIFIED STANDARD</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; font-weight: 800; margin-bottom: 0.5rem;">ISO 45001:2018</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Occupational Health and Safety Management enforcing zero-compromise site safety, hazard mitigation, and mandatory PPE compliance.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       8. CIVIL INFRASTRUCTURE PROJECT EXECUTION LIFECYCLE
       ========================================================================== -->
  <section class="section" id="civil-lifecycle" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f59e0b;">METHODOLOGY &amp; GOVERNANCE</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          CIVIL PROJECT EXECUTION LIFECYCLE
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.6;">
          Our 6-phase engineering lifecycle guarantees project delivery on schedule, within budget, and to municipal authority specifications.
        </p>
      </div>

      <div class="workflow-timeline" style="grid-template-columns: repeat(6, 1fr);">
        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">01</div>
          <h3 class="workflow-step-title">Survey &amp; GPR Mapping</h3>
          <p class="workflow-step-desc">Laser topography, Ground Penetrating Radar (GPR) utility mapping, geotechnical core boreholes, and initial authority NOCs.</p>
        </div>

        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">02</div>
          <h3 class="workflow-step-title">Mobilization &amp; TMPs</h3>
          <p class="workflow-step-desc">Site setup, ITC/RTA Traffic Management Plan (TMP) implementation, detour creation, and bulk cut/fill earthmoving.</p>
        </div>

        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">03</div>
          <h3 class="workflow-step-title">Deep Utility Networks</h3>
          <p class="workflow-step-desc">Microtunneling, stormwater culverts, gravity sewerage, potable water mains, and power duct bank trenching.</p>
        </div>

        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">04</div>
          <h3 class="workflow-step-title">Foundations &amp; Sub-Base</h3>
          <p class="workflow-step-desc">Subgrade compaction testing (98% proctor), aggregate base course laying, and bridge foundation structural concrete.</p>
        </div>

        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">05</div>
          <h3 class="workflow-step-title">Asphalt Paving</h3>
          <p class="workflow-step-desc">Bituminous base, binder course, and polymer wearing course paving with laser grade control and nuclear density testing.</p>
        </div>

        <div class="workflow-step-card">
          <div class="workflow-num-bubble" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; background: rgba(245, 158, 11, 0.12);">06</div>
          <h3 class="workflow-step-title">Furniture &amp; Handover</h3>
          <p class="workflow-step-desc">Sign gantries, guardrails, line striping, street lighting energization, municipal inspection, and operational handover.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       9. CLIENTS & SECTORS SERVED
       ========================================================================== -->
  <section class="section" style="padding: 4.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 2.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">GOVERNMENT &amp; DEVELOPER TRUST</span>
        <h2 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          AUTHORITIES, CLIENTS &amp; SECTORS
        </h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Abu Dhabi DMT</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Municipalities &amp; Transport</span>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">ITC Abu Dhabi</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Integrated Transport Centre</span>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Musanada</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">General Services Co.</span>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">ADDC &amp; TAQA</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Water &amp; Power Networks</span>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Dubai RTA</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Roads &amp; Transport Authority</span>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem; text-align: center;">
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Master Developers</div>
          <span style="font-size: 0.75rem; color: #94a3b8;">Aldar, Modon, Emaar</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       DIVISION 03 — INTEGRATED FACILITIES MANAGEMENT & AMC (HAYATT GROUP BENCHMARK)
       ========================================================================== -->
  <section class="section" id="facilities-management" style="padding: 5.5rem 0 4rem; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div class="fm-spotlight">
        <div style="display: grid; grid-template-columns: 1.25fr 0.85fr; gap: 3.5rem; align-items: center;" class="intro-grid-responsive">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 999px; padding: 0.35rem 1rem; margin-bottom: 1.25rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #34d399;">DIVISION 03 — FACILITIES MANAGEMENT &amp; ASSET LIFECYCLE</span>
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: clamp(2.2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.25rem;">
              FACILITIES MANAGEMENT &amp; ANNUAL MAINTENANCE CONTRACTS
            </h2>
            
            <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
              Benchmarked against premier UAE property maintenance standards (referencing Hayatt Group facilities scope), Rayan Group provides end-to-end facilities management, scheduled preventive maintenance contracts (AMC), rapid emergency repairs, deep specialized cleaning, and civil renovations across Abu Dhabi, Dubai, and the Northern Emirates.
            </p>
            
            <p style="font-size: 0.95rem; line-height: 1.65; color: #94a3b8; margin-bottom: 2rem;">
              Preserving asset value for residential luxury villas, master-planned developments, corporate headquarters, and commercial towers with certified multi-skilled technicians and a SLA-backed 24/7 emergency dispatch.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="#fm-amc-packages" class="btn-enterprise-primary" style="padding: 0.9rem 2rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: #10b981;">EXPLORE AMC PACKAGES ↓</a>
              <a href="#fm-emergency" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem; border-color: rgba(239, 68, 68, 0.5); color: #f87171;">24/7 EMERGENCY DISPATCH 🚨</a>
              <a href="#consultation" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">REQUEST AMC QUOTE →</a>
            </div>
          </div>

          <!-- Highlight FM Capability Matrix -->
          <div style="background: rgba(7, 17, 30, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; backdrop-filter: blur(10px);">
            <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              Facilities Management Metrics
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">EMERGENCY RESPONSE</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #10b981;">24/7</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Rapid Dispatch Hotline</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">URGENT ARRIVAL SLA</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #38bdf8;">&lt; 60 MIN</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Priority Emergency Care</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">IN-HOUSE WORKFORCE</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #f59e0b;">100%</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Certified Technicians</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">FIRST-TIME RESOLUTION</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #34d399;">99.8%</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Client Satisfaction Rate</span>
              </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.5rem;">PRIMARY ASSET COVERAGE</span>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.72rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.65rem; border-radius: 4px; color: #cbd5e1;">Luxury Villas &amp; Mansions</span>
                <span style="font-size: 0.72rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.65rem; border-radius: 4px; color: #cbd5e1;">High-End Penthouses</span>
                <span style="font-size: 0.72rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.65rem; border-radius: 4px; color: #cbd5e1;">Commercial Office Towers</span>
                <span style="font-size: 0.72rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.65rem; border-radius: 4px; color: #cbd5e1;">Retail &amp; Hospitality Assets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.1 24/7 RAPID EMERGENCY ASSISTANCE PROTOCOL
       ========================================================================== -->
  <section class="section" id="fm-emergency" style="padding: 3.5rem 0 0; background: #07111e;">
    <div class="container">
      <div class="fm-emergency-banner">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span class="emergency-pulse-dot"></span>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #ef4444;">CRITICAL ASSISTANCE</span>
              <span style="font-size: 0.72rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 999px; padding: 0.1rem 0.5rem;">SLA &lt; 60 MIN</span>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0.2rem 0;">
              24/7 EMERGENCY REPAIR &amp; CALL-OUT DISPATCH
            </h3>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.4;">
              Immediate emergency technician mobilization across Abu Dhabi &amp; Dubai for AC breakdown, burst pipes, electrical failure &amp; sewer blockages.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="tel:+97125654497" class="btn-enterprise-primary" style="background: #ef4444; border-color: #ef4444; padding: 0.75rem 1.5rem; font-size: 0.85rem;">
            📞 CALL EMERGENCY: +971 2 565 4497
          </a>
          <a href="https://wa.me/971500000000?text=Urgent%20Maintenance%20Request" target="_blank" rel="noopener noreferrer" class="btn-enterprise-secondary" style="border-color: rgba(34, 197, 94, 0.5); color: #4ade80; padding: 0.75rem 1.5rem; font-size: 0.85rem;">
            💬 WHATSAPP DISPATCH
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.2 ANNUAL MAINTENANCE CONTRACTS (AMC) PACKAGES
       ========================================================================== -->
  <section class="section" id="fm-amc-packages" style="padding: 4.5rem 0 5.5rem; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 3rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">PREVENTIVE PROPERTY CARE</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          ANNUAL MAINTENANCE CONTRACT (AMC) PACKAGES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Structured recurring maintenance packages providing scheduled proactive visits, guaranteed priority emergency response times, and comprehensive MEP protection across premier UAE communities.
        </p>
      </div>

      <!-- 4 AMC Packages Grid -->
      <div class="amc-packages-grid">
        <!-- 1. Essential Care AMC -->
        <div class="amc-package-card">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em;">TIER 01 — STANDARD</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff; font-weight: 800; margin: 0.35rem 0 0.5rem;">Essential Care AMC</h3>
          <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">
            Ideal for luxury apartments, townhomes, and rental property owners seeking essential MEP reliability.
          </p>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 0; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: #cbd5e1;"><strong>3 Scheduled PPM Visits / Year</strong> (Tri-annual)</div>
            <div style="font-size: 0.75rem; color: #cbd5e1;"><strong>Standard Emergency SLA:</strong> Within 4 Hours</div>
          </div>

          <ul class="amc-feature-list">
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>AC filter washing, coil inspection &amp; thermostat calibration</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Plumbing leakage checks, water heater &amp; mixer inspections</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Electrical DB breaker balancing &amp; socket grounding tests</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>10% Discount on specialized materials &amp; major parts</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Digital inspection report after every preventive service</span>
            </li>
          </ul>

          <a href="#consultation" class="btn-enterprise-secondary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.85rem;">
            SELECT ESSENTIAL PACKAGE
          </a>
        </div>

        <!-- 2. Executive Villa AMC (Featured) -->
        <div class="amc-package-card featured-package">
          <span class="amc-badge-popular">MOST POPULAR</span>
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #10b981; letter-spacing: 0.1em;">TIER 02 — COMPREHENSIVE</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff; font-weight: 800; margin: 0.35rem 0 0.5rem;">Executive Villa AMC</h3>
          <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">
            Engineered specifically for premium independent villas and townhomes in master communities.
          </p>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 0; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: #34d399;"><strong>6 Scheduled PPM Visits / Year</strong> (Bi-monthly)</div>
            <div style="font-size: 0.75rem; color: #34d399;"><strong>Priority Emergency SLA:</strong> Guaranteed &lt; 2 Hours</div>
          </div>

          <ul class="amc-feature-list">
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Deep chemical coil wash, drain tray flushing &amp; gas top-up</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span><strong>Unlimited emergency call-outs</strong> with priority dispatch</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Booster pump, float valve &amp; drainage blockage clearance</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span><strong>Consumables included:</strong> capacitors, fuses, washers &amp; sealants</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Includes 6 complimentary handyman hours / year for minor fixtures</span>
            </li>
          </ul>

          <a href="#consultation" class="btn-enterprise-primary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.85rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            SELECT EXECUTIVE PACKAGE
          </a>
        </div>

        <!-- 3. Prestige / Royal Villa AMC -->
        <div class="amc-package-card">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #fbbf24; letter-spacing: 0.1em;">TIER 03 — LUXURY ESTATE</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff; font-weight: 800; margin: 0.35rem 0 0.5rem;">Prestige Royal Estate</h3>
          <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">
            Turnkey white-glove estate management for high-net-worth waterfront villas and sprawling compounds.
          </p>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 0; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: #fbbf24;"><strong>12 Scheduled Monthly PPM Visits</strong> (Every 30 Days)</div>
            <div style="font-size: 0.75rem; color: #fbbf24;"><strong>VIP Emergency SLA:</strong> Priority &lt; 60 Minutes</div>
          </div>

          <ul class="amc-feature-list">
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span><strong>Weekly Swimming Pool maintenance:</strong> chemical balancing &amp; vacuum</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Automated garden irrigation audits &amp; quarterly eco-pest control</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Annual comprehensive AC duct camera inspection &amp; sanitization</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Dedicated Senior Facilities Account Manager &amp; VIP hotline</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Full civil defect patching, grout touch-ups &amp; painting rectification</span>
            </li>
          </ul>

          <a href="#consultation" class="btn-enterprise-secondary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.85rem; border-color: rgba(245,158,11,0.5); color: #fbbf24;">
            SELECT PRESTIGE PACKAGE
          </a>
        </div>

        <!-- 4. Corporate & Commercial FM -->
        <div class="amc-package-card">
          <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.1em;">TIER 04 — ENTERPRISE</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #fff; font-weight: 800; margin: 0.35rem 0 0.5rem;">Corporate &amp; Commercial</h3>
          <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;">
            Tailored hard and soft FM solutions for commercial office towers, corporate HQs, retail, and mixed-use.
          </p>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 0; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: #38bdf8;"><strong>Bespoke Contract SLA:</strong> On-Site or Mobile Team</div>
            <div style="font-size: 0.75rem; color: #38bdf8;"><strong>24/7 CAFM Helpdesk:</strong> Live Digital Job Tracking</div>
          </div>

          <ul class="amc-feature-list">
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Heavy chiller plants, cooling towers, AHUs, and BMS controls</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Civil Defense statutory compliance, fire alarms &amp; sprinkler checks</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Commercial electrical substations, LV panels &amp; backup generators</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Integrated soft services: facade cleaning, sanitization &amp; security</span>
            </li>
            <li class="amc-feature-item">
              <svg class="amc-feature-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Executive monthly asset audits, lifecycle analysis &amp; energy audits</span>
            </li>
          </ul>

          <a href="#consultation" class="btn-enterprise-secondary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.85rem; border-color: rgba(56,189,248,0.5); color: #38bdf8;">
            REQUEST COMMERCIAL RFP
          </a>
        </div>
      </div>

      <!-- Premier UAE Community Coverage Banner -->
      <div style="margin-top: 3.5rem; background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">LOCAL DISPATCH HUBS</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin: 0.2rem 0;">PROUDLY SERVING PREMIER UAE COMMUNITIES</h4>
          </div>
          <span style="font-size: 0.8rem; color: #94a3b8;">Rapid dispatch vans stationed across Abu Dhabi &amp; Dubai</span>
        </div>

        <div class="community-coverage-wrap">
          <span class="community-pill">📍 Al Bandar (Al Raha Beach)</span>
          <span class="community-pill">📍 Al Hadeel</span>
          <span class="community-pill">📍 Al Raha Gardens</span>
          <span class="community-pill">📍 Al Zeina</span>
          <span class="community-pill">📍 Saadiyat Beach Villas</span>
          <span class="community-pill">📍 Saadiyat Lagoons</span>
          <span class="community-pill">📍 Yas Island Communities (Yas Acres / West Yas)</span>
          <span class="community-pill">📍 Al Reem Island (Gate / Sun &amp; Sky)</span>
          <span class="community-pill">📍 Al Maryah Island</span>
          <span class="community-pill">📍 Al Bateen Waterfront</span>
          <span class="community-pill">📍 Palm Jumeirah (Dubai)</span>
          <span class="community-pill">📍 Dubai Hills Estate</span>
          <span class="community-pill">📍 Emirates Hills</span>
          <span class="community-pill">📍 Downtown Dubai</span>
          <span class="community-pill">📍 Dubai Marina</span>
          <span class="community-pill">📍 Arabian Ranches</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.3 8 CORE FACILITIES MANAGEMENT SERVICE DISCIPLINES
       ========================================================================== -->
  <section class="section" id="fm-disciplines" style="padding: 5.5rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">COMPREHENSIVE SCOPE OF WORK</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          FACILITIES MANAGEMENT SERVICE DISCIPLINES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Complete technical trade expertise from advanced HVAC diagnostics and ultrasonic pipe leak detection to aquatic pool engineering, professional cleaning, and master carpentry.
        </p>
      </div>

      <div class="interior-scope-grid">
        <!-- FM Scope 1: HVAC & Air Conditioning -->
        <div class="interior-card" id="fm-hvac">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/08-hvac-air-conditioning.jpg" alt="HVAC and Air Conditioning Maintenance" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">HVAC &amp; AIR CONDITIONING</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 01</span>
            <h3 class="interior-card-title">HVAC &amp; Air Conditioning Systems</h3>
            <p class="interior-card-desc">
              Comprehensive climate control engineering designed for peak UAE summer heat loads: from precision residential FCU servicing to central chiller maintenance.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>AC system installation &amp; rectification:</strong> split units, ducted splits, VRF/VRV &amp; package units</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Fan coil unit (FCU) deep cleaning:</strong> chemical wash, drainage tray disinfection &amp; motor servicing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Air duct cleaning &amp; installation:</strong> robotic video inspection, antimicrobial sanitization &amp; airflow balancing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>AC preventive maintenance:</strong> condenser coil wash, refrigerant gas recharging (R410A) &amp; electrical testing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Smart thermostat calibration:</strong> digital Nest/Ecobee setup, actuator replacement &amp; damper adjustments</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">FCU • Ducts • Gas Recharge</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book AC Service →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 2: Plumbing & Water Systems -->
        <div class="interior-card" id="fm-plumbing-electrical">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/05-mep-services.jpg" alt="Plumbing and Water Systems Maintenance" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">PLUMBING &amp; WATER</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 02</span>
            <h3 class="interior-card-title">Plumbing &amp; Water Systems</h3>
            <p class="interior-card-desc">
              Non-invasive acoustic leak detection, pipework repair, pressure balancing, and sanitary installations to safeguard interior finishes against water ingress.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Acoustic &amp; thermal leak detection:</strong> pinpointing concealed wall and under-slab pipeline breaches</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Drain blockage removal:</strong> electro-mechanical snake rooting &amp; high-pressure hydro-jetting</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Wash basin, shower &amp; mixer repairs:</strong> Grohe, Kohler &amp; Hansgrohe cartridge replacements</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Water heater installation:</strong> Ariston/Atlantic storage tanks, safety pressure relief valves &amp; thermostats</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Sanitary fixtures &amp; bathtubs:</strong> concealed cistern repair, toilet replacements &amp; walk-in shower trays</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Leak Detection • Boilers • Mixers</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Plumbing →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 3: Electrical Maintenance -->
        <div class="interior-card">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/11-electrical-works.jpg" alt="Electrical Maintenance and Power Systems" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">ELECTRICAL MAINTENANCE</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 03</span>
            <h3 class="interior-card-title">Electrical Maintenance &amp; Power</h3>
            <p class="interior-card-desc">
              Precision electrical repairs, load balancing, safety protective devices, and intelligent lighting automation executed by certified electricians.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Electrical repair &amp; installation:</strong> short circuit tracing, rewiring, and circuit breaker rectification</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Distribution boards (DB):</strong> RCD/ELCB residual current protection, MCCBs &amp; infrared thermography</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Lighting, sockets &amp; switches:</strong> LED drivers, smart dimmer switches, and IP66 outdoor weatherproof outlets</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Water &amp; circulation pumps:</strong> booster pumps, submersible sump pumps &amp; pressure switch tuning</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Low current &amp; security:</strong> Cat6 data cabling, Wi-Fi mesh access points &amp; CCTV camera setup</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">DB Panels • Tripping • Pumps</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Electrical →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 4: Civil Maintenance & Renovation -->
        <div class="interior-card" id="fm-civil">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/04-renovation-remodeling.jpg" alt="Civil Maintenance and Renovation" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">CIVIL &amp; RENOVATION</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 04</span>
            <h3 class="interior-card-title">Civil Maintenance &amp; Renovation</h3>
            <p class="interior-card-desc">
              Property refurbishments, masonry restoration, wet-area waterproofing, and surface remodeling to refresh residential and commercial interiors.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Turnkey fit-out works:</strong> complete apartment, office, and villa living room renovations</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Tile installation &amp; re-grouting:</strong> porcelain, marble, ceramic replacement &amp; epoxy anti-fungal grout</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Complete bathroom renovation:</strong> demolition, multi-coat waterproofing, tiling, niches &amp; vanity fixtures</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Concrete, masonry &amp; plastering:</strong> crack repair, blockwork partitions, structural patching &amp; skim coating</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Waterproofing &amp; false ceilings:</strong> balcony liquid membranes, gypsum drywall partitions &amp; acoustic ceiling tiles</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Tiling • Waterproofing • Bathrooms</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Renovation →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 5: Swimming Pool Services -->
        <div class="interior-card" id="fm-pool-landscaping">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Swimming Pool Services and Maintenance" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">SWIMMING POOL CARE</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 05</span>
            <h3 class="interior-card-title">Swimming Pool Services</h3>
            <p class="interior-card-desc">
              Aquatic hygiene, mechanical plant care, and structural refurbishment ensuring crystal-clear, sanitized pool water year-round.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Pool cleaning &amp; water balancing:</strong> pH/chlorine chemistry testing, robotic scrubbing &amp; backwashing</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Pool construction &amp; upgrades:</strong> skim-type, overflow perimeter troughs, infinity edges &amp; plunge pools</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Refurbishment &amp; mosaic re-grouting:</strong> glass mosaic tile repair, coping stone realignment &amp; acid wash</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Epoxy pool painting &amp; finishing:</strong> waterproof marine-grade coatings and non-slip step surfaces</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Equipment repair &amp; leak detection:</strong> Hayward/Pentair pumps, sand filters, heat-cool pumps &amp; underwater LEDs</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Water Chemistry • Pumps • Mosaic</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Pool Service →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 6: Cleaning Services & IAQ -->
        <div class="interior-card" id="fm-cleaning">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/02-building-maintenance.jpg" alt="Professional Cleaning and Sanitization" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">CLEANING &amp; SANITIZATION</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 06</span>
            <h3 class="interior-card-title">Specialist Cleaning Services</h3>
            <p class="interior-card-desc">
              High-standard domestic, commercial, and post-construction handover cleaning utilizing eco-certified hospital-grade sanitization compounds.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Deep cleaning &amp; move-in sanitization:</strong> steam cleaning, tile floor buffing &amp; grease decontamination</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Architectural window cleaning:</strong> streak-free interior and pure-water telescopic pole exterior glass cleaning</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Residential &amp; commercial cleaning:</strong> recurring scheduled villa housekeeping and corporate office janitorial care</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Specialist AC duct decontamination:</strong> mold spore eradication, fogging &amp; indoor air quality (IAQ) certification</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Upholstery &amp; carpet care:</strong> high-temp extraction shampooing for fine fabrics, rugs, and leather lounges</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Deep Cleaning • Windows • AC Ducts</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Cleaning →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 7: Landscaping & Pest Control -->
        <div class="interior-card">
          <div class="interior-card-image-wrap">
            <img src="/assets/images/projects/al-qua-school-infrastructure.jpg" alt="Landscaping and Pest Control" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">LANDSCAPING &amp; PEST</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 07</span>
            <h3 class="interior-card-title">Landscaping &amp; Outdoor Maintenance</h3>
            <p class="interior-card-desc">
              Lush garden aesthetics, smart water-efficient irrigation, seasonal lawn care, and municipality-approved eco-friendly pest prevention.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Plant &amp; greenery installation:</strong> turf sodding, tropical shrubs, ornamental palms, and flowering beds</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Trimming, cutting &amp; garden care:</strong> precision hedge shaping, palm pruning, dethatching &amp; organic fertilization</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Smart irrigation systems:</strong> Hunter/Rain Bird automatic controllers, drip lines &amp; moisture sensors</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Eco-friendly pest control:</strong> municipality-registered treatments for termites, roaches, bedbugs, and garden pests</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Outdoor living spaces:</strong> interlock pressure-washing, pathway lighting repairs, and pergola maintenance</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Garden Care • Irrigation • Pest Control</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Garden Care →</a>
            </div>
          </div>
        </div>

        <!-- FM Scope 8: Mechanical & Water Pumps -->
        <div class="interior-card">
          <div class="interior-card-image-wrap">
            <img src="/assets/services/09-mechanical-contracting.jpg" alt="Mechanical and Pump Maintenance" class="interior-card-img" loading="lazy">
            <span class="interior-scope-badge" style="background: rgba(16,185,129,0.9); border-color: #10b981;">PUMPS &amp; MECHANICAL</span>
          </div>
          <div class="interior-card-body">
            <span class="interior-card-num" style="color: #10b981;">FM SCOPE 08</span>
            <h3 class="interior-card-title">Water Pumps &amp; Mechanical Plant</h3>
            <p class="interior-card-desc">
              Preventative maintenance, seal replacements, and pressure alignment for booster pumps, sump pits, and building water circulation infrastructure.
            </p>
            <ul class="interior-card-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Domestic water booster sets:</strong> Grundfos &amp; Lowara multi-stage pumps, pressure vessels &amp; VFD inverters</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Submersible drainage pumps:</strong> basement sump pit overhauls, mechanical float switches &amp; check valves</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Water filtration &amp; softeners:</strong> multimedia sand filters, UV disinfection units &amp; salt brine systems</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Water storage tank cleaning:</strong> GRP and concrete tank disinfection conforming to Abu Dhabi Food Control</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span><strong>Vibration analysis &amp; alignment:</strong> motor bearing lubrication, mechanical seal refitting &amp; sound dampening</span></li>
            </ul>
            <div class="interior-card-footer">
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Booster Pumps • Sump Pits • Tanks</span>
              <a href="#consultation" style="font-size: 0.82rem; color: #10b981; font-weight: 700; text-decoration: none;">Book Mechanical →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.4 SPECIALIZED TRADE WORKS & HANDYMAN SOLUTIONS
       ========================================================================== -->
  <section class="section" id="fm-specialist" style="padding: 5.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 3rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">SPECIALIZED ON-DEMAND TRADES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          PAINTING, JOINERY, ALUMINIUM &amp; HANDYMAN
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Highly skilled artisan trades for precision cosmetic touch-ups, architectural glazing, custom wood restoration, and on-demand household mounting.
        </p>
      </div>

      <div class="fm-trades-grid">
        <!-- Trade 1: Painting -->
        <div class="fm-trade-card">
          <div style="font-size: 2.2rem; margin-bottom: 1rem;">🎨</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">Painting &amp; Finishing</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem;">
            Interior and exterior protective coatings utilizing premium low-VOC Jotun and Caparol paints.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.45rem;">
            <li>• Villa and apartment interior painting</li>
            <li>• Weatherproof external building facade painting</li>
            <li>• Heavy-duty epoxy garage floor coatings</li>
            <li>• Luxury textured &amp; decorative stucco finishes</li>
            <li>• Skim coating, plaster crack repair &amp; caulking</li>
          </ul>
        </div>

        <!-- Trade 2: Carpentry & Joinery -->
        <div class="fm-trade-card">
          <div style="font-size: 2.2rem; margin-bottom: 1rem;">🪚</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">Carpentry &amp; Joinery</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem;">
            Crafted architectural millwork, door fitting, veneer rejuvenation, and bespoke cabinetry.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.45rem;">
            <li>• Solid &amp; engineered door and frame installation</li>
            <li>• Door veneer refinishing, staining &amp; hand-polishing</li>
            <li>• Custom kitchen cabinets, pantries &amp; drawer runners</li>
            <li>• Tailored walk-in wardrobes and bathroom vanities</li>
            <li>• Parquet flooring repair &amp; outdoor pergola polishing</li>
          </ul>
        </div>

        <!-- Trade 3: Aluminium & Glass Works -->
        <div class="fm-trade-card">
          <div style="font-size: 2.2rem; margin-bottom: 1rem;">🪟</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">Aluminium &amp; Glass Works</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem;">
            Glazing repairs, sliding mechanism restorations, and custom powder-coated metal framing.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.45rem;">
            <li>• 24/7 Broken glass emergency replacement</li>
            <li>• Aluminium double-glazed doors and windows</li>
            <li>• Sliding patio door heavy-duty rollers and tracks</li>
            <li>• Architectural multi-point locks, handles &amp; seals</li>
            <li>• Custom electrostatic aluminium powder coating</li>
          </ul>
        </div>

        <!-- Trade 4: Handyman Services -->
        <div class="fm-trade-card">
          <div style="font-size: 2.2rem; margin-bottom: 1rem;">🛠️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">Handyman &amp; Minor Repairs</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem;">
            Multi-skilled technicians equipped with laser levels and heavy anchors for rapid household fixings.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.45rem;">
            <li>• Flush and swivel large-screen TV wall mounting</li>
            <li>• Precision curtain rail, pelmet &amp; motorized blind fixing</li>
            <li>• Heavy art, mirrors &amp; photo-frame hanging</li>
            <li>• Precision diamond drilling and anchor fixing</li>
            <li>• Shelving, flat-pack assembly &amp; hardware installations</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.5 RENOVATION & COMPLETED PROJECT SHOWCASE
       ========================================================================== -->
  <section class="section" id="fm-renovations" style="padding: 5.5rem 0; background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 3rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">VERIFIED CASE STUDIES</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          RENOVATION &amp; MAINTENANCE SHOWCASE
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Real examples of completed office fit-outs, luxury kitchen refurbishments, air duct decontaminations, swimming pool upgrades, and bathroom overhauls delivered across the UAE.
        </p>
      </div>

      <div class="fm-project-grid">
        <!-- 1. Office Renovation -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/images/projects/crc-office-marina-palace.jpg" alt="Commercial Office Renovation" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">OFFICE RENOVATION</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">DUBAI MARINA PALACE</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Commercial Office Overhaul</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Full corporate space reconfiguration featuring acoustic glass demountable partitions, Cat6 networking, LED architectural panel lighting, and ergonomic executive suites.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Completed On-Schedule: 21 Days</span>
          </div>
        </div>

        <!-- 2. AC Duct Cleaning -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/services/08-hvac-air-conditioning.jpg" alt="AC Duct Deep Cleaning and Sanitization" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">AIR QUALITY &amp; DUCTS</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">SAADIYAT BEACH VILLA</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Deep AC Duct Decontamination</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Robotic rotary brush duct cleaning, mold eradication, antimicrobial mist fogging, and condenser chemical wash resulting in a 98% reduction in airborne allergens.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">IAQ Certified • 6 Ducted Zones</span>
          </div>
        </div>

        <!-- 3. Kitchen Refurbishment -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/images/projects/al-lisaili-villa.jpg" alt="Kitchen Refurbishment and Cabinetry" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">KITCHEN REFURBISHMENT</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">AL RAHA GARDENS</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Chef's Kitchen Refurbishment</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Replacement of degraded cabinetry with soft-close Blum German hardware, Calacatta quartz countertops with waterfall edges, and integrated appliance electrical circuits.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Full Turnkey Joinery &amp; Plumbing</span>
          </div>
        </div>

        <!-- 4. Wood-Like Tile Flooring -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/services/04-renovation-remodeling.jpg" alt="Wood-like Tile Installation" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">FLOORING OVERHAUL</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">YAS ACRES VILLA</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Wood-Look Porcelain Paving</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Complete removal of damaged ceramic tiles, laser subfloor leveling, and installation of 1200x200mm Spanish rectified wood-grain porcelain with Mapei epoxy grout.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">420 sqm Surface Area Paved</span>
          </div>
        </div>

        <!-- 5. Pool Tile Refurbishment -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/images/projects/luxury-island-infinity-pool.jpg" alt="Pool Tile Refurbishment" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">POOL REFURBISHMENT</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">PALM JUMEIRAH ESTATE</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Infinity Pool Tile &amp; Pump Overhaul</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Hydro-demolition of loose glass mosaics, chemical-resistant re-plastering, iridescent mosaic installation, and variable-speed Hayward pump upgrade with color-changing LEDs.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Zero Water Loss Achieved</span>
          </div>
        </div>

        <!-- 6. Bathroom Renovation -->
        <div class="fm-project-card">
          <div class="fm-project-thumb">
            <img src="/assets/services/13-interior-design.jpg" alt="Master Bathroom Renovation" class="fm-project-img" loading="lazy">
            <span class="fm-project-tag">BATHROOM RENOVATION</span>
          </div>
          <div class="fm-project-body">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">AL REEM ISLAND</span>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 800; margin: 0.3rem 0 0.6rem;">Master Wet-Room Transformation</h4>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Full gut renovation featuring concealed Geberit cisterns, linear trench drains, ceiling-mounted rain showers, backlit anti-fog mirrors, and 10mm frameless glass partitions.
            </p>
            <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">100% Flood-Tested &amp; Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10.6 CLIENT FAQS: FACILITIES MANAGEMENT & AMC
       ========================================================================== -->
  <section class="section" style="padding: 4.5rem 0 5.5rem; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 3rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #10b981;">HELP &amp; ADVICE</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          FACILITIES MANAGEMENT &amp; AMC FAQS
        </h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 860px; margin: 0 auto;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            What communities and property types are covered by your Annual Maintenance Contracts (AMC)?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            We operate fully equipped mobile response fleets across major Abu Dhabi communities (Al Bandar, Al Hadeel, Al Raha Gardens, Al Zeina, Saadiyat Beach Villas, Yas Island, Al Reem Island) and Dubai developments (Palm Jumeirah, Dubai Hills, Emirates Hills, Downtown, Dubai Marina). We service private luxury villas, penthouses, commercial offices, and entire multi-tenant residential buildings.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            What is your emergency response time for AC breakdowns or plumbing leaks?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Under our Executive and Prestige AMC agreements, we provide guaranteed 24/7 priority emergency dispatch with on-site technician arrival within 60 to 120 minutes. Critical summer AC outages, major water line bursts, electrical main shorts, and sewage blockages are handled as Level-1 priority emergencies.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Are replacement parts and consumables included in the AMC packages?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Basic consumables like standard electrical fuses, AC starting capacitors, plumbing washers, and silicone sealants are included free of charge in our Executive and Prestige packages. Major replacement parts (such as AC compressors, PCB boards, or water heaters) are provided at pre-negotiated contractor discount rates with transparent quotes submitted before any part is installed.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Are your HVAC and electrical technicians licensed by UAE utility authorities?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Yes. All Rayan Group engineers and maintenance specialists are directly employed, insured, and certified in accordance with Abu Dhabi Civil Defense, ADDC, TAQA, and Dubai DEWA safety and technical codes. We maintain triple ISO certifications (ISO 9001, 14001, 45001) for strict health, safety, and environmental rigor.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10. UNIFIED SERVICE DIRECTORY (INTERACTIVE FILTER TABS)
       ========================================================================== -->
  <section class="section" id="service-directory" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 2.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">MASTER PORTFOLIO DIRECTORY</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          UNIFIED GROUP SERVICES DIRECTORY
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Browse and filter our complete spectrum of architectural interior fit-out, heavy civil infrastructure, and turnkey contracting solutions.
        </p>
      </div>

      <!-- Category Filter Pills -->
      <div class="services-cat-tabs">
        <button type="button" class="service-tab-btn active" data-cat="all">All Disciplines</button>
        <button type="button" class="service-tab-btn" data-cat="interior">Interior Fit-Out</button>
        <button type="button" class="service-tab-btn" data-cat="fm">Facilities Management &amp; AMC</button>
        <button type="button" class="service-tab-btn" data-cat="hvac">HVAC &amp; AC Ducts</button>
        <button type="button" class="service-tab-btn" data-cat="plumbing">Plumbing &amp; Leakage</button>
        <button type="button" class="service-tab-btn" data-cat="pools">Swimming Pools</button>
        <button type="button" class="service-tab-btn" data-cat="trades">Specialist Trades &amp; Handyman</button>
        <button type="button" class="service-tab-btn" data-cat="roads">Roads &amp; Highways</button>
        <button type="button" class="service-tab-btn" data-cat="civil">Bridges &amp; Structures</button>
        <button type="button" class="service-tab-btn" data-cat="airports">Airports &amp; Airfields</button>
        <button type="button" class="service-tab-btn" data-cat="utilities">Drainage, Sewerage &amp; Water</button>
        <button type="button" class="service-tab-btn" data-cat="electrical">Electrical &amp; Substations</button>
        <button type="button" class="service-tab-btn" data-cat="joinery">Custom Joinery</button>
        <button type="button" class="service-tab-btn" data-cat="safety">Road Safety &amp; Landscaping</button>
      </div>

      <!-- Category Matrix Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;" id="servicesMatrixGrid">
        <div class="matrix-card" data-matrix-cat="interior" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Interior Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Luxury Interior Fit-Out</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Complete home, villa, penthouse, corporate office, and 5-star hospitality design-to-handover turnkey works.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Fit-Out →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="fm" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">FM Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Facilities Management &amp; AMC</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Annual maintenance packages (Essential, Executive, Prestige, Corporate) with guaranteed 24/7 emergency dispatch.</p>
          <a href="#fm-amc-packages" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Explore AMC Packages →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="hvac" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">HVAC Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">HVAC &amp; AC Duct Cleaning</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">FCU chemical cleaning, compressor diagnostics, robotic video duct cleaning, antimicrobial sanitization &amp; IAQ certification.</p>
          <a href="#fm-hvac" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Inquire AC Care →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="plumbing" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Plumbing Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Plumbing &amp; Leak Detection</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Non-invasive acoustic pipe leak detection, hydro-jet drain unclogging, water heaters, pumps &amp; sanitary fixture repair.</p>
          <a href="#fm-plumbing-electrical" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Inquire Plumbing →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="pools" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Aquatic Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Swimming Pool Care &amp; Upgrades</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Weekly water chemical balancing, robotic vacuuming, coping stone repair, mosaic re-grouting, epoxy painting &amp; pumps.</p>
          <a href="#fm-pool-landscaping" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Inquire Pool Care →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="trades" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Trade Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Painting, Joinery &amp; Handyman</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Interior/exterior painting, custom door/veneer polishing, aluminium glass repair, TV mounting &amp; precision hardware fixing.</p>
          <a href="#fm-specialist" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Inquire Trades →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="roads" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #f59e0b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Civil Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Roads &amp; Highways</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Main highways, expressways, residential community internal roads, pavement asphalt paving, and rehabilitation.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Roads →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="civil" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #f59e0b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Civil Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Bridges &amp; Structures</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Flyovers, deep piling, reinforced concrete piers, post-tensioned bridge decks, and MSE retaining wall systems.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Bridges →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="airports" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #f59e0b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Aviation Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Airports &amp; Airfields</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Runway civil works, taxiway paving, aircraft aprons, high-friction asphalt overlays, and airfield civil access.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #f59e0b; font-weight: 700; text-decoration: none;">Inquire Airfields →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="utilities" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Utilities Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Drainage, Sewerage &amp; Water</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Stormwater flood basins, gravity sewerage networks, deep pumping stations, and high-capacity potable water mains.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #38bdf8; font-weight: 700; text-decoration: none;">Inquire Utilities →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="electrical" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #a855f7; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Energy Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Electrical &amp; Substations</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Underground MV/LV cable trenches, 11kV/33kV substation civil works, transformer plinths, and blast walls.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #a855f7; font-weight: 700; text-decoration: none;">Inquire Substations →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="joinery" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Joinery Discipline</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Custom Joinery &amp; Millwork</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">In-house artisanal millwork, bespoke dressing suites, vanity cabinetry, architectural wall claddings &amp; tables.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Joinery →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="safety" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #10b981; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Safety &amp; External</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Road Safety &amp; Landscaping</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Directional gantries, crash barriers, guardrails, automated irrigation, public realm green spaces, and forestry works.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-decoration: none;">Inquire Safety →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       11. FEATURED PROJECTS SHOWCASE
       ========================================================================== -->
  <section class="section" id="interior-portfolio" style="padding: 5.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">PROVEN TRACK RECORD</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
            FEATURED FIT-OUT &amp; CIVIL PROJECTS
          </h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem;">
            Real-world execution delivering international standards for royal, commercial, hospitality, and civic megaprojects.
          </p>
        </div>
        <a href="/projects/" class="btn-enterprise-secondary">VIEW ALL 16 GROUP PROJECTS →</a>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
        <!-- Project 1: Waldorf Astoria RAK -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/waldorf-astoria-renovation-rak.jpg" alt="Waldorf Astoria Luxury Hotel Renovation" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #f59e0b; font-weight: 700; text-transform: uppercase;">5-Star Hospitality Fit-Out</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Waldorf Astoria Luxury Overhaul</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Full-scale luxury guest suites, public corridors, acoustic doors, bespoke marble bathrooms, and VIP lounge architectural renovation in Ras Al Khaimah.
            </p>
            <a href="/projects/waldorf-astoria-renovation-rak/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>

        <!-- Project 2: Al Qua School Infrastructure -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/al-qua-school-infrastructure.jpg" alt="Al Qua Educational Infrastructure and Civil Works" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #10b981; font-weight: 700; text-transform: uppercase;">Civil &amp; Educational Infrastructure</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Al Qua Educational Infrastructure</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Comprehensive campus external civil engineering, perimeter roads, stormwater drainage trenches, dedicated substation civil plinths, and sports grounds.
            </p>
            <a href="/projects/al-qua-school-infrastructure/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>

        <!-- Project 3: Palm Jumeirah Private Waterfront Estate -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/palm-jumeirah-rec-estate.jpg" alt="Palm Jumeirah Waterfront Estate" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">Private Luxury Residential</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Palm Jumeirah Waterfront Villa</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Bespoke living suites, master dressing rooms, custom joinery, smart lighting integration, and private oceanfront wellness retreat interiors.
            </p>
            <a href="/projects/palm-jumeirah-rec-estate/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       12. FREQUENTLY ASKED QUESTIONS (FAQ)
       ========================================================================== -->
  <section class="section" id="faq" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container" style="max-width: 900px;">
      <div style="text-align: center; margin-bottom: 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">COMMON QUESTIONS</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3.2vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          SERVICES &amp; CONTRACTING FAQ
        </h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Does Rayan Group handle both civil infrastructure and luxury interior fit-out?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Yes. Rayan Group operates specialized autonomous divisions: Rayan Engineering handles heavyweight civil infrastructure (highways, bridges, drainage networks, earthworks), while our dedicated interior contracting division delivers high-end turnkey architectural interiors, custom joinery millwork, and property styling.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            What government authorities and utility standards do your civil projects comply with?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Our civil engineering works are strictly executed to the standards of the Abu Dhabi Department of Municipalities and Transport (DMT), Integrated Transport Centre (ITC), Musanada, ADDC/TAQA, Dubai RTA, and Civil Defense.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Do you own your construction equipment or rely on third-party plant hire?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            We own and operate over 50 heavy construction plant assets—including CAT heavy excavators, bulldozers, Vogele asphalt pavers, tandem vibration rollers, 3D laser-guided motor graders, and Actros tippers—ensuring rapid mobilization and direct quality control without rental bottlenecks.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       13. BOOK CONSULTATION & TENDER PROPOSAL (RFP) FORM
       ========================================================================== -->
  <section class="section" id="consultation" style="padding: 5.5rem 0 6rem; background: #06111e;">
    <div class="container" style="max-width: 960px;">
      <div class="consultation-card">
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">DIRECT TENDER &amp; PROJECT INQUIRY</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
            REQUEST A PROPOSAL OR DESIGN CONSULTATION
          </h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
            Whether you require a turnkey luxury interior fit-out or a multi-million-dirham civil infrastructure package, our technical estimating committee will respond with preliminary feasibility within 24 hours.
          </p>
        </div>

        <form id="interiorConsultationForm">
          <div class="consultation-form-grid">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Full Name *</label>
              <input type="text" class="consultation-input" placeholder="e.g. Tariq Al Mansoori" required>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Corporate / Entity Name</label>
              <input type="text" class="consultation-input" placeholder="e.g. Government Authority / Apex Contracting">
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Email Address *</label>
              <input type="email" class="consultation-input" placeholder="name@domain.com" required>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Phone / WhatsApp *</label>
              <input type="tel" class="consultation-input" placeholder="+971 50 000 0000" required>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Project Category *</label>
              <select class="consultation-select" required>
                <option value="">Select Project Scope...</option>
                <optgroup label="Facilities Management &amp; AMC Packages">
                  <option value="amc-executive">Executive Villa AMC (Bi-Monthly &bull; Recommended)</option>
                  <option value="amc-prestige">Prestige / Royal Villa AMC (Monthly VIP)</option>
                  <option value="amc-essential">Essential Care AMC (Standard Residential)</option>
                  <option value="amc-corporate">Corporate &amp; Commercial Building FM</option>
                  <option value="fm-hvac-duct">HVAC Servicing &amp; Deep AC Duct Cleaning</option>
                  <option value="fm-renovation">Turnkey Bathroom / Kitchen Renovation</option>
                  <option value="fm-plumbing-leak">Plumbing &amp; Acoustic Leak Detection</option>
                  <option value="fm-pool-care">Swimming Pool Care &amp; Refurbishment</option>
                  <option value="fm-emergency">24/7 Rapid Emergency Repair Call-Out</option>
                </optgroup>
                <optgroup label="Civil &amp; Heavy Infrastructure">
                  <option value="civil-highways">Roads, Highways &amp; Internal Road Networks</option>
                  <option value="civil-airports">Airports &amp; Airfield Infrastructure</option>
                  <option value="civil-bridges">Bridges, Piling &amp; Civil Structures</option>
                  <option value="civil-drainage">Stormwater Drainage &amp; Sewerage Networks</option>
                  <option value="civil-water-power">Potable Water &amp; Substation Civil Works</option>
                  <option value="civil-landscaping">Landscaping, External Works &amp; Road Furniture</option>
                </optgroup>
                <optgroup label="Interior Design &amp; Fit-Out">
                  <option value="residential-villa">Residential — Luxury Villa / Penthouse</option>
                  <option value="commercial-office">Commercial — Corporate Office / Workspace</option>
                  <option value="hospitality-hotel">Hospitality — Hotel / Resort / Lounge</option>
                  <option value="renovation-complete">Full Turnkey Renovation &amp; Remodeling</option>
                  <option value="custom-joinery">Custom Furniture &amp; Bespoke Joinery Only</option>
                  <option value="property-staging">Property Staging &amp; Turnkey Furnishing</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Project Location *</label>
              <select class="consultation-select" required>
                <option value="">Select Region...</option>
                <option value="abu-dhabi">Abu Dhabi (Al Raha, Yas, Saadiyat, Reem, City)</option>
                <option value="dubai">Dubai (Palm Jumeirah, Hills, Marina, Downtown)</option>
                <option value="sharjah">Sharjah &amp; Northern Emirates</option>
                <option value="india">India (Ashaz Engineering Regional Hub)</option>
                <option value="international">Other Regional / International</option>
              </select>
            </div>

            <div class="form-group-full">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Required Capabilities (Select All That Apply):</label>
              <div class="checkbox-chips-grid">
                <label class="checkbox-chip">
                  <input type="checkbox" checked> <span>Annual Maintenance Contract (AMC)</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>HVAC &amp; AC Duct Cleaning</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Plumbing &amp; Leak Detection</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Swimming Pool Care</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Heavy Civil Engineering</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Asphalt Paving &amp; Roads</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Deep Utilities &amp; Drainage</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Architectural Interior Fit-Out</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>In-House Custom Joinery</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Class-A Authority Permits (NOC)</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>MEP &amp; Substation Works</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Painting &amp; Handyman Trades</span>
                </label>
              </div>
            </div>

            <div class="form-group-full">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Project Scope &amp; Specification Details</label>
              <textarea class="consultation-textarea" rows="4" placeholder="Briefly specify property type (villa, apartment, commercial building), community location, required AMC package or civil/interior package details, and timeline..."></textarea>
            </div>
          </div>

          <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">
              🔒 Fiduciary discretion guaranteed. All client tender documents and property details handled under strict corporate NDA.
            </div>
            <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.5rem; font-size: 0.9rem;">
              SUBMIT INQUIRY / REQUEST PROPOSAL →
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
`;

createRoute('services/index.html', {
  title: 'Our Services — Interior Fit-Out, Civil Infrastructure & Facilities Management | Rayan Group',
  description: 'Comprehensive Rayan Group services: luxury interior design, turnkey fit-out, highways, airports, bridges, stormwater drainage, sewerage networks, potable water pipelines, and 24/7 Facilities Management (FM) with Annual Maintenance Contracts (AMC) across the UAE and South Asia.',
  activePath: '/services/',
  heroHtml: servicesHeroHtml,
  content: servicesContent
});
