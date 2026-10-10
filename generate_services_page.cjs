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
  { label: 'Overview', href: '/services/', active: true },
  { label: 'Interior Design & Fit-Out', href: '#interior-work', active: false },
  { label: 'Turnkey Scope', href: '#scope-pillars', active: false },
  { label: 'Contractor Capabilities', href: '#contractor-capabilities', active: false },
  { label: '5-Stage Workflow', href: '#workflow', active: false },
  { label: 'Interior Portfolio', href: '#interior-portfolio', active: false },
  { label: 'Group Divisions', href: '#group-services', active: false },
  { label: 'Book Consultation', href: '#consultation', active: false }
];

const servicesHeroHtml = renderPageHero({
  category: 'COMPREHENSIVE CAPABILITIES',
  title: 'OUR SERVICES',
  description: 'From luxury interior design, bespoke joinery, and turnkey fit-out contracting in the UAE to heavy civil engineering, critical energy EPC, and industrial fabrication across the region.',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services/' }
  ],
  bgImage: '/assets/services/13-interior-design.jpg',
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
        <a href="#scope-pillars" class="service-pill-link">📐 6 Core Scope Disciplines</a>
        <a href="#creative-solutions" class="service-pill-link">🎨 Design &amp; 3D Visualization</a>
        <a href="#contractor-capabilities" class="service-pill-link">🏗️ Turnkey Civil &amp; MEP Contracting</a>
        <a href="#workflow" class="service-pill-link">⚡ 5-Step Project Workflow</a>
        <a href="#service-directory" class="service-pill-link">📁 Service Directory &amp; Filters</a>
        <a href="#interior-portfolio" class="service-pill-link">🏆 Completed Fit-Out Projects</a>
        <a href="#group-services" class="service-pill-link">🌐 Conglomerate Services</a>
        <a href="#faq" class="service-pill-link">❓ FAQ</a>
        <a href="#consultation" class="service-pill-link" style="background: rgba(0, 153, 230, 0.25); color: #38bdf8; border-color: rgba(0, 153, 230, 0.5);">📅 Request Consultation</a>
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
              <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #38bdf8;">FLAGSHIP SERVICE DIVISION</span>
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: clamp(2.2rem, 3.8vw, 3.25rem); font-weight: 800; color: #fff; line-height: 1.15; text-transform: uppercase; margin-bottom: 1.25rem;">
              LUXURY INTERIOR DESIGN &amp; TURNKEY FIT-OUT CONTRACTING
            </h2>
            
            <p style="font-size: 1.05rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 1.25rem;">
              Inspired by the pinnacle standards of the Dubai &amp; Abu Dhabi luxury design market, Rayan Group brings a complete turnkey interior contracting capability that unites refined design aesthetics with heavyweight civil and MEP contracting execution.
            </p>
            
            <p style="font-size: 0.95rem; line-height: 1.65; color: #94a3b8; margin-bottom: 2rem;">
              Unlike design-only studios or standalone furniture retailers, Rayan Group delivers full end-to-end sovereignty: from initial concept mood boards, photorealistic 3D visualization, and spatial planning to civil modifications, authority approvals, in-house custom joinery manufacturing, MEP integration, and white-glove styling handover.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="#consultation" class="btn-enterprise-primary" style="padding: 0.9rem 2rem;">BOOK DESIGN CONSULTATION →</a>
              <a href="#scope-pillars" class="btn-enterprise-secondary" style="padding: 0.9rem 2rem;">EXPLORE DETAILED SCOPE ↓</a>
            </div>
          </div>

          <!-- Highlight Capability Matrix -->
          <div style="background: rgba(7, 17, 30, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; backdrop-filter: blur(10px);">
            <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
              Key Turnkey Metrics
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">CONTRACTING SCOPE</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #0099e6;">100%</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Turnkey Design-to-Build</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block;">IN-HOUSE JOINERY</span>
                <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: #f59e0b;">BESPOKE</div>
                <span style="font-size: 0.78rem; color: #cbd5e1;">Custom Millwork Shop</span>
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
              <strong style="color: #38bdf8;">Reference Benchmarking:</strong> Aligned with Dubai's premier interior standards (Indigo Living interior design scope) combined with Rayan Group's proven commercial execution across landmark hospitality, retail, and luxury villas.
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
          COMPREHENSIVE CONTRACTING DOMAINS
        </span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.4vw, 2.85rem); font-weight: 800; color: #fff; margin-top: 0.5rem; text-transform: uppercase; line-height: 1.2;">
          INTERIOR WORK SCOPE OF SERVICES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.6;">
          Definitive technical disciplines, design frameworks, bespoke millwork, and turnkey deliverables executed by Rayan Group across residential, commercial, and hospitality environments.
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
            <span class="interior-card-num">SCOPE 01</span>
            <h3 class="interior-card-title">Residential Interior Design</h3>
            <p class="interior-card-desc">
              Tailored luxury residential interiors creating cohesive, opulent living spaces designed around client lifestyles, family wellness, and architectural elegance.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Complete home and apartment interior design</strong> for luxury villas, penthouses, and residences</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Living room, bedroom and dining room interiors</strong> with tailored acoustic zoning and mood layering</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Space planning and furniture layouts</strong> optimizing spatial flow, natural daylighting, and circulation</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Colour schemes, materials and finishes</strong> featuring hand-selected marble, natural veneers, and luxury textiles</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Curtains, rugs, lighting and decorative accessories</strong> custom-made to exact room proportions</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Integration of existing furniture</strong> with bespoke new contemporary pieces for curated continuity</span>
              </li>
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
            <span class="interior-card-num">SCOPE 02</span>
            <h3 class="interior-card-title">Commercial Interior Design</h3>
            <p class="interior-card-desc">
              Strategic workplace engineering and commercial environments that elevate corporate prestige, foster employee productivity, and embody brand identity.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Corporate offices and workspaces</strong> with ergonomic planning and BREEAM/LEED efficiency</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Reception areas and waiting lounges</strong> creating powerful, memorable corporate first impressions</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Meeting rooms and conference spaces</strong> integrated with AV cabling, acoustic baffles, and smart glass</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furniture selection and placement</strong> prioritizing commercial contract durability and ergonomics</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Functional layouts and professional finishes</strong> balancing open collaboration with acoustic privacy</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Commercial space styling</strong> including corporate branding, biophilic accents, and architectural signage</span>
              </li>
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
            <span class="interior-card-num">SCOPE 03</span>
            <h3 class="interior-card-title">Hospitality Interior Design</h3>
            <p class="interior-card-desc">
              Immersive, high-traffic experiential interiors for world-class hotels, resorts, boutique lounges, and flagship restaurants.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Hotel rooms and suites</strong> engineered for 5-star acoustic comfort, luxury relaxation, and durability</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Hotel lobbies and lounges</strong> featuring soaring grand atriums, feature walls, and signature lighting</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Guest reception and common areas</strong> with optimized circulation and premium concierge portals</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furniture, lighting and decorative elements</strong> adhering to international hotel brand standards</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Guest-focused layouts and visual styling</strong> curating memorable photo-worthy guest touchpoints</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Restaurants, bars &amp; cafes fit-out</strong> (The Noodle House, Chipotle MBZ, Andina Lounge)</span>
              </li>
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
            <span class="interior-card-num">SCOPE 04</span>
            <h3 class="interior-card-title">Renovation &amp; Interior Execution</h3>
            <p class="interior-card-desc">
              Comprehensive structural overhaul and cosmetic modernization of aging or shell-and-core properties delivered with pinpoint precision.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Kitchen and bathroom renovations</strong> with luxury cabinetry, waterproofing, and designer sanitaryware</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Flooring and wall finishes</strong> (large-format Italian porcelain, hardwood parquetry, micro-cement)</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Joinery and fitted interior elements</strong> integrated flush into existing architecture</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Material and finish selection</strong> with comprehensive mock-ups and tactile finish sample boards</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Space planning and renovation concepts</strong> reimagining flow and eliminating outdated layout bottlenecks</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Project coordination from design through execution</strong> with on-site QA/QC engineers and safety supervisors</span>
              </li>
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
            <span class="interior-card-num">SCOPE 05</span>
            <h3 class="interior-card-title">Custom Furniture &amp; Joinery</h3>
            <p class="interior-card-desc">
              In-house bespoke millwork shop and artisanal craftsmen fabricating one-of-a-kind furniture, dressing suites, and architectural woodwork.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Custom furniture design and development</strong> engineered from client sketches to millimeter perfection</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furniture in tailored sizes, materials and finishes</strong> (exotic walnuts, brass inlays, bookmatched veneers)</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Wardrobes and storage solutions</strong> featuring concealed LED lighting, velvet organizers, and glass doors</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Bespoke furniture packages</strong> tailored for entire luxury developments and private penthouses</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furniture selection aligned with overall concept</strong> ensuring harmonic balance across all architectural planes</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>CNC precision cutting and hand-finished craft</strong> backed by structural durability guarantees</span>
              </li>
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
            <span class="interior-card-num">SCOPE 06</span>
            <h3 class="interior-card-title">Property Styling &amp; Furnishing</h3>
            <p class="interior-card-desc">
              Fast-track turnkey furnishing and high-end property staging engineered to maximize asset valuation, rental yields, and buyer emotional connection.
            </p>
            <ul class="interior-card-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furnishing vacant apartments and villas</strong> with ready-to-move curated luxury collections</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Property staging for sale or rental</strong> dramatically reducing days-on-market and commanding top-tier pricing</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Furniture and accessories selection</strong> curated by seasoned interior stylists</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Decorative styling and final setup</strong> including art hanging, luxury bedding dressing, and tabletop styling</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Preparing properties for photography and viewings</strong> ensuring cinematic marketing collateral</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Turnkey handover in as fast as 7-14 days</strong> for pre-selected luxury staging packages</span>
              </li>
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
       3. ADDITIONAL CREATIVE SERVICES (6 KEY SUPPORTING DISCIPLINES)
       ========================================================================== -->
  <section class="section" id="creative-solutions" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 780px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">INTEGRATED DESIGN RIGOR</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3.2vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          SPECIALIZED DESIGN &amp; CREATIVE SERVICES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Every project is backed by our dedicated architectural studio, providing the strategic tools necessary to plan, visualize, and execute without surprises.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
        <!-- Service 1: Interior Design Consultation -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(0, 153, 230, 0.12); color: #0099e6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            💬
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Interior Design Consultation
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            One-on-one discovery sessions with our principal interior architects to analyze your spatial requirements, project feasibility, aesthetic direction, investment budget, and key delivery timeline.
          </p>
        </div>

        <!-- Service 2: Concept Development & Mood Boards -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            🎨
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Concept Development &amp; Mood Boards
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            Curating tangible visual trajectories through thematic mood boards, chromatic harmony charts, tactile material trays, finish textures, and architectural lighting concepts.
          </p>
        </div>

        <!-- Service 3: Space Planning & Ergonomics -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            📐
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Space Planning &amp; Circulation
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            Precision 2D CAD architectural layouts planning exactly how each space functions, optimizing furniture placement, ergonomic traffic circulation, privacy zones, and sightlines.
          </p>
        </div>

        <!-- Service 4: 3D Visualization & Cinematic Renders -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(168, 85, 247, 0.12); color: #a855f7; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            🖥️
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Photorealistic 3D Visualization
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            High-definition 3D renders and virtual walkthroughs allowing clients to preview lighting, shadows, reflection properties, and material textures before physical execution commences.
          </p>
        </div>

        <!-- Service 5: Furniture, Lighting & Finishes (FF&E) -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            💡
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Furniture, Lighting &amp; Finishes (FF&amp;E)
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            End-to-end procurement and schedule coordination for principal decorative elements: architectural task luminaires, statement chandeliers, acoustic fabrics, and custom ironmongery.
          </p>
        </div>

        <!-- Service 6: Creative Design & Art Direction -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(236, 72, 153, 0.12); color: #ec4899; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.25rem;">
            📸
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.65rem;">
            Creative Design &amp; Visual Direction
          </h3>
          <p style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">
            Bespoke art direction, commissioned sculptures, architectural photography, and visual marketing assets for luxury developers promoting properties to global investors.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       4. CONTRACTOR DISTINCTION: HEAVY CIVIL & MEP CAPABILITIES
       ========================================================================== -->
  <section class="section" id="contractor-capabilities" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="max-width: 880px; margin: 0 auto 3.5rem; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f59e0b; display: inline-flex; align-items: center; gap: 0.5rem;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
          CRUCIAL INDUSTRY DISTINCTION
        </span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.9rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          WHY RAYAN GROUP: TURNKEY CONTRACTING VS. PURE STYLISTS
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.65;">
          Many interior firms in the UAE focus solely on cosmetic soft furnishings and retail furniture packages. Because Rayan Group is an accredited engineering &amp; contracting conglomerate, our clients receive full structural, civil, and MEP contracting power under one single accountable contract.
        </p>
      </div>

      <!-- Distinction Comparison Matrix -->
      <div class="distinction-table-wrap">
        <table class="distinction-table">
          <thead>
            <tr>
              <th style="width: 35%;">Contracting Discipline &amp; Scope</th>
              <th style="width: 30%;">Pure Interior Decorators / Stylists</th>
              <th class="highlight-col" style="width: 35%;">Rayan Group Turnkey Contracting</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Civil Works &amp; Structural Alterations</strong><br><span style="font-size: 0.78rem; color: #64748b;">Wall removals, openings, slab trenching &amp; coring</span></td>
              <td style="color: #ef4444;">❌ Excluded (Outsourced or unmanaged)</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ 100% In-House</span> Structural engineering &amp; execution</td>
            </tr>
            <tr>
              <td><strong>Electrical, Plumbing &amp; MEP Coordination</strong><br><span style="font-size: 0.78rem; color: #64748b;">DB panels, load balancing, pipe routing, drains</span></td>
              <td style="color: #ef4444;">❌ Excluded (Requires 3rd party MEP)</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ 100% In-House</span> Licensed Class-A MEP division</td>
            </tr>
            <tr>
              <td><strong>HVAC &amp; Climate Engineering</strong><br><span style="font-size: 0.78rem; color: #64748b;">Concealed FCUs, ductwork rerouting, linear slot diffusers</span></td>
              <td style="color: #ef4444;">❌ Excluded</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ 100% In-House</span> Air-conditioning &amp; ductwork engineering</td>
            </tr>
            <tr>
              <td><strong>False Ceilings &amp; Acoustic Partitions</strong><br><span style="font-size: 0.78rem; color: #64748b;">Multi-tier gypsum, shadow lines, STC acoustic drywall</span></td>
              <td style="color: #f59e0b;">⚠️ Subcontracted</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ 100% In-House</span> Master gypsum &amp; acoustic isolation teams</td>
            </tr>
            <tr>
              <td><strong>Custom Joinery &amp; Millwork Fabrication</strong><br><span style="font-size: 0.78rem; color: #64748b;">Bespoke wardrobes, vanities, architectural panelling</span></td>
              <td style="color: #f59e0b;">⚠️ Imported or brokered</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ In-House Joinery Shop</span> Controlled timber selection &amp; CNC milling</td>
            </tr>
            <tr>
              <td><strong>Authority Permitting &amp; NOC Approvals</strong><br><span style="font-size: 0.78rem; color: #64748b;">Dubai Municipality, DMT, Civil Defense, Emaar, Nakheel</span></td>
              <td style="color: #ef4444;">❌ Client must hire separate consultant</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ Turnkey Permitting</span> Full NOC, drawing submissions &amp; final inspection</td>
            </tr>
            <tr>
              <td><strong>Design Concept, 3D Renders &amp; FF&amp;E Styling</strong><br><span style="font-size: 0.78rem; color: #64748b;">Mood boards, photorealistic 3D, textiles &amp; accessories</span></td>
              <td style="color: #10b981;">✓ Core capability</td>
              <td class="highlight-col"><span style="color: #10b981;">✓ World-Class Studio</span> Dedicated architectural design team</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Specific Contracting Disciplines Grid -->
      <div style="margin-top: 3.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #0099e6; margin-bottom: 0.5rem; text-transform: uppercase;">1. False Ceilings &amp; Drywall</h4>
          <p style="font-size: 0.825rem; color: #94a3b8; line-height: 1.5;">Moisture-resistant gypsum boards, recessed curtain coves, cove lighting reveals, acoustic baffles, and fire-rated demountable wall systems.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #0099e6; margin-bottom: 0.5rem; text-transform: uppercase;">2. Specialist Wall &amp; Floor Finishes</h4>
          <p style="font-size: 0.825rem; color: #94a3b8; line-height: 1.5;">Italian bookmatched marble, engineered parquetry, terrazzo, acoustic micro-cement, Stucco Veneziano, and electrostatic industrial coatings.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #0099e6; margin-bottom: 0.5rem; text-transform: uppercase;">3. Plumbing, Sanitary &amp; Drainage</h4>
          <p style="font-size: 0.825rem; color: #0099e6; margin-bottom: 0.5rem; text-transform: uppercase;">Concealed thermostatic mixers, wall-hung WC frames, booster pump integration, multi-stage filtration, and certified waterproofing testing.</p>
        </div>
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem;">
          <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #0099e6; margin-bottom: 0.5rem; text-transform: uppercase;">4. Civil Defense &amp; Life Safety</h4>
          <p style="font-size: 0.825rem; color: #94a3b8; line-height: 1.5;">Fire alarm detection, sprinkler modification, emergency exit luminaire compliance, and official Civil Defense (DCD/ADCD) completion certificates.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       5. RECOMMENDED 5-STEP PROJECT WORKFLOW
       ========================================================================== -->
  <section class="section" id="workflow" style="padding: 5.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">TRANSPARENT PROJECT DELIVERY</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          RECOMMENDED 5-STEP INTERIOR WORKFLOW
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.65rem; line-height: 1.6;">
          Our proven five-stage execution roadmap ensures budget certainty, architectural fidelity, and flawless handover from initial site survey to key delivery.
        </p>
      </div>

      <div class="workflow-timeline">
        <!-- Step 01 -->
        <div class="workflow-step-card">
          <div class="workflow-num-bubble">01</div>
          <h3 class="workflow-step-title">Consultation &amp; Site Assessment</h3>
          <p class="workflow-step-desc">
            Understand the project type, conduct 3D laser spatial measurement, review existing architectural/MEP drawings, and identify the client’s lifestyle needs, budget threshold, and target completion timeline.
          </p>
        </div>

        <!-- Step 02 -->
        <div class="workflow-step-card">
          <div class="workflow-num-bubble">02</div>
          <h3 class="workflow-step-title">Design, Planning &amp; 3D Visuals</h3>
          <p class="workflow-step-desc">
            Prepare 2D space layouts, tactile mood boards, finish material trays, custom joinery plans, and photorealistic 3D visualizations giving you full confidence before committing to works.
          </p>
        </div>

        <!-- Step 03 -->
        <div class="workflow-step-card">
          <div class="workflow-num-bubble">03</div>
          <h3 class="workflow-step-title">Quotation &amp; Authority Approvals</h3>
          <p class="workflow-step-desc">
            Define itemized BOQ scope of work, material technical specifications, clear fixed pricing, milestone schedule, client approvals, and submit drawings for developer &amp; municipality permits (DM, DMT, DCD).
          </p>
        </div>

        <!-- Step 04 -->
        <div class="workflow-step-card">
          <div class="workflow-num-bubble">04</div>
          <h3 class="workflow-step-title">Execution &amp; Site Coordination</h3>
          <p class="workflow-step-desc">
            Coordinate approved civil demolition, MEP first &amp; second fix, false ceilings, custom joinery fabrication, luxury floorings, lighting installation, and furniture delivery under ISO 9001 quality supervision.
          </p>
        </div>

        <!-- Step 05 -->
        <div class="workflow-step-card">
          <div class="workflow-num-bubble">05</div>
          <h3 class="workflow-step-title">Final Styling, Snagging &amp; Handover</h3>
          <p class="workflow-step-desc">
            Arrange designer furniture and accessories, hang artwork, complete thorough 100-point snagging inspection, deep clean, and hand over the finished space with operation manuals and warranty certificates.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       6. INTERACTIVE SERVICE DIRECTORY / SUGGESTED CATEGORIES
       ========================================================================== -->
  <section class="section" id="service-directory" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 820px; margin: 0 auto 2.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">WEBSITE SERVICE DIRECTORY</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          WHAT WE SHOWCASE &amp; DELIVER
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Quickly navigate our core interior and turnkey contracting categories aligned with your project requirements.
        </p>
      </div>

      <!-- Category Filter Pills -->
      <div class="services-cat-tabs">
        <button type="button" class="service-tab-btn active" data-cat="all">All Service Categories</button>
        <button type="button" class="service-tab-btn" data-cat="design">Interior Design</button>
        <button type="button" class="service-tab-btn" data-cat="turnkey">Turnkey Interiors</button>
        <button type="button" class="service-tab-btn" data-cat="residential">Residential</button>
        <button type="button" class="service-tab-btn" data-cat="commercial">Commercial</button>
        <button type="button" class="service-tab-btn" data-cat="hospitality">Hospitality</button>
        <button type="button" class="service-tab-btn" data-cat="renovation">Renovation</button>
        <button type="button" class="service-tab-btn" data-cat="joinery">Custom Joinery</button>
        <button type="button" class="service-tab-btn" data-cat="styling">Furniture &amp; Styling</button>
      </div>

      <!-- Category Matrix Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;" id="servicesMatrixGrid">
        <div class="matrix-card" data-matrix-cat="design" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 01</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Interior Design</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Concepts, functional layouts, mood boards, tactile finish trays, and photorealistic 3D renders.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Request Concept →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="turnkey" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 02</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Turnkey Interiors</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Single-point coordination, authority approvals, civil/MEP execution, and flawless key handover.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Request Turnkey Proposal →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="residential" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 03</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Residential Interiors</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Luxury waterfront villas, private family compounds, duplex penthouses, and bespoke apartments.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Residential →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="commercial" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 04</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Commercial Interiors</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Corporate HQs, executive conference suites, fintech offices, and luxury retail precincts.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Commercial →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="hospitality" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 05</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Hospitality Interiors</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">5-star hotel suites, grand lobbies, Michelin-grade restaurants, and VIP cinema lounges.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Hospitality →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="renovation" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 06</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Renovation &amp; Remodeling</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Bespoke kitchen/bath overhauls, structural modifications, flooring replacement, and wall finishes.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Request Renovation Quote →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="joinery" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 07</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Custom Joinery</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Bespoke walk-in dressing rooms, architectural wall paneling, vanity cabinetry, and tables.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Custom Joinery →</a>
        </div>

        <div class="matrix-card" data-matrix-cat="styling" style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.75rem;">
          <span style="color: #0099e6; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.35rem;">Category 08</span>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Furniture &amp; Styling</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">Full turnkey furnishing, luxury staging for sales/rentals, curated rugs, curtains, and artwork.</p>
          <a href="#consultation" style="font-size: 0.8rem; color: #0099e6; font-weight: 700; text-decoration: none;">Inquire Staging Packages →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       7. FEATURED COMPLETED INTERIOR & FIT-OUT PROJECTS
       ========================================================================== -->
  <section class="section" id="interior-portfolio" style="padding: 5.5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">PROVEN TRACK RECORD</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
            FEATURED FIT-OUT PROJECTS
          </h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem;">
            Real-world execution delivering international standards for royal, commercial, and multinational hospitality clients.
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

        <!-- Project 2: Palm Jumeirah Private Waterfront Estate -->
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

        <!-- Project 3: Chipotle Mexican Grill MBZ Mall -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/chipotle-mbz-mall.jpg" alt="Chipotle Mexican Grill MBZ Mall Interior" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #10b981; font-weight: 700; text-transform: uppercase;">Commercial F&amp;B Fit-Out</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Chipotle Mexican Grill (MBZ Mall)</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Delivered in partnership with Top Rock Interiors: turnkey commercial restaurant fit-out, custom stainless steel joinery, polished concrete, and MEP kitchen integration.
            </p>
            <a href="/projects/chipotle-mbz-mall/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>

        <!-- Project 4: Roxy Cinemas Dubai Hills Mall -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/roxy-cinema-dubai-hills-mall.jpg" alt="Roxy Cinemas Dubai Hills Mall" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #ec4899; font-weight: 700; text-transform: uppercase;">Entertainment &amp; Acoustic Fit-Out</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Roxy Cinemas VIP Auditoriums</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              STC-rated acoustic isolation walls, tiered luxury seating platforms, acoustic wall paneling, and VIP lounge hospitality finishing.
            </p>
            <a href="/projects/roxy-cinema-dubai-hills-mall/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>

        <!-- Project 5: The Noodle House City Walk -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/the-noodle-house-city-walk.jpg" alt="The Noodle House City Walk" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #f59e0b; font-weight: 700; text-transform: uppercase;">Dining Hospitality Fit-Out</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">The Noodle House (City Walk)</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Contemporary Asian restaurant fit-out featuring bespoke open-kitchen timber joinery, custom decorative luminaires, and specialized mechanical ventilation.
            </p>
            <a href="/projects/the-noodle-house-city-walk/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>

        <!-- Project 6: Al Lisaili Luxury Residence -->
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
          <img src="/assets/images/projects/al-lisaili-villa.jpg" alt="Al Lisaili Luxury Villa" style="width: 100%; height: 230px; object-fit: cover;">
          <div style="padding: 1.75rem;">
            <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">Private Villa Interiors</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: #fff; margin: 0.35rem 0 0.65rem;">Al Lisaili Luxury Villa</h3>
            <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">
              High-rise vaulted gypsum ceilings, bespoke interior partitions, marble floor inlays, and customized luxury residential fit-out across sprawling private estate grounds.
            </p>
            <a href="/projects/al-lisaili-villa/" style="color: #0099e6; font-size: 0.85rem; font-weight: 700; text-decoration: none;">View Project Case Study →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       8. BROADER CONGLOMERATE SERVICES DIRECTORY
       ========================================================================== -->
  <section class="section" id="group-services" style="padding: 5.5rem 0; background: #06111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">MULTINATIONAL ENGINEERING ECOSYSTEM</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.4rem; text-transform: uppercase; line-height: 1.2;">
          ADDITIONAL GROUP ENGINEERING SERVICES
        </h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
          Beyond interior fit-outs, Rayan Group commands heavy turnkey contracting across critical infrastructure, energy facilities, and regional fabrication hubs.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Civil &amp; High-Rise Construction</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">Turnkey structural contracting, post-tensioned slabs, deep foundations, and luxury high-rise residential towers.</p>
          <a href="/business/engineering/" style="color: #0099e6; font-size: 0.82rem; font-weight: 700; text-decoration: none;">Rayan Engineering →</a>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚡</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Critical Energy &amp; Pipelines EPC</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">Hydrocarbon transport pipelines, process plants, refinery turnaround execution, and ISO 45001 safety rigor.</p>
          <a href="/business/energy/" style="color: #0099e6; font-size: 0.82rem; font-weight: 700; text-decoration: none;">Rayan Energy →</a>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🏭</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Heavy Structural Steel (India)</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">South Asia engineering fabrication, industrial sheds, heavy trusses, and civic infrastructure in Bettiah &amp; New Delhi.</p>
          <a href="/business/ashaz/" style="color: #0099e6; font-size: 0.82rem; font-weight: 700; text-decoration: none;">Ashaz Engineering →</a>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 2rem;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🌴</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Luxury Property Development</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.25rem;">Upcoming luxury master planned communities, beachfront villas, and prime commercial real estate investments.</p>
          <a href="/business/properties/" style="color: #0099e6; font-size: 0.82rem; font-weight: 700; text-decoration: none;">Rayan Properties →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       9. FREQUENTLY ASKED QUESTIONS (FAQ)
       ========================================================================== -->
  <section class="section" id="faq" style="padding: 5rem 0; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container" style="max-width: 900px;">
      <div style="text-align: center; margin-bottom: 3.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">COMMON QUESTIONS</span>
        <h2 style="font-family: var(--font-heading); font-size: clamp(1.85rem, 3.2vw, 2.5rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
          INTERIOR &amp; FIT-OUT FAQ
        </h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            What is the difference between an interior styling studio and a turnkey contractor like Rayan Group?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Interior stylists primarily select paint colors, curtains, rugs, and retail furniture. As a licensed Turnkey Interior Contractor, Rayan Group executes full structural modifications, MEP infrastructure, false ceilings, partition demolition, in-house custom joinery, air conditioning ductwork, and secures official authority permits (Dubai Municipality, DMT, Civil Defense) alongside bespoke interior styling.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Do you manage Dubai Municipality, Abu Dhabi DMT, and Civil Defense approvals?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Yes. Our internal engineering department handles complete drawing submissions, NOC applications, structural calculations, and inspections with Dubai Municipality, Abu Dhabi Department of Municipalities &amp; Transport, Civil Defense, and master developers such as Emaar, Nakheel, and Aldar.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            How long does a typical interior fit-out project take from consultation to handover?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Turnkey staging and styling packages can be deployed in 7 to 14 business days. Comprehensive residential villa or commercial office renovations typically range between 4 to 12 weeks, depending on structural scope, custom joinery volume, and authority permitting timelines. A definitive critical path timeline is guaranteed in our Stage 03 proposal.
          </p>
        </div>

        <div style="background: #0c1828; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem 2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
            Can you build custom furniture and walk-in dressing rooms to custom dimensions?
          </h3>
          <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
            Absolutely. We operate our own dedicated joinery and millwork workshop equipped with CNC machinery. We fabricate custom dining tables, executive desks, illuminated walk-in wardrobes, bathroom vanities, and feature wall paneling using hand-picked exotic veneers, bookmatched Italian marble, and luxury metal accents.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==========================================================================
       10. BOOK CONSULTATION & TENDER PROPOSAL (RFP) FORM
       ========================================================================== -->
  <section class="section" id="consultation" style="padding: 5.5rem 0 6rem; background: #06111e;">
    <div class="container" style="max-width: 960px;">
      <div class="consultation-card">
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0099e6;">STAGE 01 — FAST TRACK</span>
          <h2 style="font-family: var(--font-heading); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 800; color: #fff; margin-top: 0.35rem; text-transform: uppercase;">
            BOOK A DESIGN CONSULTATION &amp; QUOTATION
          </h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;">
            Submit your spatial parameters, project type, and vision. Our principal interior architects and commercial contracting estimators will review and connect within 24 hours.
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
              <input type="text" class="consultation-input" placeholder="e.g. Private Owner / Apex Holdings">
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
                <option value="">Select Category...</option>
                <option value="residential-villa">Residential — Luxury Villa / Penthouse</option>
                <option value="commercial-office">Commercial — Corporate Office / Workspace</option>
                <option value="hospitality-hotel">Hospitality — Hotel / Resort / Lounge</option>
                <option value="hospitality-restaurant">Hospitality — Restaurant / Cafe Fit-Out</option>
                <option value="renovation-complete">Full Turnkey Renovation &amp; Remodeling</option>
                <option value="custom-joinery">Custom Furniture &amp; Bespoke Joinery Only</option>
                <option value="property-staging">Property Staging &amp; Turnkey Furnishing</option>
                <option value="civil-mep">Heavy Civil &amp; MEP Contracting Scope</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Project Location *</label>
              <select class="consultation-select" required>
                <option value="">Select Region...</option>
                <option value="dubai">Dubai, UAE</option>
                <option value="abu-dhabi">Abu Dhabi, UAE</option>
                <option value="sharjah">Sharjah &amp; Northern Emirates</option>
                <option value="india">India (Ashaz Engineering Regional Hub)</option>
                <option value="international">Other International Market</option>
              </select>
            </div>

            <div class="form-group-full">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Required Scope Elements (Select All That Apply):</label>
              <div class="checkbox-chips-grid">
                <label class="checkbox-chip">
                  <input type="checkbox" checked> <span>Concept &amp; Mood Boards</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox" checked> <span>Space Planning &amp; 2D Layouts</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox" checked> <span>Photorealistic 3D Renders</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Authority NOCs &amp; Permits</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Turnkey Civil &amp; Demolition</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>MEP &amp; HVAC Engineering</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Custom In-House Joinery</span>
                </label>
                <label class="checkbox-chip">
                  <input type="checkbox"> <span>Furniture &amp; Decorative Styling</span>
                </label>
              </div>
            </div>

            <div class="form-group-full">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.4rem;">Project Scope &amp; Special Requirements</label>
              <textarea class="consultation-textarea" rows="4" placeholder="Briefly describe your space size (sq. ft.), preferred design style, budget expectations, and target completion timeline..."></textarea>
            </div>
          </div>

          <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">
              🔒 Fiduciary discretion guaranteed. Your design ideas and BOQ details remain strictly confidential.
            </div>
            <button type="submit" class="btn-enterprise-primary" style="padding: 1rem 2.5rem; font-size: 0.9rem;">
              SUBMIT CONSULTATION REQUEST →
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
`;

createRoute('services/index.html', {
  title: 'Our Services — Luxury Interior Design & Turnkey Contracting',
  description: 'Explore Rayan Group services: flagship interior design, turnkey fit-out contracting, residential villas, commercial workspaces, 5-star hospitality, bespoke custom joinery, property staging, and civil MEP across UAE and South Asia.',
  activePath: '/services/',
  heroHtml: servicesHeroHtml,
  content: servicesContent
});
